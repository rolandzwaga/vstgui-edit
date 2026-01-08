export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

const SIZE_WARNING_THRESHOLD = 72;

export function validateFontName(name: string, existingNames: string[]): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Font name cannot be empty' };
  }

  if (existingNames.includes(name)) {
    return { valid: false, error: 'A font with this name already exists' };
  }

  return { valid: true };
}

export function validateSystemFontName(fontName: string): ValidationResult {
  const trimmed = fontName.trim();

  if (!trimmed) {
    return { valid: false, error: 'System font name is required' };
  }

  return { valid: true };
}

export function validateFontSize(size: string): ValidationResult {
  const trimmed = size.trim();
  const parsed = Number.parseFloat(trimmed);

  if (!trimmed || Number.isNaN(parsed) || parsed <= 0) {
    return { valid: false, error: 'Size must be a positive number' };
  }

  if (parsed > SIZE_WARNING_THRESHOLD) {
    return { valid: true, warning: 'Warning: Size is unusually large' };
  }

  return { valid: true };
}

export function validateBooleanProperty(value: string): ValidationResult {
  if (value !== 'true' && value !== 'false') {
    return { valid: false, error: 'Invalid boolean value' };
  }

  return { valid: true };
}
