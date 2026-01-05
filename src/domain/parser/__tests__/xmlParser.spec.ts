import { describe, expect, it } from 'vitest';
import { parseXmlContent, type XmlParseResult } from '../xmlParser';

describe('parseXmlContent', () => {
  describe('valid XML parsing (FR-009)', () => {
    it('should parse minimal valid XML', () => {
      const content = '<vstgui-ui-description version="1"></vstgui-ui-description>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document.documentElement.tagName).toBe('vstgui-ui-description');
      }
    });

    it('should parse XML with declaration', () => {
      const content = '<?xml version="1.0" encoding="UTF-8"?><vstgui-ui-description version="1"/>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
    });

    it('should parse XML with nested elements', () => {
      const content = `
        <vstgui-ui-description version="1">
          <template name="MainView">
            <view class="CViewContainer" origin="0, 0" size="800, 600"/>
          </template>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const template = result.document.querySelector('template');
        expect(template?.getAttribute('name')).toBe('MainView');
      }
    });

    it('should parse XML with colors section', () => {
      const content = `
        <vstgui-ui-description version="1">
          <color name="Background" rgba="#1a1a1aff"/>
          <color name="Foreground" rgba="#ffffffff"/>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const colors = result.document.querySelectorAll('color');
        expect(colors.length).toBe(2);
      }
    });

    it('should parse XML with fonts section', () => {
      const content = `
        <vstgui-ui-description version="1">
          <font name="MainFont" font-name="Arial" size="12"/>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const font = result.document.querySelector('font');
        expect(font?.getAttribute('font-name')).toBe('Arial');
      }
    });

    it('should parse XML with bitmaps section', () => {
      const content = `
        <vstgui-ui-description version="1">
          <bitmap name="Knob" path="images/knob.png"/>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const bitmap = result.document.querySelector('bitmap');
        expect(bitmap?.getAttribute('path')).toBe('images/knob.png');
      }
    });

    it('should parse XML with control-tags section', () => {
      const content = `
        <vstgui-ui-description version="1">
          <control-tags>
            <control-tag name="Volume" tag="0"/>
            <control-tag name="Pan" tag="1"/>
          </control-tags>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        const tags = result.document.querySelectorAll('control-tag');
        expect(tags.length).toBe(2);
      }
    });
  });

  describe('malformed XML handling', () => {
    it('should return error for unclosed tag', () => {
      const content = '<vstgui-ui-description version="1"><template>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('syntax');
      }
    });

    it('should return error for mismatched tags', () => {
      const content = '<vstgui-ui-description version="1"></wrong-tag>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(false);
    });

    it('should return error for invalid XML characters', () => {
      const content = '<vstgui-ui-description version="1">&invalid;</vstgui-ui-description>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(false);
    });

    it('should return error for empty content', () => {
      const result = parseXmlContent('');
      expect(result.success).toBe(false);
    });

    it('should return error for non-XML content', () => {
      const result = parseXmlContent('not xml at all');
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle self-closing tags', () => {
      const content = '<vstgui-ui-description version="1"/>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
    });

    it('should handle attributes with special characters', () => {
      const content = '<vstgui-ui-description version="1" tooltip="Hello &amp; World"/>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.document.documentElement.getAttribute('tooltip')).toBe('Hello & World');
      }
    });

    it('should handle CDATA sections', () => {
      const content = `
        <vstgui-ui-description version="1">
          <data><![CDATA[Some <special> content]]></data>
        </vstgui-ui-description>
      `;
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
    });

    it('should handle XML with leading whitespace', () => {
      const content = '   \n\t  <vstgui-ui-description version="1"/>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
    });

    it('should handle XML with BOM', () => {
      const bom = '\uFEFF';
      const content = bom + '<vstgui-ui-description version="1"/>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(true);
    });
  });

  describe('error information', () => {
    it('should provide error message for malformed XML', () => {
      const content = '<unclosed>';
      const result = parseXmlContent(content);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeTruthy();
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    });
  });
});
