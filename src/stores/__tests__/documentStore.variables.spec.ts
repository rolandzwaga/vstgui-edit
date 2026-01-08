import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addVariable,
  deleteVariable,
  getVariables,
  reset,
  restoreVariableReference,
  setDocumentForTest,
  updateVariableName,
  updateVariableValue,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      variables: {
        buttonWidth: '100',
        buttonHeight: '30',
        spacing: '10',
      },
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children: {
            button1: {
              attributes: {
                class: 'CTextButton',
                size: 'var.buttonWidth, var.buttonHeight',
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
}

function createDocumentWithoutVariables(): VSTGUIUIDescription {
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

describe('documentStore - getVariables', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getVariables();
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document with variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return all variables', () => {
      testInRoot(() => {
        const vars = getVariables();
        expect(vars).toEqual({
          buttonWidth: '100',
          buttonHeight: '30',
          spacing: '10',
        });
      });
    });
  });

  describe('Given document without variables section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutVariables());
      });
    });

    it('should return undefined', () => {
      testInRoot(() => {
        const vars = getVariables();
        expect(vars).toBeUndefined();
      });
    });
  });
});

describe('documentStore - addVariable', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = addVariable('newVar', 'value');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should add new variable', () => {
      testInRoot(() => {
        const result = addVariable('newVar', 'newValue');
        expect(result).toBe(true);

        const vars = getVariables();
        expect(vars?.newVar).toBe('newValue');
      });
    });

    it('should preserve existing variables', () => {
      testInRoot(() => {
        addVariable('newVar', 'newValue');

        const vars = getVariables();
        expect(vars?.buttonWidth).toBe('100');
        expect(vars?.buttonHeight).toBe('30');
        expect(vars?.spacing).toBe('10');
      });
    });
  });

  describe('Given document without variables section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutVariables());
      });
    });

    it('should create variables section and add variable', () => {
      testInRoot(() => {
        const result = addVariable('newVar', 'value');
        expect(result).toBe(true);

        const vars = getVariables();
        expect(vars?.newVar).toBe('value');
      });
    });
  });
});

describe('documentStore - updateVariableName', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = updateVariableName('buttonWidth', 'mainButtonWidth');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should rename existing variable', () => {
      testInRoot(() => {
        const result = updateVariableName('buttonWidth', 'mainButtonWidth');
        expect(result).toBe(true);

        const vars = getVariables();
        expect(vars?.mainButtonWidth).toBe('100');
        expect(vars?.buttonWidth).toBeUndefined();
      });
    });

    it('should preserve value when renaming', () => {
      testInRoot(() => {
        updateVariableName('buttonWidth', 'mainButtonWidth');

        const vars = getVariables();
        expect(vars?.mainButtonWidth).toBe('100');
      });
    });

    it('should return false for non-existent variable', () => {
      testInRoot(() => {
        const result = updateVariableName('nonExistent', 'newName');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateVariableValue', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = updateVariableValue('buttonWidth', '200');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update variable value and return old value', () => {
      testInRoot(() => {
        const oldValue = updateVariableValue('buttonWidth', '200');
        expect(oldValue).toBe('100');

        const vars = getVariables();
        expect(vars?.buttonWidth).toBe('200');
      });
    });

    it('should return null for non-existent variable', () => {
      testInRoot(() => {
        const result = updateVariableValue('nonExistent', 'value');
        expect(result).toBeNull();
      });
    });

    it('should allow empty string value', () => {
      testInRoot(() => {
        updateVariableValue('buttonWidth', '');

        const vars = getVariables();
        expect(vars?.buttonWidth).toBe('');
      });
    });
  });
});

describe('documentStore - deleteVariable', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = deleteVariable('buttonWidth');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should delete unused variable', () => {
      testInRoot(() => {
        const result = deleteVariable('spacing');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('10');
        expect(result?.removedReferences).toHaveLength(0);

        const vars = getVariables();
        expect(vars?.spacing).toBeUndefined();
      });
    });

    it('should delete variable and remove references', () => {
      testInRoot(() => {
        const result = deleteVariable('buttonWidth');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('100');
        expect(result?.removedReferences.length).toBeGreaterThan(0);
      });
    });

    it('should return null for non-existent variable', () => {
      testInRoot(() => {
        const result = deleteVariable('nonExistent');
        expect(result).toBeNull();
      });
    });
  });
});

describe('documentStore - restoreVariableReference', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = restoreVariableReference('MainView-button1', 'size', 'var.buttonWidth, var.buttonHeight');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with templates', () => {
    beforeEach(() => {
      testInRoot(() => {
        const doc = createTestDocument();
        if (doc['vstgui-ui-description'].templates?.MainView.children?.button1) {
          doc['vstgui-ui-description'].templates.MainView.children.button1.attributes.size = '100, 30';
        }
        setDocumentForTest(doc);
      });
    });

    it('should restore variable reference in attribute', () => {
      testInRoot(() => {
        const result = restoreVariableReference('MainView-button1', 'size', 'var.buttonWidth, var.buttonHeight');
        expect(result).toBe(true);
      });
    });

    it('should return false for non-existent view', () => {
      testInRoot(() => {
        const result = restoreVariableReference('NonExistent', 'size', 'var.buttonWidth, var.buttonHeight');
        expect(result).toBe(false);
      });
    });
  });
});
