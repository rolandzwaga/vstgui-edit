/**
 * Path utilities for bitmap path detection and normalization.
 * Handles absolute/relative path detection and conversion.
 */

/**
 * Checks if a path is an absolute path.
 * Detects Windows (C:\, D:\) and Unix (/Users/, /home/, /) absolute paths.
 */
export function isAbsolutePath(path: string): boolean {
  if (!path) return false;

  // Windows absolute path: C:\, D:\, etc.
  if (/^[A-Za-z]:[\\/]/.test(path)) {
    return true;
  }

  // Unix absolute path: starts with /
  if (path.startsWith('/')) {
    return true;
  }

  return false;
}

/**
 * Normalizes path separators to forward slashes.
 * Converts backslashes to forward slashes for cross-platform compatibility.
 */
export function normalizeSeparators(path: string): string {
  if (!path) return path;
  return path.replace(/\\/g, '/');
}

/**
 * Extracts the directory portion from a path.
 * Returns empty string if no directory component exists.
 *
 * @example
 * getDirectoryFromPath('resources/images/knob.png') // 'resources/images'
 * getDirectoryFromPath('knob.png') // ''
 */
export function getDirectoryFromPath(path: string): string {
  if (!path) return '';

  const normalized = normalizeSeparators(path);
  const lastSlash = normalized.lastIndexOf('/');

  if (lastSlash === -1) {
    return '';
  }

  return normalized.substring(0, lastSlash);
}

/**
 * Extracts the filename (with extension) from a path.
 *
 * @example
 * getFilenameFromPath('resources/images/knob.png') // 'knob.png'
 * getFilenameFromPath('C:\\project\\knob.png') // 'knob.png'
 */
export function getFilenameFromPath(path: string): string {
  if (!path) return '';

  const normalized = normalizeSeparators(path);
  const lastSlash = normalized.lastIndexOf('/');

  if (lastSlash === -1) {
    return normalized;
  }

  return normalized.substring(lastSlash + 1);
}

/**
 * Converts an absolute path to a relative path.
 * Attempts to preserve directory structure by finding common patterns.
 *
 * Strategy:
 * 1. Look for common resource folder names (resources/, images/, bitmaps/, assets/)
 * 2. If found, return path from that folder onwards
 * 3. Otherwise, return just the filename
 *
 * @example
 * normalizeToRelativePath('C:\\project\\resources\\knob.png') // 'resources/knob.png'
 * normalizeToRelativePath('/Users/dev/project/images/buttons/play.png') // 'images/buttons/play.png'
 * normalizeToRelativePath('D:\\random\\path\\file.png') // 'file.png'
 */
export function normalizeToRelativePath(absolutePath: string): string {
  if (!absolutePath) return absolutePath;

  const normalized = normalizeSeparators(absolutePath);

  // Common resource folder patterns to preserve
  const resourcePatterns = [
    'resources/',
    'images/',
    'bitmaps/',
    'assets/',
    'gfx/',
    'graphics/',
    'res/',
    'img/',
  ];

  // Try to find a common resource folder in the path
  for (const pattern of resourcePatterns) {
    const index = normalized.toLowerCase().indexOf(pattern.toLowerCase());
    if (index !== -1) {
      // Return from the resource folder onwards
      return normalized.substring(index);
    }
  }

  // No common pattern found, return just the filename
  return getFilenameFromPath(normalized);
}

/**
 * Ensures a path is relative, converting absolute paths if necessary.
 * Normalizes separators to forward slashes.
 */
export function ensureRelativePath(path: string): string {
  if (!path) return path;

  const normalized = normalizeSeparators(path);

  if (isAbsolutePath(normalized)) {
    return normalizeToRelativePath(normalized);
  }

  return normalized;
}
