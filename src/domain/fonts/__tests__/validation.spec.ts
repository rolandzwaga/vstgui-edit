import { describe, expect, test } from 'vitest';
import {
  validateBooleanProperty,
  validateFontName,
  validateFontSize,
  validateSystemFontName,
} from '../validation';

describe('validateFontName', () => {
  const existingNames = ['TitleFont', 'BodyFont', 'HeaderFont'];

  describe('valid names', () => {
    test('accepts unique name', () => {
      const result = validateFontName('NewFont', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with spaces', () => {
      const result = validateFontName('Body Text Font', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with numbers', () => {
      const result = validateFontName('Font123', existingNames);
      expect(result.valid).toBe(true);
    });

    test('is case-sensitive (different case is unique)', () => {
      const result = validateFontName('titlefont', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts empty existing names array', () => {
      const result = validateFontName('FirstFont', []);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid names', () => {
    test('rejects duplicate name', () => {
      const result = validateFontName('TitleFont', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('rejects empty string', () => {
      const result = validateFontName('', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    test('rejects whitespace-only', () => {
      const result = validateFontName('   ', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });
  });
});

describe('validateSystemFontName', () => {
  describe('valid font names', () => {
    test('accepts non-empty font name', () => {
      const result = validateSystemFontName('Arial');
      expect(result.valid).toBe(true);
    });

    test('accepts font name with spaces', () => {
      const result = validateSystemFontName('Times New Roman');
      expect(result.valid).toBe(true);
    });

    test('accepts font name with numbers', () => {
      const result = validateSystemFontName('Roboto 400');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid font names', () => {
    test('rejects empty string', () => {
      const result = validateSystemFontName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('rejects whitespace-only', () => {
      const result = validateSystemFontName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });
});

describe('validateFontSize', () => {
  describe('valid sizes', () => {
    test('accepts positive integer', () => {
      const result = validateFontSize('12');
      expect(result.valid).toBe(true);
    });

    test('accepts positive decimal', () => {
      const result = validateFontSize('10.5');
      expect(result.valid).toBe(true);
    });

    test('accepts small positive value', () => {
      const result = validateFontSize('1');
      expect(result.valid).toBe(true);
    });

    test('accepts large value with warning', () => {
      const result = validateFontSize('100');
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('unusually large');
    });

    test('accepts value at warning threshold without warning', () => {
      const result = validateFontSize('72');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    test('shows warning for value just above threshold', () => {
      const result = validateFontSize('73');
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('unusually large');
    });
  });

  describe('invalid sizes', () => {
    test('rejects zero', () => {
      const result = validateFontSize('0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects negative number', () => {
      const result = validateFontSize('-5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects non-numeric string', () => {
      const result = validateFontSize('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects empty string', () => {
      const result = validateFontSize('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects whitespace-only', () => {
      const result = validateFontSize('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });
  });
});

describe('validateBooleanProperty', () => {
  describe('valid values', () => {
    test('accepts "true"', () => {
      const result = validateBooleanProperty('true');
      expect(result.valid).toBe(true);
    });

    test('accepts "false"', () => {
      const result = validateBooleanProperty('false');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid values', () => {
    test('rejects "yes"', () => {
      const result = validateBooleanProperty('yes');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid boolean');
    });

    test('rejects "no"', () => {
      const result = validateBooleanProperty('no');
      expect(result.valid).toBe(false);
    });

    test('rejects "1"', () => {
      const result = validateBooleanProperty('1');
      expect(result.valid).toBe(false);
    });

    test('rejects "0"', () => {
      const result = validateBooleanProperty('0');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateBooleanProperty('');
      expect(result.valid).toBe(false);
    });

    test('rejects uppercase TRUE', () => {
      const result = validateBooleanProperty('TRUE');
      expect(result.valid).toBe(false);
    });
  });
});
