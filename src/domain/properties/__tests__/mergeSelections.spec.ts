import { describe, expect, it } from 'vitest';
import { mergeSelections } from '../mergeSelections';

describe('mergeSelections', () => {
  describe('empty input', () => {
    it('should return empty result for no views', () => {
      const result = mergeSelections([], []);

      expect(result.groups).toHaveLength(0);
      expect(result.selectionCount).toBe(0);
      expect(result.className).toBeNull();
      expect(result.sameClass).toBe(false);
    });
  });

  describe('single selection', () => {
    it('should return grouped attributes for single view', () => {
      const attrs = [{ class: 'CTextButton', origin: '10, 20', size: '100, 30' }];
      const classes = ['CTextButton'];

      const result = mergeSelections(attrs, classes);

      expect(result.selectionCount).toBe(1);
      expect(result.className).toBe('CTextButton');
      expect(result.sameClass).toBe(true);
      expect(result.groups.length).toBeGreaterThan(0);
    });

    it('should have no mixed values for single view', () => {
      const attrs = [{ class: 'CView', origin: '0, 0' }];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const setAttrs = result.groups.flatMap((g) => g.attributes).filter((a) => !a.isUnset);

      expect(setAttrs.every((a) => !a.isMixed)).toBe(true);
    });
  });

  describe('multi-selection with same class', () => {
    it('should show shared class name', () => {
      const attrs = [
        { class: 'CTextButton', origin: '10, 20' },
        { class: 'CTextButton', origin: '50, 60' },
      ];
      const classes = ['CTextButton', 'CTextButton'];

      const result = mergeSelections(attrs, classes);

      expect(result.className).toBe('CTextButton');
      expect(result.sameClass).toBe(true);
      expect(result.selectionCount).toBe(2);
    });

    it('should show class as non-mixed when all same', () => {
      const attrs = [
        { class: 'CTextButton' },
        { class: 'CTextButton' },
        { class: 'CTextButton' },
      ];
      const classes = ['CTextButton', 'CTextButton', 'CTextButton'];

      const result = mergeSelections(attrs, classes);
      const identityGroup = result.groups.find((g) => g.id === 'identity');
      const classAttr = identityGroup?.attributes.find((a) => a.name === 'class');

      expect(classAttr?.isMixed).toBe(false);
      expect(classAttr?.value).toBe('CTextButton');
    });
  });

  describe('multi-selection with different classes', () => {
    it('should have null className when classes differ', () => {
      const attrs = [
        { class: 'CTextButton', origin: '10, 20' },
        { class: 'CTextLabel', origin: '50, 60' },
      ];
      const classes = ['CTextButton', 'CTextLabel'];

      const result = mergeSelections(attrs, classes);

      expect(result.className).toBeNull();
      expect(result.sameClass).toBe(false);
      expect(result.selectionCount).toBe(2);
    });

    it('should mark class as mixed when different', () => {
      const attrs = [{ class: 'CTextButton' }, { class: 'CTextLabel' }];
      const classes = ['CTextButton', 'CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const identityGroup = result.groups.find((g) => g.id === 'identity');
      const classAttr = identityGroup?.attributes.find((a) => a.name === 'class');

      expect(classAttr?.isMixed).toBe(true);
      expect(classAttr?.value).toBeNull();
    });

    it('should use common base class attributes for mixed selection', () => {
      const attrs = [{ class: 'CTextButton' }, { class: 'CTextLabel' }];
      const classes = ['CTextButton', 'CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const allAttrNames = result.groups.flatMap((g) => g.attributes.map((a) => a.name));

      expect(allAttrNames).toContain('origin');
      expect(allAttrNames).toContain('size');
      expect(allAttrNames).toContain('control-tag');
    });
  });

  describe('shared vs mixed values', () => {
    it('should show shared value when all views have same value', () => {
      const attrs = [
        { class: 'CViewContainer', 'background-color': '#FF0000' },
        { class: 'CViewContainer', 'background-color': '#FF0000' },
      ];
      const classes = ['CViewContainer', 'CViewContainer'];

      const result = mergeSelections(attrs, classes);
      const appearanceGroup = result.groups.find((g) => g.id === 'appearance');
      const bgColor = appearanceGroup?.attributes.find((a) => a.name === 'background-color');

      expect(bgColor?.isMixed).toBe(false);
      expect(bgColor?.value).toBe('#FF0000');
      expect(bgColor?.isCopyable).toBe(true);
    });

    it('should mark as mixed when values differ', () => {
      const attrs = [
        { class: 'CView', size: '100, 100' },
        { class: 'CView', size: '200, 200' },
      ];
      const classes = ['CView', 'CView'];

      const result = mergeSelections(attrs, classes);
      const geometryGroup = result.groups.find((g) => g.id === 'geometry');
      const sizeAttr = geometryGroup?.attributes.find((a) => a.name === 'size');

      expect(sizeAttr?.isMixed).toBe(true);
      expect(sizeAttr?.value).toBeNull();
      expect(sizeAttr?.isCopyable).toBe(false);
    });

    it('should mark as mixed when some views lack attribute', () => {
      const attrs = [
        { class: 'CView', tooltip: 'Hello' },
        { class: 'CView' },
      ];
      const classes = ['CView', 'CView'];

      const result = mergeSelections(attrs, classes);
      const textGroup = result.groups.find((g) => g.id === 'text');
      const tooltip = textGroup?.attributes.find((a) => a.name === 'tooltip');

      expect(tooltip?.isMixed).toBe(true);
      expect(tooltip?.value).toBeNull();
    });
  });

  describe('schema-driven behavior', () => {
    it('should show all schema attributes even with minimal instance', () => {
      const attrs = [{ class: 'CTextLabel', origin: '10, 20', size: '100, 30' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const allAttrNames = result.groups.flatMap((g) => g.attributes.map((a) => a.name));

      expect(allAttrNames).toContain('font');
      expect(allAttrNames).toContain('font-color');
      expect(allAttrNames).toContain('title');
      expect(allAttrNames).toContain('truncate-mode');
      expect(allAttrNames).toContain('text-alignment');
    });

    it('should mark schema attributes not in instance as isUnset', () => {
      const attrs = [{ class: 'CTextLabel', origin: '10, 20' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const fontAttr = result.groups.flatMap((g) => g.attributes).find((a) => a.name === 'font');

      expect(fontAttr?.isUnset).toBe(true);
      expect(fontAttr?.value).toBeNull();
    });

    it('should mark instance attributes as not unset', () => {
      const attrs = [{ class: 'CTextLabel', origin: '10, 20', font: 'MyFont' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const fontAttr = result.groups.flatMap((g) => g.attributes).find((a) => a.name === 'font');
      const originAttr = result.groups.flatMap((g) => g.attributes).find((a) => a.name === 'origin');

      expect(fontAttr?.isUnset).toBe(false);
      expect(fontAttr?.value).toBe('MyFont');
      expect(originAttr?.isUnset).toBe(false);
    });

    it('should include correct editorType from schema', () => {
      const attrs = [{ class: 'CTextLabel', origin: '10, 20' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const allAttrs = result.groups.flatMap((g) => g.attributes);

      const originAttr = allAttrs.find((a) => a.name === 'origin');
      const fontColorAttr = allAttrs.find((a) => a.name === 'font-color');
      const alignAttr = allAttrs.find((a) => a.name === 'text-alignment');

      expect(originAttr?.editorType).toBe('point');
      expect(fontColorAttr?.editorType).toBe('color');
      expect(alignAttr?.editorType).toBe('enum');
    });

    it('should include enumValues for enum attributes', () => {
      const attrs = [{ class: 'CTextLabel' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const alignAttr = result.groups
        .flatMap((g) => g.attributes)
        .find((a) => a.name === 'text-alignment');

      expect(alignAttr?.enumValues).toContain('left');
      expect(alignAttr?.enumValues).toContain('center');
      expect(alignAttr?.enumValues).toContain('right');
    });

    it('should show CViewContainer attributes for view without class', () => {
      const attrs = [{ origin: '0, 0', size: '100, 100' }];
      const classes = ['CViewContainer'];

      const result = mergeSelections(attrs, classes);
      const allAttrNames = result.groups.flatMap((g) => g.attributes.map((a) => a.name));

      expect(allAttrNames).toContain('background-color');
      expect(allAttrNames).toContain('background-color-draw-style');
    });

    it('should show unset attribute even when value was deleted', () => {
      const attrs = [{ class: 'CTextLabel', origin: '10, 20' }];
      const classes = ['CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const fontColorAttr = result.groups
        .flatMap((g) => g.attributes)
        .find((a) => a.name === 'font-color');

      expect(fontColorAttr).toBeDefined();
      expect(fontColorAttr?.isUnset).toBe(true);
    });

    it('should handle multi-selection correctly', () => {
      const attrs = [
        { class: 'CTextLabel', origin: '10, 20', font: 'Font1' },
        { class: 'CTextLabel', origin: '50, 60', font: 'Font1' },
      ];
      const classes = ['CTextLabel', 'CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const fontAttr = result.groups.flatMap((g) => g.attributes).find((a) => a.name === 'font');

      expect(fontAttr?.isMixed).toBe(false);
      expect(fontAttr?.value).toBe('Font1');
      expect(fontAttr?.isUnset).toBe(false);
    });

    it('should mark as mixed when one view has value and one does not', () => {
      const attrs = [{ class: 'CTextLabel', font: 'Font1' }, { class: 'CTextLabel' }];
      const classes = ['CTextLabel', 'CTextLabel'];

      const result = mergeSelections(attrs, classes);
      const fontAttr = result.groups.flatMap((g) => g.attributes).find((a) => a.name === 'font');

      expect(fontAttr?.isMixed).toBe(true);
    });
  });

  describe('group sorting and organization', () => {
    it('should sort groups by priority', () => {
      const attrs = [{ class: 'CView', 'mouse-enabled': 'true', origin: '0, 0' }];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const groupIds = result.groups.map((g) => g.id);

      expect(groupIds[0]).toBe('identity');
      expect(groupIds[1]).toBe('geometry');
      expect(groupIds.indexOf('appearance')).toBeGreaterThan(groupIds.indexOf('geometry'));
    });

    it('should sort attributes within groups alphabetically', () => {
      const attrs = [{ class: 'CView', size: '100, 100', origin: '0, 0' }];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const geometryGroup = result.groups.find((g) => g.id === 'geometry');
      const names = geometryGroup?.attributes.map((a) => a.name) ?? [];

      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('performance', () => {
    it('should handle 50 views efficiently', () => {
      const attrs = Array.from({ length: 50 }, (_, i) => ({
        class: 'CView',
        origin: `${i * 10}, ${i * 10}`,
      }));
      const classes = Array.from({ length: 50 }, () => 'CView');

      const startTime = performance.now();
      const result = mergeSelections(attrs, classes);
      const endTime = performance.now();

      expect(result.selectionCount).toBe(50);
      expect(result.sameClass).toBe(true);
      expect(endTime - startTime).toBeLessThan(100);

      const origin = result.groups
        .find((g) => g.id === 'geometry')
        ?.attributes.find((a) => a.name === 'origin');
      expect(origin?.isMixed).toBe(true);
    });
  });

  describe('non-schema attributes', () => {
    it('should include custom attributes not in schema', () => {
      const attrs = [{ class: 'CView', origin: '0, 0', 'my-custom-attr': 'custom-value' }];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const allAttrNames = result.groups.flatMap((g) => g.attributes.map((a) => a.name));

      expect(allAttrNames).toContain('my-custom-attr');

      const customAttr = result.groups
        .flatMap((g) => g.attributes)
        .find((a) => a.name === 'my-custom-attr');
      expect(customAttr?.value).toBe('custom-value');
      expect(customAttr?.editorType).toBe('text');
      expect(customAttr?.isUnset).toBe(false);
    });
  });
});
