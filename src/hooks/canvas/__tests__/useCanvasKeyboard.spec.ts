import { createSignal } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockContainer, createMockDocument, createMockRenderableView, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { canPaste } from '../../../domain/canvas/viewOperations';
import { resetClipboard } from '../../../stores/clipboardStore';
import { documentStore, reset as resetDocument, setDocumentForTest } from '../../../stores/documentStore';
import { clearHistory, historyStore, undo } from '../../../stores/historyStore';
import { resetSelection, select, selectAll, selectionStore } from '../../../stores/selectionStore';
import { type CancelCallbacks, useCanvasKeyboard } from '../useCanvasKeyboard';

describe('useCanvasKeyboard', () => {
  const mockCancelCallbacks: CancelCallbacks = {
    cancelResizeListeners: vi.fn(),
    cancelDragListeners: vi.fn(),
    cancelMarqueeListeners: vi.fn(),
    clearPendingDrag: vi.fn(),
  };

  beforeEach(() => {
    testInRoot(() => {
      resetDocument();
      clearHistory();
      resetSelection();
      resetClipboard();
    });
    vi.clearAllMocks();
  });

  function createKeyboardEvent(key: string, target?: HTMLElement): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { 
      value: target ?? document.body,
      writable: false,
    });
    return event;
  }

  describe('Delete/Backspace handling', () => {
    it('should delete selected views on Delete key', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
          createMockRenderableView({ id: 'MainView-1' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
      });
    });

    it('should delete selected views on Backspace key', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Backspace');
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
      });
    });

    it('should not delete when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeDefined();
      });
    });

    it('should clear selection after deletion', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should push delete operation to history', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        expect(historyStore.canUndo).toBe(false);

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('Delete');
      });
    });

    it('should support undo after deletion', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        const templateAfterDelete = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterDelete?.children?.['0']).toBeUndefined();

        undo();

        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterUndo?.children?.['0']).toBeDefined();
        expect(templateAfterUndo?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });

    it('should delete multiple selected views', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
                '1': createMockView({ class: 'CTextButton' }),
                '2': createMockView({ class: 'CSlider' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        selectAll(['MainView-0', 'MainView-2']);

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
          createMockRenderableView({ id: 'MainView-1' }),
          createMockRenderableView({ id: 'MainView-2' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEvent('Delete');
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
        expect(template?.children?.['2']).toBeUndefined();
      });
    });

    it('should not delete when input is focused', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const input = document.createElement('input');
        document.body.appendChild(input);

        const event = createKeyboardEvent('Delete', input);
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeDefined();

        document.body.removeChild(input);
      });
    });
  });

  describe('Ctrl+D duplicate handling', () => {
    function createKeyboardEventWithModifiers(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean } = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ctrlKey: modifiers.ctrlKey ?? false,
        metaKey: modifiers.metaKey ?? false,
      });
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      });
      return event;
    }

    it('should duplicate selected view on Ctrl+D', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('d', { ctrlKey: true });
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(2);
        expect(template?.children?.['0']).toBeDefined();
        expect(template?.children?.['1']).toBeDefined();
        expect(template?.children?.['1']?.attributes.class).toBe('CTextLabel');
        expect(template?.children?.['1']?.attributes.origin).toBe('110, 110');
      });
    });

    it('should duplicate selected view on Cmd+D (Mac)', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '50, 50' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('d', { metaKey: true });
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(2);
      });
    });

    it('should not duplicate when no views are selected', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('d', { ctrlKey: true });
        handleKeyDown(event);

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(1);
      });
    });

    it('should select duplicated view after duplication', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('d', { ctrlKey: true });
        handleKeyDown(event);

        expect(selectionStore.selectedIds.has('MainView-0')).toBe(false);
        expect(selectionStore.selectedIds.has('MainView-1')).toBe(true);
      });
    });

    it('should push duplicate operation to history', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        expect(historyStore.canUndo).toBe(false);

        const event = createKeyboardEventWithModifiers('d', { ctrlKey: true });
        handleKeyDown(event);

        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('Duplicate');
      });
    });

    it('should support undo after duplication', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('d', { ctrlKey: true });
        handleKeyDown(event);

        const templateAfterDup = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterDup?.children ?? {}).length).toBe(2);

        undo();

        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(templateAfterUndo?.children ?? {}).length).toBe(1);
        expect(templateAfterUndo?.children?.['0']).toBeDefined();
        expect(templateAfterUndo?.children?.['1']).toBeUndefined();
      });
    });
  });

  describe('Ctrl+C/X/V clipboard handling', () => {
    function createKeyboardEventWithModifiers(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean } = {}): KeyboardEvent {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ctrlKey: modifiers.ctrlKey ?? false,
        metaKey: modifiers.metaKey ?? false,
      });
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      });
      return event;
    }

    it('should copy selected view on Ctrl+C', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        expect(canPaste()).toBe(false);

        const event = createKeyboardEventWithModifiers('c', { ctrlKey: true });
        handleKeyDown(event);

        expect(canPaste()).toBe(true);
        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeDefined();
      });
    });

    it('should cut selected view on Ctrl+X', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
                '1': createMockView({ class: 'CTextButton' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
          createMockRenderableView({ id: 'MainView-1' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        const event = createKeyboardEventWithModifiers('x', { ctrlKey: true });
        handleKeyDown(event);

        expect(canPaste()).toBe(true);
        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(template?.children?.['0']).toBeUndefined();
        expect(template?.children?.['1']).toBeDefined();
      });
    });

    it('should paste view on Ctrl+V', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100', size: '50, 20' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        handleKeyDown(createKeyboardEventWithModifiers('c', { ctrlKey: true }));
        handleKeyDown(createKeyboardEventWithModifiers('v', { ctrlKey: true }));

        const template = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(Object.keys(template?.children ?? {}).length).toBe(2);
        expect(template?.children?.['1']?.attributes.class).toBe('CTextLabel');
        expect(template?.children?.['1']?.attributes.origin).toBe('110, 110');
      });
    });

    it('should push cut operation to history', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        expect(historyStore.canUndo).toBe(false);

        const event = createKeyboardEventWithModifiers('x', { ctrlKey: true });
        handleKeyDown(event);

        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('Delete');
      });
    });

    it('should push paste operation to history', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        handleKeyDown(createKeyboardEventWithModifiers('c', { ctrlKey: true }));

        expect(historyStore.canUndo).toBe(false);

        handleKeyDown(createKeyboardEventWithModifiers('v', { ctrlKey: true }));

        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('Paste');
      });
    });

    it('should support undo after cut', () => {
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer(
              { origin: '0, 0', size: '800, 600' },
              {
                '0': createMockView({ class: 'CTextLabel', origin: '100, 100' }),
              }
            ),
          },
        });
        setDocumentForTest(doc);
        select('MainView-0');

        const [renderableViews] = createSignal([
          createMockRenderableView({ id: 'MainView-0' }),
        ]);
        const [templateBounds] = createSignal({ width: 800, height: 600 });

        const { handleKeyDown } = useCanvasKeyboard({
          renderableViews,
          templateBounds,
          cancelCallbacks: mockCancelCallbacks,
        });

        handleKeyDown(createKeyboardEventWithModifiers('x', { ctrlKey: true }));

        const templateAfterCut = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterCut?.children?.['0']).toBeUndefined();

        undo();

        const templateAfterUndo = documentStore.document?.['vstgui-ui-description']?.templates?.['MainView'];
        expect(templateAfterUndo?.children?.['0']).toBeDefined();
        expect(templateAfterUndo?.children?.['0']?.attributes.class).toBe('CTextLabel');
      });
    });
  });
});
