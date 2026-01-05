import { describe, expect, it } from 'vitest';
import { parseJson } from '../jsonParser';

describe('parseJson', () => {
  describe('valid JSON parsing (FR-008)', () => {
    it('should parse minimal valid uidesc JSON', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].version).toBe('1');
        expect(result.format).toBe('json');
      }
    });

    it('should parse uidesc with colors', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          colors: {
            Background: '#ff0000',
            Foreground: '#00ff00ff',
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].colors?.Background).toBe('#ff0000');
      }
    });

    it('should parse uidesc with fonts', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            MainFont: {
              'font-name': 'Arial',
              size: '12',
            },
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].fonts?.MainFont['font-name']).toBe('Arial');
      }
    });

    it('should parse uidesc with bitmaps', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          bitmaps: {
            Background: {
              path: 'images/bg.png',
            },
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].bitmaps?.Background.path).toBe(
          'images/bg.png'
        );
      }
    });

    it('should parse uidesc with templates', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '800, 600',
              },
            },
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].templates?.MainView.attributes.class).toBe(
          'CViewContainer'
        );
      }
    });

    it('should parse uidesc with control-tags', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          'control-tags': {
            Volume: '0',
            Pan: '1',
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description']['control-tags']?.Volume).toBe('0');
      }
    });

    it('should parse uidesc with gradients', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          gradients: {
            ButtonGradient: [
              { rgba: '#ffffff', start: '0' },
              { rgba: '#000000', start: '1' },
            ],
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].gradients?.ButtonGradient).toHaveLength(2);
      }
    });
  });

  describe('schema validation errors (FR-005, FR-006, FR-007)', () => {
    it('should return errors for missing vstgui-ui-description', () => {
      const content = JSON.stringify({});
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].type).toBe('schema');
      }
    });

    it('should return errors for missing version', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {},
      });
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.message.includes('version'))).toBe(true);
      }
    });

    it('should return errors for invalid version', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '2',
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(false);
    });

    it('should collect all errors (FR-006)', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            Font1: { size: '12' },
            Font2: { size: '14' },
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have errors for both missing font-name properties
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should include path in errors (FR-007)', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            TestFont: { size: '12' },
          },
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.path?.includes('TestFont'))).toBe(true);
      }
    });

    it('should reject unknown properties (FR-008a)', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          unknownProperty: 'value',
        },
      });
      const result = parseJson(content);
      expect(result.success).toBe(false);
    });
  });

  describe('JSON syntax errors', () => {
    it('should return syntax error for malformed JSON', () => {
      const content = '{ invalid json }';
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].type).toBe('syntax');
      }
    });

    it('should return syntax error for truncated JSON', () => {
      const content = '{"vstgui-ui-description": {';
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].type).toBe('syntax');
      }
    });

    it('should return syntax error for JSON with trailing comma', () => {
      const content = '{"vstgui-ui-description": {"version": "1",}}';
      const result = parseJson(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].type).toBe('syntax');
      }
    });
  });

  describe('format field', () => {
    it('should always return json as format', () => {
      const validContent = JSON.stringify({
        'vstgui-ui-description': { version: '1' },
      });
      const validResult = parseJson(validContent);
      expect(validResult.format).toBe('json');

      const invalidContent = '{ invalid }';
      const invalidResult = parseJson(invalidContent);
      expect(invalidResult.format).toBe('json');
    });
  });
});
