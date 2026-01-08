export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBitmapName(name: string, existingNames: string[]): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Bitmap name cannot be empty' };
  }

  if (existingNames.includes(name)) {
    return { valid: false, error: 'A bitmap with this name already exists' };
  }

  return { valid: true };
}
