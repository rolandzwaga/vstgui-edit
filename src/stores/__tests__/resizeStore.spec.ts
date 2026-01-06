import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  cancelResize,
  endResize,
  resetResize,
  resizeStore,
  startResize,
  updateResize,
} from '../resizeStore';

describe('resizeStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetResize();
    });
  });

  describe('initial state', () => {
    it('should have isResizing as false', () => {
      testInRoot(() => {
        expect(resizeStore.isResizing).toBe(false);
      });
    });

    it('should have activeHandle as null', () => {
      testInRoot(() => {
        expect(resizeStore.activeHandle).toBeNull();
      });
    });

    it('should have viewId as null', () => {
      testInRoot(() => {
        expect(resizeStore.viewId).toBeNull();
      });
    });

    it('should have startPoint as null', () => {
      testInRoot(() => {
        expect(resizeStore.startPoint).toBeNull();
      });
    });

    it('should have currentPoint as null', () => {
      testInRoot(() => {
        expect(resizeStore.currentPoint).toBeNull();
      });
    });

    it('should have originalOrigin as null', () => {
      testInRoot(() => {
        expect(resizeStore.originalOrigin).toBeNull();
      });
    });

    it('should have originalSize as null', () => {
      testInRoot(() => {
        expect(resizeStore.originalSize).toBeNull();
      });
    });

    it('should have newOrigin as {x: 0, y: 0}', () => {
      testInRoot(() => {
        expect(resizeStore.newOrigin).toEqual({ x: 0, y: 0 });
      });
    });

    it('should have newSize as {width: 0, height: 0}', () => {
      testInRoot(() => {
        expect(resizeStore.newSize).toEqual({ width: 0, height: 0 });
      });
    });
  });

  describe('startResize', () => {
    it('should set isResizing to true', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 10, y: 20 }, { width: 200, height: 150 });
        expect(resizeStore.isResizing).toBe(true);
      });
    });

    it('should set activeHandle', () => {
      testInRoot(() => {
        startResize('nw', 'view-1', { x: 50, y: 50 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        expect(resizeStore.activeHandle).toBe('nw');
      });
    });

    it('should set viewId', () => {
      testInRoot(() => {
        startResize('e', 'my-view', { x: 0, y: 0 }, { x: 0, y: 0 }, { width: 50, height: 50 });
        expect(resizeStore.viewId).toBe('my-view');
      });
    });

    it('should set startPoint', () => {
      testInRoot(() => {
        startResize('s', 'view-1', { x: 150, y: 200 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        expect(resizeStore.startPoint).toEqual({ x: 150, y: 200 });
      });
    });

    it('should set currentPoint same as startPoint', () => {
      testInRoot(() => {
        startResize('w', 'view-1', { x: 75, y: 80 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        expect(resizeStore.currentPoint).toEqual({ x: 75, y: 80 });
      });
    });

    it('should set originalOrigin', () => {
      testInRoot(() => {
        startResize('ne', 'view-1', { x: 0, y: 0 }, { x: 25, y: 35 }, { width: 100, height: 100 });
        expect(resizeStore.originalOrigin).toEqual({ x: 25, y: 35 });
      });
    });

    it('should set originalSize', () => {
      testInRoot(() => {
        startResize('sw', 'view-1', { x: 0, y: 0 }, { x: 0, y: 0 }, { width: 180, height: 120 });
        expect(resizeStore.originalSize).toEqual({ width: 180, height: 120 });
      });
    });

    it('should initialize newOrigin with originalOrigin', () => {
      testInRoot(() => {
        startResize('n', 'view-1', { x: 0, y: 0 }, { x: 50, y: 60 }, { width: 100, height: 100 });
        expect(resizeStore.newOrigin).toEqual({ x: 50, y: 60 });
      });
    });

    it('should initialize newSize with originalSize', () => {
      testInRoot(() => {
        startResize('n', 'view-1', { x: 0, y: 0 }, { x: 0, y: 0 }, { width: 200, height: 150 });
        expect(resizeStore.newSize).toEqual({ width: 200, height: 150 });
      });
    });
  });

  describe('updateResize', () => {
    it('should update currentPoint', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        updateResize({ x: 150, y: 150 }, false, false);
        expect(resizeStore.currentPoint).toEqual({ x: 150, y: 150 });
      });
    });

    it('should do nothing when not resizing', () => {
      testInRoot(() => {
        updateResize({ x: 100, y: 100 }, false, false);
        expect(resizeStore.currentPoint).toBeNull();
      });
    });

    it('should update newSize when dragging SE handle right/down', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        updateResize({ x: 150, y: 130 }, false, false);
        expect(resizeStore.newSize).toEqual({ width: 150, height: 130 });
      });
    });

    it('should update newOrigin and newSize when dragging NW handle', () => {
      testInRoot(() => {
        startResize('nw', 'view-1', { x: 50, y: 50 }, { x: 50, y: 50 }, { width: 100, height: 100 });
        updateResize({ x: 30, y: 30 }, false, false);
        expect(resizeStore.newOrigin).toEqual({ x: 30, y: 30 });
        expect(resizeStore.newSize).toEqual({ width: 120, height: 120 });
      });
    });

    it('should only update width when dragging E handle', () => {
      testInRoot(() => {
        startResize('e', 'view-1', { x: 100, y: 50 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        updateResize({ x: 140, y: 70 }, false, false);
        expect(resizeStore.newSize.width).toBe(140);
        expect(resizeStore.newSize.height).toBe(100);
      });
    });

    it('should only update height when dragging S handle', () => {
      testInRoot(() => {
        startResize('s', 'view-1', { x: 50, y: 100 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        updateResize({ x: 80, y: 150 }, false, false);
        expect(resizeStore.newSize.width).toBe(100);
        expect(resizeStore.newSize.height).toBe(150);
      });
    });

    it('should clamp to minimum size', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        updateResize({ x: 5, y: 5 }, false, false);
        expect(resizeStore.newSize.width).toBe(10);
        expect(resizeStore.newSize.height).toBe(10);
      });
    });
  });

  describe('endResize', () => {
    it('should set isResizing to false', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 0, y: 0 }, { width: 100, height: 100 });
        endResize();
        expect(resizeStore.isResizing).toBe(false);
      });
    });

    it('should preserve newOrigin and newSize for commit logic', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 10, y: 20 }, { width: 100, height: 100 });
        updateResize({ x: 150, y: 150 }, false, false);
        endResize();
        expect(resizeStore.newOrigin).toEqual({ x: 10, y: 20 });
        expect(resizeStore.newSize).toEqual({ width: 150, height: 150 });
      });
    });

    it('should preserve originalOrigin and originalSize for history', () => {
      testInRoot(() => {
        startResize('nw', 'view-1', { x: 50, y: 50 }, { x: 50, y: 50 }, { width: 100, height: 100 });
        updateResize({ x: 30, y: 30 }, false, false);
        endResize();
        expect(resizeStore.originalOrigin).toEqual({ x: 50, y: 50 });
        expect(resizeStore.originalSize).toEqual({ width: 100, height: 100 });
      });
    });
  });

  describe('cancelResize', () => {
    it('should reset all state', () => {
      testInRoot(() => {
        startResize('se', 'view-1', { x: 100, y: 100 }, { x: 10, y: 20 }, { width: 100, height: 100 });
        updateResize({ x: 150, y: 150 }, false, false);
        cancelResize();

        expect(resizeStore.isResizing).toBe(false);
        expect(resizeStore.activeHandle).toBeNull();
        expect(resizeStore.viewId).toBeNull();
        expect(resizeStore.startPoint).toBeNull();
        expect(resizeStore.currentPoint).toBeNull();
        expect(resizeStore.originalOrigin).toBeNull();
        expect(resizeStore.originalSize).toBeNull();
      });
    });
  });

  describe('resetResize', () => {
    it('should reset all state to initial values', () => {
      testInRoot(() => {
        startResize('nw', 'view-1', { x: 50, y: 50 }, { x: 50, y: 50 }, { width: 100, height: 100 });
        updateResize({ x: 30, y: 30 }, true, true);
        resetResize();

        expect(resizeStore.isResizing).toBe(false);
        expect(resizeStore.activeHandle).toBeNull();
        expect(resizeStore.viewId).toBeNull();
        expect(resizeStore.startPoint).toBeNull();
        expect(resizeStore.currentPoint).toBeNull();
        expect(resizeStore.originalOrigin).toBeNull();
        expect(resizeStore.originalSize).toBeNull();
        expect(resizeStore.newOrigin).toEqual({ x: 0, y: 0 });
        expect(resizeStore.newSize).toEqual({ width: 0, height: 0 });
      });
    });
  });
});
