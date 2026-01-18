/**
 * Preset Service for IndexedDB
 *
 * CRUD operations for knob designer presets.
 * Follows the pattern established by bitmapService.
 */

import { BUILTIN_PRESETS } from '../../domain/knobDesigner/defaults';
import { INDEXES, STORES } from '../../domain/project/types';
import type { KnobPreset } from '../../types/knobDesigner';
import { getStore, promisifyRequest } from './database';

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
  async add(preset: KnobPreset): Promise<void> {
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
  async get(id: string): Promise<KnobPreset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    return promisifyRequest(store.get(id));
  },

  /**
   * Gets a preset by name.
   *
   * @param name - The preset name
   * @returns The preset or undefined if not found
   */
  async getByName(name: string): Promise<KnobPreset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_NAME);
    return promisifyRequest(index.get(name));
  },

  /**
   * Gets all presets.
   *
   * @returns Array of all presets, built-in first then alphabetical
   */
  async getAll(): Promise<KnobPreset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const all = await promisifyRequest(store.getAll());
    // Sort: built-in first, then alphabetical by name
    return all.sort((a, b) => {
      if (a.isBuiltIn !== b.isBuiltIn) {
        return a.isBuiltIn ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Gets only built-in presets.
   *
   * @returns Array of built-in presets
   */
  async getBuiltIn(): Promise<KnobPreset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_BUILTIN);
    const builtIn = await promisifyRequest(index.getAll(IDBKeyRange.only(true)));
    return builtIn.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Gets only custom (user-created) presets.
   *
   * @returns Array of custom presets, sorted alphabetically
   */
  async getCustom(): Promise<KnobPreset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_BUILTIN);
    const custom = await promisifyRequest(index.getAll(IDBKeyRange.only(false)));
    return custom.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Updates an existing preset.
   *
   * @param preset - The preset with updated values
   * @throws If preset does not exist or is built-in
   */
  async update(preset: KnobPreset): Promise<void> {
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
   * Gets the count of custom presets.
   *
   * @returns Number of custom presets
   */
  async getCustomCount(): Promise<number> {
    const custom = await this.getCustom();
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

    // If any built-in presets exist, skip seeding
    const hasBuiltIn = existing.some((p: KnobPreset) => p.isBuiltIn);
    if (hasBuiltIn) {
      return;
    }

    const now = new Date().toISOString();
    for (const template of BUILTIN_PRESETS) {
      const preset: KnobPreset = {
        ...template,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      const writeStore = getStore(STORES.PRESETS, 'readwrite');
      await promisifyRequest(writeStore.put(preset));
    }
  },
};
