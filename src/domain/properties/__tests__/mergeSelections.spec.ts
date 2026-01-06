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
      const attrs = [{ class: 'CView', origin: '0, 0', 'background-color': '#FFF' }];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const allAttrs = result.groups.flatMap((g) => g.attributes);

      expect(allAttrs.every((a) => !a.isMixed)).toBe(true);
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
  });

  describe('shared vs mixed values', () => {
    it('should show shared value when all views have same value', () => {
      const attrs = [
        { class: 'CView', 'background-color': '#FF0000' },
        { class: 'CView', 'background-color': '#FF0000' },
      ];
      const classes = ['CView', 'CView'];

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

    it('should not include attribute if no views have it', () => {
      const attrs = [{ class: 'CView' }, { class: 'CView' }];
      const classes = ['CView', 'CView'];

      const result = mergeSelections(attrs, classes);
      const textGroup = result.groups.find((g) => g.id === 'text');

      expect(textGroup).toBeUndefined();
    });
  });

  describe('attribute merging from all views', () => {
    it('should include all attributes from all views', () => {
      const attrs = [
        { class: 'CView', origin: '0, 0' },
        { class: 'CView', size: '100, 100' },
        { class: 'CView', 'background-color': '#FFF' },
      ];
      const classes = ['CView', 'CView', 'CView'];

      const result = mergeSelections(attrs, classes);
      const allAttrNames = result.groups.flatMap((g) => g.attributes.map((a) => a.name));

      expect(allAttrNames).toContain('class');
      expect(allAttrNames).toContain('origin');
      expect(allAttrNames).toContain('size');
      expect(allAttrNames).toContain('background-color');
    });

    it('should mark attributes as mixed if not all views have them', () => {
      const attrs = [
        { class: 'CView', origin: '0, 0' },
        { class: 'CView', size: '100, 100' },
      ];
      const classes = ['CView', 'CView'];

      const result = mergeSelections(attrs, classes);
      const geometryGroup = result.groups.find((g) => g.id === 'geometry');

      const origin = geometryGroup?.attributes.find((a) => a.name === 'origin');
      const size = geometryGroup?.attributes.find((a) => a.name === 'size');

      expect(origin?.isMixed).toBe(true);
      expect(size?.isMixed).toBe(true);
    });
  });

  describe('group sorting and organization', () => {
    it('should sort groups by priority', () => {
      const attrs = [
        {
          class: 'CView',
          'mouse-enabled': 'true',
          origin: '0, 0',
          'background-color': '#FFF',
          title: 'Test',
        },
      ];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const groupIds = result.groups.map((g) => g.id);

      expect(groupIds).toEqual(['identity', 'geometry', 'appearance', 'text', 'behavior']);
    });

    it('should sort attributes within groups alphabetically', () => {
      const attrs = [
        {
          class: 'CView',
          size: '100, 100',
          'min-size': '50, 50',
          origin: '0, 0',
        },
      ];
      const classes = ['CView'];

      const result = mergeSelections(attrs, classes);
      const geometryGroup = result.groups.find((g) => g.id === 'geometry');
      const names = geometryGroup?.attributes.map((a) => a.name);

      expect(names).toEqual(['min-size', 'origin', 'size']);
    });
  });

  describe('large selection (50+ views)', () => {
    it('should handle 50 views efficiently', () => {
      const attrs = Array.from({ length: 50 }, (_, i) => ({
        class: 'CView',
        origin: `${i * 10}, ${i * 10}`,
        'background-color': '#FF0000',
      }));
      const classes = Array.from({ length: 50 }, () => 'CView');

      const startTime = performance.now();
      const result = mergeSelections(attrs, classes);
      const endTime = performance.now();

      expect(result.selectionCount).toBe(50);
      expect(result.sameClass).toBe(true);
      expect(endTime - startTime).toBeLessThan(100);

      const bgColor = result.groups
        .find((g) => g.id === 'appearance')
        ?.attributes.find((a) => a.name === 'background-color');
      expect(bgColor?.isMixed).toBe(false);
      expect(bgColor?.value).toBe('#FF0000');

      const origin = result.groups
        .find((g) => g.id === 'geometry')
        ?.attributes.find((a) => a.name === 'origin');
      expect(origin?.isMixed).toBe(true);
    });
  });
});
