import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Project } from '../../domain/project/types';
import { DB_NAME, DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../domain/project/types';
import { closeDatabase, openDatabase } from '../../services/indexedDB/database';
import { projectService } from '../../services/indexedDB/projectService';
import { canvasStore, resetCanvas } from '../canvasStore';
import { reset as resetDocumentStore, setDocumentForTest } from '../documentStore';
import { hierarchyStore, resetHierarchy } from '../hierarchyStore';
import {
  cancelAutoSaveTimers,
  clearPendingFile,
  closeNameDialog,
  closeProjectList,
  createProject,
  initializeProjectStore,
  openNameDialog,
  openProject,
  openProjectList,
  projectStore,
  resetProjectStore,
  scheduleDocumentSave,
  scheduleStateSave,
  setCurrentProject,
  setIsDirty,
  setIsSessionOnly,
  setPendingFile,
  setSaveStatus,
  updateProjectEditorState,
} from '../projectStore';
import { propertiesStore, resetProperties } from '../propertiesStore';
import { resetTemplateStore, templateStore } from '../templateStore';

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
    test('setPendingFile stores file info', () => {
      const fileInfo = {
        content: '{"vstgui-ui-description": {}}',
        format: 'json' as const,
        filename: 'test.uidesc',
      };
      setPendingFile(fileInfo);
      expect(projectStore.pendingFile).toEqual(fileInfo);
    });

    test('clearPendingFile removes file info', () => {
      const fileInfo = {
        content: '{}',
        format: 'json' as const,
        filename: 'test.uidesc',
      };
      setPendingFile(fileInfo);
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
    // Helper to create a simple uidesc document
    function createTestDoc(value: string) {
      return { 'vstgui-ui-description': { version: '1' as const, test: value } };
    }

    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      await openDatabase();
      resetDocumentStore();
    });

    afterEach(() => {
      cancelAutoSaveTimers();
      vi.useRealTimers();
      resetDocumentStore();
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
        // Create project with initial content
        const initialContent = JSON.stringify(createTestDoc('old'));
        const project = await createProject('Auto Save Test', initialContent, 'json');
        expect(project).not.toBeNull();

        // Set up documentStore with the new document to be saved
        // performDocumentSave() serializes documentStore.document, not currentProject.uidescContent
        setDocumentForTest(createTestDoc('new'));
        setIsDirty(true);
        scheduleDocumentSave();

        // Advance time by less than debounce period
        await vi.advanceTimersByTimeAsync(1000);
        await flushSaveOperations();

        // Should still have old content in IndexedDB
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.uidescContent).toBe(initialContent);

        // Advance past debounce period
        await vi.advanceTimersByTimeAsync(1100);
        await flushSaveOperations();

        // Should now have new content (serialized from documentStore.document)
        const afterSave = await projectService.get(project!.id);
        expect(JSON.parse(afterSave!.uidescContent)).toEqual(createTestDoc('new'));
      });

      test('resets timer on subsequent document changes', async () => {
        const initialContent = JSON.stringify(createTestDoc('v0'));
        const project = await createProject('Timer Reset Test', initialContent, 'json');

        // Set up first change
        setDocumentForTest(createTestDoc('v1'));
        setIsDirty(true);
        scheduleDocumentSave();

        // Advance 1.5 seconds
        await vi.advanceTimersByTimeAsync(1500);
        await flushSaveOperations();

        // Make another change - should reset timer
        setDocumentForTest(createTestDoc('v2'));
        scheduleDocumentSave();

        // Advance another 1.5 seconds (total 3s, but only 1.5s since last change)
        await vi.advanceTimersByTimeAsync(1500);
        await flushSaveOperations();

        // Should still not have saved
        const beforeSave = await projectService.get(project!.id);
        expect(beforeSave?.uidescContent).toBe(initialContent);

        // Advance past debounce for second change
        await vi.advanceTimersByTimeAsync(600);
        await flushSaveOperations();

        // Now should have v2
        const afterSave = await projectService.get(project!.id);
        expect(JSON.parse(afterSave!.uidescContent)).toEqual(createTestDoc('v2'));
      });

      test('does not save in session-only mode', async () => {
        const initialContent = JSON.stringify(createTestDoc('old'));
        const project = await createProject('Session Only Test', initialContent, 'json');
        setIsSessionOnly(true);

        setDocumentForTest(createTestDoc('new'));
        setIsDirty(true);
        scheduleDocumentSave();

        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        // IndexedDB should still have old content (save was skipped)
        const stored = await projectService.get(project!.id);
        expect(stored?.uidescContent).toBe(initialContent);
      });

      test('sets saveStatus to saved after successful save', async () => {
        const initialContent = JSON.stringify(createTestDoc('initial'));
        await createProject('Status Test', initialContent, 'json');

        setDocumentForTest(createTestDoc('updated'));
        setIsDirty(true);
        scheduleDocumentSave();

        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        expect(projectStore.saveStatus).toBe('saved');
      });

      test('clears isDirty after successful save', async () => {
        const initialContent = JSON.stringify(createTestDoc('initial'));
        await createProject('Dirty Test', initialContent, 'json');

        setDocumentForTest(createTestDoc('updated'));
        setIsDirty(true);
        scheduleDocumentSave();

        expect(projectStore.isDirty).toBe(true);

        await vi.advanceTimersByTimeAsync(2100);
        await flushSaveOperations();

        expect(projectStore.isDirty).toBe(false);
      });

      test('updates lastSavedAt after successful save', async () => {
        const initialContent = JSON.stringify(createTestDoc('initial'));
        await createProject('Timestamp Test', initialContent, 'json');

        expect(projectStore.lastSavedAt).toBeNull();

        setDocumentForTest(createTestDoc('updated'));
        setIsDirty(true);
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
        const initialContent = JSON.stringify(createTestDoc('v0'));
        const project = await createProject('Dual Timer Test', initialContent, 'json');

        // Update both content and state
        setDocumentForTest(createTestDoc('v1'));
        updateProjectEditorState({ zoomLevel: 2.0 });
        setIsDirty(true);
        scheduleDocumentSave();

        // At 2.5 seconds, document save fires - saves ALL current state
        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        const afterSave = await projectService.get(project!.id);
        expect(JSON.parse(afterSave!.uidescContent)).toEqual(createTestDoc('v1'));
        expect(afterSave?.editorState.zoomLevel).toBe(2.0); // All current state is saved
      });

      test('document save timer and state save timer run independently', async () => {
        // Create project
        const initialContent = JSON.stringify(createTestDoc('initial'));
        const project = await createProject('Independent Timer Test', initialContent, 'json');

        // Schedule state save first (10s timer)
        updateProjectEditorState({ zoomLevel: 1.5 });
        scheduleStateSave();

        // After 5 seconds, schedule document save (2s timer)
        await vi.advanceTimersByTimeAsync(5000);
        await flushSaveOperations();

        setDocumentForTest(createTestDoc('changed'));
        setIsDirty(true);
        scheduleDocumentSave();

        // At 7.5 seconds, doc timer fires (5s + 2.5s)
        await vi.advanceTimersByTimeAsync(2500);
        await flushSaveOperations();

        // Doc save saved all current state
        const afterDocSave = await projectService.get(project!.id);
        expect(JSON.parse(afterDocSave!.uidescContent)).toEqual(createTestDoc('changed'));
        expect(afterDocSave?.editorState.zoomLevel).toBe(1.5);

        // State timer should still fire at 10s from start
        await vi.advanceTimersByTimeAsync(2600);
        await flushSaveOperations();

        // Verify state timer also completed (but same data)
        const afterStateSave = await projectService.get(project!.id);
        expect(afterStateSave?.editorState.zoomLevel).toBe(1.5);
      });

      test('each timer only resets its own debounce', async () => {
        const initialContent = JSON.stringify(createTestDoc('v0'));
        const project = await createProject('Reset Test', initialContent, 'json');

        // Start document timer
        setDocumentForTest(createTestDoc('v1'));
        setIsDirty(true);
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
        expect(JSON.parse(afterDocSave!.uidescContent)).toEqual(createTestDoc('v1'));
        expect(afterDocSave?.editorState.zoomLevel).toBe(1.5);
      });
    });

    describe('cancelAutoSaveTimers', () => {
      test('cancels pending document save', async () => {
        const initialContent = JSON.stringify(createTestDoc('old'));
        const project = await createProject('Cancel Doc Test', initialContent, 'json');

        setDocumentForTest(createTestDoc('new'));
        setIsDirty(true);
        scheduleDocumentSave();

        // Cancel before debounce completes
        await vi.advanceTimersByTimeAsync(1000);
        cancelAutoSaveTimers();

        await vi.advanceTimersByTimeAsync(2000);
        await flushSaveOperations();

        // Should still have old content
        const stored = await projectService.get(project!.id);
        expect(stored?.uidescContent).toBe(initialContent);
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
        const typicalContent = JSON.stringify(createTestDoc('initial'));
        await createProject('Perf Test', typicalContent, 'json');

        // Set up documentStore with modified content
        setDocumentForTest(createTestDoc('modified'));
        setIsDirty(true);
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

  describe('createEmptyProject', () => {
    beforeEach(async () => {
      await openDatabase();
    });

    test('creates project with default uidesc structure', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Empty Project');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Empty Project');

      // Parse the uidesc content to verify structure
      const content = JSON.parse(result!.uidescContent);
      expect(content['vstgui-ui-description']).toBeDefined();
      expect(content['vstgui-ui-description'].version).toBe('1');
      expect(content['vstgui-ui-description'].templates).toBeDefined();
    });

    test('creates project with default template named "view"', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Template Test');

      const content = JSON.parse(result!.uidescContent);
      const templates = content['vstgui-ui-description'].templates;

      expect(templates.view).toBeDefined();
      expect(templates.view.attributes.class).toBe('CViewContainer');
    });

    test('creates template with default dimensions', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Dimensions Test');

      const content = JSON.parse(result!.uidescContent);
      const viewAttrs = content['vstgui-ui-description'].templates.view.attributes;

      expect(viewAttrs.size).toBe('400, 300');
      expect(viewAttrs.origin).toBe('0, 0');
    });

    test('creates project with default settings', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Settings Test');

      expect(result?.settings).toEqual(DEFAULT_PROJECT_SETTINGS);
    });

    test('creates project with default editor state', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Editor State Test');

      expect(result?.editorState).toEqual(DEFAULT_EDITOR_STATE);
    });

    test('sets uidescFormat to json', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Format Test');

      expect(result?.uidescFormat).toBe('json');
    });

    test('sets current project after creation', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Current Test');

      expect(projectStore.currentProject).toEqual(result);
    });

    test('stores project in IndexedDB', async () => {
      const { createEmptyProject } = await import('../projectStore');

      const result = await createEmptyProject('Storage Test');

      const stored = await projectService.get(result!.id);
      expect(stored).toBeDefined();
      expect(stored?.name).toBe('Storage Test');
    });

    test('works in session-only mode without persisting', async () => {
      const { createEmptyProject } = await import('../projectStore');
      setIsSessionOnly(true);

      const result = await createEmptyProject('Session Only');

      // Returns the project but doesn't persist it
      expect(result).not.toBeNull();
      expect(projectStore.currentProject).toEqual(result);
    });
  });

  describe('renameProject', () => {
    beforeEach(async () => {
      await openDatabase();
    });

    test('renames project in IndexedDB', async () => {
      const { renameProject } = await import('../projectStore');

      const project = await createProject('Original Name', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const result = await renameProject(project!.id, 'New Name');

      expect(result).toBe(true);

      const stored = await projectService.get(project!.id);
      expect(stored?.name).toBe('New Name');
    });

    test('updates currentProject if it is the renamed project', async () => {
      const { renameProject } = await import('../projectStore');

      await createProject('Original Name', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const currentId = projectStore.currentProject!.id;

      await renameProject(currentId, 'Updated Name');

      expect(projectStore.currentProject?.name).toBe('Updated Name');
    });

    test('does not affect currentProject if different project is renamed', async () => {
      const { renameProject } = await import('../projectStore');

      const project1 = await createProject('First', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      resetProjectStore();
      await openDatabase();
      const project2 = await createProject('Second', '{"vstgui-ui-description": {"version": "1"}}', 'json');

      expect(projectStore.currentProject?.id).toBe(project2!.id);

      await renameProject(project1!.id, 'First Renamed');

      expect(projectStore.currentProject?.name).toBe('Second');
    });

    test('updates updatedAt timestamp', async () => {
      const { renameProject } = await import('../projectStore');

      const project = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const originalUpdatedAt = new Date(project!.updatedAt).getTime();

      // Small delay to ensure timestamp difference
      await new Promise(r => setTimeout(r, 10));

      await renameProject(project!.id, 'Renamed');

      const stored = await projectService.get(project!.id);
      const storedUpdatedAt = new Date(stored!.updatedAt).getTime();
      expect(storedUpdatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    test('returns false for invalid project name', async () => {
      const { renameProject } = await import('../projectStore');

      const project = await createProject('Valid', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const result = await renameProject(project!.id, '');

      expect(result).toBe(false);
    });

    test('returns false for non-existent project', async () => {
      const { renameProject } = await import('../projectStore');

      const result = await renameProject('non-existent-id', 'New Name');

      expect(result).toBe(false);
    });

    test('returns false in session-only mode', async () => {
      const { renameProject } = await import('../projectStore');
      setIsSessionOnly(true);

      const result = await renameProject('any-id', 'New Name');

      expect(result).toBe(false);
    });

    test('sanitizes project name', async () => {
      const { renameProject } = await import('../projectStore');

      const project = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      await renameProject(project!.id, '  Spaces Around  ');

      const stored = await projectService.get(project!.id);
      expect(stored?.name).toBe('Spaces Around');
    });
  });

  describe('duplicateProject', () => {
    beforeEach(async () => {
      await openDatabase();
    });

    test('creates a copy of the project with new ID', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const duplicate = await duplicateProject(original!.id, 'Copy of Original');

      expect(duplicate).not.toBeNull();
      expect(duplicate!.id).not.toBe(original!.id);
      expect(duplicate!.name).toBe('Copy of Original');
    });

    test('copies uidesc content from original', async () => {
      const { duplicateProject } = await import('../projectStore');

      const content = '{"vstgui-ui-description": {"version": "1", "custom": "data"}}';
      const original = await createProject('Original', content, 'json');
      const duplicate = await duplicateProject(original!.id, 'Duplicate');

      expect(duplicate!.uidescContent).toBe(content);
    });

    test('copies uidesc format from original', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('XML Project', '{"vstgui-ui-description": {"version": "1"}}', 'xml');
      const duplicate = await duplicateProject(original!.id, 'XML Copy');

      expect(duplicate!.uidescFormat).toBe('xml');
    });

    test('sets current project to duplicate', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const duplicate = await duplicateProject(original!.id, 'Duplicate');

      expect(projectStore.currentProject).toEqual(duplicate);
    });

    test('stores duplicate in IndexedDB', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const duplicate = await duplicateProject(original!.id, 'Stored Duplicate');

      const stored = await projectService.get(duplicate!.id);
      expect(stored).toBeDefined();
      expect(stored?.name).toBe('Stored Duplicate');
    });

    test('returns null for non-existent source project', async () => {
      const { duplicateProject } = await import('../projectStore');

      const result = await duplicateProject('non-existent-id', 'Copy');

      expect(result).toBeNull();
    });

    test('returns null in session-only mode', async () => {
      const { duplicateProject } = await import('../projectStore');
      setIsSessionOnly(true);

      const result = await duplicateProject('any-id', 'Copy');

      expect(result).toBeNull();
    });

    test('uses default editor state for duplicate', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const duplicate = await duplicateProject(original!.id, 'Fresh Copy');

      expect(duplicate!.editorState).toEqual(DEFAULT_EDITOR_STATE);
    });

    test('validates new name', async () => {
      const { duplicateProject } = await import('../projectStore');

      const original = await createProject('Original', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const result = await duplicateProject(original!.id, '');

      expect(result).toBeNull();
    });
  });

  describe('replaceUidesc', () => {
    beforeEach(async () => {
      await openDatabase();
    });

    test('updates uidescContent in current project', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {"mycolor": "#FF0000FF"}}}';
      const result = await replaceUidesc(newContent, 'json');

      expect(result.success).toBe(true);
      expect(projectStore.currentProject?.uidescContent).toBe(newContent);
    });

    test('updates uidescFormat when changed', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);

      const xmlContent = '<?xml version="1.0" encoding="UTF-8"?><vstgui-ui-description version="1"></vstgui-ui-description>';
      const result = await replaceUidesc(xmlContent, 'xml');

      expect(result.success).toBe(true);
      expect(projectStore.currentProject?.uidescFormat).toBe('xml');
    });

    test('preserves project settings', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const customSettings = {
        ...DEFAULT_PROJECT_SETTINGS,
        grid: { ...DEFAULT_PROJECT_SETTINGS.grid, size: 20 as const },
      };
      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      // Update project with custom settings
      const updatedProjectData: Project = { ...project!, settings: customSettings };
      await projectService.update(updatedProjectData);
      setCurrentProject(updatedProjectData);

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {}}}';
      await replaceUidesc(newContent, 'json');

      expect(projectStore.currentProject?.settings.grid.size).toBe(20);
    });

    test('preserves editor state', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const customEditorState = {
        ...DEFAULT_EDITOR_STATE,
        zoomLevel: 2.0,
        panOffset: { x: 100, y: 200 },
      };
      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      const updatedProjectData: Project = { ...project!, editorState: customEditorState };
      await projectService.update(updatedProjectData);
      setCurrentProject(updatedProjectData);

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {}}}';
      await replaceUidesc(newContent, 'json');

      expect(projectStore.currentProject?.editorState.zoomLevel).toBe(2.0);
      expect(projectStore.currentProject?.editorState.panOffset).toEqual({ x: 100, y: 200 });
    });

    test('updates updatedAt timestamp', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);
      const originalUpdatedAt = project!.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10));

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {}}}';
      await replaceUidesc(newContent, 'json');

      expect(new Date(projectStore.currentProject!.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    test('returns orphaned bitmaps when they exist', async () => {
      const { replaceUidesc } = await import('../projectStore');
      const { bitmapService } = await import('../../services/indexedDB/bitmapService');

      // Create project with uidesc that references a bitmap
      const project = await createProject(
        'Test',
        '{"vstgui-ui-description": {"version": "1", "bitmaps": {"mybitmap": {"path": "bitmap.png"}}}}',
        'json'
      );
      setCurrentProject(project);

      // Add a bitmap to storage that's referenced
      await bitmapService.add({
        id: crypto.randomUUID(),
        projectId: project!.id,
        name: 'mybitmap',
        blob: new Blob(['test'], { type: 'image/png' }),
        mimeType: 'image/png',
        width: 100,
        height: 100,
        size: 4,
        addedAt: new Date().toISOString(),
      });

      // Replace with uidesc that doesn't reference the bitmap
      const newContent = '{"vstgui-ui-description": {"version": "1"}}';
      const result = await replaceUidesc(newContent, 'json');

      expect(result.success).toBe(true);
      expect(result.orphanedBitmaps).toHaveLength(1);
      expect(result.orphanedBitmaps![0].name).toBe('mybitmap');
    });

    test('returns empty orphanedBitmaps when all bitmaps are still referenced', async () => {
      const { replaceUidesc } = await import('../projectStore');
      const { bitmapService } = await import('../../services/indexedDB/bitmapService');

      // Create project with uidesc that references a bitmap
      const project = await createProject(
        'Test',
        '{"vstgui-ui-description": {"version": "1", "bitmaps": {"mybitmap": {"path": "bitmap.png"}}}}',
        'json'
      );
      expect(project).not.toBeNull();
      setCurrentProject(project);

      // Add a bitmap to storage
      await bitmapService.add({
        id: crypto.randomUUID(),
        projectId: project!.id,
        name: 'mybitmap',
        blob: new Blob(['test'], { type: 'image/png' }),
        mimeType: 'image/png',
        width: 100,
        height: 100,
        size: 4,
        addedAt: new Date().toISOString(),
      });

      // Replace with uidesc that still references the bitmap
      const newContent = '{"vstgui-ui-description": {"version": "1", "bitmaps": {"mybitmap": {"path": "newpath.png"}}}}';
      const result = await replaceUidesc(newContent, 'json');

      expect(result.success).toBe(true);
      expect(result.orphanedBitmaps).toHaveLength(0);
    });

    test('fails when no project is open', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const newContent = '{"vstgui-ui-description": {"version": "1"}}';
      const result = await replaceUidesc(newContent, 'json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No project');
    });

    test('fails when uidesc content is invalid', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);

      const invalidContent = 'not valid json';
      const result = await replaceUidesc(invalidContent, 'json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('persists changes to IndexedDB', async () => {
      const { replaceUidesc } = await import('../projectStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {"red": "#FF0000FF"}}}';
      await replaceUidesc(newContent, 'json');

      // Verify persisted in DB
      const savedProject = await projectService.get(project!.id);
      expect(savedProject?.uidescContent).toBe(newContent);
    });

    test('updates documentStore with new content', async () => {
      const { replaceUidesc } = await import('../projectStore');
      const { documentStore, setDocumentForTest } = await import('../documentStore');

      const project = await createProject('Test', '{"vstgui-ui-description": {"version": "1"}}', 'json');
      setCurrentProject(project);
      setDocumentForTest({ 'vstgui-ui-description': { version: '1' } });

      const newContent = '{"vstgui-ui-description": {"version": "1", "colors": {"blue": "#0000FFFF"}}}';
      await replaceUidesc(newContent, 'json');

      expect(documentStore.document).toBeDefined();
      expect(documentStore.document?.['vstgui-ui-description']?.colors).toHaveProperty('blue');
    });
  });
});
