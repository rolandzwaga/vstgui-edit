import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import {
  addColor,
  deleteColor,
  documentStore,
  getColors,
  reset,
  setDocumentForTest,
} from '../../../stores/documentStore';
import { clearHistory, pushOperation, redo, undo } from '../../../stores/historyStore';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import {
  createAddColorOperation,
  createDeleteColorOperation,
  createEditColorNameOperation,
  createEditColorValueOperation,
} from '../historyOperations';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      colors: {
        Background: '#2d2d2dff',
        Text: '#ffffffff',
      },
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

describe('createAddColorOperation', () => {
  beforeEach(() => {
    reset();
    clearHistory();
  });

  it('should create an operation that can be undone', () => {
    testInRoot(() => {
      setDocumentForTest(createTestDocument());

      addColor('NewColor', '#ff0000ff');
      const operation = createAddColorOperation('NewColor', '#ff0000ff');
      pushOperation(operation);

      expect(getColors()?.NewColor).toBe('#ff0000ff');

      undo();
      expect(getColors()?.NewColor).toBeUndefined();
    });
  });

  it('should create an operation that can be redone', () => {
    testInRoot(() => {
      setDocumentForTest(createTestDocument());

      addColor('NewColor', '#ff0000ff');
      const operation = createAddColorOperation('NewColor', '#ff0000ff');
      pushOperation(operation);

      undo();
      redo();

      expect(getColors()?.NewColor).toBe('#ff0000ff');
    });
  });

  it('should have correct description', () => {
    testInRoot(() => {
      const operation = createAddColorOperation('MyColor', '#ff0000ff');
      expect(operation.description).toBe('Add color "MyColor"');
    });
  });
});

describe('createEditColorNameOperation', () => {
  beforeEach(() => {
    reset();
    clearHistory();
  });

  it('should create an operation that can be undone', () => {
    testInRoot(() => {
      setDocumentForTest(createTestDocument());

      const operation = createEditColorNameOperation('Background', 'MainBg');
      operation.redo();
      pushOperation(operation);

      expect(getColors()?.MainBg).toBe('#2d2d2dff');
      expect(getColors()?.Background).toBeUndefined();

      undo();
      expect(getColors()?.Background).toBe('#2d2d2dff');
      expect(getColors()?.MainBg).toBeUndefined();
    });
  });

  it('should have correct description', () => {
    testInRoot(() => {
      const operation = createEditColorNameOperation('OldName', 'NewName');
      expect(operation.description).toBe('Rename color "OldName" to "NewName"');
    });
  });
});

describe('createEditColorValueOperation', () => {
  beforeEach(() => {
    reset();
    clearHistory();
  });

  it('should create an operation that can be undone', () => {
    testInRoot(() => {
      setDocumentForTest(createTestDocument());

      const operation = createEditColorValueOperation('Background', '#2d2d2dff', '#ff0000ff');
      operation.redo();
      pushOperation(operation);

      expect(getColors()?.Background).toBe('#ff0000ff');

      undo();
      expect(getColors()?.Background).toBe('#2d2d2dff');
    });
  });

  it('should have correct description', () => {
    testInRoot(() => {
      const operation = createEditColorValueOperation('Background', '#000000', '#ffffff');
      expect(operation.description).toBe('Change color "Background"');
    });
  });
});

describe('createDeleteColorOperation', () => {
  beforeEach(() => {
    reset();
    clearHistory();
  });

  it('should create an operation that can be undone', () => {
    testInRoot(() => {
      setDocumentForTest(createTestDocument());

      const operation = createDeleteColorOperation('Background', '#2d2d2dff');
      operation.redo();
      pushOperation(operation);

      expect(getColors()?.Background).toBeUndefined();

      undo();
      expect(getColors()?.Background).toBe('#2d2d2dff');
    });
  });

  it('should have correct description', () => {
    testInRoot(() => {
      const operation = createDeleteColorOperation('Background', '#2d2d2dff');
      expect(operation.description).toBe('Delete color "Background"');
    });
  });

  it('should restore color references on undo', () => {
    testInRoot(() => {
      setDocumentForTest({
        'vstgui-ui-description': {
          version: '1',
          colors: { Theme: '#ff0000ff' },
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', 'background-color': 'Theme' },
            },
          },
        },
      });

      const result = deleteColor('Theme');
      const operation = createDeleteColorOperation('Theme', '#ff0000ff', result?.removedReferences ?? []);
      pushOperation(operation);

      const viewAfterDelete = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
      expect(viewAfterDelete?.attributes['background-color']).toBeUndefined();

      undo();

      expect(getColors()?.Theme).toBe('#ff0000ff');
      const viewAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
      expect(viewAfterUndo?.attributes['background-color']).toBe('Theme');
    });
  });

  it('should remove color references again on redo', () => {
    testInRoot(() => {
      setDocumentForTest({
        'vstgui-ui-description': {
          version: '1',
          colors: { Theme: '#ff0000ff' },
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', 'background-color': 'Theme' },
            },
          },
        },
      });

      const result = deleteColor('Theme');
      const operation = createDeleteColorOperation('Theme', '#ff0000ff', result?.removedReferences ?? []);
      pushOperation(operation);

      undo();
      redo();

      expect(getColors()?.Theme).toBeUndefined();
      const view = documentStore.document?.['vstgui-ui-description']?.templates?.MainView;
      expect(view?.attributes['background-color']).toBeUndefined();
    });
  });
});
