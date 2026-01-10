/**
 * useGuideDrag Hook
 *
 * Handles mouse events for guide creation and repositioning drags.
 * Attaches document-level listeners when a drag is active.
 */

import { createEffect, onCleanup } from 'solid-js';
import { RULER_THICKNESS, screenToCanvasPosition } from '../../domain/rulers';
import { canvasStore } from '../../stores/canvasStore';
import {
  completeCreationDrag,
  completeRepositionDrag,
  guidesStore,
  repositionGuide,
  updateCreationDrag,
  updateRepositionDrag,
} from '../../stores/guidesStore';

export interface UseGuideDragOptions {
  /** Reference to the canvas wrapper element for bounds calculation */
  canvasWrapperRef: () => HTMLElement | undefined;
}

export interface UseGuideDragResult {
  /** Check if canvas is being hovered during creation drag */
  isCreationDragActive: () => boolean;
  /** Check if reposition drag is active */
  isRepositionDragActive: () => boolean;
}

export function useGuideDrag(options: UseGuideDragOptions): UseGuideDragResult {
  const { canvasWrapperRef } = options;

  // Track document-level listeners
  let creationMoveHandler: ((e: MouseEvent) => void) | null = null;
  let creationUpHandler: ((e: MouseEvent) => void) | null = null;
  let repositionMoveHandler: ((e: MouseEvent) => void) | null = null;
  let repositionUpHandler: ((e: MouseEvent) => void) | null = null;

  const isCreationDragActive = () => guidesStore.creationDrag !== null;
  const isRepositionDragActive = () => guidesStore.repositionDrag !== null;

  // Check if point is over the canvas (not over rulers)
  const isOverCanvas = (clientX: number, clientY: number): boolean => {
    const wrapper = canvasWrapperRef();
    if (!wrapper) return false;

    const rect = wrapper.getBoundingClientRect();
    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    );
  };

  // Check if point is over a ruler
  const isOverRuler = (
    clientX: number,
    clientY: number,
    orientation: 'horizontal' | 'vertical'
  ): boolean => {
    const wrapper = canvasWrapperRef();
    if (!wrapper) return false;

    // Get the ruler container (parent of canvas wrapper)
    const rulerContainer = wrapper.parentElement;
    if (!rulerContainer) return false;

    const rect = rulerContainer.getBoundingClientRect();

    if (orientation === 'horizontal') {
      // Top ruler area
      return clientY < rect.top + RULER_THICKNESS && clientY >= rect.top;
    } else {
      // Left ruler area
      return clientX < rect.left + RULER_THICKNESS && clientX >= rect.left;
    }
  };

  // Get canvas coordinate from screen position
  const getCanvasPosition = (
    clientX: number,
    clientY: number,
    orientation: 'horizontal' | 'vertical'
  ): number => {
    const wrapper = canvasWrapperRef();
    if (!wrapper) return 0;

    const rect = wrapper.getBoundingClientRect();

    if (orientation === 'horizontal') {
      // Y position for horizontal guides
      const screenY = clientY - rect.top;
      return screenToCanvasPosition(screenY, canvasStore.panOffset.y, canvasStore.zoomLevel);
    } else {
      // X position for vertical guides
      const screenX = clientX - rect.left;
      return screenToCanvasPosition(screenX, canvasStore.panOffset.x, canvasStore.zoomLevel);
    }
  };

  // Effect to manage creation drag listeners
  createEffect(() => {
    const drag = guidesStore.creationDrag;

    if (drag) {
      // Add document listeners
      creationMoveHandler = (e: MouseEvent) => {
        const position = getCanvasPosition(e.clientX, e.clientY, drag.orientation);
        const overCanvas = isOverCanvas(e.clientX, e.clientY);
        updateCreationDrag(position, overCanvas);
      };

      creationUpHandler = (_e: MouseEvent) => {
        completeCreationDrag();
        removeCreationListeners();
      };

      document.addEventListener('mousemove', creationMoveHandler);
      document.addEventListener('mouseup', creationUpHandler);

      onCleanup(() => {
        removeCreationListeners();
      });
    }
  });

  const removeCreationListeners = () => {
    if (creationMoveHandler) {
      document.removeEventListener('mousemove', creationMoveHandler);
      creationMoveHandler = null;
    }
    if (creationUpHandler) {
      document.removeEventListener('mouseup', creationUpHandler);
      creationUpHandler = null;
    }
  };

  // Effect to manage reposition drag listeners
  createEffect(() => {
    const drag = guidesStore.repositionDrag;

    if (drag) {
      const guide = guidesStore.getGuideById(drag.guideId);
      if (!guide) return;

      // Add document listeners
      repositionMoveHandler = (e: MouseEvent) => {
        const position = getCanvasPosition(e.clientX, e.clientY, guide.orientation);
        const overRuler = isOverRuler(e.clientX, e.clientY, guide.orientation);

        updateRepositionDrag(position, overRuler);

        // Live update the guide position during drag (for visual feedback)
        if (!overRuler) {
          repositionGuide(drag.guideId, position);
        }
      };

      repositionUpHandler = (_e: MouseEvent) => {
        completeRepositionDrag();
        removeRepositionListeners();
      };

      document.addEventListener('mousemove', repositionMoveHandler);
      document.addEventListener('mouseup', repositionUpHandler);

      onCleanup(() => {
        removeRepositionListeners();
      });
    }
  });

  const removeRepositionListeners = () => {
    if (repositionMoveHandler) {
      document.removeEventListener('mousemove', repositionMoveHandler);
      repositionMoveHandler = null;
    }
    if (repositionUpHandler) {
      document.removeEventListener('mouseup', repositionUpHandler);
      repositionUpHandler = null;
    }
  };

  return {
    isCreationDragActive,
    isRepositionDragActive,
  };
}
