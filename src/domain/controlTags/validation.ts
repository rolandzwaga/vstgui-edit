/**
 * Control tag validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a control tag name
 * @param name - The name to validate
 * @param existingNames - List of existing tag names
 * @param currentName - Current name (when editing, to exclude self from uniqueness check)
 * @returns Validation result
 */
export function validateTagName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  const others = currentName ? existingNames.filter(n => n !== currentName) : existingNames;

  if (others.includes(trimmed)) {
    return { valid: false, error: 'Name already exists' };
  }

  return { valid: true };
}

/**
 * Validates a control tag ID
 * @param id - The ID to validate (string representation of integer)
 * @param existingIds - List of existing tag IDs
 * @param currentId - Current ID (when editing, to exclude self from uniqueness check)
 * @returns Validation result
 */
export function validateTagId(
  id: string,
  existingIds: string[],
  currentId?: string
): ValidationResult {
  const trimmed = id.trim();

  // Check if valid non-negative integer format (digits only)
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Tag ID must be a non-negative integer' };
  }

  const numericId = Number.parseInt(trimmed, 10);

  if (!Number.isFinite(numericId) || numericId < 0) {
    return { valid: false, error: 'Tag ID must be a non-negative integer' };
  }

  // Normalize for comparison (e.g., "007" -> "7")
  const normalizedId = String(numericId);

  const others = currentId ? existingIds.filter(i => i !== currentId) : existingIds;

  const normalizedOthers = others.map(i => String(Number.parseInt(i, 10)));

  if (normalizedOthers.includes(normalizedId)) {
    return { valid: false, error: 'Tag ID already in use' };
  }

  return { valid: true };
}

/**
 * Generates a unique tag name based on existing tags
 * @param existingTags - Map of existing tag names to IDs
 * @returns A unique name like "New Tag", "New Tag 2", etc.
 */
export function generateUniqueTagName(existingTags: Record<string, string>): string {
  const baseName = 'New Tag';

  if (!(baseName in existingTags)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingTags) {
    counter++;
  }

  return `${baseName} ${counter}`;
}

/**
 * Gets the next available non-negative tag ID
 * Fills gaps in the sequence (e.g., if 0, 2, 3 exist, returns 1)
 * @param existingTags - Map of existing tag names to IDs
 * @returns The lowest available non-negative integer as string
 */
export function getNextAvailableTagId(existingTags: Record<string, string>): string {
  const usedIds = new Set(
    Object.values(existingTags)
      .map(id => Number.parseInt(id, 10))
      .filter(id => id >= 0)
  );

  let nextId = 0;
  while (usedIds.has(nextId)) {
    nextId++;
  }

  return String(nextId);
}
