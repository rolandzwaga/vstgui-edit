/**
 * Project Serialization
 *
 * Functions to serialize and deserialize editor state and project settings
 * for storage in IndexedDB.
 *
 * Note: The current implementation uses simple structures that serialize
 * directly to JSON. These functions exist to provide a clear API boundary
 * and to handle any future transformation needs (e.g., if stores use Sets
 * that need to be converted to arrays).
 */

import type { EditorState, ProjectSettings } from './types';

// ============================================================================
// Editor State Serialization
// ============================================================================

/**
 * Serializes editor state for storage.
 *
 * Converts any non-JSON-serializable types (e.g., Sets) to arrays.
 *
 * @param state - The editor state to serialize
 * @returns Serializable editor state
 */
export function serializeEditorState(state: EditorState): EditorState {
  return {
    panOffset: { ...state.panOffset },
    zoomLevel: state.zoomLevel,
    expandedHierarchyNodes: [...state.expandedHierarchyNodes],
    expandedPropertyGroups: [...state.expandedPropertyGroups],
    selectedTemplateId: state.selectedTemplateId,
  };
}

/**
 * Deserializes editor state from storage.
 *
 * Reconstructs any non-JSON-serializable types (e.g., Sets from arrays).
 *
 * @param data - The stored editor state
 * @returns Deserialized editor state
 */
export function deserializeEditorState(data: EditorState): EditorState {
  return {
    panOffset: { x: data.panOffset.x, y: data.panOffset.y },
    zoomLevel: data.zoomLevel,
    expandedHierarchyNodes: [...data.expandedHierarchyNodes],
    expandedPropertyGroups: [...data.expandedPropertyGroups],
    selectedTemplateId: data.selectedTemplateId,
  };
}

// ============================================================================
// Project Settings Serialization
// ============================================================================

/**
 * Serializes project settings for storage.
 *
 * @param settings - The project settings to serialize
 * @returns Serializable project settings
 */
export function serializeProjectSettings(settings: ProjectSettings): ProjectSettings {
  return {
    grid: { ...settings.grid },
    snap: { ...settings.snap },
    smartGuides: { ...settings.smartGuides },
    customGuides: {
      snapEnabledByDefault: settings.customGuides.snapEnabledByDefault,
      guides: settings.customGuides.guides.map(guide => ({ ...guide })),
    },
    theme: { ...settings.theme },
    autoSave: { ...settings.autoSave },
  };
}

/**
 * Deserializes project settings from storage.
 *
 * @param data - The stored project settings
 * @returns Deserialized project settings
 */
export function deserializeProjectSettings(data: ProjectSettings): ProjectSettings {
  return {
    grid: {
      size: data.grid.size,
      style: data.grid.style,
      visibleByDefault: data.grid.visibleByDefault,
    },
    snap: {
      enabledByDefault: data.snap.enabledByDefault,
      threshold: data.snap.threshold,
    },
    smartGuides: {
      enabledByDefault: data.smartGuides.enabledByDefault,
    },
    customGuides: {
      snapEnabledByDefault: data.customGuides.snapEnabledByDefault,
      guides: data.customGuides.guides.map(guide => ({
        id: guide.id,
        orientation: guide.orientation,
        position: guide.position,
      })),
    },
    theme: {
      mode: data.theme.mode,
    },
    autoSave: {
      enabled: data.autoSave.enabled,
    },
  };
}
