/**
 * Control Designer Store
 *
 * Unified state management for the multi-type Control Designer.
 * Manages designs for all registered control types with plugin dispatch,
 * auto-save on tab switch, and modal-local undo/redo history.
 */

import { createMemo, createSignal } from 'solid-js';
import { invalidateThumbnailCache } from '../domain/bitmaps/thumbnail';
import { getAllControlTypes, getControlType } from '../domain/controlDesigner/registry';
import { bitmapService } from '../services/indexedDB/bitmapService';
import { presetService } from '../services/indexedDB/presetService';
import type {
  BaseControlDesign,
  BaseOutputConfig,
  ControlDesignerHistoryOperation,
  ControlTypeId,
  GenerationProgress,
  LightingConfig,
  MaterialTarget,
  RotationalOutputConfig,
} from '../types/controlDesigner';
import type { LayerMaterial } from '../types/knobDesigner';
import { getBaseBitmapPath, updateBitmapProperty } from './documentStore';

// ============================================================================
// Constants
// ============================================================================

/** Maximum operations in the modal-local history stack */
const MODAL_HISTORY_LIMIT = 50;

// ============================================================================
// State Signals
// ============================================================================

// Modal state
const [isOpen, setIsOpen] = createSignal(false);
const [activeControlType, setActiveControlType] = createSignal<ControlTypeId>('knob');
const [targetBitmapName, setTargetBitmapName] = createSignal<string | null>(null);
const [targetProjectId, setTargetProjectId] = createSignal<string | null>(null);

// Designs indexed by control type
const [designs, setDesigns] = createSignal<Record<ControlTypeId, BaseControlDesign | null>>({
  knob: null,
  slider: null,
});

// Preset and modification state
const [selectedPresetId, setSelectedPresetId] = createSignal<string | null>(null);
const [isModified, setIsModified] = createSignal(false);

// Generation state
const [generationProgress, setGenerationProgress] = createSignal<GenerationProgress | null>(null);
const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

// History stacks (per control type, keyed by type)
const [historyStacks, setHistoryStacks] = createSignal<
  Record<
    ControlTypeId,
    {
      undo: ControlDesignerHistoryOperation[];
      redo: ControlDesignerHistoryOperation[];
    }
  >
>({
  knob: { undo: [], redo: [] },
  slider: { undo: [], redo: [] },
});

// Material target selection (for slider component selection)
const [selectedMaterialTarget, setSelectedMaterialTarget] = createSignal<MaterialTarget | null>(
  null
);

// Generation cancellation flag
let generationCancelled = false;

// ============================================================================
// Derived State
// ============================================================================

/**
 * Get the current active design.
 */
const activeDesign = createMemo(() => {
  const type = activeControlType();
  return designs()[type];
});

/**
 * Get the active plugin.
 * NOTE: This is a function, not a memo, because the registry is not reactive.
 * Calling getControlType directly ensures we always get the current state.
 */
function getActivePlugin() {
  const type = activeControlType();
  return getControlType(type);
}

/**
 * Get all registered plugins.
 * NOTE: This is a function, not a memo, because the registry is not reactive.
 * Calling getAllControlTypes directly ensures we always get the current state.
 */
function getRegisteredPlugins() {
  return getAllControlTypes();
}

/**
 * Get history state for active control type.
 */
const activeHistory = createMemo(() => {
  const type = activeControlType();
  return historyStacks()[type];
});

// ============================================================================
// Store Export (Read-only State)
// ============================================================================

