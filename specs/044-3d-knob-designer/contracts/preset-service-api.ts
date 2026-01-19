/**
 * Preset Service API Contract
 *
 * Defines the IndexedDB service interface for knob presets.
 * Follows the pattern established by bitmapService.
 */

import type { KnobPreset } from '../../../src/types/knobDesigner';

// ============================================================================
// Preset Service Interface
// ============================================================================

export interface PresetService {
  /**
   * Adds a preset to IndexedDB.
   *
   * @param preset - The preset to add
   * @throws If a preset with the same name already exists
   */
  add(preset: KnobPreset): Promise<void>;

  /**
   * Gets a preset by ID.
   *
   * @param id - The preset ID
   * @returns The preset or undefined if not found
   */
  get(id: string): Promise<KnobPreset | undefined>;

  /**
   * Gets a preset by name.
   *
   * @param name - The preset name
   * @returns The preset or undefined if not found
   */
  getByName(name: string): Promise<KnobPreset | undefined>;

  /**
   * Gets all presets.
   *
   * @returns Array of all presets, built-in first then alphabetical
   */
  getAll(): Promise<KnobPreset[]>;

  /**
   * Gets only built-in presets.
   *
   * @returns Array of built-in presets
   */
  getBuiltIn(): Promise<KnobPreset[]>;

  /**
   * Gets only custom (user-created) presets.
   *
   * @returns Array of custom presets, sorted alphabetically
   */
  getCustom(): Promise<KnobPreset[]>;

  /**
   * Updates an existing preset.
   *
   * @param preset - The preset with updated values
   * @throws If preset does not exist or is built-in
   */
  update(preset: KnobPreset): Promise<void>;

  /**
   * Deletes a preset by ID.
   *
   * @param id - The preset ID to delete
   * @throws If preset is built-in (cannot delete built-in presets)
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a preset name is already in use.
   *
   * @param name - The name to check
   * @param excludeId - Optional ID to exclude (for rename operations)
   * @returns True if name is taken
   */
  isNameTaken(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Gets the count of custom presets.
   *
   * @returns Number of custom presets
   */
  getCustomCount(): Promise<number>;

  /**
   * Seeds built-in presets if not already present.
   * Called on database initialization.
   */
  seedBuiltInPresets(): Promise<void>;
}

// ============================================================================
// Service Instance Export
// ============================================================================

/**
 * Singleton preset service instance.
 * Follows the pattern of bitmapService.
 */
export declare const presetService: PresetService;
