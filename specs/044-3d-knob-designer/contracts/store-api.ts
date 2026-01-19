/**
 * Knob Designer Store API Contract
 *
 * Defines the public interface for the knob designer modal store.
 * This file serves as a contract for implementation.
 */

import type {
  KnobDesign,
  KnobLayer,
  KnobIndicator,
  LightingConfig,
  OutputConfig,
  GenerationProgress,
  LayerGeometry,
  LayerMaterial,
  IndicatorType,
  IndicatorMaterial,
  IndicatorSize,
} from '../../../src/types/knobDesigner';

// ============================================================================
// Store State Interface
// ============================================================================

export interface KnobDesignerStore {
  // ---------------------------------------------------------------------------
  // State (Read-only getters)
  // ---------------------------------------------------------------------------

  /** Whether the modal is currently open */
  readonly isOpen: boolean;

  /** Current working design */
  readonly design: KnobDesign;

  /** Target bitmap name from BitmapItem context */
  readonly targetBitmapName: string | null;

  /** Target project ID */
  readonly targetProjectId: string | null;

  /** Selected preset ID (null = custom/modified) */
  readonly selectedPresetId: string | null;

  /** Whether design has been modified from loaded preset */
  readonly isModified: boolean;

  /** Generation progress (null = not generating) */
  readonly generationProgress: GenerationProgress | null;

  /** Error message for display */
  readonly errorMessage: string | null;

  /** Whether undo is available */
  readonly canUndo: boolean;

  /** Whether redo is available */
  readonly canRedo: boolean;

  /** Description of undo operation */
  readonly undoDescription: string | null;

  /** Description of redo operation */
  readonly redoDescription: string | null;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

/**
 * Opens the knob designer modal.
 *
 * @param bitmapName - Target bitmap name
 * @param projectId - Project ID for bitmap storage
 */
export declare function openKnobDesigner(bitmapName: string, projectId: string): void;

/**
 * Closes the knob designer modal without saving.
 * Clears undo history and resets state.
 */
export declare function closeKnobDesigner(): void;

// ---------------------------------------------------------------------------
// Layer Operations
// ---------------------------------------------------------------------------

/**
 * Adds a new layer to the design.
 * Creates undo operation.
 *
 * @throws If maximum layers (3) already exist
 */
export declare function addLayer(): void;

/**
 * Removes a layer from the design.
 * Creates undo operation.
 *
 * @param layerId - ID of layer to remove
 * @throws If only one layer exists (minimum required)
 */
export declare function removeLayer(layerId: string): void;

/**
 * Reorders a layer in the stack.
 * Creates undo operation.
 *
 * @param layerId - ID of layer to move
 * @param newIndex - Target index (0 = bottom)
 */
export declare function reorderLayer(layerId: string, newIndex: number): void;

/**
 * Updates layer geometry properties.
 * Creates undo operation.
 *
 * @param layerId - ID of layer to update
 * @param geometry - Partial geometry updates
 */
export declare function updateLayerGeometry(
  layerId: string,
  geometry: Partial<LayerGeometry>
): void;

/**
 * Updates layer material properties.
 * Creates undo operation.
 *
 * @param layerId - ID of layer to update
 * @param material - Partial material updates
 */
export declare function updateLayerMaterial(
  layerId: string,
  material: Partial<LayerMaterial>
): void;

// ---------------------------------------------------------------------------
// Indicator Operations
// ---------------------------------------------------------------------------

/**
 * Toggles indicator enabled state.
 * Creates undo operation.
 */
export declare function toggleIndicator(): void;

/**
 * Sets indicator type.
 * Creates undo operation.
 *
 * @param type - New indicator type
 */
export declare function setIndicatorType(type: IndicatorType): void;

/**
 * Updates indicator material properties.
 * Creates undo operation.
 *
 * @param material - Partial material updates
 */
export declare function updateIndicatorMaterial(material: Partial<IndicatorMaterial>): void;

/**
 * Updates indicator size properties.
 * Creates undo operation.
 *
 * @param size - Partial size updates
 */
export declare function updateIndicatorSize(size: Partial<IndicatorSize>): void;

/**
 * Updates indicator radial position.
 * Creates undo operation.
 *
 * @param position - New radial position (10-90 percentage)
 */
export declare function setIndicatorPosition(position: number): void;

// ---------------------------------------------------------------------------
// Lighting Operations
// ---------------------------------------------------------------------------

/**
 * Updates lighting configuration.
 * Creates undo operation.
 *
 * @param lighting - Partial lighting updates
 */
export declare function updateLighting(lighting: Partial<LightingConfig>): void;

// ---------------------------------------------------------------------------
// Output Operations
// ---------------------------------------------------------------------------

/**
 * Updates output configuration.
 * Creates undo operation.
 *
 * @param output - Partial output updates
 */
export declare function updateOutput(output: Partial<OutputConfig>): void;

// ---------------------------------------------------------------------------
// Preset Operations
// ---------------------------------------------------------------------------

/**
 * Loads a preset into the working design.
 * Clears undo history.
 *
 * @param presetId - ID of preset to load
 */
export declare function loadPreset(presetId: string): Promise<void>;

/**
 * Saves current design as a new preset.
 *
 * @param name - Preset name (must be unique)
 * @throws If name already exists
 */
export declare function savePreset(name: string): Promise<string>;

/**
 * Renames an existing custom preset.
 *
 * @param presetId - ID of preset to rename
 * @param newName - New name (must be unique)
 * @throws If preset is built-in or name exists
 */
export declare function renamePreset(presetId: string, newName: string): Promise<void>;

/**
 * Deletes a custom preset.
 *
 * @param presetId - ID of preset to delete
 * @throws If preset is built-in
 */
export declare function deletePreset(presetId: string): Promise<void>;

/**
 * Gets all available presets (built-in + custom).
 *
 * @returns Array of preset metadata
 */
export declare function getAllPresets(): Promise<
  Array<{ id: string; name: string; isBuiltIn: boolean }>
>;

// ---------------------------------------------------------------------------
// History Operations
// ---------------------------------------------------------------------------

/**
 * Undoes the last operation.
 * No-op if undo stack is empty.
 */
export declare function undo(): void;

/**
 * Redoes the last undone operation.
 * No-op if redo stack is empty.
 */
export declare function redo(): void;

// ---------------------------------------------------------------------------
// Generation Operations
// ---------------------------------------------------------------------------

/**
 * Generates the filmstrip and assigns to target bitmap.
 * Updates generation progress during render.
 *
 * @returns Promise resolving when generation complete
 * @throws If generation fails
 */
export declare function generateFilmstrip(): Promise<void>;

/**
 * Cancels ongoing filmstrip generation.
 * No-op if not generating.
 */
export declare function cancelGeneration(): void;

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

/**
 * Clears the current error message.
 */
export declare function clearError(): void;

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

/**
 * Resets the store to initial state.
 * Used for testing and cleanup.
 */
export declare function resetKnobDesignerStore(): void;