export const controlDesignerStore = {
  get isOpen() {
    return isOpen();
  },
  get activeControlType() {
    return activeControlType();
  },
  get designs() {
    return designs();
  },
  get activeDesign() {
    return activeDesign();
  },
  get activePlugin() {
    return getActivePlugin();
  },
  get registeredPlugins() {
    return getRegisteredPlugins();
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
    return activeHistory().undo.length > 0;
  },
  get canRedo() {
    return activeHistory().redo.length > 0;
  },
  get undoDescription(): string | null {
    const stack = activeHistory().undo;
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
  get redoDescription(): string | null {
    const stack = activeHistory().redo;
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
  get selectedMaterialTarget() {
    return selectedMaterialTarget();
  },
};

// ============================================================================
// History Helpers
// ============================================================================

/**
 * Pushes an operation to the undo stack and clears redo.
 */
function pushHistory(op: ControlDesignerHistoryOperation): void {
  const type = activeControlType();
  setHistoryStacks(stacks => {
    const current = stacks[type];
    const newUndo = [...current.undo, op];
    if (newUndo.length > MODAL_HISTORY_LIMIT) {
      newUndo.shift();
    }
    return {
      ...stacks,
      [type]: { undo: newUndo, redo: [] },
    };
  });
  setIsModified(true);
}

/**
 * Clears history for the active control type.
 */
function clearActiveHistory(): void {
  const type = activeControlType();
  setHistoryStacks(stacks => ({
    ...stacks,
    [type]: { undo: [], redo: [] },
  }));
}

/**
 * Clears all history stacks.
 */
function clearAllHistory(): void {
  setHistoryStacks({
    knob: { undo: [], redo: [] },
    slider: { undo: [], redo: [] },
  });
}

// ============================================================================
// Modal Lifecycle Actions
// ============================================================================

/**
 * Opens the control designer modal.
 *
 * @param bitmapName - Target bitmap name
 * @param projectId - Project ID for bitmap storage
 * @param controlType - Initial control type (defaults to 'knob')
 */
export function openControlDesigner(
  bitmapName: string,
  projectId: string,
  controlType: ControlTypeId = 'knob'
): void {
  setTargetBitmapName(bitmapName);
  setTargetProjectId(projectId);
  setActiveControlType(controlType);

  // Initialize designs for all registered plugins
  const initialDesigns: Record<ControlTypeId, BaseControlDesign | null> = {
    knob: null,
    slider: null,
  };

  for (const plugin of getAllControlTypes()) {
    initialDesigns[plugin.id] = plugin.createDefaultDesign();
  }

  setDesigns(initialDesigns);
  setSelectedPresetId(null);
  setIsModified(false);
  setErrorMessage(null);
  setGenerationProgress(null);
  setSelectedMaterialTarget(null);
  clearAllHistory();
  setIsOpen(true);
}

/**
 * Closes the control designer modal without saving.
 */
export function closeControlDesigner(): void {
  setIsOpen(false);
  setTargetBitmapName(null);
  setTargetProjectId(null);
  setSelectedPresetId(null);
  setIsModified(false);
  setErrorMessage(null);
  setGenerationProgress(null);
  setSelectedMaterialTarget(null);
  clearAllHistory();
  generationCancelled = true;
}

// ============================================================================
// Tab Switching
// ============================================================================

/**
 * Switches to a different control type.
 * Preserves state for each control type independently.
 *
 * @param controlType - Control type to switch to
 */
export function switchControlType(controlType: ControlTypeId): void {
  if (controlType === activeControlType()) return;

  const plugin = getControlType(controlType);
  if (!plugin) {
    setErrorMessage(`Control type "${controlType}" is not registered`);
    return;
  }

  // Initialize design for this type if not already initialized
  const currentDesigns = designs();
  if (!currentDesigns[controlType]) {
    setDesigns({
      ...currentDesigns,
      [controlType]: plugin.createDefaultDesign(),
    });
  }

  setActiveControlType(controlType);
  setSelectedPresetId(null);
  setSelectedMaterialTarget(null);
  setErrorMessage(null);
}

// ============================================================================
// Design Update Actions
// ============================================================================

/**
 * Updates the active design with partial updates.
 *
 * @param updates - Partial design updates
 */
export function updateDesign(updates: Partial<BaseControlDesign>): void {
  const type = activeControlType();
  const currentDesign = designs()[type];
  if (!currentDesign) return;

  const oldDesign = { ...currentDesign };
  const newDesign = { ...currentDesign, ...updates };

  setDesigns(d => ({
    ...d,
    [type]: newDesign,
  }));

  pushHistory({
    type: 'design-update',
    description: 'Update design',
    undo: () => {
      setDesigns(d => ({ ...d, [type]: oldDesign }));
    },
    redo: () => {
      setDesigns(d => ({ ...d, [type]: newDesign }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates lighting configuration for the active design.
 *
 * @param lighting - Partial lighting updates
 */
export function updateLighting(lighting: Partial<LightingConfig>): void {
  const type = activeControlType();
  const currentDesign = designs()[type];
  if (!currentDesign) return;

  const oldLighting = { ...currentDesign.lighting };
  const newLighting = { ...currentDesign.lighting, ...lighting };
  const newDesign = { ...currentDesign, lighting: newLighting };

  setDesigns(d => ({
    ...d,
    [type]: newDesign,
  }));

  pushHistory({
    type: 'lighting-update',
    description: 'Update lighting',
    undo: () => {
      setDesigns(d => ({
        ...d,
        [type]: { ...d[type]!, lighting: oldLighting },
      }));
    },
    redo: () => {
      setDesigns(d => ({
        ...d,
        [type]: { ...d[type]!, lighting: newLighting },
      }));
    },
    timestamp: Date.now(),
  });
}

/**
 * Updates output configuration for the active design.
 *
 * @param output - Partial output updates
 */
export function updateOutput(output: Partial<BaseOutputConfig | RotationalOutputConfig>): void {
  const type = activeControlType();
  const currentDesign = designs()[type];
  if (!currentDesign) return;

  const oldOutput = { ...currentDesign.output };
  const newOutput = { ...currentDesign.output, ...output };
  const newDesign = { ...currentDesign, output: newOutput };

  setDesigns(d => ({
    ...d,
    [type]: newDesign as BaseControlDesign,
  }));

  pushHistory({
    type: 'output-update',
    description: 'Update output settings',
    undo: () => {
      setDesigns(d => ({
        ...d,
        [type]: { ...d[type]!, output: oldOutput },
      }));
    },
    redo: () => {
      setDesigns(d => ({
        ...d,
        [type]: { ...d[type]!, output: newOutput },
      }));
    },
    timestamp: Date.now(),
  });
}

// ============================================================================
// Material Target Selection
// ============================================================================

/**
 * Sets the material target for component selection.
 *
 * @param target - Material target or null to clear
 */
export function setMaterialTarget(target: MaterialTarget | null): void {
  setSelectedMaterialTarget(target);
}

/**
 * Updates material for the selected target.
 * This is a placeholder that will be implemented per control type.
 *
 * @param _material - Partial material updates
 */
export function updateMaterial(_material: Partial<LayerMaterial>): void {
  // TODO: Dispatch to active plugin's material update handler
  // This will be implemented when we add slider material support
  setIsModified(true);
}

// ============================================================================
// History Operations
// ============================================================================

/**
 * Undoes the last operation for the active control type.
 */
export function undo(): void {
  const type = activeControlType();
  const stacks = historyStacks();
  const current = stacks[type];

  if (current.undo.length === 0) return;

  const op = current.undo[current.undo.length - 1];
  setHistoryStacks({
    ...stacks,
    [type]: {
      undo: current.undo.slice(0, -1),
      redo: [...current.redo, op],
    },
  });

  op.undo();
}

/**
 * Redoes the last undone operation for the active control type.
 */
export function redo(): void {
  const type = activeControlType();
  const stacks = historyStacks();
  const current = stacks[type];

  if (current.redo.length === 0) return;

  const op = current.redo[current.redo.length - 1];
  setHistoryStacks({
    ...stacks,
    [type]: {
      undo: [...current.undo, op],
      redo: current.redo.slice(0, -1),
    },
  });

  op.redo();
}

// ============================================================================
// Preset Operations
// ============================================================================

/**
 * Loads a preset into the active design.
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

    const type = activeControlType();
    if (preset.controlType !== type) {
      setErrorMessage(`Preset is for ${preset.controlType}, not ${type}`);
      return;
    }

    // Deep clone the design
    const design = JSON.parse(JSON.stringify(preset.design)) as BaseControlDesign;
    design.id = crypto.randomUUID();

    setDesigns(d => ({
      ...d,
      [type]: design,
    }));
    setSelectedPresetId(presetId);
    setIsModified(false);
    clearActiveHistory();
    setErrorMessage(null);
  } catch (error) {
    setErrorMessage(
      `Failed to load preset: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Saves the active design as a new preset.
 *
 * @param name - Preset name
 * @returns The new preset ID
 */
export async function savePreset(name: string): Promise<string> {
  const type = activeControlType();
  const design = designs()[type];

  if (!design) {
    throw new Error('No active design to save');
  }

  try {
    // Check name uniqueness
    const nameTaken = await presetService.isNameTaken(name);
    if (nameTaken) {
      throw new Error(`A preset with the name "${name}" already exists`);
    }

    const now = new Date().toISOString();
    const preset = {
      id: crypto.randomUUID(),
      name,
      controlType: type,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
      design: JSON.parse(JSON.stringify(design)),
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
 * Deletes a preset.
 *
 * @param presetId - ID of preset to delete
 */
export async function deletePreset(presetId: string): Promise<void> {
  try {
    await presetService.delete(presetId);

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

// ============================================================================
// Generation Operations
// ============================================================================

/**
 * Generates the filmstrip for the active design.
 */
export async function generateFilmstrip(): Promise<void> {
  const type = activeControlType();
  const design = designs()[type];
  const plugin = getControlType(type);
  const bitmapName = targetBitmapName();
  const projectId = targetProjectId();

  if (!design || !plugin || !bitmapName || !projectId) {
    setErrorMessage('Missing required data for generation');
    return;
  }

  // Validate design
  const validation = plugin.validateDesign(design);
  if (!validation.valid) {
    setErrorMessage(`Invalid design: ${validation.error}`);
    return;
  }

  generationCancelled = false;

  try {
    // Create renderer
    const renderer = plugin.createRenderer();

    // Create off-screen canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = design.output.frameWidth;
    canvas.height = design.output.frameHeight;

    await renderer.initialize(canvas);

    // Generate filmstrip
    const dataUrl = await renderer.generateFilmstrip(design, progress => {
      if (!generationCancelled) {
        setGenerationProgress(progress);
      }
    });

    if (generationCancelled) {
      renderer.dispose();
      setGenerationProgress(null);
      return;
    }

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Calculate filmstrip dimensions
    const { frameCount, frameWidth, frameHeight, layout } = design.output;
    let framesPerRow: number;
    let rows: number;

    switch (layout ?? 'vertical') {
      case 'vertical':
        framesPerRow = 1;
        rows = frameCount;
        break;
      case 'horizontal':
        framesPerRow = frameCount;
        rows = 1;
        break;
      default: {
        const sqrt = Math.sqrt(frameCount);
        const candidates = [8, 16, 32, 64];
        framesPerRow = candidates.find(c => c >= sqrt) ?? 64;
        rows = Math.ceil(frameCount / framesPerRow);
        break;
      }
    }

    const totalWidth = frameWidth * framesPerRow;
    const totalHeight = frameHeight * rows;

    // Save to IndexedDB
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

    // Invalidate thumbnail cache
    invalidateThumbnailCache(projectId, bitmapName);

    // Update document store with multiframe properties
    const frameSizeValue = `${frameWidth}, ${frameHeight}`;
    updateBitmapProperty(bitmapName, 'multiframe-size', frameSizeValue);
    updateBitmapProperty(bitmapName, 'multiframe-num-frames', String(frameCount));

    // For grid layouts, also set frames-per-row
    if ((layout ?? 'vertical') === 'grid') {
      updateBitmapProperty(bitmapName, 'mulitframe-frames-per-row', String(framesPerRow));
    }

    // Set the bitmap path
    const basePath = getBaseBitmapPath();
    updateBitmapProperty(bitmapName, 'path', `${basePath}/${bitmapName}.png`);

    renderer.dispose();
    closeControlDesigner();
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
export function resetControlDesignerStore(): void {
  setIsOpen(false);
  setActiveControlType('knob');
  setDesigns({
    knob: null,
    slider: null,
  });
  setTargetBitmapName(null);
  setTargetProjectId(null);
  setSelectedPresetId(null);
  setIsModified(false);
  setGenerationProgress(null);
  setErrorMessage(null);
  setSelectedMaterialTarget(null);
  clearAllHistory();
  generationCancelled = false;
}
