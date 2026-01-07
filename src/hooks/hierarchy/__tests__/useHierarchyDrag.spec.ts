import { beforeEach, describe, expect, it } from 'vitest';
import { createMockContainer, createMockDocument, createMockView } from '../../../__tests__/helpers/fixtures';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { reset, setDocumentForTest } from '../../../stores/documentStore';
import { createHierarchyDragState } from '../useHierarchyDrag';

describe('useHierarchyDrag', () => {
  beforeEach(() => {
    reset();
  });

  describe('createHierarchyDragState', () => {
    it('should create initial idle state', () =>
      testInRoot(() => {
        const [state] = createHierarchyDragState();

        expect(state.isDragging).toBe(false);
        expect(state.draggedIds).toEqual([]);
        expect(state.dropTargetId).toBeNull();
        expect(state.dropPosition).toBeNull();
        expect(state.isValidDrop).toBe(false);
      }));
  });

  describe('startDrag', () => {
    it('should set dragging state with single view', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-child']);

        expect(state.isDragging).toBe(true);
        expect(state.draggedIds).toEqual(['MainView-child']);
      }));

    it('should set dragging state with multiple views', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              a: createMockView(),
              b: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-a', 'MainView-b']);

        expect(state.isDragging).toBe(true);
        expect(state.draggedIds).toEqual(['MainView-a', 'MainView-b']);
      }));
  });

  describe('updateDropTarget', () => {
    it('should set valid drop target for container', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer({}, {
                child: createMockView(),
              }),
              target: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-container-child']);
        actions.updateDropTarget('MainView-target', 'inside');

        expect(state.dropTargetId).toBe('MainView-target');
        expect(state.dropPosition).toBe('inside');
        expect(state.isValidDrop).toBe(true);
      }));

    it('should set invalid drop target for self-drop', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-container']);
        actions.updateDropTarget('MainView-container', 'inside');

        expect(state.dropTargetId).toBe('MainView-container');
        expect(state.isValidDrop).toBe(false);
      }));

    it('should set invalid drop target for circular dependency', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              parent: createMockContainer({}, {
                child: createMockContainer(),
              }),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-parent']);
        actions.updateDropTarget('MainView-parent-child', 'inside');

        expect(state.dropTargetId).toBe('MainView-parent-child');
        expect(state.isValidDrop).toBe(false);
      }));

    it('should allow dropping next to non-container (inserts as sibling)', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              container: createMockContainer({}, {
                child: createMockView(),
              }),
              leaf: createMockView({ class: 'CTextLabel' }),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-container-child']);
        actions.updateDropTarget('MainView-leaf', 'before');

        expect(state.dropTargetId).toBe('MainView-leaf');
        expect(state.isValidDrop).toBe(true);
      }));

    it('should clear drop target when targetId is null', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
              target: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-child']);
        actions.updateDropTarget('MainView-target', 'inside');
        actions.updateDropTarget(null, null);

        expect(state.dropTargetId).toBeNull();
        expect(state.dropPosition).toBeNull();
        expect(state.isValidDrop).toBe(false);
      }));
  });

  describe('endDrag', () => {
    it('should reset state after drop', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
              target: createMockContainer(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-child']);
        actions.updateDropTarget('MainView-target', 'inside');
        actions.endDrag();

        expect(state.isDragging).toBe(false);
        expect(state.draggedIds).toEqual([]);
        expect(state.dropTargetId).toBeNull();
        expect(state.dropPosition).toBeNull();
        expect(state.isValidDrop).toBe(false);
      }));
  });

  describe('cancelDrag', () => {
    it('should reset state on cancel', () =>
      testInRoot(() => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockContainer({}, {
              child: createMockView(),
            }),
          },
        });
        setDocumentForTest(doc);

        const [state, actions] = createHierarchyDragState();
        actions.startDrag(['MainView-child']);
        actions.cancelDrag();

        expect(state.isDragging).toBe(false);
        expect(state.draggedIds).toEqual([]);
      }));
  });
});
