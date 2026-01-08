import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addVariable,
  getVariables,
  reset,
  setDocumentForTest,
  updateVariableName,
  updateVariableValue,
} from '../documentStore';

function createEmptyDocument(): VSTGUIUIDescription {
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

describe('documentStore - variable edit flow integration', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document without variables', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createEmptyDocument());
      });
    });

    it('should add variable, rename it, and update value', () => {
      testInRoot(() => {
        expect(getVariables()).toBeUndefined();

        const added = addVariable('New Variable', '');
        expect(added).toBe(true);
        expect(getVariables()).toEqual({ 'New Variable': '' });

        const renamed = updateVariableName('New Variable', 'myVar');
        expect(renamed).toBe(true);
        expect(getVariables()).toEqual({ myVar: '' });

        const oldValue = updateVariableValue('myVar', '100');
        expect(oldValue).toBe('');
        expect(getVariables()).toEqual({ myVar: '100' });
      });
    });

    it('should handle empty string values correctly', () => {
      testInRoot(() => {
        addVariable('emptyVar', '');

        const renamed = updateVariableName('emptyVar', 'renamedEmpty');
        expect(renamed).toBe(true);
        expect(getVariables()?.renamedEmpty).toBe('');

        const oldValue = updateVariableValue('renamedEmpty', 'newValue');
        expect(oldValue).toBe('');
        expect(getVariables()?.renamedEmpty).toBe('newValue');
      });
    });
  });
});
