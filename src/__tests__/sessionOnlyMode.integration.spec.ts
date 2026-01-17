/**
 * Session-Only Mode Integration Tests
 *
 * Tests that verify the editor works correctly without IndexedDB,
 * including importing, editing, and exporting without persistence.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projectService } from '../services/indexedDB/projectService';
import {
  closeCurrentProject,
  createProject,
  projectStore,
  resetProjectStore,
  setIsSessionOnly,
  updateProjectContent,
} from '../stores/projectStore';

describe('Session-Only Mode Integration', () => {
  beforeEach(() => {
    // Start fresh
    resetProjectStore();
    // Enable session-only mode to simulate IndexedDB unavailable
    setIsSessionOnly(true);
  });

  afterEach(() => {
    resetProjectStore();
    vi.clearAllMocks();
  });

  it('sets isSessionOnly flag correctly', () => {
    expect(projectStore.isSessionOnly).toBe(true);
  });

  describe('project creation', () => {
    it('creates project in memory without IndexedDB call', async () => {
      const createSpy = vi.spyOn(projectService, 'create');
      const uidescContent = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            view: {
              attributes: {
                class: 'CViewContainer',
                size: '400, 300',
              },
            },
          },
        },
      });

      const project = await createProject('Test Project', uidescContent, 'json');

      expect(project).not.toBeNull();
      expect(project?.name).toBe('Test Project');
      expect(projectStore.currentProject?.id).toBe(project?.id);
      // IndexedDB should NOT be called in session-only mode
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('project is available in store after creation', async () => {
      const uidescContent = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });

      await createProject('My Plugin', uidescContent, 'json');

      expect(projectStore.currentProject).not.toBeNull();
      expect(projectStore.currentProject?.name).toBe('My Plugin');
      expect(projectStore.currentProject?.uidescContent).toBe(uidescContent);
    });
  });

  describe('project editing', () => {
    it('tracks content changes in memory', async () => {
      const uidescContent = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });

      await createProject('Edit Test', uidescContent, 'json');

      const newContent = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            modified: { attributes: { class: 'CView' } },
          },
        },
      });

      updateProjectContent(newContent);

      expect(projectStore.currentProject?.uidescContent).toBe(newContent);
      expect(projectStore.isDirty).toBe(true);
    });

    it('does not attempt to auto-save in session-only mode', async () => {
      const updateSpy = vi.spyOn(projectService, 'update');
      const uidescContent = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });

      await createProject('No Save Test', uidescContent, 'json');

      updateProjectContent('{"vstgui-ui-description":{}}');

      // Even after making changes, no IndexedDB calls
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('project lifecycle', () => {
    it('can close project without persistence errors', async () => {
      const uidescContent = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });

      await createProject('Close Test', uidescContent, 'json');
      expect(projectStore.currentProject).not.toBeNull();

      closeCurrentProject();

      expect(projectStore.currentProject).toBeNull();
      expect(projectStore.isDirty).toBe(false);
    });

    it('can create multiple projects in sequence', async () => {
      const content1 = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: { a: {} } },
      });
      const content2 = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: { b: {} } },
      });

      const project1 = await createProject('Project 1', content1, 'json');
      expect(projectStore.currentProject?.id).toBe(project1?.id);

      const project2 = await createProject('Project 2', content2, 'json');
      expect(projectStore.currentProject?.id).toBe(project2?.id);
      expect(projectStore.currentProject?.name).toBe('Project 2');
    });
  });

  describe('store state integrity', () => {
    it('maintains correct state throughout workflow', async () => {
      // Initial state
      expect(projectStore.currentProject).toBeNull();
      expect(projectStore.isDirty).toBe(false);
      expect(projectStore.saveStatus).toBe('idle');

      // Create project
      const content = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });
      await createProject('Workflow Test', content, 'json');

      expect(projectStore.currentProject).not.toBeNull();
      expect(projectStore.isDirty).toBe(false);
      expect(projectStore.saveStatus).toBe('idle');

      // Make changes
      updateProjectContent('{"vstgui-ui-description":{"version":"1"}}');

      expect(projectStore.isDirty).toBe(true);

      // Close project
      closeCurrentProject();

      expect(projectStore.currentProject).toBeNull();
      expect(projectStore.isDirty).toBe(false);
    });

    it('preserves editor state in project without persistence', async () => {
      const content = JSON.stringify({
        'vstgui-ui-description': { version: '1', templates: {} },
      });

      const project = await createProject('State Test', content, 'json');

      // Editor state should be initialized
      expect(project?.editorState.zoomLevel).toBe(1.0);
      expect(project?.editorState.panOffset).toEqual({ x: 0, y: 0 });
      expect(project?.editorState.expandedHierarchyNodes).toEqual([]);
    });
  });

  describe('export in session-only mode', () => {
    it('project data is available for export', async () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            main: {
              attributes: {
                class: 'CViewContainer',
                size: '800, 600',
              },
            },
          },
        },
      });

      await createProject('Export Test', content, 'json');

      // Verify content is available
      const project = projectStore.currentProject;
      expect(project?.uidescContent).toBe(content);
      expect(project?.uidescFormat).toBe('json');
      expect(project?.name).toBe('Export Test');
    });
  });

  describe('getAllProjects returns empty in session-only mode', () => {
    it('returns empty array when isSessionOnly', async () => {
      // Import the function
      const { getAllProjects } = await import('../stores/projectStore');

      const projects = await getAllProjects();

      expect(projects).toEqual([]);
    });
  });
});
