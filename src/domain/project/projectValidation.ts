/**
 * Project Validation
 *
 * Functions to validate project records retrieved from IndexedDB.
 * Used to detect and handle corrupted projects.
 */

import { parseUidesc } from '../parser';
import type { EditorState, Project, ProjectSettings } from './types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from './types';

/**
 * Result of project validation.
 */
export interface ProjectValidationResult {
  /** Whether the project is valid */
  isValid: boolean;

  /** List of validation errors */
  errors: string[];

  /** Whether the project can potentially be restored */
  canRestore: boolean;

  /** The repaired project if restoration is possible */
  repairedProject?: Project;
}

/**
 * Checks if a value is a non-null object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is a valid string.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validates the editor state structure.
 */
function validateEditorState(state: unknown): { valid: boolean; error?: string } {
  if (!isObject(state)) {
    return { valid: false, error: 'editorState is not an object' };
  }

  const editorState = state as Partial<EditorState>;

  if (!isObject(editorState.panOffset)) {
    return { valid: false, error: 'editorState.panOffset is missing or invalid' };
  }

  if (typeof editorState.zoomLevel !== 'number') {
    return { valid: false, error: 'editorState.zoomLevel is missing or invalid' };
  }

  if (!Array.isArray(editorState.expandedHierarchyNodes)) {
    return { valid: false, error: 'editorState.expandedHierarchyNodes is missing or invalid' };
  }

  if (!Array.isArray(editorState.expandedPropertyGroups)) {
    return { valid: false, error: 'editorState.expandedPropertyGroups is missing or invalid' };
  }

  return { valid: true };
}

/**
 * Validates the project settings structure.
 */
function validateSettings(settings: unknown): { valid: boolean; error?: string } {
  if (!isObject(settings)) {
    return { valid: false, error: 'settings is not an object' };
  }

  const s = settings as Partial<ProjectSettings>;

  if (!isObject(s.grid)) {
    return { valid: false, error: 'settings.grid is missing or invalid' };
  }

  if (!isObject(s.snap)) {
    return { valid: false, error: 'settings.snap is missing or invalid' };
  }

  if (!isObject(s.theme)) {
    return { valid: false, error: 'settings.theme is missing or invalid' };
  }

  return { valid: true };
}

/**
 * Attempts to repair a project with default values.
 */
function repairProject(project: Partial<Project>): Project | null {
  // Must have id and uidescContent at minimum
  if (!isNonEmptyString(project.id)) {
    return null;
  }

  if (!isNonEmptyString(project.uidescContent)) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: project.id,
    name: isNonEmptyString(project.name) ? project.name : 'Recovered Project',
    createdAt: isNonEmptyString(project.createdAt) ? project.createdAt : now,
    updatedAt: isNonEmptyString(project.updatedAt) ? project.updatedAt : now,
    uidescContent: project.uidescContent,
    uidescFormat: project.uidescFormat === 'xml' ? 'xml' : 'json',
    editorState: isObject(project.editorState)
      ? { ...DEFAULT_EDITOR_STATE, ...project.editorState }
      : { ...DEFAULT_EDITOR_STATE },
    settings: isObject(project.settings)
      ? deepMergeSettings(DEFAULT_PROJECT_SETTINGS, project.settings as Partial<ProjectSettings>)
      : { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl:
      typeof project.thumbnailDataUrl === 'string' ? project.thumbnailDataUrl : null,
  };
}

/**
 * Deep merges settings with defaults.
 */
function deepMergeSettings(
  defaults: ProjectSettings,
  partial: Partial<ProjectSettings>
): ProjectSettings {
  return {
    grid: isObject(partial.grid) ? { ...defaults.grid, ...partial.grid } : defaults.grid,
    snap: isObject(partial.snap) ? { ...defaults.snap, ...partial.snap } : defaults.snap,
    smartGuides: isObject(partial.smartGuides)
      ? { ...defaults.smartGuides, ...partial.smartGuides }
      : defaults.smartGuides,
    customGuides: isObject(partial.customGuides)
      ? { ...defaults.customGuides, ...partial.customGuides }
      : defaults.customGuides,
    theme: isObject(partial.theme) ? { ...defaults.theme, ...partial.theme } : defaults.theme,
    autoSave: isObject(partial.autoSave)
      ? { ...defaults.autoSave, ...partial.autoSave }
      : defaults.autoSave,
  };
}

/**
 * Validates a project record from IndexedDB.
 *
 * Checks that:
 * - Required fields exist (id, name, uidescContent, etc.)
 * - uidescContent is parseable
 * - editorState has valid structure
 * - settings has valid structure
 *
 * @param project - The project record to validate
 * @returns Validation result with errors and repair possibility
 */
export function validateProjectRecord(project: unknown): ProjectValidationResult {
  const errors: string[] = [];

  // Check if it's an object at all
  if (!isObject(project)) {
    return {
      isValid: false,
      errors: ['Project data is not an object'],
      canRestore: false,
    };
  }

  const p = project as Partial<Project>;

  // Check required string fields
  if (!isNonEmptyString(p.id)) {
    errors.push('Missing or invalid project ID');
  }

  if (!isNonEmptyString(p.name)) {
    errors.push('Missing or invalid project name');
  }

  if (!isNonEmptyString(p.uidescContent)) {
    errors.push('Missing uidesc content');
  }

  if (!isNonEmptyString(p.createdAt)) {
    errors.push('Missing creation timestamp');
  }

  if (!isNonEmptyString(p.updatedAt)) {
    errors.push('Missing update timestamp');
  }

  // Validate uidescContent is parseable
  if (isNonEmptyString(p.uidescContent)) {
    const parseResult = parseUidesc(p.uidescContent);
    if (!parseResult.success) {
      errors.push('uidesc content is not valid JSON or XML');
    }
  }

  // Validate editor state structure
  const editorStateResult = validateEditorState(p.editorState);
  if (!editorStateResult.valid && editorStateResult.error) {
    errors.push(editorStateResult.error);
  }

  // Validate settings structure
  const settingsResult = validateSettings(p.settings);
  if (!settingsResult.valid && settingsResult.error) {
    errors.push(settingsResult.error);
  }

  // Check if project can be restored
  const canRestore = isNonEmptyString(p.id) && isNonEmptyString(p.uidescContent);

  // If valid, return success
  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
      canRestore: true,
    };
  }

  // Try to repair if possible
  const repairedProject = canRestore ? repairProject(p) : null;

  return {
    isValid: false,
    errors,
    canRestore: repairedProject !== null,
    repairedProject: repairedProject ?? undefined,
  };
}
