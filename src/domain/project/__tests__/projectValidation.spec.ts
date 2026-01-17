/**
 * Project validation tests
 */

import { describe, expect, it } from 'vitest';
import { type ProjectValidationResult, validateProjectRecord } from '../projectValidation';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../types';

describe('projectValidation', () => {
  const validProject = {
    id: 'test-id-123',
    name: 'Test Project',
    createdAt: '2025-01-15T12:00:00.000Z',
    updatedAt: '2025-01-15T12:00:00.000Z',
    uidescContent: JSON.stringify({
      'vstgui-ui-description': {
        version: '1',
        templates: {},
      },
    }),
    uidescFormat: 'json' as const,
    editorState: { ...DEFAULT_EDITOR_STATE },
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl: null,
  };

  describe('validateProjectRecord', () => {
    it('returns valid for a complete valid project', () => {
      const result = validateProjectRecord(validProject);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.canRestore).toBe(true);
    });

    it('returns invalid when project is not an object', () => {
      const result = validateProjectRecord(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project data is not an object');
      expect(result.canRestore).toBe(false);
    });

    it('returns invalid when project is a string', () => {
      const result = validateProjectRecord('not an object');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project data is not an object');
    });

    it('returns invalid when id is missing', () => {
      const project = { ...validProject, id: undefined };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing or invalid project ID');
    });

    it('returns invalid when id is empty string', () => {
      const project = { ...validProject, id: '' };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing or invalid project ID');
    });

    it('returns invalid when name is missing', () => {
      const project = { ...validProject, name: undefined };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing or invalid project name');
    });

    it('returns invalid when uidescContent is missing', () => {
      const project = { ...validProject, uidescContent: undefined };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing uidesc content');
      expect(result.canRestore).toBe(false);
    });

    it('returns invalid when uidescContent is not parseable', () => {
      const project = { ...validProject, uidescContent: 'not valid json or xml' };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('uidesc content is not valid JSON or XML');
    });

    it('returns invalid when createdAt is missing', () => {
      const project = { ...validProject, createdAt: undefined };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing creation timestamp');
    });

    it('returns invalid when updatedAt is missing', () => {
      const project = { ...validProject, updatedAt: undefined };
      const result = validateProjectRecord(project);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing update timestamp');
    });

    describe('editorState validation', () => {
      it('returns invalid when editorState is not an object', () => {
        const project = { ...validProject, editorState: 'not an object' };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('editorState is not an object');
      });

      it('returns invalid when panOffset is missing', () => {
        const project = {
          ...validProject,
          editorState: { ...DEFAULT_EDITOR_STATE, panOffset: undefined },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('editorState.panOffset is missing or invalid');
      });

      it('returns invalid when zoomLevel is not a number', () => {
        const project = {
          ...validProject,
          editorState: { ...DEFAULT_EDITOR_STATE, zoomLevel: 'not a number' },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('editorState.zoomLevel is missing or invalid');
      });

      it('returns invalid when expandedHierarchyNodes is not an array', () => {
        const project = {
          ...validProject,
          editorState: { ...DEFAULT_EDITOR_STATE, expandedHierarchyNodes: 'not an array' },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('editorState.expandedHierarchyNodes is missing or invalid');
      });
    });

    describe('settings validation', () => {
      it('returns invalid when settings is not an object', () => {
        const project = { ...validProject, settings: 'not an object' };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('settings is not an object');
      });

      it('returns invalid when settings.grid is missing', () => {
        const project = {
          ...validProject,
          settings: { ...DEFAULT_PROJECT_SETTINGS, grid: undefined },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('settings.grid is missing or invalid');
      });

      it('returns invalid when settings.snap is missing', () => {
        const project = {
          ...validProject,
          settings: { ...DEFAULT_PROJECT_SETTINGS, snap: undefined },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('settings.snap is missing or invalid');
      });

      it('returns invalid when settings.theme is missing', () => {
        const project = {
          ...validProject,
          settings: { ...DEFAULT_PROJECT_SETTINGS, theme: undefined },
        };
        const result = validateProjectRecord(project);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('settings.theme is missing or invalid');
      });
    });

    describe('restoration capability', () => {
      it('can restore project with missing name', () => {
        const project = { ...validProject, name: undefined };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(true);
        expect(result.repairedProject).toBeDefined();
        expect(result.repairedProject?.name).toBe('Recovered Project');
      });

      it('can restore project with missing timestamps', () => {
        const project = {
          ...validProject,
          createdAt: undefined,
          updatedAt: undefined,
        };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(true);
        expect(result.repairedProject).toBeDefined();
        expect(result.repairedProject?.createdAt).toBeDefined();
        expect(result.repairedProject?.updatedAt).toBeDefined();
      });

      it('can restore project with missing editorState', () => {
        const project = { ...validProject, editorState: undefined };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(true);
        expect(result.repairedProject?.editorState).toEqual(DEFAULT_EDITOR_STATE);
      });

      it('can restore project with missing settings', () => {
        const project = { ...validProject, settings: undefined };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(true);
        expect(result.repairedProject?.settings).toEqual(DEFAULT_PROJECT_SETTINGS);
      });

      it('cannot restore project without id', () => {
        const project = { ...validProject, id: undefined };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(false);
        expect(result.repairedProject).toBeUndefined();
      });

      it('cannot restore project without uidescContent', () => {
        const project = { ...validProject, uidescContent: undefined };
        const result = validateProjectRecord(project);

        expect(result.canRestore).toBe(false);
        expect(result.repairedProject).toBeUndefined();
      });

      it('preserves valid fields when repairing', () => {
        const project = {
          ...validProject,
          name: undefined,
          editorState: { ...DEFAULT_EDITOR_STATE, zoomLevel: 2.5 },
        };
        const result = validateProjectRecord(project);

        expect(result.repairedProject?.id).toBe(validProject.id);
        expect(result.repairedProject?.uidescContent).toBe(validProject.uidescContent);
        expect(result.repairedProject?.editorState.zoomLevel).toBe(2.5);
      });

      it('merges partial settings with defaults', () => {
        const project = {
          ...validProject,
          settings: {
            grid: { size: 20 },
            // Missing other required settings
          },
        };
        const result = validateProjectRecord(project);

        expect(result.repairedProject?.settings.grid.size).toBe(20);
        expect(result.repairedProject?.settings.grid.style).toBe('lines');
        expect(result.repairedProject?.settings.snap).toEqual(DEFAULT_PROJECT_SETTINGS.snap);
      });
    });

    describe('multiple errors', () => {
      it('collects all validation errors', () => {
        const project = {
          id: '',
          name: '',
          uidescContent: '',
          editorState: null,
          settings: null,
        };
        const result = validateProjectRecord(project);

        expect(result.errors.length).toBeGreaterThan(1);
        expect(result.errors).toContain('Missing or invalid project ID');
        expect(result.errors).toContain('Missing or invalid project name');
        expect(result.errors).toContain('Missing uidesc content');
      });
    });
  });
});
