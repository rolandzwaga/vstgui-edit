import { createSignal, onCleanup } from 'solid-js';
import {
  createCreateOperation,
  createNewView,
  findContainerAtPoint,
} from '../../domain/canvas/viewOperations';
import { pushOperation } from '../../stores/historyStore';
import type { Point, RenderableView } from '../../types/canvas';

export interface UseCanvasDropOptions {
  renderableViews: () => RenderableView[];
  getCanvasPoint: (clientX: number, clientY: number) => Point;
}

export interface UseCanvasDropResult {
  isDraggingOver: () => boolean;
  dropTargetId: () => string | null;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
}

const DRAG_DATA_TYPE = 'application/vstgui-view-class';

export function useCanvasDrop(options: UseCanvasDropOptions): UseCanvasDropResult {
  const { renderableViews, getCanvasPoint } = options;

  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const [dropTargetId, setDropTargetId] = createSignal<string | null>(null);

  const handleDragOver = (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes(DRAG_DATA_TYPE)) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    setIsDraggingOver(true);

    const point = getCanvasPoint(e.clientX, e.clientY);
    const container = findContainerAtPoint(renderableViews(), point);
    setDropTargetId(container?.id ?? null);
  };

  const handleDragLeave = (e: DragEvent) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const currentTarget = e.currentTarget as Node;

    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    setIsDraggingOver(false);
    setDropTargetId(null);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();

    const className = e.dataTransfer?.getData(DRAG_DATA_TYPE);
    if (!className) {
      setIsDraggingOver(false);
      setDropTargetId(null);
      return;
    }

    const point = getCanvasPoint(e.clientX, e.clientY);
    const container = findContainerAtPoint(renderableViews(), point);

    if (!container) {
      setIsDraggingOver(false);
      setDropTargetId(null);
      return;
    }

    const relativePosition: Point = {
      x: point.x - container.absoluteX,
      y: point.y - container.absoluteY,
    };

    const newViewId = createNewView({
      className,
      parentId: container.id,
      position: relativePosition,
    });

    if (newViewId) {
      const operation = createCreateOperation(newViewId, className);
      pushOperation(operation);
    }

    setIsDraggingOver(false);
    setDropTargetId(null);
  };

  onCleanup(() => {
    setIsDraggingOver(false);
    setDropTargetId(null);
  });

  return {
    isDraggingOver,
    dropTargetId,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
