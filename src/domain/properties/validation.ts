import type { ValidationResult } from '../../types/editors';

export function validatePoint(value: string): ValidationResult {
  const parts = value.split(',').map(p => p.trim());
  if (parts.length !== 2) {
    return { valid: false, error: 'Expected format: "x, y"' };
  }

  const x = Number.parseInt(parts[0], 10);
  const y = Number.parseInt(parts[1], 10);

  if (!Number.isFinite(x) || String(x) !== parts[0]) {
    return { valid: false, error: 'Both values must be integers' };
  }
  if (!Number.isFinite(y) || String(y) !== parts[1]) {
    return { valid: false, error: 'Both values must be integers' };
  }

  return { valid: true, normalizedValue: `${x}, ${y}` };
}

export function validateSize(value: string): ValidationResult {
  const pointResult = validatePoint(value);
  if (!pointResult.valid) {
    return pointResult;
  }

  const parts = value.split(',').map(p => Number.parseInt(p.trim(), 10));
  if (parts[0] < 0 || parts[1] < 0) {
    return { valid: false, error: 'Width and height must be non-negative' };
  }

  return pointResult;
}

export function validateNumber(value: string, min?: number, max?: number): ValidationResult {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }
  return { valid: true, normalizedValue: String(num) };
}

export function validateBoolean(value: string): ValidationResult {
  const lower = value.toLowerCase();
  if (lower !== 'true' && lower !== 'false') {
    return { valid: false, error: 'Must be "true" or "false"' };
  }
  return { valid: true, normalizedValue: lower };
}

export function validateColor(value: string, documentColors: string[]): ValidationResult {
  if (documentColors.includes(value)) {
    return { valid: true };
  }

  if (value.startsWith('~')) {
    return { valid: true };
  }

  const hexPattern = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
  if (hexPattern.test(value)) {
    return { valid: true, normalizedValue: value.toUpperCase() };
  }

  return {
    valid: false,
    error: 'Must be a defined color, predefined (~), or hex (#RRGGBB or #RRGGBBAA)',
  };
}
