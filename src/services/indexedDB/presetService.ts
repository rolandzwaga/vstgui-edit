/**
 * Preset Service for IndexedDB
 *
 * CRUD operations for control designer presets.
 * Supports multiple control types (knob, slider, etc.).
 * Follows the pattern established by bitmapService.
 */

import { BUILTIN_PRESETS } from '../../domain/knobDesigner/defaults';
import { INDEXES, STORES } from '../../domain/project/types';
import { BUILTIN_SLIDER_PRESETS } from '../../domain/sliderDesigner/defaults';
import type { ControlTypeId } from '../../types/controlDesigner';
import { getStore, promisifyRequest } from './database';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Base preset interface that all control presets implement.
 * This is a more flexible type that works with both legacy KnobPreset
 * and new control types.
 */
export interface BasePreset {
  id: string;
  name: string;
  controlType: ControlTypeId;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
  design: unknown; // Allow any design shape for flexibility
}

/**
 * Preset type used by the service - compatible with KnobPreset and future types.
 */
type Preset = BasePreset;

// ============================================================================
// Preset Service Implementation
// ============================================================================

export const presetService = {
  /**
   * Adds a preset to IndexedDB.
   *
   * @param preset - The preset to add
   * @throws If a preset with the same name already exists
   */
  async add(preset: Preset): Promise<void> {
    // Check for duplicate name
    const existing = await this.getByName(preset.name);
    if (existing && existing.id !== preset.id) {
      throw new Error(`A preset with the name "${preset.name}" already exists`);
    }
    const store = getStore(STORES.PRESETS, 'readwrite');
    await promisifyRequest(store.put(preset));
  },

  /**
   * Gets a preset by ID.
   *
   * @param id - The preset ID
   * @returns The preset or undefined if not found
   */
  async get(id: string): Promise<Preset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    return promisifyRequest(store.get(id));
  },

  /**
   * Gets a preset by name.
   *
   * @param name - The preset name
   * @returns The preset or undefined if not found
   */
  async getByName(name: string): Promise<Preset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_NAME);
    return promisifyRequest(index.get(name));
  },

  /**
   * Gets all presets, optionally filtered by control type.
   *
   * @param controlType - Optional control type to filter by
   * @returns Array of presets, built-in first then alphabetical
   */
  async getAll(controlType?: ControlTypeId): Promise<Preset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    let all: Preset[];

    if (controlType) {
      // Use the controlType index for filtering
      const index = store.index(INDEXES.PRESETS_BY_CONTROL_TYPE);
      all = await promisifyRequest(index.getAll(IDBKeyRange.only(controlType)));
    } else {
      all = await promisifyRequest(store.getAll());
    }

    // Sort: built-in first, then alphabetical by name
    return all.sort((a, b) => {
      if (a.isBuiltIn !== b.isBuiltIn) {
        return a.isBuiltIn ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Gets presets by control type.
   *
   * @param controlType - The control type to filter by
   * @returns Array of presets for the specified control type
   */
  async getByControlType(controlType: ControlTypeId): Promise<Preset[]> {
    return this.getAll(controlType);
  },

  /**
   * Gets only built-in presets, optionally filtered by control type.
   *
   * @param controlType - Optional control type to filter by
   * @returns Array of built-in presets
   */
  async getBuiltIn(controlType?: ControlTypeId): Promise<Preset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_BUILTIN);
    let builtIn: Preset[] = await promisifyRequest(index.getAll(IDBKeyRange.only(true)));

    if (controlType) {
      builtIn = builtIn.filter(p => p.controlType === controlType);
    }

    return builtIn.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Gets only custom (user-created) presets, optionally filtered by control type.
   *
   * @param controlType - Optional control type to filter by
   * @returns Array of custom presets, sorted alphabetically
   */
  async getCustom(controlType?: ControlTypeId): Promise<Preset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_BUILTIN);
    let custom: Preset[] = await promisifyRequest(index.getAll(IDBKeyRange.only(false)));

    if (controlType) {
      custom = custom.filter(p => p.controlType === controlType);
    }

    return custom.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Updates an existing preset.
   *
   * @param preset - The preset with updated values
   * @throws If preset does not exist or is built-in
   */
  async update(preset: Preset): Promise<void> {
    // Verify preset exists
    const existing = await this.get(preset.id);
    if (!existing) {
      throw new Error(`Preset with ID "${preset.id}" does not exist`);
    }
    // Prevent modifying built-in presets
    if (existing.isBuiltIn) {
      throw new Error('Cannot modify built-in presets');
    }
    // Check for duplicate name (excluding this preset)
    const nameConflict = await this.getByName(preset.name);
    if (nameConflict && nameConflict.id !== preset.id) {
      throw new Error(`A preset with the name "${preset.name}" already exists`);
    }
    const store = getStore(STORES.PRESETS, 'readwrite');
    await promisifyRequest(store.put(preset));
  },

  /**
   * Deletes a preset by ID.
   *
   * @param id - The preset ID to delete
   * @throws If preset is built-in (cannot delete built-in presets)
   */
  async delete(id: string): Promise<void> {
    const preset = await this.get(id);
    if (!preset) {
      return; // Already deleted or never existed
    }
    if (preset.isBuiltIn) {
      throw new Error('Cannot delete built-in presets');
    }
    const store = getStore(STORES.PRESETS, 'readwrite');
    await promisifyRequest(store.delete(id));
  },

  /**
   * Checks if a preset name is already in use.
   *
   * @param name - The name to check
   * @param excludeId - Optional ID to exclude (for rename operations)
   * @returns True if name is taken
   */
  async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const existing = await this.getByName(name);
    return existing !== undefined && existing.id !== excludeId;
  },

  /**
   * Gets the count of custom presets, optionally filtered by control type.
   *
   * @param controlType - Optional control type to filter by
   * @returns Number of custom presets
   */
  async getCustomCount(controlType?: ControlTypeId): Promise<number> {
    const custom = await this.getCustom(controlType);
    return custom.length;
  },

  /**
   * Seeds built-in presets if not already present.
   * Called on database initialization.
   */
  async seedBuiltInPresets(): Promise<void> {
    // Check if any presets exist (don't rely on index which may not exist yet)
    const store = getStore(STORES.PRESETS, 'readonly');
    const existing = await promisifyRequest(store.getAll());

    // Check which control types have built-in presets
    const hasKnobBuiltIn = existing.some((p: Preset) => p.isBuiltIn && p.controlType === 'knob');
    const hasSliderBuiltIn = existing.some(
      (p: Preset) => p.isBuiltIn && p.controlType === 'slider'
    );

    const now = new Date().toISOString();

    // Seed knob presets if not present
    if (!hasKnobBuiltIn) {
      for (const template of BUILTIN_PRESETS) {
        const preset: Preset = {
          ...template,
          id: crypto.randomUUID(),
          controlType: 'knob',
          createdAt: now,
          updatedAt: now,
        };
        const writeStore = getStore(STORES.PRESETS, 'readwrite');
        await promisifyRequest(writeStore.put(preset));
      }
    }

    // Seed slider presets if not present
    if (!hasSliderBuiltIn) {
      for (const template of BUILTIN_SLIDER_PRESETS) {
        const preset: Preset = {
          ...template,
          id: crypto.randomUUID(),
          controlType: 'slider',
          createdAt: now,
          updatedAt: now,
        };
        const writeStore = getStore(STORES.PRESETS, 'readwrite');
        await promisifyRequest(writeStore.put(preset));
      }
    }
  },
};
