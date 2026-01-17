/**
 * Project Store
 *
 * SolidJS store for managing the current project session.
 * Handles project CRUD operations, auto-save, and IndexedDB synchronization.
 */

import { createStore } from 'solid-js/store';
import { parseUidesc } from '../domain/parser';
import type {
  EditorState,
  NameDialogMode,
  OrphanedBitmap,
  PendingFileInfo,
  Project,
  ProjectStoreState,
  ReplaceUidescResult,
  SaveStatus,
  UidescFormat,
} from '../domain/project/types';
import { DEBOUNCE, DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../domain/project/types';
import { sanitizeProjectName, validateProjectName } from '../domain/project/validation';
import { bitmapService } from '../services/indexedDB/bitmapService';
import { openDatabase } from '../services/indexedDB/database';
import { projectService } from '../services/indexedDB/projectService';
import { restoreCanvasState } from './canvasStore';
import { setDocumentForTest as setDocumentStoreContent } from './documentStore';
import { restoreHierarchyState } from './hierarchyStore';
import { restorePropertiesState } from './propertiesStore';
import { setActiveTemplate } from './templateStore';

// ============================================================================
// Initial State
// ============================================================================

const initialState: ProjectStoreState = {
  currentProject: null,
  isDirty: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  isSessionOnly: false,
  isProjectListOpen: false,
  isNameDialogOpen: false,
  nameDialogMode: null,
  pendingFile: null,
};

// ============================================================================
// Store
// ============================================================================

const [store, setStore] = createStore<ProjectStoreState>({ ...initialState });

/**
 * Reactive project store exposing current session state.
 */
export const projectStore = store;

// ============================================================================
// Basic State Setters
// ============================================================================

/**
 * Sets the current project.
 */
export function setCurrentProject(project: Project | null): void {
  setStore({ currentProject: project });
}

/**
 * Sets the dirty flag.
 */
export function setIsDirty(isDirty: boolean): void {
  setStore({ isDirty });
}

/**
 * Sets the save status.
 */
export function setSaveStatus(status: SaveStatus): void {
  setStore({ saveStatus: status });
}

/**
 * Sets the last saved timestamp.
 */
export function setLastSavedAt(date: Date | null): void {
  setStore({ lastSavedAt: date });
}

/**
 * Sets session-only mode (IndexedDB unavailable).
 */
export function setIsSessionOnly(isSessionOnly: boolean): void {
  setStore({ isSessionOnly });
}

// ============================================================================
// Modal Controls
// ============================================================================

/**
 * Opens the project list modal.
 */
export function openProjectList(): void {
  setStore({ isProjectListOpen: true });
}

/**
 * Closes the project list modal.
 */
export function closeProjectList(): void {
  setStore({ isProjectListOpen: false });
}

/**
 * Opens the name dialog with specified mode.
 */
export function openNameDialog(mode: NameDialogMode): void {
  setStore({ isNameDialogOpen: true, nameDialogMode: mode });
}

/**
 * Closes the name dialog.
 */
export function closeNameDialog(): void {
  setStore({ isNameDialogOpen: false, nameDialogMode: null });
}

// ============================================================================
// Pending File
// ============================================================================

/**
 * Sets the pending file info for project creation.
 */
export function setPendingFile(fileInfo: PendingFileInfo): void {
  setStore({ pendingFile: fileInfo });
}

/**
 * Clears the pending file.
 */
export function clearPendingFile(): void {
  setStore({ pendingFile: null });
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets the store to initial state.
 */
export function resetProjectStore(): void {
  setStore({ ...initialState });
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the project store.
 *
 * Attempts to open IndexedDB. If unavailable, sets session-only mode.
 */
export async function initializeProjectStore(): Promise<void> {
  try {
    await openDatabase();
    setStore({ isSessionOnly: false });
  } catch {
    setStore({ isSessionOnly: true });
  }
}

// ============================================================================
// Project CRUD
// ============================================================================

/**
 * Creates a new project and sets it as current.
 *
 * @param name - Project name
 * @param uidescContent - Raw uidesc content
 * @param uidescFormat - File format (json or xml)
 * @returns The created project, or null if failed
 */
export async function createProject(
  name: string,
  uidescContent: string,
  uidescFormat: UidescFormat
): Promise<Project | null> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    uidescContent,
    uidescFormat,
    editorState: { ...DEFAULT_EDITOR_STATE },
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl: null,
  };

  // In session-only mode, we still set the project but don't persist
  if (!store.isSessionOnly) {
    try {
      await projectService.create(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      // Still set the project in session
    }
  }

  setStore({
    currentProject: project,
    isDirty: false,
    saveStatus: 'idle',
    lastSavedAt: null,
  });

  return project;
}

/**
 * Loads a project by ID and sets it as current.
 *
 * @param id - Project ID
 * @returns The loaded project, or null if not found
 */
export async function loadProject(id: string): Promise<Project | null> {
  if (store.isSessionOnly) {
    return null;
  }

  try {
    const project = await projectService.get(id);
    if (project) {
      setStore({
        currentProject: project,
        isDirty: false,
        saveStatus: 'idle',
        lastSavedAt: null,
      });
      return project;
    }
    return null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

/**
 * Gets all projects from IndexedDB.
 *
 * @returns Array of projects, sorted by updatedAt descending
 */
export async function getAllProjects(): Promise<Project[]> {
  if (store.isSessionOnly) {
    return [];
  }

  try {
    return await projectService.getAll();
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
}

/**
 * Saves the current project to IndexedDB.
 *
 * @returns True if saved successfully
 */
export async function saveCurrentProject(): Promise<boolean> {
  const project = store.currentProject;
  if (!project || store.isSessionOnly) {
    return false;
  }

  try {
    setStore({ saveStatus: 'saving' });

    const updatedProject: Project = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    await projectService.update(updatedProject);

    setStore({
      currentProject: updatedProject,
      isDirty: false,
      saveStatus: 'saved',
      lastSavedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Failed to save project:', error);
    setStore({ saveStatus: 'error' });
    return false;
  }
}

/**
 * Updates the current project's uidesc content.
 *
 * @param content - New uidesc content
 */
export function updateProjectContent(content: string): void {
  const project = store.currentProject;
  if (!project) return;

  setStore({
    currentProject: { ...project, uidescContent: content },
    isDirty: true,
  });
}

/**
 * Closes the current project.
 */
export function closeCurrentProject(): void {
  cancelAutoSaveTimers();
  setStore({
    currentProject: null,
    isDirty: false,
    saveStatus: 'idle',
    lastSavedAt: null,
  });
}

// ============================================================================
// Auto-Save Engine
// ============================================================================

/** Timer ID for document save debounce */
let documentSaveTimer: ReturnType<typeof setTimeout> | null = null;

/** Timer ID for editor state save debounce */
let stateSaveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Creates a plain object copy of a project for IndexedDB storage.
 * SolidJS stores use Proxy objects that cannot be directly stored in IndexedDB.
 */
function toPlainProject(project: Project): Project {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    uidescContent: project.uidescContent,
    uidescFormat: project.uidescFormat,
    editorState: {
      panOffset: { x: project.editorState.panOffset.x, y: project.editorState.panOffset.y },
      zoomLevel: project.editorState.zoomLevel,
      expandedHierarchyNodes: [...project.editorState.expandedHierarchyNodes],
      expandedPropertyGroups: [...project.editorState.expandedPropertyGroups],
      selectedTemplateId: project.editorState.selectedTemplateId,
    },
    settings: {
      grid: {
        size: project.settings.grid.size,
        style: project.settings.grid.style,
        visibleByDefault: project.settings.grid.visibleByDefault,
      },
      snap: {
        enabledByDefault: project.settings.snap.enabledByDefault,
        threshold: project.settings.snap.threshold,
      },
      smartGuides: {
        enabledByDefault: project.settings.smartGuides.enabledByDefault,
      },
      customGuides: {
        snapEnabledByDefault: project.settings.customGuides.snapEnabledByDefault,
        guides: project.settings.customGuides.guides.map(g => ({
          id: g.id,
          orientation: g.orientation,
          position: g.position,
        })),
      },
      theme: {
        mode: project.settings.theme.mode,
      },
      autoSave: {
        enabled: project.settings.autoSave.enabled,
      },
    },
    thumbnailDataUrl: project.thumbnailDataUrl,
  };
}

/**
 * Performs the actual document save to IndexedDB.
 */
async function performDocumentSave(): Promise<void> {
  const project = store.currentProject;
  if (!project || store.isSessionOnly) {
    return;
  }

  try {
    setStore({ saveStatus: 'saving' });

    const updatedProject: Project = {
      ...toPlainProject(project),
      updatedAt: new Date().toISOString(),
    };

    await projectService.update(updatedProject);

    setStore({
      currentProject: updatedProject,
      isDirty: false,
      saveStatus: 'saved',
      lastSavedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to auto-save document:', error);
    setStore({ saveStatus: 'error' });
  }
}

/**
 * Performs the actual editor state save to IndexedDB.
 */
async function performStateSave(): Promise<void> {
  const project = store.currentProject;
  if (!project || store.isSessionOnly) {
    return;
  }

  try {
    const updatedProject: Project = {
      ...toPlainProject(project),
      updatedAt: new Date().toISOString(),
    };

    await projectService.update(updatedProject);

    setStore({
      currentProject: updatedProject,
    });
  } catch (error) {
    console.error('Failed to auto-save editor state:', error);
  }
}

/**
 * Schedules a document save with 2 second debounce.
 * Call this when uidesc content changes.
 */
export function scheduleDocumentSave(): void {
  if (documentSaveTimer !== null) {
    clearTimeout(documentSaveTimer);
  }

  documentSaveTimer = setTimeout(() => {
    documentSaveTimer = null;
    performDocumentSave();
  }, DEBOUNCE.DOCUMENT);
}

/**
 * Schedules an editor state save with 10 second debounce.
 * Call this when pan, zoom, or panel states change.
 */
export function scheduleStateSave(): void {
  if (stateSaveTimer !== null) {
    clearTimeout(stateSaveTimer);
  }

  stateSaveTimer = setTimeout(() => {
    stateSaveTimer = null;
    performStateSave();
  }, DEBOUNCE.EDITOR_STATE);
}

/**
 * Cancels any pending auto-save timers.
 * Call this when closing a project or shutting down.
 */
export function cancelAutoSaveTimers(): void {
  if (documentSaveTimer !== null) {
    clearTimeout(documentSaveTimer);
    documentSaveTimer = null;
  }
  if (stateSaveTimer !== null) {
    clearTimeout(stateSaveTimer);
    stateSaveTimer = null;
  }
}

/**
 * Updates the current project's editor state.
 *
 * @param updates - Partial editor state updates
 */
export function updateProjectEditorState(updates: Partial<EditorState>): void {
  const project = store.currentProject;
  if (!project) return;

  setStore({
    currentProject: {
      ...project,
      editorState: {
        ...project.editorState,
        ...updates,
      },
    },
  });
}

/**
 * Lists all projects from IndexedDB.
 *
 * @returns Promise resolving to array of projects, sorted by updatedAt desc
 */
export async function listProjects(): Promise<Project[]> {
  if (store.isSessionOnly) {
    return [];
  }

  try {
    return await projectService.getAll();
  } catch (error) {
    console.error('Failed to list projects:', error);
    return [];
  }
}

/**
 * Opens a project by ID, loading it from IndexedDB.
 * Restores editor state to respective stores (canvas, hierarchy, properties, template).
 *
 * @param id - The project ID to open
 * @returns The loaded project, or null on failure
 */
export async function openProject(id: string): Promise<Project | null> {
  if (store.isSessionOnly) {
    return null;
  }

  try {
    const project = await projectService.get(id);
    if (!project) {
      return null;
    }

    // Restore editor state to respective stores
    const { editorState } = project;
    restoreCanvasState(editorState.panOffset, editorState.zoomLevel);
    restoreHierarchyState(editorState.expandedHierarchyNodes);
    restorePropertiesState(editorState.expandedPropertyGroups);
    setActiveTemplate(editorState.selectedTemplateId);

    setStore({
      currentProject: project,
      isDirty: false,
      saveStatus: 'saved',
      lastSavedAt: new Date(project.updatedAt),
    });

    return project;
  } catch (error) {
    console.error('Failed to open project:', error);
    return null;
  }
}

/**
 * Deletes a project by ID from IndexedDB.
 *
 * @param id - The project ID to delete
 * @returns True if deleted, false on failure
 */
export async function deleteProject(id: string): Promise<boolean> {
  if (store.isSessionOnly) {
    return false;
  }

  try {
    await projectService.delete(id);

    // If this was the current project, close it
    if (store.currentProject?.id === id) {
      closeCurrentProject();
    }

    return true;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return false;
  }
}

// ============================================================================
// Empty Project Creation
// ============================================================================

/**
 * Creates a default empty uidesc document structure.
 * Used for creating new projects without importing an existing file.
 */
function createDefaultUidescContent(): string {
  const doc = {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        view: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
            'background-color': '~ BlackCColor',
          },
        },
      },
    },
  };
  return JSON.stringify(doc);
}

/**
 * Creates a new empty project with default uidesc structure.
 *
 * This function creates a project with:
 * - A default uidesc JSON structure with a single "view" template
 * - Default project settings
 * - Default editor state
 *
 * @param name - Project name
 * @returns The created project, or null if failed
 */
export async function createEmptyProject(name: string): Promise<Project | null> {
  const uidescContent = createDefaultUidescContent();
  return createProject(name, uidescContent, 'json');
}

// ============================================================================
// Project Rename
// ============================================================================

/**
 * Renames a project.
 *
 * Updates the project name in IndexedDB and in the current project if it matches.
 *
 * @param id - The project ID to rename
 * @param newName - The new name for the project
 * @returns True if renamed successfully, false on failure
 */
export async function renameProject(id: string, newName: string): Promise<boolean> {
  if (store.isSessionOnly) {
    return false;
  }

  // Validate and sanitize the name
  const validationResult = validateProjectName(newName);
  if (!validationResult.valid) {
    return false;
  }

  const sanitizedName = sanitizeProjectName(newName);

  try {
    // Get the existing project
    const existing = await projectService.get(id);
    if (!existing) {
      return false;
    }

    // Update the project
    const updatedProject: Project = {
      ...existing,
      name: sanitizedName,
      updatedAt: new Date().toISOString(),
    };

    await projectService.update(updatedProject);

    // If this is the current project, update the store
    if (store.currentProject?.id === id) {
      setStore('currentProject', 'name', sanitizedName);
      setStore('currentProject', 'updatedAt', updatedProject.updatedAt);
    }

    return true;
  } catch (error) {
    console.error('Failed to rename project:', error);
    return false;
  }
}

// ============================================================================
// Project Duplication
// ============================================================================

/**
 * Duplicates a project with a new name (Save As).
 *
 * Creates a new project with the same uidesc content but fresh ID,
 * timestamps, and default editor state.
 *
 * @param sourceId - The ID of the project to duplicate
 * @param newName - The name for the duplicate project
 * @returns The duplicated project, or null if failed
 */
export async function duplicateProject(sourceId: string, newName: string): Promise<Project | null> {
  if (store.isSessionOnly) {
    return null;
  }

  // Validate the new name
  const validationResult = validateProjectName(newName);
  if (!validationResult.valid) {
    return null;
  }

  const sanitizedName = sanitizeProjectName(newName);

  try {
    // Get the source project
    const source = await projectService.get(sourceId);
    if (!source) {
      return null;
    }

    // Create the duplicate with the source's content but new ID and timestamps
    return createProject(sanitizedName, source.uidescContent, source.uidescFormat);
  } catch (error) {
    console.error('Failed to duplicate project:', error);
    return null;
  }
}

// ============================================================================
// Replace Uidesc
// ============================================================================

/**
 * Extracts bitmap names referenced in a parsed uidesc document.
 */
function extractBitmapReferences(parsedDoc: Record<string, unknown>): Set<string> {
  const references = new Set<string>();
  const uidesc = parsedDoc['vstgui-ui-description'] as Record<string, unknown> | undefined;
  if (!uidesc) return references;

  const bitmaps = uidesc.bitmaps as Record<string, unknown> | undefined;
  if (bitmaps) {
    for (const name of Object.keys(bitmaps)) {
      references.add(name);
    }
  }

  return references;
}

/**
 * Replaces the uidesc content in the current project.
 *
 * This operation:
 * - Parses and validates the new uidesc content
 * - Preserves project settings and editor state
 * - Detects orphaned bitmaps (stored blobs no longer referenced)
 * - Updates both IndexedDB and the document store
 *
 * @param newContent - The new uidesc content string
 * @param newFormat - The format of the new content (json or xml)
 * @returns Result object with success status and orphaned bitmaps list
 */
export async function replaceUidesc(
  newContent: string,
  newFormat: UidescFormat
): Promise<ReplaceUidescResult> {
  const project = store.currentProject;
  if (!project) {
    return { success: false, error: 'No project is open' };
  }

  // Parse and validate the new content
  const parseResult = parseUidesc(newContent);
  if (!parseResult.success) {
    const errorMsg = parseResult.errors[0]?.message ?? 'Invalid uidesc content';
    return { success: false, error: errorMsg };
  }

  // Extract bitmap references from new content
  const newBitmapRefs = extractBitmapReferences(
    parseResult.document as unknown as Record<string, unknown>
  );

  // Get stored bitmaps for this project
  const storedBitmaps = store.isSessionOnly ? [] : await bitmapService.getByProject(project.id);

  // Find orphaned bitmaps (stored but not referenced in new content)
  const orphanedBitmaps: OrphanedBitmap[] = storedBitmaps
    .filter(bitmap => !newBitmapRefs.has(bitmap.name))
    .map(bitmap => ({ name: bitmap.name, size: bitmap.size }));

  // Update project in store
  const updatedProject: Project = {
    ...project,
    uidescContent: newContent,
    uidescFormat: newFormat,
    updatedAt: new Date().toISOString(),
  };

  // Persist to IndexedDB if not in session-only mode
  if (!store.isSessionOnly) {
    try {
      await projectService.update(toPlainProject(updatedProject));
    } catch (error) {
      console.error('Failed to persist replaced uidesc:', error);
      return { success: false, error: 'Failed to save changes' };
    }
  }

  // Update the project store
  setStore({ currentProject: updatedProject, isDirty: false });

  // Update the document store with parsed content
  // setDocumentForTest also sets parseState to 'valid'
  setDocumentStoreContent(parseResult.document);

  return { success: true, orphanedBitmaps };
}
