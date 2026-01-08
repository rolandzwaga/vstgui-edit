export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateGradientName(name: string, existingNames: string[]): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Gradient name cannot be empty' };
  }

  if (existingNames.includes(name)) {
    return { valid: false, error: 'A gradient with this name already exists' };
  }

  return { valid: true };
}
