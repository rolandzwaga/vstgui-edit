import { describe, expect, test } from 'vitest';
import {
  ATTRIBUTE_TYPE_MAP,
  AUTOSIZE_FLAGS,
  ENUM_OPTIONS,
  getAttributeConfig,
} from '../attributeTypes';

describe('attributeTypes', () => {
  describe('ATTRIBUTE_TYPE_MAP', () => {
    test('class attribute is readonly', () => {
      expect(ATTRIBUTE_TYPE_MAP['class']).toEqual({ editorType: 'readonly' });
    });

    test('geometry attributes have point editor type', () => {
      const geometryAttrs = ['origin', 'size', 'min-size', 'max-size', 'text-inset', 'shadow-offset'];
      for (const attr of geometryAttrs) {
        expect(ATTRIBUTE_TYPE_MAP[attr]?.editorType).toBe('point');
      }
    });

    test('boolean attributes have boolean editor type', () => {
      const booleanAttrs = [
        'mouse-enabled',
        'transparent',
        'wants-focus',
        'visible',
        'bordered',
        'draw-antialiased',
        'font-antialias',
      ];
      for (const attr of booleanAttrs) {
        expect(ATTRIBUTE_TYPE_MAP[attr]?.editorType).toBe('boolean');
      }
    });

    test('numeric attributes have number editor type with correct constraints', () => {
      expect(ATTRIBUTE_TYPE_MAP['opacity']).toEqual({
        editorType: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      });
      expect(ATTRIBUTE_TYPE_MAP['frame-width']).toEqual({
        editorType: 'number',
        min: 0,
        step: 1,
      });
    });

    test('enum attributes have enum editor type with options', () => {
      expect(ATTRIBUTE_TYPE_MAP['text-alignment']).toEqual({
        editorType: 'enum',
        options: ['left', 'center', 'right'],
      });
    });

    test('autosize has autosize editor type with flags', () => {
      expect(ATTRIBUTE_TYPE_MAP['autosize']).toEqual({
        editorType: 'autosize',
        flags: ['left', 'right', 'top', 'bottom', 'row', 'column'],
      });
    });

    test('color attributes have color editor type', () => {
      const colorAttrs = ['background-color', 'font-color', 'frame-color', 'shadow-color'];
      for (const attr of colorAttrs) {
        expect(ATTRIBUTE_TYPE_MAP[attr]?.editorType).toBe('color');
      }
    });

    test('font attribute has font editor type', () => {
      expect(ATTRIBUTE_TYPE_MAP['font']).toEqual({ editorType: 'font' });
    });

    test('bitmap attribute has bitmap editor type', () => {
      expect(ATTRIBUTE_TYPE_MAP['bitmap']).toEqual({ editorType: 'bitmap' });
    });

    test('text attributes have text editor type', () => {
      const textAttrs = ['title', 'tooltip', 'uidesc-label', 'custom-view-name', 'sub-controller'];
      for (const attr of textAttrs) {
        expect(ATTRIBUTE_TYPE_MAP[attr]?.editorType).toBe('text');
      }
    });
  });

  describe('getAttributeConfig', () => {
    test('returns config for known attributes', () => {
      expect(getAttributeConfig('origin')).toEqual({ editorType: 'point' });
      expect(getAttributeConfig('opacity')).toEqual({
        editorType: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      });
    });

    test('returns text editor type for unknown attributes', () => {
      expect(getAttributeConfig('unknown-attribute')).toEqual({ editorType: 'text' });
      expect(getAttributeConfig('custom-property')).toEqual({ editorType: 'text' });
    });
  });

  describe('ENUM_OPTIONS', () => {
    test('text-alignment has correct options', () => {
      expect(ENUM_OPTIONS['text-alignment']).toEqual(['left', 'center', 'right']);
    });

    test('background-color-draw-style has correct options', () => {
      expect(ENUM_OPTIONS['background-color-draw-style']).toEqual([
        'filled',
        'stroked',
        'filled and stroked',
      ]);
    });

    test('truncate-mode has correct options', () => {
      expect(ENUM_OPTIONS['truncate-mode']).toEqual(['head', 'tail', 'none']);
    });

    test('orientation has correct options', () => {
      expect(ENUM_OPTIONS['orientation']).toEqual(['horizontal', 'vertical']);
    });
  });

  describe('AUTOSIZE_FLAGS', () => {
    test('contains all autosize flags', () => {
      expect(AUTOSIZE_FLAGS).toEqual(['left', 'right', 'top', 'bottom', 'row', 'column']);
    });
  });
});
