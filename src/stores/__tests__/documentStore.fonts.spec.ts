import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addFont,
  deleteFont,
  documentStore,
  getFonts,
  reset,
  setDocumentForTest,
  updateFontName,
  updateFontProperty,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      fonts: {
        MainFont: {
          'font-name': 'Arial',
          size: '12',
        },
        HeaderFont: {
          'font-name': 'Helvetica',
          size: '18',
          bold: 'true',
        },
        AccentFont: {
          'font-name': 'Georgia',
          size: '14',
          italic: 'true',
        },
      },
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children: {
            label: {
              attributes: {
                class: 'CTextLabel',
                font: 'MainFont',
              },
            },
          },
        },
      },
    },
  };
}

function createDocumentWithoutFonts(): VSTGUIUIDescription {
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

describe('documentStore - getFonts', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getFonts();
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document with fonts', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return all fonts', () => {
      testInRoot(() => {
        const fonts = getFonts();
        expect(fonts).toBeDefined();
        expect(Object.keys(fonts!)).toHaveLength(3);
        expect(fonts!.MainFont).toEqual({
          'font-name': 'Arial',
          size: '12',
        });
      });
    });
  });

  describe('Given document without fonts section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutFonts());
      });
    });

    it('should return undefined', () => {
      testInRoot(() => {
        const fonts = getFonts();
        expect(fonts).toBeUndefined();
      });
    });
  });
});

describe('documentStore - addFont', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with fonts', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should add a new font', () => {
      testInRoot(() => {
        const result = addFont('NewFont', { 'font-name': 'Verdana', size: '10' });
        expect(result).toBe(true);

        const fonts = getFonts();
        expect(fonts?.NewFont).toEqual({ 'font-name': 'Verdana', size: '10' });
      });
    });

    it('should add a font with all properties', () => {
      testInRoot(() => {
        const result = addFont('StyledFont', {
          'font-name': 'Times New Roman',
          size: '16',
          bold: 'true',
          italic: 'true',
          underline: 'true',
          'strike-through': 'true',
        });
        expect(result).toBe(true);

        const fonts = getFonts();
        expect(fonts?.StyledFont).toEqual({
          'font-name': 'Times New Roman',
          size: '16',
          bold: 'true',
          italic: 'true',
          underline: 'true',
          'strike-through': 'true',
        });
      });
    });

    it('should preserve existing fonts', () => {
      testInRoot(() => {
        addFont('NewFont', { 'font-name': 'Verdana', size: '10' });

        const fonts = getFonts();
        expect(fonts?.MainFont).toEqual({ 'font-name': 'Arial', size: '12' });
        expect(fonts?.HeaderFont).toBeDefined();
      });
    });
  });

  describe('Given document without fonts section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutFonts());
      });
    });

    it('should create fonts section and add font', () => {
      testInRoot(() => {
        const result = addFont('NewFont', { 'font-name': 'Arial', size: '12' });
        expect(result).toBe(true);

        const fonts = getFonts();
        expect(fonts?.NewFont).toEqual({ 'font-name': 'Arial', size: '12' });
      });
    });
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = addFont('NewFont', { 'font-name': 'Arial', size: '12' });
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateFontName', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with fonts', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should rename a font', () => {
      testInRoot(() => {
        const result = updateFontName('MainFont', 'RenamedFont');
        expect(result).toBe(true);

        const fonts = getFonts();
        expect(fonts?.RenamedFont).toEqual({ 'font-name': 'Arial', size: '12' });
        expect(fonts?.MainFont).toBeUndefined();
      });
    });

    it('should preserve the font definition', () => {
      testInRoot(() => {
        updateFontName('HeaderFont', 'BigFont');

        const fonts = getFonts();
        expect(fonts?.BigFont).toEqual({
          'font-name': 'Helvetica',
          size: '18',
          bold: 'true',
        });
      });
    });

    it('should return false for non-existent font', () => {
      testInRoot(() => {
        const result = updateFontName('NonExistent', 'NewName');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateFontProperty', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with fonts', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update font-name property', () => {
      testInRoot(() => {
        const oldValue = updateFontProperty('MainFont', 'font-name', 'Helvetica');
        expect(oldValue).toBe('Arial');

        const fonts = getFonts();
        expect(fonts?.MainFont?.['font-name']).toBe('Helvetica');
      });
    });

    it('should update size property', () => {
      testInRoot(() => {
        const oldValue = updateFontProperty('MainFont', 'size', '16');
        expect(oldValue).toBe('12');

        const fonts = getFonts();
        expect(fonts?.MainFont?.size).toBe('16');
      });
    });

    it('should update bold property', () => {
      testInRoot(() => {
        const oldValue = updateFontProperty('MainFont', 'bold', 'true');
        expect(oldValue).toBeUndefined();

        const fonts = getFonts();
        expect(fonts?.MainFont?.bold).toBe('true');
      });
    });

    it('should update existing bold property', () => {
      testInRoot(() => {
        const oldValue = updateFontProperty('HeaderFont', 'bold', 'false');
        expect(oldValue).toBe('true');

        const fonts = getFonts();
        expect(fonts?.HeaderFont?.bold).toBe('false');
      });
    });

    it('should return null for non-existent font', () => {
      testInRoot(() => {
        const result = updateFontProperty('NonExistent', 'size', '20');
        expect(result).toBeNull();
      });
    });
  });
});

