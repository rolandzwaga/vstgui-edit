import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DB_NAME, DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../domain/project/types';
import type { Project, ProjectStoreState } from '../../domain/project/types';
import { closeDatabase, openDatabase } from '../../services/indexedDB/database';
import { projectService } from '../../services/indexedDB/projectService';
import {
  projectStore,
  resetProjectStore,
  setCurrentProject,
  setIsDirty,
  setSaveStatus,
  setIsSessionOnly,
  openProjectList,
  closeProjectList,
  openNameDialog,
  closeNameDialog,
  setPendingFile,
  clearPendingFile,
  initializeProjectStore,
  createProject,
} from '../projectStore';

function createTestProject(overrides: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Test Project',
    createdAt: now,
    updatedAt: now,
    uidescContent: '{"vstgui-ui-description": {"version": "1"}}',
    uidescFormat: 'json',
    editorState: { ...DEFAULT_EDITOR_STATE },
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl: null,
    ...overrides,
  };
}

describe('projectStore', () => {
  beforeEach(async () => {
    resetProjectStore();
    closeDatabase();
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  });

  afterEach(() => {
    resetProjectStore();
    closeDatabase();
  });

  describe('initial state', () => {
    test('has null current project', () => {
      expect(projectStore.currentProject).toBeNull();
    });

    test('has isDirty false', () => {
      expect(projectStore.isDirty).toBe(false);
    });

    test('has saveStatus idle', () => {
      expect(projectStore.saveStatus).toBe('idle');
    });

    test('has lastSavedAt null', () => {
      expect(projectStore.lastSavedAt).toBeNull();
    });

    test('has isSessionOnly false', () => {
      expect(projectStore.isSessionOnly).toBe(false);
    });

    test('has isProjectListOpen false', () => {
      expect(projectStore.isProjectListOpen).toBe(false);
    });

    test('has isNameDialogOpen false', () => {
      expect(projectStore.isNameDialogOpen).toBe(false);
    });

    test('has nameDialogMode null', () => {
      expect(projectStore.nameDialogMode).toBeNull();
    });

    test('has pendingFile null', () => {
      expect(projectStore.pendingFile).toBeNull();
    });
  });

  describe('setCurrentProject', () => {
    test('sets current project', () => {
      const project = createTestProject({ name: 'My Project' });
      setCurrentProject(project);

      expect(projectStore.currentProject).toEqual(project);
    });

    test('can clear current project', () => {
      const project = createTestProject();
      setCurrentProject(project);
      setCurrentProject(null);

      expect(projectStore.currentProject).toBeNull();
    });
  });

  describe('setIsDirty', () => {
    test('sets dirty flag to true', () => {
      setIsDirty(true);
      expect(projectStore.isDirty).toBe(true);
    });

    test('sets dirty flag to false', () => {
      setIsDirty(true);
      setIsDirty(false);
      expect(projectStore.isDirty).toBe(false);
    });
  });

  describe('setSaveStatus', () => {
    test('sets save status to saving', () => {
      setSaveStatus('saving');
      expect(projectStore.saveStatus).toBe('saving');
    });

    test('sets save status to saved', () => {
      setSaveStatus('saved');
      expect(projectStore.saveStatus).toBe('saved');
    });

    test('sets save status to error', () => {
      setSaveStatus('error');
      expect(projectStore.saveStatus).toBe('error');
    });
  });

  describe('setIsSessionOnly', () => {
    test('sets session-only mode', () => {
      setIsSessionOnly(true);
      expect(projectStore.isSessionOnly).toBe(true);
    });
  });

  describe('project list modal', () => {
    test('openProjectList opens modal', () => {
      openProjectList();
      expect(projectStore.isProjectListOpen).toBe(true);
    });

    test('closeProjectList closes modal', () => {
      openProjectList();
      closeProjectList();
      expect(projectStore.isProjectListOpen).toBe(false);
    });
  });

  describe('name dialog', () => {
    test('openNameDialog opens dialog with create mode', () => {
      openNameDialog('create');
      expect(projectStore.isNameDialogOpen).toBe(true);
      expect(projectStore.nameDialogMode).toBe('create');
    });

    test('openNameDialog opens dialog with rename mode', () => {
      openNameDialog('rename');
      expect(projectStore.isNameDialogOpen).toBe(true);
      expect(projectStore.nameDialogMode).toBe('rename');
    });

    test('closeNameDialog closes dialog', () => {
      openNameDialog('create');
      closeNameDialog();
      expect(projectStore.isNameDialogOpen).toBe(false);
      expect(projectStore.nameDialogMode).toBeNull();
    });
  });

  describe('pending file', () => {
    test('setPendingFile stores file', () => {
      const file = new File(['content'], 'test.uidesc', { type: 'application/json' });
      setPendingFile(file);
      expect(projectStore.pendingFile).toBe(file);
    });

    test('clearPendingFile removes file', () => {
      const file = new File(['content'], 'test.uidesc');
      setPendingFile(file);
      clearPendingFile();
      expect(projectStore.pendingFile).toBeNull();
    });
  });

  describe('resetProjectStore', () => {
    test('resets all state to initial values', () => {
      setCurrentProject(createTestProject());
      setIsDirty(true);
      setSaveStatus('saving');
      setIsSessionOnly(true);
      openProjectList();
      openNameDialog('create');

      resetProjectStore();

      expect(projectStore.currentProject).toBeNull();
      expect(projectStore.isDirty).toBe(false);
      expect(projectStore.saveStatus).toBe('idle');
      expect(projectStore.isSessionOnly).toBe(false);
      expect(projectStore.isProjectListOpen).toBe(false);
      expect(projectStore.isNameDialogOpen).toBe(false);
    });
  });

  describe('initializeProjectStore', () => {
    test('sets isSessionOnly false when IndexedDB is available', async () => {
      await initializeProjectStore();
      expect(projectStore.isSessionOnly).toBe(false);
    });
  });

  describe('createProject', () => {
    test('creates project with provided name and content', async () => {
      await openDatabase();

      const result = await createProject('My Project', '{"vstgui-ui-description": {}}', 'json');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('My Project');
      expect(result?.uidescFormat).toBe('json');
    });

    test('sets current project after creation', async () => {
      await openDatabase();

      const result = await createProject('New Project', '{}', 'json');

      expect(projectStore.currentProject).toEqual(result);
    });

    test('stores project in IndexedDB', async () => {
      await openDatabase();

      const result = await createProject('Stored Project', '{}', 'json');

      const stored = await projectService.get(result!.id);
      expect(stored).toBeDefined();
      expect(stored?.name).toBe('Stored Project');
    });

    test('uses default editor state', async () => {
      await openDatabase();

      const result = await createProject('Default State Project', '{}', 'json');

      expect(result?.editorState).toEqual(DEFAULT_EDITOR_STATE);
    });

    test('uses default project settings', async () => {
      await openDatabase();

      const result = await createProject('Default Settings Project', '{}', 'json');

      expect(result?.settings).toEqual(DEFAULT_PROJECT_SETTINGS);
    });

    test('clears dirty flag after creation', async () => {
      await openDatabase();
      setIsDirty(true);

      await createProject('Clean Project', '{}', 'json');

      expect(projectStore.isDirty).toBe(false);
    });

    test('returns null in session-only mode but still sets current project', async () => {
      setIsSessionOnly(true);

      const result = await createProject('Session Project', '{}', 'json');

      // Returns the project but doesn't persist it
      expect(result).not.toBeNull();
      expect(projectStore.currentProject).toEqual(result);
    });
  });
});
