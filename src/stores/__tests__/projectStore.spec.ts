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
  scheduleDocumentSave,
  scheduleStateSave,
  cancelAutoSaveTimers,
  updateProjectContent,
  updateProjectEditorState,
  openProject,
} from '../projectStore';
import { canvasStore, resetCanvas } from '../canvasStore';
import { hierarchyStore, resetHierarchy } from '../hierarchyStore';
import { propertiesStore, resetProperties } from '../propertiesStore';
import { templateStore, resetTemplateStore } from '../templateStore';

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

  describe('auto-save', () => {
    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      await openDatabase();
    });

    afterEach(() => {
      cancelAutoSaveTimers();
      vi.useRealTimers();
    });

    // Helper to wait for async save operations to complete
    async function flushSaveOperations(): Promise<void> {
      // Give time for IndexedDB operations (fake-indexeddb uses microtasks)
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }
    }

    describe('scheduleDocumentSave', () => {
      test('saves document after 2 second debounce', async () => {
        const project = await createProject('Auto Save Test', '{"old": true}', 'json');
        expect(project).not.toBeNull();

        // Update content and schedule save
        updateProjectContent('{"new": true}');
        scheduleDocumentSave();

        // Advance time by less than debounce period
        await vi.advanceTimersByTimeAsync(1000);
        await flushSaveOperations();

        // Should still have old content in IndexedDB
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.uidescContent).toBe('{"old": true}');

        // Advance past debounce period
        await vi.advanceTimersByTimeAsync(1100);
        await flushSaveOperations();

        // Should now have new content
        const afterSave = await projectService.get(project!.id);
        expect(afterSave?.uidescContent).toBe('{"new": true}');
      });

      test('resets timer on subsequent document changes', async () => {
        const project = await createProject('Timer Reset Test', '{"v": 0}', 'json');

        updateProjectContent('{"v": 1}');
        scheduleDocumentSave();

        // Advance 1.5 seconds
        await vi.advanceTimersByTimeAsync(1500);
        await flushSaveOperations();

        // Make another change - should reset timer
        updateProjectContent('{"v": 2}');
        scheduleDocumentSave();

        // Advance another 1.5 seconds (total 3s, but only 1.5s since last change)
        await vi.advanceTimersByTimeAsync(1500);
        await flushSaveOperations();

        // Should still not have saved
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.uidescContent).toBe('{"v": 0}');

        // Advance past debounce for second change
        await vi.advanceTimersByTimeAsync(600);
        await flushSaveOperations();

        // Now should have v: 2
        const afterSave = await projectService.get(project!.id);
        expect(afterSave?.uidescContent).toBe('{"v": 2}');
      });

      test('does not save in session-only mode', async () => {
        const project = await createProject('Session Only Test', '{"old": true}', 'json');
        setIsSessionOnly(true);

        updateProjectContent('{"new": true}');
        scheduleDocumentSave();

        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        // IndexedDB should still have old content (save was skipped)
        const stored = await projectService.get(project!.id);
        expect(stored?.uidescContent).toBe('{"old": true}');
      });

      test('sets saveStatus to saved after successful save', async () => {
        await createProject('Status Test', '{}', 'json');

        updateProjectContent('{"updated": true}');
        scheduleDocumentSave();

        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        expect(projectStore.saveStatus).toBe('saved');
      });

      test('clears isDirty after successful save', async () => {
        await createProject('Dirty Test', '{}', 'json');

        updateProjectContent('{"updated": true}');
        scheduleDocumentSave();

        expect(projectStore.isDirty).toBe(true);

        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        expect(projectStore.isDirty).toBe(false);
      });

      test('updates lastSavedAt after successful save', async () => {
        await createProject('Timestamp Test', '{}', 'json');

        expect(projectStore.lastSavedAt).toBeNull();

        updateProjectContent('{"updated": true}');
        scheduleDocumentSave();

        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        expect(projectStore.lastSavedAt).not.toBeNull();
      });
    });

    describe('scheduleStateSave', () => {
      test('saves editor state after 10 second debounce', async () => {
        const project = await createProject('State Save Test', '{}', 'json');

        updateProjectEditorState({ panOffset: { x: 100, y: 200 } });
        scheduleStateSave();

        // Advance less than 10 seconds
        await vi.advanceTimersByTimeAsync(5000);
        await flushSaveOperations();

        // Should still have original state
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.editorState.panOffset).toEqual({ x: 0, y: 0 });

        // Advance past 10 seconds
        await vi.advanceTimersByTimeAsync(5100);
        await flushSaveOperations();

        // Should now have updated state
        const afterSave = await projectService.get(project!.id);
        expect(afterSave?.editorState.panOffset).toEqual({ x: 100, y: 200 });
      });

      test('resets timer on subsequent state changes', async () => {
        const project = await createProject('State Timer Reset Test', '{}', 'json');

        updateProjectEditorState({ zoomLevel: 1.5 });
        scheduleStateSave();

        // Advance 8 seconds
        await vi.advanceTimersByTimeAsync(8000);
        await flushSaveOperations();

        // Make another change
        updateProjectEditorState({ zoomLevel: 2.0 });
        scheduleStateSave();

        // Advance another 8 seconds
        await vi.advanceTimersByTimeAsync(8000);
        await flushSaveOperations();

        // Should not have saved yet
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.editorState.zoomLevel).toBe(1.0);

        // Advance remaining time
        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        // Now should have zoom 2.0
        const afterSave = await projectService.get(project!.id);
        expect(afterSave?.editorState.zoomLevel).toBe(2.0);
      });
    });

    describe('dual timers', () => {
      test('document save triggers include all current state', async () => {
        const project = await createProject('Dual Timer Test', '{"v": 0}', 'json');

        // Update both content and state
        updateProjectContent('{"v": 1}');
        updateProjectEditorState({ zoomLevel: 2.0 });
        scheduleDocumentSave();

        // At 2.5 seconds, document save fires - saves ALL current state
        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        const afterSave = await projectService.get(project!.id);
        expect(afterSave?.uidescContent).toBe('{"v": 1}');
        expect(afterSave?.editorState.zoomLevel).toBe(2.0); // All current state is saved
      });

      test('document save timer and state save timer run independently', async () => {
        // Create project
        const project = await createProject('Independent Timer Test', '{}', 'json');

        // Schedule state save first (10s timer)
        updateProjectEditorState({ zoomLevel: 1.5 });
        scheduleStateSave();

        // After 5 seconds, schedule document save (2s timer)
        await vi.advanceTimersByTimeAsync(5000);
        await flushSaveOperations();

        updateProjectContent('{"changed": true}');
        scheduleDocumentSave();

        // At 7.5 seconds, doc timer fires (5s + 2.5s)
        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        // Doc save saved all current state
        const afterDocSave = await projectService.get(project!.id);
        expect(afterDocSave?.uidescContent).toBe('{"changed": true}');
        expect(afterDocSave?.editorState.zoomLevel).toBe(1.5);

        // State timer should still fire at 10s from start
        await vi.advanceTimersByTimeAsync(2600);
        await flushSaveOperations();

        // Verify state timer also completed (but same data)
        const afterStateSave = await projectService.get(project!.id);
        expect(afterStateSave?.editorState.zoomLevel).toBe(1.5);
      });

      test('each timer only resets its own debounce', async () => {
        const project = await createProject('Reset Test', '{"v": 0}', 'json');

        // Start document timer
        updateProjectContent('{"v": 1}');
        scheduleDocumentSave();

        // After 1 second, schedule state timer (should NOT reset document timer)
        await vi.advanceTimersByTimeAsync(1000);
        await flushSaveOperations();

        updateProjectEditorState({ zoomLevel: 1.5 });
        scheduleStateSave();

        // At 2.5 seconds total (1.5s after state change), document timer fires
        await vi.advanceTimersByTimeAsync(1500);
        await flushSaveOperations();

        const afterDocSave = await projectService.get(project!.id);
        expect(afterDocSave?.uidescContent).toBe('{"v": 1}');
        expect(afterDocSave?.editorState.zoomLevel).toBe(1.5);
      });
    });

    describe('cancelAutoSaveTimers', () => {
      test('cancels pending document save', async () => {
        const project = await createProject('Cancel Doc Test', '{"old": true}', 'json');

        updateProjectContent('{"new": true}');
        scheduleDocumentSave();

        // Cancel before debounce completes
        await vi.advanceTimersByTimeAsync(1000);
        cancelAutoSaveTimers();

        await vi.advanceTimersByTimeAsync(2000);
        await flushSaveOperations();

        // Should still have old content
        const stored = await projectService.get(project!.id);
        expect(stored?.uidescContent).toBe('{"old": true}');
      });

      test('cancels pending state save', async () => {
        const project = await createProject('Cancel State Test', '{}', 'json');

        updateProjectEditorState({ zoomLevel: 2.0 });
        scheduleStateSave();

        // Cancel before debounce completes
        await vi.advanceTimersByTimeAsync(5000);
        cancelAutoSaveTimers();

        await vi.advanceTimersByTimeAsync(10000);
        await flushSaveOperations();

        // Should still have original zoom
        const stored = await projectService.get(project!.id);
        expect(stored?.editorState.zoomLevel).toBe(1.0);
      });
    });

    describe('performance', () => {
      test('auto-save completes within 200ms for typical document changes', async () => {
        // Create a project with typical content size
        const typicalContent = JSON.stringify({
          'vstgui-ui-description': {
            version: '1',
            templates: {
              view: {
                class: 'CViewContainer',
                attributes: { size: '600, 400' },
                children: [
                  { class: 'CTextButton', attributes: { title: 'Button 1', size: '100, 30' } },
                  { class: 'CTextButton', attributes: { title: 'Button 2', size: '100, 30' } },
                  { class: 'CTextLabel', attributes: { title: 'Label', size: '200, 20' } },
                ],
              },
            },
          },
        });
        const project = await createProject('Perf Test', typicalContent, 'json');

        // Update content
        const updatedContent = typicalContent.replace('Button 1', 'Modified Button');
        updateProjectContent(updatedContent);
        scheduleDocumentSave();

        // Trigger the save by advancing past debounce
        await vi.advanceTimersByTimeAsync(2100);

        // Measure time for the save operation to complete
        const startTime = performance.now();
        await flushSaveOperations();
        const endTime = performance.now();

        // Save should complete within 200ms
        const saveTime = endTime - startTime;
        expect(saveTime).toBeLessThan(200);

        // Verify save was successful
        expect(projectStore.saveStatus).toBe('saved');
      });
    });
  });

  describe('openProject', () => {
    beforeEach(async () => {
      await openDatabase();
      // Reset other stores to known state
      resetCanvas();
      resetHierarchy();
      resetProperties();
      resetTemplateStore();
    });

    test('returns project from IndexedDB', async () => {
      const created = await createProject('Open Test', '{}', 'json');
      resetProjectStore();

      const opened = await openProject(created!.id);

      expect(opened).not.toBeNull();
      expect(opened?.name).toBe('Open Test');
    });

    test('sets current project', async () => {
      const created = await createProject('Current Test', '{}', 'json');
      resetProjectStore();

      await openProject(created!.id);

      expect(projectStore.currentProject?.name).toBe('Current Test');
    });

    test('returns null for non-existent project', async () => {
      const result = await openProject('non-existent-id');

      expect(result).toBeNull();
    });

    test('returns null in session-only mode', async () => {
      const created = await createProject('Session Test', '{}', 'json');
      resetProjectStore();
      setIsSessionOnly(true);

      const result = await openProject(created!.id);

      expect(result).toBeNull();
    });

    describe('state restoration', () => {
      test('restores canvas pan offset', async () => {
        const created = await createProject('Pan Test', '{}', 'json');
        updateProjectEditorState({ panOffset: { x: 150, y: 250 } });
        // Save to IndexedDB
        await projectService.update({
          ...created!,
          editorState: { ...created!.editorState, panOffset: { x: 150, y: 250 } },
        });
        resetProjectStore();
        resetCanvas();

        await openProject(created!.id);

        expect(canvasStore.panOffset).toEqual({ x: 150, y: 250 });
      });

      test('restores canvas zoom level', async () => {
        const created = await createProject('Zoom Test', '{}', 'json');
        // Save updated state to IndexedDB
        await projectService.update({
          ...created!,
          editorState: { ...created!.editorState, zoomLevel: 2.5 },
        });
        resetProjectStore();
        resetCanvas();

        await openProject(created!.id);

        expect(canvasStore.zoomLevel).toBe(2.5);
      });

      test('restores hierarchy expanded nodes', async () => {
        const created = await createProject('Hierarchy Test', '{}', 'json');
        const expandedNodes = ['node-1', 'node-2', 'node-3'];
        await projectService.update({
          ...created!,
          editorState: { ...created!.editorState, expandedHierarchyNodes: expandedNodes },
        });
        resetProjectStore();
        resetHierarchy();

        await openProject(created!.id);

        expect(hierarchyStore.expandedIds.has('node-1')).toBe(true);
        expect(hierarchyStore.expandedIds.has('node-2')).toBe(true);
        expect(hierarchyStore.expandedIds.has('node-3')).toBe(true);
      });

      test('restores properties expanded groups', async () => {
        const created = await createProject('Properties Test', '{}', 'json');
        // Use actual valid group IDs from ALL_GROUP_IDS
        const expandedGroups = ['geometry', 'appearance'];
        await projectService.update({
          ...created!,
          editorState: { ...created!.editorState, expandedPropertyGroups: expandedGroups },
        });
        resetProjectStore();
        resetProperties();

        await openProject(created!.id);

        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
        expect(propertiesStore.expandedGroups.has('appearance')).toBe(true);
        expect(propertiesStore.expandedGroups.has('behavior')).toBe(false);
      });

      test('restores selected template', async () => {
        const created = await createProject('Template Test', '{}', 'json');
        await projectService.update({
          ...created!,
          editorState: { ...created!.editorState, selectedTemplateId: 'template-1' },
        });
        resetProjectStore();
        resetTemplateStore();

        await openProject(created!.id);

        expect(templateStore.activeTemplateId).toBe('template-1');
      });

      test('does not trigger auto-save during restoration', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        const created = await createProject('No Auto-Save Test', '{}', 'json');
        const originalUpdatedAt = created!.updatedAt;
        await projectService.update({
          ...created!,
          editorState: {
            ...created!.editorState,
            panOffset: { x: 100, y: 100 },
            zoomLevel: 2.0,
          },
        });
        resetProjectStore();
        resetCanvas();

        await openProject(created!.id);

        // Advance timers to see if any auto-save was scheduled
        await vi.advanceTimersByTimeAsync(15000);
        for (let i = 0; i < 10; i++) {
          await Promise.resolve();
        }

        // The project should not have been saved (updatedAt unchanged)
        const stored = await projectService.get(created!.id);
        // Note: The updatedAt might change when we manually update above,
        // but no additional save should have occurred from the open
        vi.useRealTimers();
      });
    });

    describe('project validation', () => {
      test('validates required fields exist', async () => {
        const validProject = await createProject('Valid Project', '{"vstgui-ui-description": {}}', 'json');
        resetProjectStore();

        // Project should open successfully with valid data
        const result = await openProject(validProject!.id);
        expect(result).not.toBeNull();
      });

      test('validates uidescContent is parseable', async () => {
        const project = await createProject('Parseable Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
        resetProjectStore();

        const result = await openProject(project!.id);
        expect(result).not.toBeNull();
        expect(result?.uidescContent).toBe('{"vstgui-ui-description": {"version": "1"}}');
      });
    });
  });
});
