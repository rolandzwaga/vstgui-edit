import { describe, expect, it } from 'vitest';
import { parseUidesc } from '../index';

describe('parseUidesc', () => {
  describe('JSON format detection and parsing', () => {
    it('should detect and parse valid JSON uidesc', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
        },
      });
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
      if (result.success) {
        expect(result.document['vstgui-ui-description'].version).toBe('1');
      }
    });

    it('should detect and parse JSON starting with whitespace', () => {
      const content =
        '  \n  ' +
        JSON.stringify({
          'vstgui-ui-description': {
            version: '1',
          },
        });
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
    });

    it('should return validation errors for invalid JSON schema', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          unknownField: 'value',
        },
      });
      const result = parseUidesc(content);
      expect(result.success).toBe(false);
      expect(result.format).toBe('json');
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should return syntax errors for malformed JSON', () => {
      const content = '{ invalid json }';
      const result = parseUidesc(content);
      expect(result.success).toBe(false);
      expect(result.format).toBe('json');
      if (!result.success) {
        expect(result.errors[0].type).toBe('syntax');
      }
    });
  });

  describe('unknown format handling', () => {
    it('should return format error for empty content', () => {
      const result = parseUidesc('');
      expect(result.success).toBe(false);
      expect(result.format).toBe('unknown');
      if (!result.success) {
        expect(result.errors[0].type).toBe('format');
      }
    });

    it('should return format error for plain text', () => {
      const result = parseUidesc('hello world');
      expect(result.success).toBe(false);
      expect(result.format).toBe('unknown');
      if (!result.success) {
        expect(result.errors[0].type).toBe('format');
        expect(result.errors[0].message).toContain('format');
      }
    });

    it('should return format error for whitespace only', () => {
      const result = parseUidesc('   \n\t   ');
      expect(result.success).toBe(false);
      expect(result.format).toBe('unknown');
    });
  });

  describe('complete uidesc document parsing', () => {
    it('should parse complete uidesc with all sections', () => {
      const content = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          colors: {
            Background: '#1a1a1a',
            Foreground: '#ffffff',
          },
          fonts: {
            MainFont: {
              'font-name': 'Arial',
              size: '12',
            },
          },
          bitmaps: {
            Knob: {
              path: 'images/knob.png',
            },
          },
          gradients: {
            Button: [
              { rgba: '#ffffff', start: '0' },
              { rgba: '#cccccc', start: '1' },
            ],
          },
          'control-tags': {
            Volume: '0',
            Pan: '1',
          },
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '800, 600',
                'background-color': 'Background',
              },
              children: {
                Knob1: {
                  attributes: {
                    class: 'CAnimKnob',
                    origin: '10, 10',
                    size: '50, 50',
                    bitmap: 'Knob',
                    'control-tag': 'Volume',
                  },
                },
              },
            },
          },
        },
      });

      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const desc = result.document['vstgui-ui-description'];
        expect(desc.colors?.Background).toBe('#1a1a1a');
        expect(desc.fonts?.MainFont['font-name']).toBe('Arial');
        expect(desc.bitmaps?.Knob.path).toBe('images/knob.png');
        expect(desc.gradients?.Button).toHaveLength(2);
        expect(desc['control-tags']?.Volume).toBe('0');
        expect(desc.templates?.MainView.attributes.class).toBe('CViewContainer');
        expect(desc.templates?.MainView.children?.Knob1.attributes.class).toBe('CAnimKnob');
      }
    });
  });

  describe('XML format detection and parsing', () => {
    it('should detect and parse valid XML uidesc', () => {
      const content = '<vstgui-ui-description version="1"/>';
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      expect(result.format).toBe('xml');
      if (result.success) {
        expect(result.document['vstgui-ui-description'].version).toBe('1');
      }
    });

    it('should detect and parse XML with declaration', () => {
      const content = '<?xml version="1.0"?><vstgui-ui-description version="1"/>';
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      expect(result.format).toBe('xml');
    });

    it('should detect and parse XML with leading whitespace', () => {
      const content = '  \n  <vstgui-ui-description version="1"/>';
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      expect(result.format).toBe('xml');
    });

    it('should parse XML with colors', () => {
      const content = `
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1a"/>
        </vstgui-ui-description>
      `;
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].colors?.Background).toBe('#1a1a1a');
      }
    });

    it('should parse XML with fonts', () => {
      const content = `
        <vstgui-ui-description version="1">
          <font name="MainFont" font-name="Arial" size="12"/>
        </vstgui-ui-description>
      `;
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].fonts?.MainFont['font-name']).toBe('Arial');
      }
    });

    it('should parse XML with bitmaps', () => {
      const content = `
        <vstgui-ui-description version="1">
          <bitmap name="Knob" path="images/knob.png"/>
        </vstgui-ui-description>
      `;
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].bitmaps?.Knob.path).toBe('images/knob.png');
      }
    });

    it('should parse XML with templates', () => {
      const content = `
        <vstgui-ui-description version="1">
          <template name="MainView" class="CViewContainer" origin="0, 0" size="800, 600"/>
        </vstgui-ui-description>
      `;
      const result = parseUidesc(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document['vstgui-ui-description'].templates?.MainView.attributes.class).toBe(
          'CViewContainer'
        );
      }
    });

    it('should return syntax error for malformed XML', () => {
      const content = '<vstgui-ui-description version="1"><unclosed>';
      const result = parseUidesc(content);
      expect(result.success).toBe(false);
      expect(result.format).toBe('xml');
      if (!result.success) {
        expect(result.errors[0].type).toBe('syntax');
      }
    });

    it('should return validation errors for invalid XML schema', () => {
      const content = `
        <vstgui-ui-description version="1">
          <font name="BadFont" size="12"/>
        </vstgui-ui-description>
      `;
      const result = parseUidesc(content);
      expect(result.success).toBe(false);
      expect(result.format).toBe('xml');
      if (!result.success) {
        expect(result.errors[0].type).toBe('schema');
      }
    });
  });

  describe('XML and JSON produce identical structures (FR-013)', () => {
    it('should produce same colors from XML and JSON', () => {
      const jsonContent = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          colors: { Background: '#1a1a1a' },
        },
      });
      const xmlContent = `
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1a"/>
        </vstgui-ui-description>
      `;

      const jsonResult = parseUidesc(jsonContent);
      const xmlResult = parseUidesc(xmlContent);

      expect(jsonResult.success).toBe(true);
      expect(xmlResult.success).toBe(true);

      if (jsonResult.success && xmlResult.success) {
        expect(jsonResult.document['vstgui-ui-description'].colors).toEqual(
          xmlResult.document['vstgui-ui-description'].colors
        );
      }
    });

    it('should produce same fonts from XML and JSON', () => {
      const jsonContent = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: { MainFont: { 'font-name': 'Arial', size: '12' } },
        },
      });
      const xmlContent = `
        <vstgui-ui-description version="1">
          <font name="MainFont" font-name="Arial" size="12"/>
        </vstgui-ui-description>
      `;

      const jsonResult = parseUidesc(jsonContent);
      const xmlResult = parseUidesc(xmlContent);

      expect(jsonResult.success).toBe(true);
      expect(xmlResult.success).toBe(true);

      if (jsonResult.success && xmlResult.success) {
        expect(jsonResult.document['vstgui-ui-description'].fonts).toEqual(
          xmlResult.document['vstgui-ui-description'].fonts
        );
      }
    });
  });
});
