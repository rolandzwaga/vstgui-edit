/**
 * Control Designer Plugin Registry
 *
 * Central registry for control type plugins.
 * Plugins register themselves at application startup to add new control types.
 */

import type {
  BaseControlDesign,
  ControlTypeId,
  ControlTypePlugin,
} from '../../types/controlDesigner';

// ============================================================================
// Registry Storage
// ============================================================================

/**
 * Map storing registered control type plugins.
 * Key is the control type ID, value is the plugin definition.
 */
const pluginRegistry = new Map<ControlTypeId, ControlTypePlugin>();

// ============================================================================
// Registry API
// ============================================================================

/**
 * Registers a control type plugin with the registry.
 * Called at application startup for each supported control type.
 *
 * @param plugin - The plugin definition to register
 * @throws Error if a plugin with the same ID is already registered
 */
export function registerControlType<T extends BaseControlDesign>(
  plugin: ControlTypePlugin<T>
): void {
  if (pluginRegistry.has(plugin.id)) {
    throw new Error(`Control type "${plugin.id}" is already registered`);
  }
  // Cast is safe because we're storing by ID
  pluginRegistry.set(plugin.id, plugin as unknown as ControlTypePlugin);
}

/**
 * Gets a registered plugin by its control type ID.
 *
 * @param id - The control type identifier
 * @returns The plugin definition or undefined if not found
 */
export function getControlType(id: ControlTypeId): ControlTypePlugin | undefined {
  return pluginRegistry.get(id);
}

/**
 * Gets all registered control type plugins.
 * Returns plugins in registration order.
 *
 * @returns Array of all registered plugins
 */
export function getAllControlTypes(): ControlTypePlugin[] {
  return Array.from(pluginRegistry.values());
}

/**
 * Checks if a control type is registered.
 *
 * @param id - The control type identifier to check
 * @returns True if the control type is registered
 */
export function isControlTypeRegistered(id: ControlTypeId): boolean {
  return pluginRegistry.has(id);
}

/**
 * Gets the number of registered control types.
 *
 * @returns Number of registered plugins
 */
export function getRegisteredCount(): number {
  return pluginRegistry.size;
}

/**
 * Gets all registered control type IDs.
 *
 * @returns Array of registered control type IDs
 */
export function getRegisteredIds(): ControlTypeId[] {
  return Array.from(pluginRegistry.keys());
}

/**
 * Clears all registered plugins.
 * Used for testing only.
 */
export function clearRegistry(): void {
  pluginRegistry.clear();
}

// ============================================================================
// Export Registry Object
// ============================================================================

/**
 * Control type registry singleton.
 * Provides access to all registry operations.
 */
export const controlTypeRegistry = {
  register: registerControlType,
  get: getControlType,
  getAll: getAllControlTypes,
  isRegistered: isControlTypeRegistered,
  count: getRegisteredCount,
  getIds: getRegisteredIds,
  clear: clearRegistry,
};
