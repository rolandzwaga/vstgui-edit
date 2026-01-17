import { describe, expect, test } from 'vitest';

import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../types';
import type { EditorState, ProjectSettings } from '../types';
import {
  serializeEditorState,
  deserializeEditorState,
  serializeProjectSettings,
  deserializeProjectSettings,
} from '../serialization';

describe('serializeEditorState', () => {
  test('serializes default editor state', () => {
    const result = serializeEditorState(DEFAULT_EDITOR_STATE);

    expect(result).toEqual(DEFAULT_EDITOR_STATE);
  });

  test('serializes custom pan offset', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      panOffset: { x: 100, y: 200 },
    };

    const result = serializeEditorState(state);

    expect(result.panOffset).toEqual({ x: 100, y: 200 });
  });

  test('serializes custom zoom level', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      zoomLevel: 2.5,
    };

    const result = serializeEditorState(state);

    expect(result.zoomLevel).toBe(2.5);
  });

  test('preserves array of expanded hierarchy nodes', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      expandedHierarchyNodes: ['node1', 'node2', 'node3'],
    };

    const result = serializeEditorState(state);

    expect(result.expandedHierarchyNodes).toEqual(['node1', 'node2', 'node3']);
  });

  test('preserves array of expanded property groups', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      expandedPropertyGroups: ['layout', 'appearance'],
    };

    const result = serializeEditorState(state);

    expect(result.expandedPropertyGroups).toEqual(['layout', 'appearance']);
  });

  test('serializes selected template id', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      selectedTemplateId: 'MainView',
    };

    const result = serializeEditorState(state);

    expect(result.selectedTemplateId).toBe('MainView');
  });

  test('preserves null template id', () => {
    const state: EditorState = {
      ...DEFAULT_EDITOR_STATE,
      selectedTemplateId: null,
    };

    const result = serializeEditorState(state);

    expect(result.selectedTemplateId).toBeNull();
  });
});

describe('deserializeEditorState', () => {
  test('deserializes default editor state', () => {
    const result = deserializeEditorState(DEFAULT_EDITOR_STATE);

    expect(result).toEqual(DEFAULT_EDITOR_STATE);
  });

  test('deserializes custom values', () => {
    const data: EditorState = {
      panOffset: { x: 50, y: 75 },
      zoomLevel: 1.5,
      expandedHierarchyNodes: ['a', 'b'],
      expandedPropertyGroups: ['layout'],
      selectedTemplateId: 'TestView',
    };

    const result = deserializeEditorState(data);

    expect(result.panOffset).toEqual({ x: 50, y: 75 });
    expect(result.zoomLevel).toBe(1.5);
    expect(result.expandedHierarchyNodes).toEqual(['a', 'b']);
    expect(result.expandedPropertyGroups).toEqual(['layout']);
    expect(result.selectedTemplateId).toBe('TestView');
  });
});

describe('serializeProjectSettings', () => {
  test('serializes default project settings', () => {
    const result = serializeProjectSettings(DEFAULT_PROJECT_SETTINGS);

    expect(result).toEqual(DEFAULT_PROJECT_SETTINGS);
  });

  test('serializes custom grid settings', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      grid: {
        size: 20,
        style: 'dots',
        visibleByDefault: true,
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.grid).toEqual({
      size: 20,
      style: 'dots',
      visibleByDefault: true,
    });
  });

  test('serializes custom snap settings', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      snap: {
        enabledByDefault: true,
        threshold: 10,
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.snap).toEqual({
      enabledByDefault: true,
      threshold: 10,
    });
  });

  test('serializes smart guides settings', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      smartGuides: {
        enabledByDefault: false,
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.smartGuides.enabledByDefault).toBe(false);
  });

  test('serializes custom guides', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      customGuides: {
        snapEnabledByDefault: false,
        guides: [
          { id: 'g1', orientation: 'horizontal', position: 100 },
          { id: 'g2', orientation: 'vertical', position: 200 },
        ],
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.customGuides.guides).toHaveLength(2);
    expect(result.customGuides.guides[0]).toEqual({
      id: 'g1',
      orientation: 'horizontal',
      position: 100,
    });
  });

  test('serializes theme settings', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      theme: {
        mode: 'dark',
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.theme.mode).toBe('dark');
  });

  test('serializes auto-save settings', () => {
    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      autoSave: {
        enabled: false,
      },
    };

    const result = serializeProjectSettings(settings);

    expect(result.autoSave.enabled).toBe(false);
  });
});

describe('deserializeProjectSettings', () => {
  test('deserializes default project settings', () => {
    const result = deserializeProjectSettings(DEFAULT_PROJECT_SETTINGS);

    expect(result).toEqual(DEFAULT_PROJECT_SETTINGS);
  });

  test('deserializes custom settings', () => {
    const data: ProjectSettings = {
      grid: {
        size: 16,
        style: 'crosshairs',
        visibleByDefault: true,
      },
      snap: {
        enabledByDefault: true,
        threshold: 8,
      },
      smartGuides: {
        enabledByDefault: false,
      },
      customGuides: {
        snapEnabledByDefault: false,
        guides: [{ id: 'test', orientation: 'vertical', position: 50 }],
      },
      theme: {
        mode: 'light',
      },
      autoSave: {
        enabled: true,
      },
    };

    const result = deserializeProjectSettings(data);

    expect(result.grid.size).toBe(16);
    expect(result.grid.style).toBe('crosshairs');
    expect(result.snap.threshold).toBe(8);
    expect(result.customGuides.guides).toHaveLength(1);
    expect(result.theme.mode).toBe('light');
  });
});

describe('roundtrip conversions', () => {
  test('editor state survives serialize/deserialize roundtrip', () => {
    const original: EditorState = {
      panOffset: { x: 123.5, y: -456.7 },
      zoomLevel: 2.75,
      expandedHierarchyNodes: ['root', 'child1', 'child2'],
      expandedPropertyGroups: ['identity', 'layout', 'appearance'],
      selectedTemplateId: 'MainView',
    };

    const serialized = serializeEditorState(original);
    const deserialized = deserializeEditorState(serialized);

    expect(deserialized).toEqual(original);
  });

  test('project settings survives serialize/deserialize roundtrip', () => {
    const original: ProjectSettings = {
      grid: {
        size: 12,
        style: 'dots',
        visibleByDefault: true,
      },
      snap: {
        enabledByDefault: true,
        threshold: 15,
      },
      smartGuides: {
        enabledByDefault: false,
      },
      customGuides: {
        snapEnabledByDefault: true,
        guides: [
          { id: 'h1', orientation: 'horizontal', position: 100 },
          { id: 'v1', orientation: 'vertical', position: 200 },
        ],
      },
      theme: {
        mode: 'dark',
      },
      autoSave: {
        enabled: false,
      },
    };

    const serialized = serializeProjectSettings(original);
    const deserialized = deserializeProjectSettings(serialized);

    expect(deserialized).toEqual(original);
  });

  test('handles empty arrays', () => {
    const original: EditorState = {
      panOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      expandedHierarchyNodes: [],
      expandedPropertyGroups: [],
      selectedTemplateId: null,
    };

    const serialized = serializeEditorState(original);
    const deserialized = deserializeEditorState(serialized);

    expect(deserialized.expandedHierarchyNodes).toEqual([]);
    expect(deserialized.expandedPropertyGroups).toEqual([]);
  });
});
