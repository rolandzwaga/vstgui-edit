import { describe, expect, it } from 'vitest';
import { generateUniqueVariableName, validateVariableName } from '../validation';

describe('validateVariableName', () => {
  it('should accept valid name starting with letter', () => {
    const result = validateVariableName('buttonWidth', []);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid name starting with underscore', () => {
    const result = validateVariableName('_privateVar', []);
    expect(result.valid).toBe(true);
  });

  it('should accept name with hyphens', () => {
    const result = validateVariableName('button-width', []);
    expect(result.valid).toBe(true);
  });

  it('should accept name with numbers', () => {
    const result = validateVariableName('button1Width', []);
    expect(result.valid).toBe(true);
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

  it('should reject name with spaces', () => {
    const result = validateVariableName('button width', []);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject name starting with number', () => {
    const result = validateVariableName('1button', []);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject name with special characters', () => {
    const result = validateVariableName('button@width', []);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
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
  it('should return "newVariable" when no variables exist', () => {
    const name = generateUniqueVariableName({});
    expect(name).toBe('newVariable');
  });

  it('should return "newVariable" when name is available', () => {
    const name = generateUniqueVariableName({ buttonWidth: '100', buttonHeight: '50' });
    expect(name).toBe('newVariable');
  });

  it('should return "newVariable2" when "newVariable" exists', () => {
    const name = generateUniqueVariableName({ newVariable: '' });
    expect(name).toBe('newVariable2');
  });

  it('should increment counter until unique name found', () => {
    const name = generateUniqueVariableName({
      newVariable: '',
      newVariable2: '',
      newVariable3: '',
    });
    expect(name).toBe('newVariable4');
  });

  it('should fill gaps in numbering', () => {
    const name = generateUniqueVariableName({
      newVariable: '',
      newVariable3: '',
    });
    expect(name).toBe('newVariable2');
  });
});
