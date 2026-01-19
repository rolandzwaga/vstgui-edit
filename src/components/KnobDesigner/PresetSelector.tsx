/**
 * PresetSelector Component
 *
 * Dropdown for loading, saving, and managing control presets.
 * Supports filtering by control type for the unified control designer.
 */

import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import type { ControlTypeId } from '../../types/controlDesigner';
import { validatePresetName } from '../../domain/knobDesigner';
import { presetService } from '../../services/indexedDB/presetService';
import styles from './PresetSelector.module.css';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Loads presets filtered by control type.
 * Falls back to knob presets when no controlType is specified.
 */
async function loadPresetsForType(controlType: ControlTypeId = 'knob'): Promise<PresetInfo[]> {
  try {
    const allPresets = await presetService.getByControlType(controlType);
    return allPresets.map(p => ({ id: p.id, name: p.name, isBuiltIn: p.isBuiltIn }));
  } catch (_error) {
    // Fallback to getting all presets if getByControlType fails
    const allPresets = await presetService.getAll();
    return allPresets
      .filter(p => p.controlType === controlType || !p.controlType)
      .map(p => ({ id: p.id, name: p.name, isBuiltIn: p.isBuiltIn }));
  }
}

// ============================================================================
// Types
// ============================================================================

interface PresetInfo {
  id: string;
  name: string;
  isBuiltIn: boolean;
}

// ============================================================================
// Props Interface
// ============================================================================

export interface PresetSelectorProps {
  /**
   * Control type to filter presets by.
   */
  controlType: ControlTypeId;

  /**
   * Current preset ID from the control designer store.
   */
  selectedPresetId: string | null;

  /**
   * Whether the design has been modified.
   */
  isModified: boolean;

  /**
   * Whether the control designer modal is open.
   * Used to trigger preset list refresh.
   */
  isOpen: boolean;

  /**
   * Handler for loading a preset.
   */
  onLoadPreset: (presetId: string) => Promise<void>;

  /**
   * Handler for saving a preset.
   */
  onSavePreset: (name: string) => Promise<string>;

  /**
   * Handler for deleting a preset.
   */
  onDeletePreset: (presetId: string) => Promise<void>;
}

// ============================================================================
// Component
// ============================================================================

export const PresetSelector: Component<PresetSelectorProps> = (props) => {
  const [presets, setPresets] = createSignal<PresetInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = createSignal(false);
  const [newPresetName, setNewPresetName] = createSignal('');
  const [saveError, setSaveError] = createSignal<string | null>(null);

  // Refresh presets helper
  const refreshPresets = async () => {
    const loaded = await loadPresetsForType(props.controlType);
    setPresets(loaded);
  };

  // Load presets on mount
  onMount(async () => {
    await refreshPresets();
  });

  // Refresh presets when modal opens or control type changes
  createEffect(async () => {
    const type = props.controlType;
    if (props.isOpen || type) {
      await refreshPresets();
    }
  });

  const handleSelectPreset = async (presetId: string) => {
    await props.onLoadPreset(presetId);
    setIsDropdownOpen(false);
  };

  const handleDeletePreset = async (presetId: string, e: Event) => {
    e.stopPropagation();
    if (confirm('Delete this preset?')) {
      await props.onDeletePreset(presetId);
      await refreshPresets();
    }
  };

  const handleSavePreset = async () => {
    const name = newPresetName().trim();
    const validation = validatePresetName(name);

    if (!validation.valid) {
      setSaveError(validation.error ?? 'Invalid name');
      return;
    }

    try {
      await props.onSavePreset(name);
      await refreshPresets();
      setIsSaveDialogOpen(false);
      setNewPresetName('');
      setSaveError(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const selectedPresetName = () => {
    const id = props.selectedPresetId;
    if (!id) return 'Custom';
    const preset = presets().find(p => p.id === id);
    return preset?.name ?? 'Custom';
  };

  return (
    <div class={styles.container}>
      {/* Preset Dropdown */}
      <div class={styles.dropdownContainer}>
        <button
          type="button"
          class={styles.dropdownButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen())}
        >
          <span class={styles.dropdownLabel}>Preset:</span>
          <span class={styles.dropdownValue}>
            {selectedPresetName()}
            {props.isModified && ' (modified)'}
          </span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <Show when={isDropdownOpen()}>
          <div class={styles.dropdown}>
            {/* Built-in Presets */}
            <div class={styles.dropdownSection}>
              <span class={styles.dropdownSectionTitle}>Built-in</span>
              <For each={presets().filter(p => p.isBuiltIn)}>
                {(preset) => (
                  <button
                    type="button"
                    class={`${styles.dropdownItem} ${props.selectedPresetId === preset.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSelectPreset(preset.id)}
                  >
                    {preset.name}
                  </button>
                )}
              </For>
            </div>

            {/* Custom Presets */}
            <Show when={presets().some(p => !p.isBuiltIn)}>
              <div class={styles.dropdownSection}>
                <span class={styles.dropdownSectionTitle}>Custom</span>
                <For each={presets().filter(p => !p.isBuiltIn)}>
                  {(preset) => (
                    <div
                      class={`${styles.dropdownItem} ${styles.dropdownItemWithActions} ${props.selectedPresetId === preset.id ? styles.dropdownItemActive : ''}`}
                      onClick={() => handleSelectPreset(preset.id)}
                    >
                      <span>{preset.name}</span>
                      <button
                        type="button"
                        class={styles.deleteButton}
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        title="Delete preset"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            {/* Save New Preset */}
            <div class={styles.dropdownFooter}>
              <button
                type="button"
                class={styles.saveButton}
                onClick={() => {
                  setIsSaveDialogOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
                Save as New Preset
              </button>
            </div>
          </div>
        </Show>
      </div>

      {/* Save Dialog */}
      <Show when={isSaveDialogOpen()}>
        <div class={styles.dialogOverlay} onClick={() => setIsSaveDialogOpen(false)}>
          <div class={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 class={styles.dialogTitle}>Save Preset</h3>
            <div class={styles.dialogContent}>
              <label class={styles.dialogLabel}>Preset Name</label>
              <input
                type="text"
                class={styles.dialogInput}
                placeholder="Enter preset name"
                value={newPresetName()}
                onInput={(e) => {
                  setNewPresetName(e.currentTarget.value);
                  setSaveError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset();
                  if (e.key === 'Escape') setIsSaveDialogOpen(false);
                }}
                autofocus
              />
              <Show when={saveError()}>
                <span class={styles.dialogError}>{saveError()}</span>
              </Show>
            </div>
            <div class={styles.dialogActions}>
              <button
                type="button"
                class={styles.dialogCancel}
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                class={styles.dialogConfirm}
                onClick={handleSavePreset}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Click outside to close dropdown */}
      <Show when={isDropdownOpen()}>
        <div class={styles.backdrop} onClick={() => setIsDropdownOpen(false)} />
      </Show>
    </div>
  );
};
