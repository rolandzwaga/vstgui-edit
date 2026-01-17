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
  EditorState,
} from '../domain/project/types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS, DEBOUNCE } from '../domain/project/types';
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
        guides: project.settings.customGuides.guides.map((g) => ({
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
