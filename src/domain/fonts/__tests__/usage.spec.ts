import { describe, expect, test } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { findFontUsages } from '../usage';

describe('findFontUsages', () => {
  test('returns empty array for null document', () => {
    const result = findFontUsages('TitleFont', null);
    expect(result).toEqual([]);
  });

  test('returns empty array when document has no templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toEqual([]);
  });

  test('finds font usage in view with direct name reference', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CTextLabel',
              font: 'TitleFont',
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      viewId: 'MainView',
      viewClass: 'CTextLabel',
      attribute: 'font',
    });
  });

  test('finds font usage with tilde prefix reference', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CTextLabel',
              font: '~ TitleFont',
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(1);
    expect(result[0].viewClass).toBe('CTextLabel');
  });

  test('finds multiple usages across templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CTextLabel',
              font: '~ TitleFont',
            },
          },
          SecondView: {
            attributes: {
              class: 'CTextEdit',
              font: 'TitleFont',
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(2);
  });

  test('finds usages in nested children', () => {
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
                  class: 'CTextLabel',
                  font: 'TitleFont',
                },
              },
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(1);
    expect(result[0].viewId).toBe('MainView-child1');
    expect(result[0].viewClass).toBe('CTextLabel');
  });

  test('returns empty array when font is not used', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              class: 'CTextLabel',
              font: 'OtherFont',
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toEqual([]);
  });

  test('handles view with Unknown class when class attribute missing', () => {
    const doc = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: {
              font: 'TitleFont',
            },
          },
        },
      },
    } as unknown as VSTGUIUIDescription;
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(1);
    expect(result[0].viewClass).toBe('Unknown');
  });

  test('finds deeply nested usages', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              level1: {
                attributes: { class: 'CViewContainer' },
                children: {
                  level2: {
                    attributes: {
                      class: 'CTextLabel',
                      font: 'TitleFont',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const result = findFontUsages('TitleFont', doc);
    expect(result).toHaveLength(1);
    expect(result[0].viewId).toBe('MainView-level1-level2');
  });
});
