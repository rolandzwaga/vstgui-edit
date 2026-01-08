import { describe, expect, test } from 'vitest';
import { createMockDocument } from '../../../__tests__/helpers/fixtures';
import { serializeToJson } from '../jsonSerializer';

describe('serializeToJson', () => {
  describe('basic serialization', () => {
    test('serializes minimal document to valid JSON', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc);

      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed['vstgui-ui-description']).toBeDefined();
      expect(parsed['vstgui-ui-description'].version).toBe('1');
    });

    test('preserves all document properties', () => {
      const doc = createMockDocument({
        colors: { TestColor: '#ff0000ff' },
        fonts: { TestFont: { 'font-name': 'Arial', size: '12' } },
      });
      const result = serializeToJson(doc);
      const parsed = JSON.parse(result);

      expect(parsed['vstgui-ui-description'].colors).toEqual({ TestColor: '#ff0000ff' });
      expect(parsed['vstgui-ui-description'].fonts).toEqual({
        TestFont: { 'font-name': 'Arial', size: '12' },
      });
    });

    test('preserves template structure with nested children', () => {
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
      const result = serializeToJson(doc);
      const parsed = JSON.parse(result);

      expect(parsed['vstgui-ui-description'].templates.MainView.children['0']).toBeDefined();
      expect(parsed['vstgui-ui-description'].templates.MainView.children['0'].attributes.class).toBe(
        'CTextLabel'
      );
    });
  });

  describe('formatting options', () => {
    test('produces pretty-printed output by default', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    test('uses 2-space indentation by default', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc);

      const lines = result.split('\n');
      const indentedLine = lines.find(line => line.startsWith('  ') && !line.startsWith('    '));
      expect(indentedLine).toBeDefined();
    });

    test('respects pretty: false for minified output', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc, { pretty: false });

      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });

    test('respects custom indent value', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc, { indent: 4 });

      expect(result).toContain('    ');
    });

    test('ignores indent when pretty is false', () => {
      const doc = createMockDocument();
      const result = serializeToJson(doc, { pretty: false, indent: 4 });

      expect(result).not.toContain('    ');
      expect(result).not.toContain('\n');
    });
  });

  describe('round-trip consistency', () => {
    test('parse(serialize(doc)) equals original document', () => {
      const doc = createMockDocument({
        colors: { Red: '#ff0000ff', Blue: '#0000ffff' },
        templates: {
          Main: {
            attributes: { class: 'CViewContainer', origin: '0, 0', size: '800, 600' },
          },
        },
      });
      const serialized = serializeToJson(doc);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(doc);
    });
  });
});
