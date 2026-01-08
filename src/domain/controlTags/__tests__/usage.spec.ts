import { describe, expect, it } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { CONTROL_TAG_ATTRIBUTE, findControlTagUsages } from '../usage';

describe('findControlTagUsages', () => {
  it('should return empty array when document is null', () => {
    const usages = findControlTagUsages('Volume', null);
    expect(usages).toEqual([]);
  });

  it('should return empty array when no templates exist', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toEqual([]);
  });

  it('should return empty array when tag is not used', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toEqual([]);
  });

  it('should find usage in root template view', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: {
              class: 'CSlider',
              'control-tag': 'Volume',
            },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'MainView',
      viewClass: 'CSlider',
      templateName: 'MainView',
    });
  });

  it('should find usage in nested child views', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              slider1: {
                attributes: {
                  class: 'CSlider',
                  'control-tag': 'Volume',
                },
              },
            },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'MainView-slider1',
      viewClass: 'CSlider',
      templateName: 'MainView',
    });
  });

  it('should find multiple usages across views', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              slider1: {
                attributes: {
                  class: 'CSlider',
                  'control-tag': 'Volume',
                },
              },
              knob1: {
                attributes: {
                  class: 'CKnob',
                  'control-tag': 'Volume',
                },
              },
            },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(2);
    expect(usages.map((u) => u.viewClass).sort()).toEqual(['CKnob', 'CSlider']);
  });

  it('should find usages across multiple templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: {
              class: 'CSlider',
              'control-tag': 'Volume',
            },
          },
          EditorView: {
            attributes: {
              class: 'CKnob',
              'control-tag': 'Volume',
            },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(2);
    expect(usages.map((u) => u.templateName).sort()).toEqual(['EditorView', 'MainView']);
  });

  it('should find deeply nested usages', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              panel: {
                attributes: { class: 'CViewContainer' },
                children: {
                  inner: {
                    attributes: { class: 'CViewContainer' },
                    children: {
                      slider: {
                        attributes: {
                          class: 'CSlider',
                          'control-tag': 'Volume',
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
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0].viewId).toBe('MainView-panel-inner-slider');
  });

  it('should not match partial tag names', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        'control-tags': { Volume: '0', VolumeAlt: '1' },
        templates: {
          MainView: {
            attributes: {
              class: 'CSlider',
              'control-tag': 'VolumeAlt',
            },
          },
        },
      },
    };
    const usages = findControlTagUsages('Volume', doc);
    expect(usages).toHaveLength(0);
  });

  it('should export CONTROL_TAG_ATTRIBUTE constant', () => {
    expect(CONTROL_TAG_ATTRIBUTE).toBe('control-tag');
  });
});
