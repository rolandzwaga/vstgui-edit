/**
 * Variable validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a variable name
 * @param name - The name to validate
 * @param existingNames - List of existing variable names
 * @param currentName - Current name (when editing, to exclude self from uniqueness check)
 * @returns Validation result
 */
const VALID_VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function validateVariableName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (!VALID_VARIABLE_NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error:
        'Name must start with a letter or underscore, and contain only letters, numbers, underscores, or hyphens',
    };
  }

  const others = currentName ? existingNames.filter(n => n !== currentName) : existingNames;

  if (others.includes(trimmed)) {
    return { valid: false, error: 'Name already exists' };
  }

  return { valid: true };
}

/**
 * Generates a unique variable name based on existing variables
 * @param existingVariables - Map of existing variable names to values
 * @returns A unique name like "New Variable", "New Variable 2", etc.
 */
export function generateUniqueVariableName(existingVariables: Record<string, string>): string {
  const baseName = 'newVariable';

  if (!(baseName in existingVariables)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName}${counter}` in existingVariables) {
    counter++;
  }

  return `${baseName}${counter}`;
}
