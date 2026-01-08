import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addColor,
  deleteColor,
  documentStore,
  getColors,
  reset,
  setDocumentForTest,
  updateColorName,
  updateColorValue,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      colors: {
        Background: '#2d2d2dff',
        Text: '#ffffffff',
        Accent: '#0066ccff',
      },
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
            'background-color': 'Background',
          },
        },
      },
    },
  };
}

function createDocumentWithoutColors(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
        },
      },
    },
  };
}

describe('documentStore - getColors', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getColors();
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document with colors', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return all colors', () => {
      testInRoot(() => {
        const colors = getColors();
        expect(colors).toEqual({
          Background: '#2d2d2dff',
          Text: '#ffffffff',
          Accent: '#0066ccff',
        });
      });
    });
  });

  describe('Given document without colors section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutColors());
      });
    });

    it('should return undefined', () => {
      testInRoot(() => {
        const colors = getColors();
        expect(colors).toBeUndefined();
      });
    });
  });
});

describe('documentStore - addColor', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with colors', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should add a new color', () => {
      testInRoot(() => {
        const result = addColor('NewColor', '#ff0000ff');
        expect(result).toBe(true);

        const colors = getColors();
        expect(colors?.NewColor).toBe('#ff0000ff');
      });
    });

    it('should preserve existing colors', () => {
      testInRoot(() => {
        addColor('NewColor', '#ff0000ff');

        const colors = getColors();
        expect(colors?.Background).toBe('#2d2d2dff');
        expect(colors?.Text).toBe('#ffffffff');
      });
    });
  });

  describe('Given document without colors section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutColors());
      });
    });

    it('should create colors section and add color', () => {
      testInRoot(() => {
        const result = addColor('NewColor', '#ff0000ff');
        expect(result).toBe(true);

        const colors = getColors();
        expect(colors?.NewColor).toBe('#ff0000ff');
      });
    });
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = addColor('NewColor', '#ff0000ff');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateColorName', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with colors', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should rename a color', () => {
      testInRoot(() => {
        const result = updateColorName('Background', 'MainBackground');
        expect(result).toBe(true);

        const colors = getColors();
        expect(colors?.MainBackground).toBe('#2d2d2dff');
        expect(colors?.Background).toBeUndefined();
      });
    });

    it('should preserve the color value', () => {
      testInRoot(() => {
        updateColorName('Background', 'MainBackground');

        const colors = getColors();
        expect(colors?.MainBackground).toBe('#2d2d2dff');
      });
    });

    it('should return false for non-existent color', () => {
      testInRoot(() => {
        const result = updateColorName('NonExistent', 'NewName');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateColorValue', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with colors', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update color value', () => {
      testInRoot(() => {
        const oldValue = updateColorValue('Background', '#ff0000ff');
        expect(oldValue).toBe('#2d2d2dff');

        const colors = getColors();
        expect(colors?.Background).toBe('#ff0000ff');
      });
    });

    it('should return null for non-existent color', () => {
      testInRoot(() => {
        const result = updateColorValue('NonExistent', '#ff0000ff');
        expect(result).toBeNull();
      });
    });
  });
});

describe('documentStore - deleteColor', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with colors', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should delete a color and return old value', () => {
      testInRoot(() => {
        const result = deleteColor('Background');
        expect(result?.oldValue).toBe('#2d2d2dff');

        const colors = getColors();
        expect(colors?.Background).toBeUndefined();
      });
    });

    it('should preserve other colors', () => {
      testInRoot(() => {
        deleteColor('Background');

        const colors = getColors();
        expect(colors?.Text).toBe('#ffffffff');
        expect(colors?.Accent).toBe('#0066ccff');
      });
    });

    it('should return null for non-existent color', () => {
      testInRoot(() => {
        const result = deleteColor('NonExistent');
        expect(result).toBeNull();
      });
    });

    it('should remove color references from views and return them', () => {
      testInRoot(() => {
        const result = deleteColor('Background');

        expect(result?.removedReferences).toHaveLength(1);
        expect(result?.removedReferences[0]).toEqual({
          viewId: 'MainView',
          attribute: 'background-color',
          value: 'Background',
        });

        const view = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
        expect(view?.attributes['background-color']).toBeUndefined();
      });
    });

    it('should remove tilde-prefixed color references', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
            colors: { MyColor: '#ff0000ff' },
            templates: {
              MainView: {
                attributes: {
                  class: 'CViewContainer',
                  'background-color': '~ MyColor',
                },
              },
            },
          },
        });

        const result = deleteColor('MyColor');

        expect(result?.removedReferences).toHaveLength(1);
        expect(result?.removedReferences[0].value).toBe('~ MyColor');

        const view = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
        expect(view?.attributes['background-color']).toBeUndefined();
      });
    });

    it('should remove multiple color references from nested views', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
            colors: { Theme: '#00ff00ff' },
            templates: {
              MainView: {
                attributes: { class: 'CViewContainer', 'background-color': 'Theme' },
                children: {
                  child1: {
                    attributes: { class: 'CView', 'frame-color': 'Theme' },
                  },
                  child2: {
                    attributes: { class: 'CTextLabel', 'font-color': '~ Theme' },
                  },
                },
              },
            },
          },
        });

        const result = deleteColor('Theme');

        expect(result?.removedReferences).toHaveLength(3);
      });
    });

    it('should return empty removedReferences when color is not used', () => {
      testInRoot(() => {
        const result = deleteColor('Accent');

        expect(result?.oldValue).toBe('#0066ccff');
        expect(result?.removedReferences).toHaveLength(0);
      });
    });
  });
});
