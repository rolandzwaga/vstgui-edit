/**
 * Knob Designer Store
 *
 * State management for the 3D Knob Designer modal.
 * Includes modal state, design configuration, and local undo/redo history.
 */

import { createSignal } from 'solid-js';
import { copyDesign, createDefaultDesign } from '../domain/knobDesigner/defaults';
import { LAYER_CONSTRAINTS, PRESET_CONSTRAINTS } from '../domain/knobDesigner/validation';
import { bitmapService } from '../services/indexedDB/bitmapService';
import { presetService } from '../services/indexedDB/presetService';
import { knobRendererService } from '../services/knobRenderer';
import type {
  GenerationProgress,
  IndicatorMaterial,
  IndicatorSize,
  IndicatorType,
  KnobDesign,
  KnobDesignerHistoryOperation,
  KnobIndicator,
  KnobLayer,
  KnobPreset,
  LayerGeometry,
  LayerMaterial,
  LightingConfig,
  OutputConfig,
} from '../types/knobDesigner';
import { updateBitmapProperty } from './documentStore';

// ============================================================================
// Constants
// ============================================================================

/** Maximum operations in the modal-local history stack */
const MODAL_HISTORY_LIMIT = 50;

// ============================================================================
// State Signals
// ============================================================================

const [isOpen, setIsOpen] = createSignal(false);
const [design, setDesign] = createSignal<KnobDesign>(createDefaultDesign());
const [targetBitmapName, setTargetBitmapName] = createSignal<string | null>(null);
const [targetProjectId, setTargetProjectId] = createSignal<string | null>(null);
const [selectedPresetId, setSelectedPresetId] = createSignal<string | null>(null);
const [isModified, setIsModified] = createSignal(false);
const [generationProgress, setGenerationProgress] = createSignal<GenerationProgress | null>(null);
const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

// Modal-local undo/redo stacks
const [undoStack, setUndoStack] = createSignal<KnobDesignerHistoryOperation[]>([]);
const [redoStack, setRedoStack] = createSignal<KnobDesignerHistoryOperation[]>([]);

// Generation cancellation flag
let generationCancelled = false;

// ============================================================================
// Store Export (Read-only State)
// ============================================================================

