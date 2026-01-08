import { describe, expect, test } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { BITMAP_ATTRIBUTES, findBitmapUsages } from '../usage';

describe('BITMAP_ATTRIBUTES', () => {
  test('includes all known bitmap attribute names', () => {
    expect(BITMAP_ATTRIBUTES).toContain('bitmap');
    expect(BITMAP_ATTRIBUTES).toContain('disabled-bitmap');
    expect(BITMAP_ATTRIBUTES).toContain('handle-bitmap');
    expect(BITMAP_ATTRIBUTES).toContain('off-bitmap');
    expect(BITMAP_ATTRIBUTES).toContain('icon');
    expect(BITMAP_ATTRIBUTES).toContain('icon-highlighted');
    expect(BITMAP_ATTRIBUTES).toContain('splash-bitmap');
  });
});

describe('findBitmapUsages', () => {
  test('returns empty array for null document', () => {
    expect(findBitmapUsages('knob', null)).toEqual([]);
  });

  test('returns empty array for document without templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
      },
    };
    expect(findBitmapUsages('knob', doc)).toEqual([]);
  });

  test('returns empty array when bitmap not used', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: {
              class: 'CViewContainer',
              bitmap: 'other-bitmap',
            },
          },
        },
      },
    };
    expect(findBitmapUsages('knob', doc)).toEqual([]);
  });

  test('finds bitmap usage in root template', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: {
              class: 'CView',
              bitmap: 'knob',
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('knob', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'main',
      viewClass: 'CView',
      attribute: 'bitmap',
    });
  });

  test('finds bitmap usage in nested child', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: { class: 'CViewContainer' },
            children: {
              '0': {
                attributes: {
                  class: 'CKnob',
                  bitmap: 'knob-bg',
                },
              },
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('knob-bg', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'main-0',
      viewClass: 'CKnob',
      attribute: 'bitmap',
    });
  });

  test('finds multiple usages of same bitmap', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: { class: 'CViewContainer' },
            children: {
              '0': {
                attributes: {
                  class: 'CKnob',
                  bitmap: 'shared',
                },
              },
              '1': {
                attributes: {
                  class: 'CSlider',
                  bitmap: 'shared',
                },
              },
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('shared', doc);
    expect(usages).toHaveLength(2);
  });

  test('finds bitmap with tilde prefix reference', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: {
              class: 'CView',
              bitmap: '~ knob',
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('knob', doc);
    expect(usages).toHaveLength(1);
  });

  test('finds usages in different bitmap attributes', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: { class: 'CViewContainer' },
            children: {
              '0': {
                attributes: {
                  class: 'CControl',
                  bitmap: 'mybitmap',
                  'disabled-bitmap': 'mybitmap',
                },
              },
              '1': {
                attributes: {
                  class: 'CKnob',
                  'handle-bitmap': 'mybitmap',
                },
              },
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('mybitmap', doc);
    expect(usages).toHaveLength(3);
    expect(usages.map(u => u.attribute)).toContain('bitmap');
    expect(usages.map(u => u.attribute)).toContain('disabled-bitmap');
    expect(usages.map(u => u.attribute)).toContain('handle-bitmap');
  });

  test('finds deeply nested bitmap usage', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          main: {
            attributes: { class: 'CViewContainer' },
            children: {
              '0': {
                attributes: { class: 'CViewContainer' },
                children: {
                  '0': {
                    attributes: { class: 'CViewContainer' },
                    children: {
                      '0': {
                        attributes: {
                          class: 'CKnob',
                          bitmap: 'deep-bitmap',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('deep-bitmap', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0].viewId).toBe('main-0-0-0');
  });

  test('handles view without class attribute', () => {
    const doc = {
      'vstgui-ui-description': {
        version: '1' as const,
        templates: {
          main: {
            attributes: {
              bitmap: 'noclass',
            },
          },
        },
      },
    };
    const usages = findBitmapUsages('noclass', doc as unknown as VSTGUIUIDescription);
    expect(usages).toHaveLength(1);
    expect(usages[0].viewClass).toBe('Unknown');
  });
});
