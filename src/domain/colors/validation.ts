export interface ValidationResult {
  valid: boolean;
  normalized?: string;
  error?: string;
}

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function validateHexColor(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, error: 'Invalid hex color. Use #RGB, #RRGGBB, or #RRGGBBAA format' };
  }

  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (!HEX_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: 'Invalid hex color. Use #RGB, #RRGGBB, or #RRGGBBAA format',
    };
  }

  return { valid: true, normalized };
}

export function validateColorName(name: string, existingNames: string[]): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Color name cannot be empty' };
  }

  if (existingNames.includes(name)) {
    return { valid: false, error: 'A color with this name already exists' };
  }

  return { valid: true };
}

export function normalizeHexColor(hex: string): string {
  return hex.toLowerCase();
}
