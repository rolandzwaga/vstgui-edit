import { describe, expect, it } from 'vitest';
import { type ValidateResult, validateUidesc } from '../validator';

describe('validateUidesc', () => {
  describe('valid documents (FR-005)', () => {
    it('should validate minimal valid uidesc', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate uidesc with colors', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          colors: {
            Background: '#ff0000',
            Foreground: '#00ff00ff',
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(true);
    });

    it('should validate uidesc with fonts', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            MainFont: {
              'font-name': 'Arial',
              size: '12',
            },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(true);
    });

    it('should validate uidesc with templates', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '100, 100',
              },
            },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(true);
    });
  });

  describe('schema violations - missing required fields', () => {
    it('should reject document without vstgui-ui-description', () => {
      const doc = {};
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject document without version', () => {
      const doc = {
        'vstgui-ui-description': {},
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      // AJV reports missing required fields with error message containing the field name
      expect(result.errors.some((e) => e.message.includes('version'))).toBe(true);
    });

    it('should reject font without required font-name', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            BadFont: {
              size: '12',
            },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      // AJV reports missing required fields with error message containing the field name
      expect(result.errors.some((e) => e.message.includes('font-name'))).toBe(true);
    });
  });

  describe('collect all errors (FR-006)', () => {
    it('should collect multiple errors from same document', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            BadFont1: { size: '12' },
            BadFont2: { size: '14' },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      // Should have at least 2 errors (one for each missing font-name)
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error paths (FR-007)', () => {
    it('should include JSON path in validation errors', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            TestFont: {
              size: '12',
            },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      const fontError = result.errors.find((e) => e.path?.includes('TestFont'));
      expect(fontError).toBeDefined();
      expect(fontError?.path).toContain('/vstgui-ui-description/fonts/TestFont');
    });
  });

  describe('strict mode - reject unknown properties (FR-008a)', () => {
    it('should reject unknown properties at root level', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          unknownProperty: 'value',
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('additional'))).toBe(true);
    });

    it('should reject unknown properties in font definition', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            TestFont: {
              'font-name': 'Arial',
              size: '12',
              unknownProp: 'value',
            },
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid value types', () => {
    it('should reject invalid version value', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '2',
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid color format', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          colors: {
            // Schema pattern requires: #hex, ~Name, var.name, or name starting with letter
            // Numbers at start are invalid
            BadColor: '123invalid',
          },
        },
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
    });
  });

  describe('error message quality', () => {
    it('should provide human-readable error messages', () => {
      const doc = {
        'vstgui-ui-description': {},
      };
      const result = validateUidesc(doc);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBeTruthy();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });
  });
});
