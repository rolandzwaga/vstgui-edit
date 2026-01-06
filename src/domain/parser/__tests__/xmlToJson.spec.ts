import { describe, expect, it } from 'vitest';
import { type XmlToJsonResult, xmlToJson } from '../xmlToJson';

/**
 * Helper to create an XML Document from string
 */
function parseXml(content: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(content, 'application/xml');
}

describe('xmlToJson', () => {
  describe('basic structure conversion (FR-010)', () => {
    it('should convert minimal uidesc structure', () => {
      const doc = parseXml('<vstgui-ui-description version="1"/>');
      const result = xmlToJson(doc);

      expect(result.json).toEqual({
        'vstgui-ui-description': {
          version: '1',
        },
      });
    });

    it('should convert version attribute', () => {
      const doc = parseXml('<vstgui-ui-description version="1"/>');
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].version).toBe('1');
    });
  });

  describe('colors conversion', () => {
    it('should convert color elements to colors object', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1aff"/>
          <color name="Foreground" rgba="#ffffffff"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].colors).toEqual({
        Background: '#1a1a1aff',
        Foreground: '#ffffffff',
      });
    });
  });

  describe('fonts conversion', () => {
    it('should convert font elements to fonts object', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <font name="MainFont" font-name="Arial" size="12"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].fonts).toEqual({
        MainFont: {
          'font-name': 'Arial',
          size: '12',
        },
      });
    });

    it('should convert font with optional attributes', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <font name="BoldFont" font-name="Arial" size="14" bold="true"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].fonts?.BoldFont).toEqual({
        'font-name': 'Arial',
        size: '14',
        bold: 'true',
      });
    });
  });

  describe('bitmaps conversion', () => {
    it('should convert bitmap elements to bitmaps object', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <bitmap name="Knob" path="images/knob.png"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].bitmaps).toEqual({
        Knob: {
          path: 'images/knob.png',
        },
      });
    });

    it('should convert bitmap with scale-factor', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <bitmap name="KnobHD" path="images/knob@2x.png" scale-factor="2"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].bitmaps?.KnobHD).toEqual({
        path: 'images/knob@2x.png',
        'scale-factor': '2',
      });
    });
  });

  describe('gradients conversion', () => {
    it('should convert gradient elements to gradients object', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <gradient name="ButtonGradient">
            <color-stop rgba="#ffffff" start="0"/>
            <color-stop rgba="#cccccc" start="1"/>
          </gradient>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].gradients).toEqual({
        ButtonGradient: [
          { rgba: '#ffffff', start: '0' },
          { rgba: '#cccccc', start: '1' },
        ],
      });
    });
  });

  describe('control-tags conversion', () => {
    it('should convert control-tags elements', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <control-tags>
            <control-tag name="Volume" tag="0"/>
            <control-tag name="Pan" tag="1"/>
          </control-tags>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description']['control-tags']).toEqual({
        Volume: '0',
        Pan: '1',
      });
    });
  });

  describe('templates conversion', () => {
    it('should convert simple template', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <template name="MainView" class="CViewContainer" origin="0, 0" size="800, 600"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].templates).toEqual({
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '800, 600',
          },
        },
      });
    });

    it('should convert template with nested views', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <template name="MainView" class="CViewContainer" origin="0, 0" size="800, 600">
            <view class="CTextButton" origin="10, 10" size="100, 30" title="Click Me"/>
          </template>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      const templates = result.json['vstgui-ui-description'].templates;
      expect(templates?.MainView.attributes.class).toBe('CViewContainer');
      expect(templates?.MainView.children).toBeDefined();
    });

    it('should convert deeply nested view hierarchy', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <template name="MainView" class="CViewContainer" origin="0, 0" size="800, 600">
            <view class="CViewContainer" origin="10, 10" size="200, 200">
              <view class="CTextButton" origin="5, 5" size="50, 20"/>
            </view>
          </template>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      const templates = result.json['vstgui-ui-description'].templates as Record<string, { children?: Record<string, { children?: unknown }> }>;
      expect(templates?.MainView.children).toBeDefined();
      const firstChild = Object.values(templates?.MainView.children ?? {})[0];
      expect(firstChild?.children).toBeDefined();
    });
  });

  describe('variables conversion', () => {
    it('should convert variable elements', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <variable name="myVar" value="100"/>
          <variable name="anotherVar" value="test"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.json['vstgui-ui-description'].variables).toEqual({
        myVar: '100',
        anotherVar: 'test',
      });
    });
  });

  describe('path mapping (FR-012)', () => {
    it('should build path mapping for root element', () => {
      const doc = parseXml('<vstgui-ui-description version="1"/>');
      const result = xmlToJson(doc);

      expect(result.pathMap.get('/vstgui-ui-description')).toBeDefined();
    });

    it('should build path mapping for colors', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1a"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.pathMap.get('/vstgui-ui-description/colors/Background')).toBeDefined();
    });

    it('should build path mapping for fonts', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <font name="MainFont" font-name="Arial" size="12"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.pathMap.get('/vstgui-ui-description/fonts/MainFont')).toBeDefined();
    });

    it('should build path mapping for templates', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <template name="MainView" class="CViewContainer"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      expect(result.pathMap.get('/vstgui-ui-description/templates/MainView')).toBeDefined();
    });
  });

  describe('complete document conversion (FR-013)', () => {
    it('should produce identical structure to equivalent JSON', () => {
      const doc = parseXml(`
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1a"/>
          <font name="MainFont" font-name="Arial" size="12"/>
          <bitmap name="Knob" path="images/knob.png"/>
          <template name="MainView" class="CViewContainer" origin="0, 0" size="100, 100"/>
        </vstgui-ui-description>
      `);
      const result = xmlToJson(doc);

      // Verify structure matches expected JSON format
      expect(result.json['vstgui-ui-description']).toMatchObject({
        version: '1',
        colors: { Background: '#1a1a1a' },
        fonts: { MainFont: { 'font-name': 'Arial', size: '12' } },
        bitmaps: { Knob: { path: 'images/knob.png' } },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer', origin: '0, 0', size: '100, 100' },
          },
        },
      });
    });
  });
});
