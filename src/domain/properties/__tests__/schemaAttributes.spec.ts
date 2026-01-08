import { describe, expect, test } from 'vitest';
import {
  findCommonBaseClass,
  getAttributesForClass,
  getInheritanceChain,
  resolveClassAttributes,
} from '../schemaAttributes';

describe('schemaAttributes', () => {
  describe('getInheritanceChain', () => {
    test('CView returns only CView', () => {
      const chain = getInheritanceChain('CView');
      expect(chain).toEqual(['CView']);
    });

    test('CViewContainer inherits from CView', () => {
      const chain = getInheritanceChain('CViewContainer');
      expect(chain).toEqual(['CViewContainer', 'CView']);
    });

    test('CTextLabel has full inheritance chain', () => {
      const chain = getInheritanceChain('CTextLabel');
      expect(chain).toEqual(['CTextLabel', 'CParamDisplay', 'CControl', 'CView']);
    });

    test('CSlider inherits from CControl', () => {
      const chain = getInheritanceChain('CSlider');
      expect(chain).toEqual(['CSlider', 'CControl', 'CView']);
    });

    test('CRowColumnView inherits from CViewContainer', () => {
      const chain = getInheritanceChain('CRowColumnView');
      expect(chain).toEqual(['CRowColumnView', 'CViewContainer', 'CView']);
    });

    test('unknown class falls back to CView', () => {
      const chain = getInheritanceChain('UnknownClass');
      expect(chain).toEqual(['CView']);
    });
  });

  describe('resolveClassAttributes', () => {
    test('CView has base attributes', () => {
      const attrs = resolveClassAttributes('CView');
      const attrNames = attrs.map((a) => a.name);

      expect(attrNames).toContain('origin');
      expect(attrNames).toContain('size');
      expect(attrNames).toContain('opacity');
      expect(attrNames).toContain('transparent');
      expect(attrNames).toContain('mouse-enabled');
    });

    test('CViewContainer has CView attributes plus its own', () => {
      const attrs = resolveClassAttributes('CViewContainer');
      const attrNames = attrs.map((a) => a.name);

      expect(attrNames).toContain('origin');
      expect(attrNames).toContain('size');
      expect(attrNames).toContain('background-color');
      expect(attrNames).toContain('background-color-draw-style');
    });

    test('CTextLabel has inherited attributes from all parents', () => {
      const attrs = resolveClassAttributes('CTextLabel');
      const attrNames = attrs.map((a) => a.name);

      expect(attrNames).toContain('origin');
      expect(attrNames).toContain('control-tag');
      expect(attrNames).toContain('font');
      expect(attrNames).toContain('font-color');
      expect(attrNames).toContain('title');
      expect(attrNames).toContain('truncate-mode');
    });

    test('no duplicate attributes from inheritance chain', () => {
      const attrs = resolveClassAttributes('CTextLabel');
      const attrNames = attrs.map((a) => a.name);
      const uniqueNames = new Set(attrNames);

      expect(attrNames.length).toBe(uniqueNames.size);
    });
  });

  describe('getAttributesForClass', () => {
    test('returns ViewClassSchema with all fields', () => {
      const schema = getAttributesForClass('CTextLabel');

      expect(schema.className).toBe('CTextLabel');
      expect(schema.inheritanceChain).toEqual(['CTextLabel', 'CParamDisplay', 'CControl', 'CView']);
      expect(schema.attributes.length).toBeGreaterThan(0);
    });

    test('attributes have correct editorType', () => {
      const schema = getAttributesForClass('CTextLabel');
      const originAttr = schema.attributes.find((a) => a.name === 'origin');
      const fontColorAttr = schema.attributes.find((a) => a.name === 'font-color');
      const alignAttr = schema.attributes.find((a) => a.name === 'text-alignment');

      expect(originAttr?.editorType).toBe('point');
      expect(fontColorAttr?.editorType).toBe('color');
      expect(alignAttr?.editorType).toBe('enum');
      expect(alignAttr?.enumValues).toContain('left');
      expect(alignAttr?.enumValues).toContain('center');
      expect(alignAttr?.enumValues).toContain('right');
    });

    test('caches results for repeated calls', () => {
      const schema1 = getAttributesForClass('CSlider');
      const schema2 = getAttributesForClass('CSlider');

      expect(schema1).toBe(schema2);
    });

    test('unknown class falls back to CView attributes', () => {
      const schema = getAttributesForClass('InvalidClassName');

      expect(schema.className).toBe('InvalidClassName');
      expect(schema.inheritanceChain).toEqual(['CView']);
      expect(schema.attributes.some((a) => a.name === 'origin')).toBe(true);
    });
  });

  describe('findCommonBaseClass', () => {
    test('same class returns that class', () => {
      expect(findCommonBaseClass(['CTextLabel', 'CTextLabel'])).toBe('CTextLabel');
    });

    test('CTextLabel and CTextEdit share CTextLabel as common base', () => {
      expect(findCommonBaseClass(['CTextLabel', 'CTextEdit'])).toBe('CTextLabel');
    });

    test('CTextLabel and CSlider share CControl as common base', () => {
      expect(findCommonBaseClass(['CTextLabel', 'CSlider'])).toBe('CControl');
    });

    test('CViewContainer and CTextLabel share CView as common base', () => {
      expect(findCommonBaseClass(['CViewContainer', 'CTextLabel'])).toBe('CView');
    });

    test('empty array returns CView', () => {
      expect(findCommonBaseClass([])).toBe('CView');
    });

    test('single class returns that class', () => {
      expect(findCommonBaseClass(['CKnob'])).toBe('CKnob');
    });

    test('multiple different classes find deepest common ancestor', () => {
      expect(findCommonBaseClass(['CTextLabel', 'CTextEdit', 'COptionMenu'])).toBe('CParamDisplay');
    });
  });

  describe('schema type mapping', () => {
    test('colorValue maps to color editor', () => {
      const schema = getAttributesForClass('CViewContainer');
      const bgColor = schema.attributes.find((a) => a.name === 'background-color');

      expect(bgColor?.editorType).toBe('color');
    });

    test('pointValue maps to point editor', () => {
      const schema = getAttributesForClass('CView');
      const origin = schema.attributes.find((a) => a.name === 'origin');

      expect(origin?.editorType).toBe('point');
    });

    test('booleanValue maps to boolean editor', () => {
      const schema = getAttributesForClass('CView');
      const transparent = schema.attributes.find((a) => a.name === 'transparent');

      expect(transparent?.editorType).toBe('boolean');
    });

    test('numericValue maps to number editor', () => {
      const schema = getAttributesForClass('CView');
      const opacity = schema.attributes.find((a) => a.name === 'opacity');

      expect(opacity?.editorType).toBe('number');
    });

    test('enum with values maps to enum editor with enumValues', () => {
      const schema = getAttributesForClass('CParamDisplay');
      const alignment = schema.attributes.find((a) => a.name === 'text-alignment');

      expect(alignment?.editorType).toBe('enum');
      expect(alignment?.enumValues).toEqual(['left', 'center', 'right']);
    });

    test('font reference maps to font editor', () => {
      const schema = getAttributesForClass('CParamDisplay');
      const font = schema.attributes.find((a) => a.name === 'font');

      expect(font?.editorType).toBe('font');
    });

    test('bitmap reference maps to bitmap editor', () => {
      const schema = getAttributesForClass('CView');
      const bitmap = schema.attributes.find((a) => a.name === 'bitmap');

      expect(bitmap?.editorType).toBe('bitmap');
    });
  });

  describe('performance', () => {
    test('schema resolution completes in under 50ms', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        getAttributesForClass('CTextLabel');
        getAttributesForClass('CSlider');
        getAttributesForClass('CViewContainer');
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });
});
