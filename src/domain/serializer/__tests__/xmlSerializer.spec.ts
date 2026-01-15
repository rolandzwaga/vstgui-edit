import { describe, expect, test } from 'vitest';
import { createMockDocument } from '../../../__tests__/helpers/fixtures';
import { serializeToXml } from '../xmlSerializer';

describe('serializeToXml', () => {
  describe('basic serialization', () => {
    test('produces valid XML with declaration', () => {
      const doc = createMockDocument();
      const result = serializeToXml(doc);

      expect(result).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    });

    test('has vstgui-ui-description root element with version', () => {
      const doc = createMockDocument();
      const result = serializeToXml(doc);

      expect(result).toContain('<vstgui-ui-description version="1">');
      expect(result).toContain('</vstgui-ui-description>');
    });
  });

  describe('colors serialization', () => {
    test('serializes colors as color elements with name and rgba attributes', () => {
      const doc = createMockDocument({
        colors: { TestColor: '#ff0000ff', AnotherColor: '#00ff00ff' },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('<colors>');
      expect(result).toContain('<color name="TestColor" rgba="#ff0000ff"/>');
      expect(result).toContain('<color name="AnotherColor" rgba="#00ff00ff"/>');
      expect(result).toContain('</colors>');
    });

    test('omits colors section when no colors defined', () => {
      const doc = createMockDocument({ colors: undefined });
      const result = serializeToXml(doc);

      expect(result).not.toContain('<colors>');
    });
  });

  describe('fonts serialization', () => {
    test('serializes fonts as font elements with properties as attributes', () => {
      const doc = createMockDocument({
        fonts: {
          TestFont: { 'font-name': 'Arial', size: '12', bold: 'true' },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('<fonts>');
      expect(result).toMatch(/<font name="TestFont".*font-name="Arial"/);
      expect(result).toMatch(/<font name="TestFont".*size="12"/);
      expect(result).toContain('</fonts>');
    });
  });

  describe('bitmaps serialization', () => {
    test('serializes string bitmaps as bitmap elements with path', () => {
      const doc = createMockDocument({
        bitmaps: { knob: 'knob.png' },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('<bitmaps>');
      expect(result).toContain('<bitmap name="knob" path="knob.png"/>');
      expect(result).toContain('</bitmaps>');
    });

    test('serializes object bitmaps with all properties', () => {
      const doc = createMockDocument({
        bitmaps: {
          slider: { path: 'slider.png', 'nineparttiled-offsets': '5, 5, 5, 5' },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toMatch(/<bitmap name="slider".*path="slider.png"/);
      expect(result).toMatch(/<bitmap name="slider".*nineparttiled-offsets="5, 5, 5, 5"/);
    });
  });

  describe('templates serialization', () => {
    test('serializes template as template element with name and attributes', () => {
      const doc = createMockDocument({
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer', origin: '0, 0', size: '400, 300' },
          },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toMatch(/<template name="MainView".*class="CViewContainer"/);
      expect(result).toMatch(/<template name="MainView".*origin="0, 0"/);
      expect(result).toMatch(/<template name="MainView".*size="400, 300"/);
    });

    test('serializes nested children as view elements', () => {
      const doc = createMockDocument({
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer', origin: '0, 0', size: '400, 300' },
            children: {
              '0': { attributes: { class: 'CTextLabel', origin: '10, 10', size: '100, 20' } },
            },
          },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('<view class="CTextLabel"');
      expect(result).toMatch(/<view.*origin="10, 10"/);
    });

    test('serializes deeply nested view hierarchy', () => {
      const doc = createMockDocument({
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer', origin: '0, 0', size: '400, 300' },
            children: {
              '0': {
                attributes: { class: 'CViewContainer', origin: '10, 10', size: '200, 200' },
                children: {
                  '0': { attributes: { class: 'CKnob', origin: '5, 5', size: '50, 50' } },
                },
              },
            },
          },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('<view class="CKnob"');
    });
  });

  describe('attribute escaping', () => {
    test('escapes special XML characters in attribute values', () => {
      const doc = createMockDocument({
        colors: { 'Test&Color': '#ff0000ff' },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('name="Test&amp;Color"');
    });

    test('escapes quotes in attribute values', () => {
      const doc = createMockDocument({
        templates: {
          Test: {
            attributes: { class: 'CView', origin: '0, 0', size: '100, 100', title: 'Say "Hello"' },
          },
        },
      });
      const result = serializeToXml(doc);

      expect(result).toContain('title="Say &quot;Hello&quot;"');
    });
  });

  describe('formatting', () => {
    test('produces indented XML output', () => {
      const doc = createMockDocument();
      const result = serializeToXml(doc);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });
});
