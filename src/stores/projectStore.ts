/**
 * Project Store
 *
 * SolidJS store for managing the current project session.
 * Handles project CRUD operations, auto-save, and IndexedDB synchronization.
 */

import { createStore } from 'solid-js/store';

import type {
  Project,
  ProjectStoreState,
  SaveStatus,
  NameDialogMode,
  UidescFormat,
} from '../domain/project/types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../domain/project/types';
import { openDatabase, closeDatabase } from '../services/indexedDB/database';
import { projectService } from '../services/indexedDB/projectService';

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
 * Sets the pending file for project creation.
 */
export function setPendingFile(file: File): void {
  setStore({ pendingFile: file });
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
 * Deletes a project by ID.
 *
 * @param id - Project ID
 * @returns True if deleted successfully
 */
export async function deleteProject(id: string): Promise<boolean> {
  if (store.isSessionOnly) {
    return false;
  }

  try {
    await projectService.delete(id);

    // Clear current project if it was the deleted one
    if (store.currentProject?.id === id) {
      setStore({
        currentProject: null,
        isDirty: false,
        saveStatus: 'idle',
        lastSavedAt: null,
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return false;
  }
}

/**
 * Closes the current project.
 */
export function closeCurrentProject(): void {
  setStore({
    currentProject: null,
    isDirty: false,
    saveStatus: 'idle',
    lastSavedAt: null,
  });
}
