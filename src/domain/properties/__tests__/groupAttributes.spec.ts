import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_GROUP_MAP, getAttributeGroup, groupAttributes } from '../groupAttributes';

describe('ATTRIBUTE_GROUP_MAP', () => {
  it('should map class to identity', () => {
    expect(ATTRIBUTE_GROUP_MAP.class).toBe('identity');
  });

  it('should map geometry attributes correctly', () => {
    expect(ATTRIBUTE_GROUP_MAP.origin).toBe('geometry');
    expect(ATTRIBUTE_GROUP_MAP.size).toBe('geometry');
    expect(ATTRIBUTE_GROUP_MAP['min-size']).toBe('geometry');
    expect(ATTRIBUTE_GROUP_MAP['max-size']).toBe('geometry');
  });

  it('should map appearance attributes correctly', () => {
    expect(ATTRIBUTE_GROUP_MAP['background-color']).toBe('appearance');
    expect(ATTRIBUTE_GROUP_MAP.opacity).toBe('appearance');
    expect(ATTRIBUTE_GROUP_MAP.bitmap).toBe('appearance');
    expect(ATTRIBUTE_GROUP_MAP['frame-color']).toBe('appearance');
  });

  it('should map text attributes correctly', () => {
    expect(ATTRIBUTE_GROUP_MAP.font).toBe('text');
    expect(ATTRIBUTE_GROUP_MAP['font-color']).toBe('text');
    expect(ATTRIBUTE_GROUP_MAP.title).toBe('text');
    expect(ATTRIBUTE_GROUP_MAP.tooltip).toBe('text');
  });

  it('should map behavior attributes correctly', () => {
    expect(ATTRIBUTE_GROUP_MAP['mouse-enabled']).toBe('behavior');
    expect(ATTRIBUTE_GROUP_MAP['want-focus']).toBe('behavior');
    expect(ATTRIBUTE_GROUP_MAP.autosize).toBe('behavior');
  });
});

describe('getAttributeGroup', () => {
  it('should return correct group for known attributes', () => {
    expect(getAttributeGroup('class')).toBe('identity');
    expect(getAttributeGroup('origin')).toBe('geometry');
    expect(getAttributeGroup('background-color')).toBe('appearance');
    expect(getAttributeGroup('title')).toBe('text');
    expect(getAttributeGroup('mouse-enabled')).toBe('behavior');
  });

  it('should return other for unknown attributes', () => {
    expect(getAttributeGroup('custom-attr')).toBe('other');
    expect(getAttributeGroup('my-special-property')).toBe('other');
    expect(getAttributeGroup('')).toBe('other');
  });
});

