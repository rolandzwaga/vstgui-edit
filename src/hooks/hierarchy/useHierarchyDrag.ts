import { createStore } from 'solid-js/store';
import { validateDrop } from '../../domain/hierarchy/reorder';
import type { DropPosition, HierarchyDragState } from '../../types/hierarchy';

const initialState: HierarchyDragState = {
  isDragging: false,
  draggedIds: [],
  dropTargetId: null,
  dropPosition: null,
  isValidDrop: false,
};

export interface HierarchyDragActions {
  startDrag: (viewIds: string[]) => void;
  updateDropTarget: (targetId: string | null, position: DropPosition | null) => void;
  endDrag: () => void;
  cancelDrag: () => void;
}

export function createHierarchyDragState(): [HierarchyDragState, HierarchyDragActions] {
  const [state, setState] = createStore<HierarchyDragState>({ ...initialState });

  function startDrag(viewIds: string[]): void {
    setState({
      isDragging: true,
      draggedIds: viewIds,
      dropTargetId: null,
      dropPosition: null,
      isValidDrop: false,
    });
  }

  function updateDropTarget(targetId: string | null, position: DropPosition | null): void {
    if (targetId === null) {
      setState({
        dropTargetId: null,
        dropPosition: null,
        isValidDrop: false,
      });
      return;
    }

    let isValid = true;
    for (const draggedId of state.draggedIds) {
      const validation = validateDrop(draggedId, targetId, position);
      if (!validation.isValid) {
        isValid = false;
        break;
      }
    }

    setState({
      dropTargetId: targetId,
      dropPosition: position,
      isValidDrop: isValid,
    });
  }

  function endDrag(): void {
    setState({ ...initialState });
  }

  function cancelDrag(): void {
    setState({ ...initialState });
  }

  return [state, { startDrag, updateDropTarget, endDrag, cancelDrag }];
}
