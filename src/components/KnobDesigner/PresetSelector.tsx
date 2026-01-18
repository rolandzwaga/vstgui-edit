/**
 * PresetSelector Component
 *
 * Dropdown for loading, saving, and managing knob presets.
 */

import { createSignal, createEffect, For, Show, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import {
  knobDesignerStore,
  loadPreset,
  savePreset,
  deletePreset,
  getAllPresets,
} from '../../stores/knobDesignerStore';
import { validatePresetName } from '../../domain/knobDesigner';
import styles from './PresetSelector.module.css';

// ============================================================================
// Types
// ============================================================================

interface PresetInfo {
  id: string;
  name: string;
  isBuiltIn: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const PresetSelector: Component = () => {
  const [presets, setPresets] = createSignal<PresetInfo[]>([]);
  const [isOpen, setIsOpen] = createSignal(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = createSignal(false);
  const [newPresetName, setNewPresetName] = createSignal('');
  const [saveError, setSaveError] = createSignal<string | null>(null);

  // Load presets on mount
  onMount(async () => {
    const loaded = await getAllPresets();
    setPresets(loaded);
  });

  // Refresh presets when modal opens
  createEffect(async () => {
    if (knobDesignerStore.isOpen) {
      const loaded = await getAllPresets();
      setPresets(loaded);
    }
  });

  const handleSelectPreset = async (presetId: string) => {
    await loadPreset(presetId);
    setIsOpen(false);
  };

  const handleDeletePreset = async (presetId: string, e: Event) => {
    e.stopPropagation();
    if (confirm('Delete this preset?')) {
      await deletePreset(presetId);
      const loaded = await getAllPresets();
      setPresets(loaded);
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
      await savePreset(name);
      const loaded = await getAllPresets();
      setPresets(loaded);
      setIsSaveDialogOpen(false);
      setNewPresetName('');
      setSaveError(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const selectedPresetName = () => {
    const id = knobDesignerStore.selectedPresetId;
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
          onClick={() => setIsOpen(!isOpen())}
        >
          <span class={styles.dropdownLabel}>Preset:</span>
          <span class={styles.dropdownValue}>
            {selectedPresetName()}
            {knobDesignerStore.isModified && ' (modified)'}
          </span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <Show when={isOpen()}>
          <div class={styles.dropdown}>
            {/* Built-in Presets */}
            <div class={styles.dropdownSection}>
              <span class={styles.dropdownSectionTitle}>Built-in</span>
              <For each={presets().filter(p => p.isBuiltIn)}>
                {(preset) => (
                  <button
                    type="button"
                    class={`${styles.dropdownItem} ${knobDesignerStore.selectedPresetId === preset.id ? styles.dropdownItemActive : ''}`}
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
                      class={`${styles.dropdownItem} ${styles.dropdownItemWithActions} ${knobDesignerStore.selectedPresetId === preset.id ? styles.dropdownItemActive : ''}`}
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
                  setIsOpen(false);
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
      <Show when={isOpen()}>
        <div class={styles.backdrop} onClick={() => setIsOpen(false)} />
      </Show>
    </div>
  );
};

export default PresetSelector;
