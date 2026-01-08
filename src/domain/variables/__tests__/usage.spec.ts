import { describe, expect, it } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { findVariableUsages, VARIABLE_REFERENCE_PATTERN } from '../usage';

describe('findVariableUsages', () => {
  it('should return empty array when document is null', () => {
    const usages = findVariableUsages('buttonWidth', null);
    expect(usages).toEqual([]);
  });

  it('should return empty array when no templates exist', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toEqual([]);
  });

  it('should return empty array when variable is not used', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer', size: '200, 200' },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toEqual([]);
  });

  it('should find usage in root template view', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: {
              class: 'CView',
              size: 'var.buttonWidth, 50',
            },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'MainView',
      viewClass: 'CView',
      templateName: 'MainView',
      attribute: 'size',
    });
  });

  it('should find usage in nested child views', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              button1: {
                attributes: {
                  class: 'CTextButton',
                  size: 'var.buttonWidth, 30',
                },
              },
            },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0]).toEqual({
      viewId: 'MainView-button1',
      viewClass: 'CTextButton',
      templateName: 'MainView',
      attribute: 'size',
    });
  });

  it('should find multiple usages across views', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: { class: 'CViewContainer' },
            children: {
              button1: {
                attributes: {
                  class: 'CTextButton',
                  size: 'var.buttonWidth, 30',
                },
              },
              button2: {
                attributes: {
                  class: 'CTextButton',
                  size: 'var.buttonWidth, 40',
                },
              },
            },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(2);
    expect(usages.map(u => u.viewId).sort()).toEqual(['MainView-button1', 'MainView-button2']);
  });

  it('should find usages across multiple templates', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: {
              class: 'CView',
              size: 'var.buttonWidth, 50',
            },
          },
          EditorView: {
            attributes: {
              class: 'CView',
              size: 'var.buttonWidth, 60',
            },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(2);
    expect(usages.map(u => u.templateName).sort()).toEqual(['EditorView', 'MainView']);
  });

  it('should find deeply nested usages', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
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
                      button: {
                        attributes: {
                          class: 'CTextButton',
                          size: 'var.buttonWidth, 30',
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
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(1);
    expect(usages[0].viewId).toBe('MainView-panel-inner-button');
  });

  it('should not match partial variable names', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { button: '100', buttonWidth: '200' },
        templates: {
          MainView: {
            attributes: {
              class: 'CView',
              size: 'var.buttonWidth, 50',
            },
          },
        },
      },
    };
    const usages = findVariableUsages('button', doc);
    expect(usages).toHaveLength(0);
  });

  it('should find multiple usages in same view (different attributes)', () => {
    const doc: VSTGUIUIDescription = {
      'vstgui-ui-description': {
        version: '1',
        variables: { buttonWidth: '100' },
        templates: {
          MainView: {
            attributes: {
              class: 'CView',
              size: 'var.buttonWidth, 50',
              'min-size': 'var.buttonWidth, 20',
            },
          },
        },
      },
    };
    const usages = findVariableUsages('buttonWidth', doc);
    expect(usages).toHaveLength(2);
    expect(usages.map(u => u.attribute).sort()).toEqual(['min-size', 'size']);
  });
});

describe('VARIABLE_REFERENCE_PATTERN', () => {
  it('should match var.variableName pattern', () => {
    const matches = 'var.buttonWidth'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toEqual(['var.buttonWidth']);
  });

  it('should match multiple variable references', () => {
    const text = 'var.width, var.height';
    const matches = text.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toEqual(['var.width', 'var.height']);
  });

  it('should match variable names starting with underscore', () => {
    const matches = 'var._private'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toEqual(['var._private']);
  });

  it('should match variable names with numbers', () => {
    const matches = 'var.button1Width'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toEqual(['var.button1Width']);
  });

  it('should match variable names with hyphens', () => {
    const matches = 'var.button-width'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toEqual(['var.button-width']);
  });

  it('should not match names starting with numbers', () => {
    const matches = 'var.1button'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toBeNull();
  });

  it('should not match standalone var keyword', () => {
    const matches = 'var'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toBeNull();
  });

  it('should not match var. without name', () => {
    const matches = 'var.'.match(VARIABLE_REFERENCE_PATTERN);
    expect(matches).toBeNull();
  });
});