describe('groupAttributes', () => {
  it('should group attributes by category', () => {
    const attrs = {
      class: 'CTextButton',
      origin: '10, 20',
      size: '100, 30',
      'background-color': '#FF5500FF',
    };

    const groups = groupAttributes(attrs);

    expect(groups).toHaveLength(3);

    const identityGroup = groups.find((g) => g.id === 'identity');
    expect(identityGroup?.attributes).toHaveLength(1);
    expect(identityGroup?.attributes[0].name).toBe('class');
    expect(identityGroup?.attributes[0].value).toBe('CTextButton');

    const geometryGroup = groups.find((g) => g.id === 'geometry');
    expect(geometryGroup?.attributes).toHaveLength(2);

    const appearanceGroup = groups.find((g) => g.id === 'appearance');
    expect(appearanceGroup?.attributes).toHaveLength(1);
  });

  it('should sort groups by priority', () => {
    const attrs = {
      'mouse-enabled': 'true',
      origin: '0, 0',
      class: 'CView',
      title: 'Hello',
    };

    const groups = groupAttributes(attrs);
    const groupIds = groups.map((g) => g.id);

    expect(groupIds).toEqual(['identity', 'geometry', 'text', 'behavior']);
  });

  it('should sort attributes within group alphabetically', () => {
    const attrs = {
      size: '100, 100',
      'min-size': '50, 50',
      origin: '0, 0',
      'max-size': '200, 200',
    };

    const groups = groupAttributes(attrs);
    const geometryGroup = groups.find((g) => g.id === 'geometry');
    const names = geometryGroup?.attributes.map((a) => a.name);

    expect(names).toEqual(['max-size', 'min-size', 'origin', 'size']);
  });

  it('should not include empty groups', () => {
    const attrs = {
      class: 'CView',
      origin: '0, 0',
    };

    const groups = groupAttributes(attrs);

    expect(groups.every((g) => g.attributes.length > 0)).toBe(true);
    expect(groups.find((g) => g.id === 'appearance')).toBeUndefined();
    expect(groups.find((g) => g.id === 'text')).toBeUndefined();
  });

  it('should put unknown attributes in other group', () => {
    const attrs = {
      class: 'CView',
      'custom-view-name': 'MyCustom',
      'sub-controller': 'MyController',
    };

    const groups = groupAttributes(attrs);
    const otherGroup = groups.find((g) => g.id === 'other');

    expect(otherGroup).toBeDefined();
    expect(otherGroup?.attributes).toHaveLength(2);
  });

  it('should set isCopyable to true for non-empty values', () => {
    const attrs = {
      class: 'CView',
      origin: '10, 20',
    };

    const groups = groupAttributes(attrs);
    const allAttrs = groups.flatMap((g) => g.attributes);

    expect(allAttrs.every((a) => a.isCopyable)).toBe(true);
  });

  it('should set isCopyable to false for empty values', () => {
    const attrs = {
      class: 'CView',
      tooltip: '',
    };

    const groups = groupAttributes(attrs);
    const textGroup = groups.find((g) => g.id === 'text');
    const tooltip = textGroup?.attributes.find((a) => a.name === 'tooltip');

    expect(tooltip?.isCopyable).toBe(false);
  });

  it('should set isMixed to false for single view', () => {
    const attrs = {
      class: 'CView',
      origin: '0, 0',
    };

    const groups = groupAttributes(attrs);
    const allAttrs = groups.flatMap((g) => g.attributes);

    expect(allAttrs.every((a) => !a.isMixed)).toBe(true);
  });

  it('should stringify object values', () => {
    const attrs = {
      class: 'CView',
      'complex-value': { nested: 'value' },
    };

    const groups = groupAttributes(attrs);
    const otherGroup = groups.find((g) => g.id === 'other');
    const complexAttr = otherGroup?.attributes.find((a) => a.name === 'complex-value');

    expect(complexAttr?.value).toBe('{"nested":"value"}');
  });

  it('should handle undefined and null values', () => {
    const attrs = {
      class: 'CView',
      'null-attr': null as unknown,
      'undefined-attr': undefined as unknown,
    };

    const groups = groupAttributes(attrs);
    const otherGroup = groups.find((g) => g.id === 'other');

    const nullAttr = otherGroup?.attributes.find((a) => a.name === 'null-attr');
    const undefinedAttr = otherGroup?.attributes.find((a) => a.name === 'undefined-attr');

    expect(nullAttr?.value).toBe('');
    expect(nullAttr?.isCopyable).toBe(false);
    expect(undefinedAttr?.value).toBe('');
    expect(undefinedAttr?.isCopyable).toBe(false);
  });

  it('should include correct group labels', () => {
    const attrs = {
      class: 'CView',
      origin: '0, 0',
      'background-color': '#000',
      title: 'Test',
      'mouse-enabled': 'true',
      'custom-attr': 'value',
    };

    const groups = groupAttributes(attrs);

    expect(groups.find((g) => g.id === 'identity')?.label).toBe('Identity');
    expect(groups.find((g) => g.id === 'geometry')?.label).toBe('Geometry');
    expect(groups.find((g) => g.id === 'appearance')?.label).toBe('Appearance');
    expect(groups.find((g) => g.id === 'text')?.label).toBe('Text');
    expect(groups.find((g) => g.id === 'behavior')?.label).toBe('Behavior');
    expect(groups.find((g) => g.id === 'other')?.label).toBe('Other');
  });

  it('should handle empty attributes object', () => {
    const groups = groupAttributes({});
    expect(groups).toHaveLength(0);
  });
});
