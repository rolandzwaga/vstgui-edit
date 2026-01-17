import { describe, expect, test } from 'vitest';

import { LIMITS, sanitizeProjectName, validateProjectName } from '../validation';

describe('validateProjectName', () => {
  test('accepts valid alphanumeric name', () => {
    const result = validateProjectName('MyProject');
    expect(result).toEqual({ valid: true });
  });

  test('accepts name with spaces', () => {
    const result = validateProjectName('My Project Name');
    expect(result).toEqual({ valid: true });
  });

  test('accepts name with hyphens', () => {
    const result = validateProjectName('my-project-name');
    expect(result).toEqual({ valid: true });
  });

  test('accepts name with underscores', () => {
    const result = validateProjectName('my_project_name');
    expect(result).toEqual({ valid: true });
  });

  test('accepts name with numbers', () => {
    const result = validateProjectName('Project123');
    expect(result).toEqual({ valid: true });
  });

  test('accepts mixed valid characters', () => {
    const result = validateProjectName('My-Project_2024 Final');
    expect(result).toEqual({ valid: true });
  });

  test('rejects empty string', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Project name is required');
  });

  test('rejects whitespace-only string', () => {
    const result = validateProjectName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Project name is required');
  });

  test('rejects name exceeding maximum length', () => {
    const longName = 'a'.repeat(LIMITS.MAX_NAME_LENGTH + 1);
    const result = validateProjectName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Name must be ${LIMITS.MAX_NAME_LENGTH} characters or less`);
  });

  test('accepts name at maximum length', () => {
    const maxName = 'a'.repeat(LIMITS.MAX_NAME_LENGTH);
    const result = validateProjectName(maxName);
    expect(result).toEqual({ valid: true });
  });

  test('rejects name with special characters', () => {
    const result = validateProjectName('Project!@#');
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      'Name can only contain letters, numbers, spaces, hyphens, and underscores'
    );
  });

  test('rejects name with periods', () => {
    const result = validateProjectName('my.project');
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      'Name can only contain letters, numbers, spaces, hyphens, and underscores'
    );
  });

  test('rejects name with forward slashes', () => {
    const result = validateProjectName('my/project');
    expect(result.valid).toBe(false);
  });

  test('rejects name with backslashes', () => {
    const result = validateProjectName('my\\project');
    expect(result.valid).toBe(false);
  });

  test('trims leading and trailing whitespace', () => {
    const result = validateProjectName('  My Project  ');
    expect(result).toEqual({ valid: true });
  });
});

describe('sanitizeProjectName', () => {
  test('returns valid name unchanged', () => {
    expect(sanitizeProjectName('MyProject')).toBe('MyProject');
  });

  test('trims leading and trailing whitespace', () => {
    expect(sanitizeProjectName('  MyProject  ')).toBe('MyProject');
  });

  test('removes special characters', () => {
    expect(sanitizeProjectName('My!@#Project')).toBe('MyProject');
  });

  test('removes periods', () => {
    expect(sanitizeProjectName('my.project')).toBe('myproject');
  });

  test('removes slashes', () => {
    expect(sanitizeProjectName('my/project\\name')).toBe('myprojectname');
  });

  test('preserves spaces', () => {
    expect(sanitizeProjectName('My Project')).toBe('My Project');
  });

  test('preserves hyphens', () => {
    expect(sanitizeProjectName('my-project')).toBe('my-project');
  });

  test('preserves underscores', () => {
    expect(sanitizeProjectName('my_project')).toBe('my_project');
  });

  test('truncates to maximum length', () => {
    const longName = 'a'.repeat(LIMITS.MAX_NAME_LENGTH + 50);
    const result = sanitizeProjectName(longName);
    expect(result.length).toBe(LIMITS.MAX_NAME_LENGTH);
  });

  test('handles empty string', () => {
    expect(sanitizeProjectName('')).toBe('');
  });

  test('handles string with only invalid characters', () => {
    expect(sanitizeProjectName('!@#$%^&*()')).toBe('');
  });
});
