import { describe, expect, it } from 'vitest';
import { generateUniqueVariableName, validateVariableName } from '../validation';

describe('validateVariableName', () => {
  it('should accept valid non-empty name', () => {
    const result = validateVariableName('buttonWidth', []);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty name', () => {
    const result = validateVariableName('', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject whitespace-only name', () => {
    const result = validateVariableName('   ', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should trim whitespace from name', () => {
    const result = validateVariableName('  buttonWidth  ', []);
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate name', () => {
    const result = validateVariableName('buttonWidth', ['buttonWidth', 'buttonHeight']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exists');
  });

  it('should allow duplicate when editing self', () => {
    const result = validateVariableName('buttonWidth', ['buttonWidth', 'buttonHeight'], 'buttonWidth');
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate when editing to another existing name', () => {
    const result = validateVariableName('buttonHeight', ['buttonWidth', 'buttonHeight'], 'buttonWidth');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exists');
  });

  it('should be case-sensitive for duplicates', () => {
    const result = validateVariableName('buttonwidth', ['buttonWidth']);
    expect(result.valid).toBe(true);
  });
});

describe('generateUniqueVariableName', () => {
  it('should return "New Variable" when no variables exist', () => {
    const name = generateUniqueVariableName({});
    expect(name).toBe('New Variable');
  });

  it('should return "New Variable" when name is available', () => {
    const name = generateUniqueVariableName({ buttonWidth: '100', buttonHeight: '50' });
    expect(name).toBe('New Variable');
  });

  it('should return "New Variable 2" when "New Variable" exists', () => {
    const name = generateUniqueVariableName({ 'New Variable': '' });
    expect(name).toBe('New Variable 2');
  });

  it('should increment counter until unique name found', () => {
    const name = generateUniqueVariableName({
      'New Variable': '',
      'New Variable 2': '',
      'New Variable 3': '',
    });
    expect(name).toBe('New Variable 4');
  });

  it('should fill gaps in numbering', () => {
    const name = generateUniqueVariableName({
      'New Variable': '',
      'New Variable 3': '',
    });
    expect(name).toBe('New Variable 2');
  });
});
