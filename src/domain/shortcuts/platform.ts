/**
 * Platform Detection Utilities
 *
 * Utilities for detecting platform and formatting keyboard shortcuts
 * appropriately (e.g., Ctrl vs Cmd on macOS).
 */

/**
 * Detects if the current platform is macOS.
 *
 * @returns true if running on macOS
 */
export function isMacPlatform(): boolean {
  // navigator.platform is deprecated but still widely supported
  // Falls back to false if not available
  if (typeof navigator === 'undefined') {
    return false;
  }
  return navigator.platform?.toLowerCase().includes('mac') ?? false;
}

/**
 * Gets the platform-appropriate modifier key name.
 *
 * @returns "Cmd" on Mac, "Ctrl" on Windows/Linux
 */
export function getModifierKeyName(): string {
  return isMacPlatform() ? 'Cmd' : 'Ctrl';
}

/**
 * Formats a shortcut's keys for the current platform.
 * Converts "Ctrl+" to "Cmd+" on macOS.
 *
 * @param keys - The key combination string
 * @returns Platform-formatted key string
 */
export function formatKeysForPlatform(keys: string): string {
  if (isMacPlatform()) {
    // Replace Ctrl+ with Cmd+ (case-insensitive)
    return keys.replace(/Ctrl\+/gi, 'Cmd+');
  }
  return keys;
}
