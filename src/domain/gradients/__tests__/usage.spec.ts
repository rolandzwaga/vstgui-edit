import { describe, expect, test } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { findGradientUsages, GRADIENT_ATTRIBUTES } from '../usage';

describe('GRADIENT_ATTRIBUTES', () => {
  test('contains expected attributes', () => {
    expect(GRADIENT_ATTRIBUTES).toContain('gradient');
  });
});

describe('findGradientUsages', () => {
  test('returns empty array for null document', () => {
    expect(findGradientUsages('MyGradient', null)).toEqual([]);
  });

  test('returns empty array for document without templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
      },
    };
    expect(findGradientUsages('MyGradient', doc)).toEqual([]);
  });

  test('finds gradient usage in root view', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CGradientView',
              gradient: 'MyGradient',
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'MainView',
      viewClass: 'CGradientView',
      attribute: 'gradient',
    });
  });

  test('finds gradient usage in nested view', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CViewContainer',
            },
            children: {
              child1: {
                attributes: {
                  class: 'CGradientView',
                  gradient: 'MyGradient',
                },
              },
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0].viewId).toBe('MainView-child1');
    expect(usages[0].viewClass).toBe('CGradientView');
  });

  test('finds multiple usages', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CGradientView',
              gradient: 'MyGradient',
            },
            children: {
              nested: {
                attributes: {
                  class: 'CGradientView',
                  gradient: 'MyGradient',
                },
              },
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toHaveLength(2);
  });

  test('ignores views using different gradient', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CGradientView',
              gradient: 'OtherGradient',
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toEqual([]);
  });

  test('finds tilde-prefixed gradient reference', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CGradientView',
              gradient: '~ MyGradient',
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toHaveLength(1);
  });

  test('returns empty for views without gradient attribute', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CView',
            },
          },
        },
      },
    };
    const usages = findGradientUsages('MyGradient', doc);
    expect(usages).toEqual([]);
  });
});