describe('documentStore - deleteFont', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with fonts', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should delete a font and return old definition', () => {
      testInRoot(() => {
        const result = deleteFont('AccentFont');
        expect(result?.font).toEqual({
          'font-name': 'Georgia',
          size: '14',
          italic: 'true',
        });

        const fonts = getFonts();
        expect(fonts?.AccentFont).toBeUndefined();
      });
    });

    it('should preserve other fonts', () => {
      testInRoot(() => {
        deleteFont('AccentFont');

        const fonts = getFonts();
        expect(fonts?.MainFont).toBeDefined();
        expect(fonts?.HeaderFont).toBeDefined();
      });
    });

    it('should return null for non-existent font', () => {
      testInRoot(() => {
        const result = deleteFont('NonExistent');
        expect(result).toBeNull();
      });
    });

    it('should remove font references from views and return them', () => {
      testInRoot(() => {
        const result = deleteFont('MainFont');

        expect(result?.removedReferences).toHaveLength(1);
        expect(result?.removedReferences[0]).toEqual({
          viewId: 'MainView-label',
          attribute: 'font',
          value: 'MainFont',
        });

        const view =
          documentStore.document?.['vstgui-ui-description']?.templates?.MainView?.children?.label;
        expect(view?.attributes.font).toBeUndefined();
      });
    });

    it('should remove tilde-prefixed font references', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
            fonts: { MyFont: { 'font-name': 'Arial', size: '12' } },
            templates: {
              MainView: {
                attributes: {
                  class: 'CViewContainer',
                  font: '~ MyFont',
                },
              },
            },
          },
        });

        const result = deleteFont('MyFont');

        expect(result?.removedReferences).toHaveLength(1);
        expect(result?.removedReferences[0].value).toBe('~ MyFont');

        const view = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
        expect(view?.attributes.font).toBeUndefined();
      });
    });

    it('should remove multiple font references from nested views', () => {
      testInRoot(() => {
        setDocumentForTest({
          'vstgui-ui-description': {
            version: '1',
            fonts: { SharedFont: { 'font-name': 'Arial', size: '12' } },
            templates: {
              MainView: {
                attributes: { class: 'CViewContainer', font: 'SharedFont' },
                children: {
                  child1: {
                    attributes: { class: 'CTextLabel', font: 'SharedFont' },
                  },
                  child2: {
                    attributes: { class: 'CTextEdit', font: '~ SharedFont' },
                  },
                },
              },
            },
          },
        });

        const result = deleteFont('SharedFont');

        expect(result?.removedReferences).toHaveLength(3);
      });
    });

    it('should return empty removedReferences when font is not used', () => {
      testInRoot(() => {
        const result = deleteFont('AccentFont');

        expect(result?.font).toBeDefined();
        expect(result?.removedReferences).toHaveLength(0);
      });
    });
  });
});
