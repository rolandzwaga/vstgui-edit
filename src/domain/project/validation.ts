/**
 * Project Name Validation
 *
 * Validates and sanitizes project names for filesystem compatibility
 * and consistent display.
 */

import type { NameValidationResult } from './types';

// ============================================================================
// Constants
// ============================================================================

/** Project name validation regex - alphanumeric, spaces, hyphens, underscores */
export const PROJECT_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;

/** Storage and validation limits */
export const LIMITS = {
  /** Maximum bitmap size in bytes (10MB) */
  MAX_BITMAP_SIZE: 10 * 1024 * 1024,

  /** Maximum project name length */
  MAX_NAME_LENGTH: 100,

  /** Minimum project name length */
  MIN_NAME_LENGTH: 1,

  /** Maximum guides per project */
  MAX_GUIDES: 50,

  /** Storage warning threshold (percentage) */
  QUOTA_WARNING_THRESHOLD: 80,
} as const;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a project name.
 *
 * Rules:
 * - Must be 1-100 characters after trimming
 * - Can only contain letters, numbers, spaces, hyphens, and underscores
 * - Duplicate names are allowed (projects identified by UUID)
 *
 * @param name - The project name to validate
 * @returns Validation result with valid flag and optional error message
 */
export function validateProjectName(name: string): NameValidationResult {
  const trimmed = name.trim();

  if (trimmed.length < LIMITS.MIN_NAME_LENGTH) {
    return { valid: false, error: 'Project name is required' };
  }

  if (trimmed.length > LIMITS.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${LIMITS.MAX_NAME_LENGTH} characters or less`,
    };
  }

  if (!PROJECT_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a string to be a valid project name.
 *
 * - Trims whitespace
 * - Removes invalid characters
 * - Truncates to maximum length
 *
 * @param name - The name to sanitize
 * @returns A sanitized project name (may be empty if all chars invalid)
 */
export function sanitizeProjectName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .slice(0, LIMITS.MAX_NAME_LENGTH);
}
