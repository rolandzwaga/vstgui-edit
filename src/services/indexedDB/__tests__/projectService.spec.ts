import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { DB_NAME, DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../../domain/project/types';
import type { Project } from '../../../domain/project/types';
import { openDatabase, closeDatabase } from '../database';
import { projectService } from '../projectService';

function createTestProject(overrides: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Test Project',
    createdAt: now,
    updatedAt: now,
    uidescContent: '{"vstgui-ui-description": {}}',
    uidescFormat: 'json',
    editorState: { ...DEFAULT_EDITOR_STATE },
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl: null,
    ...overrides,
  };
}

describe('projectService', () => {
  beforeEach(async () => {
    closeDatabase();
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
    await openDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('create', () => {
    test('creates a new project', async () => {
      const project = createTestProject({ name: 'New Project' });
      await projectService.create(project);

      const retrieved = await projectService.get(project.id);
      expect(retrieved).toEqual(project);
    });

    test('creates project with all fields stored', async () => {
      const project = createTestProject({
        name: 'Full Project',
        uidescContent: '<vstgui-ui-description></vstgui-ui-description>',
        uidescFormat: 'xml',
        editorState: {
          panOffset: { x: 100, y: 200 },
          zoomLevel: 1.5,
          expandedHierarchyNodes: ['node1', 'node2'],
          expandedPropertyGroups: ['layout'],
          selectedTemplateId: 'MainView',
        },
        thumbnailDataUrl: 'data:image/png;base64,abc123',
      });

      await projectService.create(project);
      const retrieved = await projectService.get(project.id);

      expect(retrieved).toEqual(project);
    });
  });

  describe('get', () => {
    test('returns project by id', async () => {
      const project = createTestProject();
      await projectService.create(project);

      const retrieved = await projectService.get(project.id);
      expect(retrieved).toEqual(project);
    });

    test('returns undefined for non-existent id', async () => {
      const retrieved = await projectService.get('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    test('returns empty array when no projects exist', async () => {
      const projects = await projectService.getAll();
      expect(projects).toEqual([]);
    });

    test('returns all projects', async () => {
      const project1 = createTestProject({ name: 'Project 1' });
      const project2 = createTestProject({ name: 'Project 2' });
      const project3 = createTestProject({ name: 'Project 3' });

      await projectService.create(project1);
      await projectService.create(project2);
      await projectService.create(project3);

      const projects = await projectService.getAll();
      expect(projects).toHaveLength(3);
    });

    test('returns projects sorted by updatedAt descending (most recent first)', async () => {
      const old = createTestProject({
        name: 'Old Project',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      const recent = createTestProject({
        name: 'Recent Project',
        updatedAt: '2024-12-31T23:59:59.999Z',
      });
      const middle = createTestProject({
        name: 'Middle Project',
        updatedAt: '2024-06-15T12:00:00.000Z',
      });

      // Insert in random order
      await projectService.create(old);
      await projectService.create(recent);
      await projectService.create(middle);

      const projects = await projectService.getAll();

      expect(projects[0].name).toBe('Recent Project');
      expect(projects[1].name).toBe('Middle Project');
      expect(projects[2].name).toBe('Old Project');
    });
  });

  describe('update', () => {
    test('updates existing project', async () => {
      const project = createTestProject({ name: 'Original Name' });
      await projectService.create(project);

      const updatedProject = { ...project, name: 'Updated Name' };
      await projectService.update(updatedProject);

      const retrieved = await projectService.get(project.id);
      expect(retrieved?.name).toBe('Updated Name');
    });

    test('updates editor state', async () => {
      const project = createTestProject();
      await projectService.create(project);

      const updatedProject = {
        ...project,
        editorState: {
          ...project.editorState,
          zoomLevel: 2.0,
          panOffset: { x: 50, y: 100 },
        },
      };
      await projectService.update(updatedProject);

      const retrieved = await projectService.get(project.id);
      expect(retrieved?.editorState.zoomLevel).toBe(2.0);
      expect(retrieved?.editorState.panOffset).toEqual({ x: 50, y: 100 });
    });

    test('updates uidesc content', async () => {
      const project = createTestProject({ uidescContent: '{"old": true}' });
      await projectService.create(project);

      const updatedProject = { ...project, uidescContent: '{"new": true}' };
      await projectService.update(updatedProject);

      const retrieved = await projectService.get(project.id);
      expect(retrieved?.uidescContent).toBe('{"new": true}');
    });

    test('updates settings', async () => {
      const project = createTestProject();
      await projectService.create(project);

      const updatedProject = {
        ...project,
        settings: {
          ...project.settings,
          grid: { ...project.settings.grid, size: 20 as const },
        },
      };
      await projectService.update(updatedProject);

      const retrieved = await projectService.get(project.id);
      expect(retrieved?.settings.grid.size).toBe(20);
    });
  });

  describe('delete', () => {
    test('deletes project by id', async () => {
      const project = createTestProject();
      await projectService.create(project);

      await projectService.delete(project.id);

      const retrieved = await projectService.get(project.id);
      expect(retrieved).toBeUndefined();
    });

    test('does not throw when deleting non-existent project', async () => {
      await expect(projectService.delete('non-existent-id')).resolves.not.toThrow();
    });

    test('only deletes specified project', async () => {
      const project1 = createTestProject({ name: 'Project 1' });
      const project2 = createTestProject({ name: 'Project 2' });

      await projectService.create(project1);
      await projectService.create(project2);

      await projectService.delete(project1.id);

      const projects = await projectService.getAll();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Project 2');
    });
  });
});