export const knobDesignerStore = {
  get isOpen() {
    return isOpen();
  },
  get design() {
    return design();
  },
  get targetBitmapName() {
    return targetBitmapName();
  },
  get targetProjectId() {
    return targetProjectId();
  },
  get selectedPresetId() {
    return selectedPresetId();
  },
  get isModified() {
    return isModified();
  },
  get generationProgress() {
    return generationProgress();
  },
  get errorMessage() {
    return errorMessage();
  },
  get canUndo() {
    return undoStack().length > 0;
  },
  get canRedo() {
    return redoStack().length > 0;
  },
  get undoDescription(): string | null {
    const stack = undoStack();
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
  get redoDescription(): string | null {
    const stack = redoStack();
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
};

// ============================================================================
// History Helpers
// ============================================================================

/**
 * Pushes an operation to the undo stack and clears redo.
 */
function pushHistory(op: KnobDesignerHistoryOperation): void {
  setUndoStack(stack => {
    const newStack = [...stack, op];
    if (newStack.length > MODAL_HISTORY_LIMIT) {
      return newStack.slice(newStack.length - MODAL_HISTORY_LIMIT);
    }
    return newStack;
  });
  setRedoStack([]);
  setIsModified(true);
}

/**
 * Clears both undo and redo stacks.
 */
function clearHistory(): void {
  setUndoStack([]);
  setRedoStack([]);
}

// ============================================================================
// Modal Lifecycle Actions
// ============================================================================

/**
 * Opens the knob designer modal.
 *
 * @param bitmapName - Target bitmap name
 * @param projectId - Project ID for bitmap storage
 */
export function openKnobDesigner(bitmapName: string, projectId: string): void {
  setTargetBitmapName(bitmapName);
  setTargetProjectId(projectId);
  setDesign(createDefaultDesign());
  setSelectedPresetId(null);
  setIsModified(false);
  setErrorMessage(null);
  setGenerationProgress(null);
  clearHistory();
  setIsOpen(true);
}

/**
 * Closes the knob designer modal without saving.
 * Clears undo history and resets state.
 */
export function closeKnobDesigner(): void {
  setIsOpen(false);
  setTargetBitmapName(null);
  setTargetProjectId(null);
  setSelectedPresetId(null);
  setIsModified(false);
  setErrorMessage(null);
  setGenerationProgress(null);
  clearHistory();
  generationCancelled = true;
}

// ============================================================================
// Layer Operations
// ============================================================================

/**
 * Adds a new layer to the design.
 *
 * @throws If maximum layers (3) already exist
 */
export function addLayer(): void {
  const currentDesign = design();
  if (currentDesign.layers.length >= LAYER_CONSTRAINTS.MAX_LAYERS) {
    setErrorMessage(`Maximum ${LAYER_CONSTRAINTS.MAX_LAYERS} layers allowed`);
    return;
  }

  const newLayer: KnobLayer = {
    id: `layer-${crypto.randomUUID().slice(0, 8)}`,
    name: `Layer ${currentDesign.layers.length + 1}`,
    geometry: {
      diameter: 80,
      height: 50,
      bevelRadius: 3,
      skirtStyle: 'cylindrical',
    },
    material: {
      type: 'metallic',
      color: '#808080FF',
      shininess: 60,
      reflectivity: 40,
      brushDirection: 'radial',
      brushIntensity: 0,
    },
  };

  const oldLayers = [...currentDesign.layers];
  const newLayers = [...currentDesign.layers, newLayer];

  setDesign({
    ...currentDesign,
    layers: newLayers,
  });

  pushHistory({
    type: 'layer-add',
    description: 'Add layer',
    undo: () => {
      setDesign(prev => ({
        ...prev,
        layers: oldLayers,
      }));
    },
    redo: () => {
      setDesign(prev => ({
        ...prev,
        layers: newLayers,
      }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Removes a layer from the design.
 *
 * @param layerId - ID of layer to remove
 * @throws If only one layer exists (minimum required)
 */
export function removeLayer(layerId: string): void {
  const currentDesign = design();
  if (currentDesign.layers.length <= LAYER_CONSTRAINTS.MIN_LAYERS) {
    setErrorMessage('At least one layer is required');
    return;
  }

  const layerIndex = currentDesign.layers.findIndex(l => l.id === layerId);
  if (layerIndex === -1) return;

  const removedLayer = currentDesign.layers[layerIndex];
  const oldLayers = [...currentDesign.layers];
  const newLayers = currentDesign.layers.filter(l => l.id !== layerId);

  setDesign({
    ...currentDesign,
    layers: newLayers,
  });

  pushHistory({
    type: 'layer-remove',
    description: `Remove ${removedLayer.name}`,
    undo: () => {
      setDesign(prev => ({
        ...prev,
        layers: oldLayers,
      }));
    },
    redo: () => {
      setDesign(prev => ({
        ...prev,
        layers: newLayers,
      }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Reorders a layer in the stack.
 *
 * @param layerId - ID of layer to move
 * @param newIndex - Target index (0 = bottom)
 */
export function reorderLayer(layerId: string, newIndex: number): void {
  const currentDesign = design();
  const oldIndex = currentDesign.layers.findIndex(l => l.id === layerId);
  if (oldIndex === -1 || newIndex < 0 || newIndex >= currentDesign.layers.length) return;
  if (oldIndex === newIndex) return;

  const oldLayers = [...currentDesign.layers];
  const newLayers = [...currentDesign.layers];
  const [layer] = newLayers.splice(oldIndex, 1);
  newLayers.splice(newIndex, 0, layer);

  setDesign({
    ...currentDesign,
    layers: newLayers,
  });

  pushHistory({
    type: 'layer-reorder',
    description: `Reorder ${layer.name}`,
    undo: () => {
      setDesign(prev => ({
        ...prev,
        layers: oldLayers,
      }));
    },
    redo: () => {
      setDesign(prev => ({
        ...prev,
        layers: newLayers,
      }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates layer geometry properties.
 *
 * @param layerId - ID of layer to update
 * @param geometry - Partial geometry updates
 */
export function updateLayerGeometry(layerId: string, geometry: Partial<LayerGeometry>): void {
  const currentDesign = design();
  const layerIndex = currentDesign.layers.findIndex(l => l.id === layerId);
  if (layerIndex === -1) return;

  const oldGeometry = { ...currentDesign.layers[layerIndex].geometry };
  const newGeometry = { ...oldGeometry, ...geometry };

  const newLayers = currentDesign.layers.map((layer, idx) =>
    idx === layerIndex ? { ...layer, geometry: newGeometry } : layer
  );

  setDesign({
    ...currentDesign,
    layers: newLayers,
  });

  pushHistory({
    type: 'layer-geometry',
    description: 'Update geometry',
    undo: () => {
      setDesign(prev => ({
        ...prev,
        layers: prev.layers.map((layer, idx) =>
          idx === layerIndex ? { ...layer, geometry: oldGeometry } : layer
        ),
      }));
    },
    redo: () => {
      setDesign(prev => ({
        ...prev,
        layers: prev.layers.map((layer, idx) =>
          idx === layerIndex ? { ...layer, geometry: newGeometry } : layer
        ),
      }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates layer material properties.
 *
 * @param layerId - ID of layer to update
 * @param material - Partial material updates
 */
export function updateLayerMaterial(layerId: string, material: Partial<LayerMaterial>): void {
  const currentDesign = design();
  const layerIndex = currentDesign.layers.findIndex(l => l.id === layerId);
  if (layerIndex === -1) return;

  const oldMaterial = { ...currentDesign.layers[layerIndex].material };
  const newMaterial = { ...oldMaterial, ...material };

  const newLayers = currentDesign.layers.map((layer, idx) =>
    idx === layerIndex ? { ...layer, material: newMaterial } : layer
  );

  setDesign({
    ...currentDesign,
    layers: newLayers,
  });

  pushHistory({
    type: 'layer-material',
    description: 'Update material',
    undo: () => {
      setDesign(prev => ({
        ...prev,
        layers: prev.layers.map((layer, idx) =>
          idx === layerIndex ? { ...layer, material: oldMaterial } : layer
        ),
      }));
    },
    redo: () => {
      setDesign(prev => ({
        ...prev,
        layers: prev.layers.map((layer, idx) =>
          idx === layerIndex ? { ...layer, material: newMaterial } : layer
        ),
      }));
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Indicator Operations
// ============================================================================

/**
 * Toggles indicator enabled state.
 */
export function toggleIndicator(): void {
  const currentDesign = design();
  const oldIndicator = currentDesign.indicator;
  let newIndicator: KnobIndicator | null;

  if (oldIndicator) {
    // Toggle enabled state
    newIndicator = { ...oldIndicator, enabled: !oldIndicator.enabled };
  } else {
    // Create default indicator
    newIndicator = {
      enabled: true,
      type: 'line',
      material: { color: '#FFFFFFFF', metallic: false },
      size: { radius: 3, length: 15, width: 2, depth: 2 },
      radialPosition: 75,
    };
  }

  setDesign({
    ...currentDesign,
    indicator: newIndicator,
  });

  pushHistory({
    type: 'indicator-toggle',
    description: newIndicator.enabled ? 'Enable indicator' : 'Disable indicator',
    undo: () => {
      setDesign(prev => ({ ...prev, indicator: oldIndicator }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, indicator: newIndicator }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Sets indicator type.
 *
 * @param type - New indicator type
 */
export function setIndicatorType(type: IndicatorType): void {
  const currentDesign = design();
  if (!currentDesign.indicator) return;

  const oldIndicator = { ...currentDesign.indicator };
  const newIndicator = { ...currentDesign.indicator, type };

  setDesign({
    ...currentDesign,
    indicator: newIndicator,
  });

  pushHistory({
    type: 'indicator-type',
    description: `Change indicator to ${type}`,
    undo: () => {
      setDesign(prev => ({ ...prev, indicator: oldIndicator }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, indicator: newIndicator }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates indicator material properties.
 *
 * @param material - Partial material updates
 */
export function updateIndicatorMaterial(material: Partial<IndicatorMaterial>): void {
  const currentDesign = design();
  if (!currentDesign.indicator) return;

  const oldIndicator = {
    ...currentDesign.indicator,
    material: { ...currentDesign.indicator.material },
  };
  const newMaterial = { ...currentDesign.indicator.material, ...material };
  const newIndicator = { ...currentDesign.indicator, material: newMaterial };

  setDesign({
    ...currentDesign,
    indicator: newIndicator,
  });

  pushHistory({
    type: 'indicator-material',
    description: 'Update indicator material',
    undo: () => {
      setDesign(prev => ({ ...prev, indicator: oldIndicator }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, indicator: newIndicator }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates indicator size properties.
 *
 * @param size - Partial size updates
 */
export function updateIndicatorSize(size: Partial<IndicatorSize>): void {
  const currentDesign = design();
  if (!currentDesign.indicator) return;

  const oldIndicator = { ...currentDesign.indicator, size: { ...currentDesign.indicator.size } };
  const newSize = { ...currentDesign.indicator.size, ...size };
  const newIndicator = { ...currentDesign.indicator, size: newSize };

  setDesign({
    ...currentDesign,
    indicator: newIndicator,
  });

  pushHistory({
    type: 'indicator-size',
    description: 'Update indicator size',
    undo: () => {
      setDesign(prev => ({ ...prev, indicator: oldIndicator }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, indicator: newIndicator }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates indicator radial position.
 *
 * @param position - New radial position (10-90 percentage)
 */
export function setIndicatorPosition(position: number): void {
  const currentDesign = design();
  if (!currentDesign.indicator) return;

  const oldIndicator = { ...currentDesign.indicator };
  const newIndicator = { ...currentDesign.indicator, radialPosition: position };

  setDesign({
    ...currentDesign,
    indicator: newIndicator,
  });

  pushHistory({
    type: 'indicator-position',
    description: 'Update indicator position',
    undo: () => {
      setDesign(prev => ({ ...prev, indicator: oldIndicator }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, indicator: newIndicator }));
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Lighting Operations
// ============================================================================

/**
 * Updates lighting configuration.
 *
 * @param lighting - Partial lighting updates
 */
export function updateLighting(lighting: Partial<LightingConfig>): void {
  const currentDesign = design();
  const oldLighting = { ...currentDesign.lighting };
  const newLighting = { ...currentDesign.lighting, ...lighting };

  setDesign({
    ...currentDesign,
    lighting: newLighting,
  });

  pushHistory({
    type: 'lighting',
    description: 'Update lighting',
    undo: () => {
      setDesign(prev => ({ ...prev, lighting: oldLighting }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, lighting: newLighting }));
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Output Operations
// ============================================================================

/**
 * Updates output configuration.
 *
 * @param output - Partial output updates
 */
export function updateOutput(output: Partial<OutputConfig>): void {
  const currentDesign = design();
  const oldOutput = { ...currentDesign.output };
  const newOutput = { ...currentDesign.output, ...output };

  setDesign({
    ...currentDesign,
    output: newOutput,
  });

  pushHistory({
    type: 'output',
    description: 'Update output settings',
    undo: () => {
      setDesign(prev => ({ ...prev, output: oldOutput }));
    },
    redo: () => {
      setDesign(prev => ({ ...prev, output: newOutput }));
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Preset Operations
// ============================================================================

/**
 * Loads a preset into the working design.
 * Clears undo history.
 *
 * @param presetId - ID of preset to load
 */
export async function loadPreset(presetId: string): Promise<void> {
  try {
    const preset = await presetService.get(presetId);
    if (!preset) {
      setErrorMessage('Preset not found');
      return;
    }

    // Deep copy the design and assign new ID
    const newDesign = copyDesign(preset.design, crypto.randomUUID());

    setDesign(newDesign);
    setSelectedPresetId(presetId);
    setIsModified(false);
    clearHistory();
    setErrorMessage(null);
  } catch (error) {
    setErrorMessage(
      `Failed to load preset: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Saves current design as a new preset.
 *
 * @param name - Preset name (must be unique)
 * @returns The new preset ID
 * @throws If name already exists or limit reached
 */
export async function savePreset(name: string): Promise<string> {
  try {
    // Check custom preset limit
    const customCount = await presetService.getCustomCount();
    if (customCount >= PRESET_CONSTRAINTS.MAX_CUSTOM_PRESETS) {
      throw new Error(`Maximum ${PRESET_CONSTRAINTS.MAX_CUSTOM_PRESETS} custom presets allowed`);
    }

    // Check name uniqueness
    const nameTaken = await presetService.isNameTaken(name);
    if (nameTaken) {
      throw new Error(`A preset with the name "${name}" already exists`);
    }

    const now = new Date().toISOString();
    const preset: KnobPreset = {
      id: crypto.randomUUID(),
      name,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
      design: copyDesign(design()),
    };

    await presetService.add(preset);
    setSelectedPresetId(preset.id);
    setIsModified(false);
    setErrorMessage(null);

    return preset.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setErrorMessage(`Failed to save preset: ${message}`);
    throw error;
  }
}

/**
 * Renames an existing custom preset.
 *
 * @param presetId - ID of preset to rename
 * @param newName - New name (must be unique)
 * @throws If preset is built-in or name exists
 */
export async function renamePreset(presetId: string, newName: string): Promise<void> {
  try {
    const preset = await presetService.get(presetId);
    if (!preset) {
      throw new Error('Preset not found');
    }
    if (preset.isBuiltIn) {
      throw new Error('Cannot rename built-in presets');
    }

    const nameTaken = await presetService.isNameTaken(newName, presetId);
    if (nameTaken) {
      throw new Error(`A preset with the name "${newName}" already exists`);
    }

    const updated: KnobPreset = {
      ...preset,
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    await presetService.update(updated);
    setErrorMessage(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setErrorMessage(`Failed to rename preset: ${message}`);
    throw error;
  }
}

/**
 * Deletes a custom preset.
 *
 * @param presetId - ID of preset to delete
 * @throws If preset is built-in
 */
export async function deletePreset(presetId: string): Promise<void> {
  try {
    await presetService.delete(presetId);

    // Clear selection if deleted preset was selected
    if (selectedPresetId() === presetId) {
      setSelectedPresetId(null);
    }

    setErrorMessage(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setErrorMessage(`Failed to delete preset: ${message}`);
    throw error;
  }
}

/**
 * Gets all available presets (built-in + custom).
 *
 * @returns Array of preset metadata
 */
export async function getAllPresets(): Promise<
  Array<{ id: string; name: string; isBuiltIn: boolean }>
> {
  try {
    const presets = await presetService.getAll();
    return presets.map(p => ({ id: p.id, name: p.name, isBuiltIn: p.isBuiltIn }));
  } catch (_error) {
    setErrorMessage('Failed to load presets');
    return [];
  }
}

// ============================================================================
// History Operations
// ============================================================================

/**
 * Undoes the last operation.
 * No-op if undo stack is empty.
 */
export function undo(): void {
  const stack = undoStack();
  if (stack.length === 0) return;

  const op = stack[stack.length - 1];
  setUndoStack(stack.slice(0, -1));
  setRedoStack(redo => [...redo, op]);
  op.undo();
}

/**
 * Redoes the last undone operation.
 * No-op if redo stack is empty.
 */
export function redo(): void {
  const stack = redoStack();
  if (stack.length === 0) return;

  const op = stack[stack.length - 1];
  setRedoStack(stack.slice(0, -1));
  setUndoStack(undoS => [...undoS, op]);
  op.redo();
}

// ============================================================================
// Generation Operations
// ============================================================================

/**
 * Generates the filmstrip and assigns to target bitmap.
 * Uses the Three.js renderer service to render frames and saves to IndexedDB.
 *
 * @returns Promise resolving when generation complete
 * @throws If generation fails
 */
export async function generateFilmstrip(): Promise<void> {
  const currentDesign = design();
  const bitmapName = targetBitmapName();
  const projectId = targetProjectId();

  if (!bitmapName || !projectId) {
    setErrorMessage('No target bitmap selected');
    return;
  }

  generationCancelled = false;

  try {
    // Generate filmstrip using the renderer service
    const dataUrl = await knobRendererService.generateFilmstrip(currentDesign, progress =>
      setGenerationProgress(progress)
    );

    if (generationCancelled) {
      setGenerationProgress(null);
      return;
    }

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Calculate filmstrip dimensions
    const { frameCount, frameWidth, frameHeight } = currentDesign.output;
    const framesPerRow = Math.ceil(Math.sqrt(frameCount));
    const rows = Math.ceil(frameCount / framesPerRow);
    const totalWidth = frameWidth * framesPerRow;
    const totalHeight = frameHeight * rows;

    // Save to IndexedDB using the add method
    await bitmapService.add({
      id: `${projectId}:${bitmapName}`,
      projectId,
      name: bitmapName,
      blob,
      width: totalWidth,
      height: totalHeight,
      mimeType: 'image/png',
      size: blob.size,
      addedAt: new Date().toISOString(),
    });

    // Update document store with multiframe properties
    const frameSizeValue = `${frameWidth}, ${frameHeight}`;
    updateBitmapProperty(bitmapName, 'multiframe-size', frameSizeValue);
    updateBitmapProperty(bitmapName, 'multiframe-num-frames', String(frameCount));

    // Close modal after successful generation
    closeKnobDesigner();
  } catch (error) {
    if (generationCancelled) {
      setGenerationProgress(null);
      return;
    }
    setErrorMessage(
      `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    setGenerationProgress(null);
  }
}

/**
 * Cancels ongoing filmstrip generation.
 * No-op if not generating.
 */
export function cancelGeneration(): void {
  if (generationProgress()) {
    generationCancelled = true;
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Clears the current error message.
 */
export function clearError(): void {
  setErrorMessage(null);
}

// ============================================================================
// Reset
// ============================================================================

/**
 * Resets the store to initial state.
 * Used for testing and cleanup.
 */
export function resetKnobDesignerStore(): void {
  setIsOpen(false);
  setDesign(createDefaultDesign());
  setTargetBitmapName(null);
  setTargetProjectId(null);
  setSelectedPresetId(null);
  setIsModified(false);
  setGenerationProgress(null);
  setErrorMessage(null);
  clearHistory();
  generationCancelled = false;
}
