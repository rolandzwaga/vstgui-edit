import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  cancelDrag,
  dragStore,
  endDrag,
  resetDrag,
  startDrag,
  updateDrag,
} from '../dragStore';

describe('dragStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetDrag();
    });
  });

  describe('initial state', () => {
    it('should have isDragging as false', () => {
      testInRoot(() => {
        expect(dragStore.isDragging).toBe(false);
      });
    });

    it('should have startPoint as null', () => {
      testInRoot(() => {
        expect(dragStore.startPoint).toBeNull();
      });
    });

    it('should have currentPoint as null', () => {
      testInRoot(() => {
        expect(dragStore.currentPoint).toBeNull();
      });
    });

    it('should have empty originalOrigins', () => {
      testInRoot(() => {
        expect(Object.keys(dragStore.originalOrigins).length).toBe(0);
      });
    });

    it('should have constrainedAxis as null', () => {
      testInRoot(() => {
        expect(dragStore.constrainedAxis).toBeNull();
      });
    });

    it('should have delta as {x: 0, y: 0}', () => {
      testInRoot(() => {
        expect(dragStore.delta).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('startDrag', () => {
    it('should set isDragging to true', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, { 'view-1': { x: 0, y: 0 } });
        expect(dragStore.isDragging).toBe(true);
      });
    });

    it('should set startPoint', () => {
      testInRoot(() => {
        startDrag({ x: 100, y: 200 }, {});
        expect(dragStore.startPoint).toEqual({ x: 100, y: 200 });
      });
    });

    it('should set currentPoint same as startPoint', () => {
      testInRoot(() => {
        startDrag({ x: 50, y: 75 }, {});
        expect(dragStore.currentPoint).toEqual({ x: 50, y: 75 });
      });
    });

    it('should store originalOrigins', () => {
      testInRoot(() => {
        const origins = {
          'view-1': { x: 10, y: 20 },
          'view-2': { x: 30, y: 40 },
        };
        startDrag({ x: 0, y: 0 }, origins);
        expect(dragStore.originalOrigins).toEqual(origins);
      });
    });

    it('should copy origins not reference them', () => {
      testInRoot(() => {
        const origins: Record<string, { x: number; y: number }> = {
          'view-1': { x: 10, y: 20 },
        };
        startDrag({ x: 0, y: 0 }, origins);
        origins['view-2'] = { x: 30, y: 40 };
        expect(dragStore.originalOrigins['view-2']).toBeUndefined();
      });
    });

    it('should reset constrainedAxis to null', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        expect(dragStore.constrainedAxis).toBeNull();
      });
    });
  });

  describe('updateDrag', () => {
    it('should update currentPoint', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        updateDrag({ x: 100, y: 150 }, false);
        expect(dragStore.currentPoint).toEqual({ x: 100, y: 150 });
      });
    });

    it('should not change startPoint', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, {});
        updateDrag({ x: 100, y: 150 }, false);
        expect(dragStore.startPoint).toEqual({ x: 10, y: 20 });
      });
    });

    it('should do nothing when not dragging', () => {
      testInRoot(() => {
        updateDrag({ x: 100, y: 150 }, false);
        expect(dragStore.currentPoint).toBeNull();
      });
    });

    it('should allow multiple updates', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        updateDrag({ x: 50, y: 50 }, false);
        updateDrag({ x: 100, y: 100 }, false);
        updateDrag({ x: 200, y: 300 }, false);
        expect(dragStore.currentPoint).toEqual({ x: 200, y: 300 });
      });
    });

    describe('with shift held (constrained movement)', () => {
      it('should set horizontal axis when movement is primarily horizontal', () => {
        testInRoot(() => {
          startDrag({ x: 0, y: 0 }, {});
          updateDrag({ x: 50, y: 10 }, true);
          expect(dragStore.constrainedAxis).toBe('horizontal');
        });
      });

      it('should set vertical axis when movement is primarily vertical', () => {
        testInRoot(() => {
          startDrag({ x: 0, y: 0 }, {});
          updateDrag({ x: 10, y: 50 }, true);
          expect(dragStore.constrainedAxis).toBe('vertical');
        });
      });

      it('should not set axis if movement is below threshold', () => {
        testInRoot(() => {
          startDrag({ x: 0, y: 0 }, {});
          updateDrag({ x: 3, y: 2 }, true);
          expect(dragStore.constrainedAxis).toBeNull();
        });
      });

      it('should keep axis once determined', () => {
        testInRoot(() => {
          startDrag({ x: 0, y: 0 }, {});
          updateDrag({ x: 50, y: 10 }, true);
          expect(dragStore.constrainedAxis).toBe('horizontal');

          updateDrag({ x: 50, y: 100 }, true);
          expect(dragStore.constrainedAxis).toBe('horizontal');
        });
      });

      it('should clear axis when shift released', () => {
        testInRoot(() => {
          startDrag({ x: 0, y: 0 }, {});
          updateDrag({ x: 50, y: 10 }, true);
          expect(dragStore.constrainedAxis).toBe('horizontal');

          updateDrag({ x: 60, y: 20 }, false);
          expect(dragStore.constrainedAxis).toBeNull();
        });
      });
    });
  });

  describe('delta', () => {
    it('should calculate unconstrained delta', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, {});
        updateDrag({ x: 50, y: 70 }, false);
        expect(dragStore.delta).toEqual({ x: 40, y: 50 });
      });
    });

    it('should calculate negative delta', () => {
      testInRoot(() => {
        startDrag({ x: 100, y: 100 }, {});
        updateDrag({ x: 50, y: 30 }, false);
        expect(dragStore.delta).toEqual({ x: -50, y: -70 });
      });
    });

    it('should constrain delta to horizontal axis', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        updateDrag({ x: 50, y: 10 }, true);
        updateDrag({ x: 100, y: 80 }, true);
        expect(dragStore.delta).toEqual({ x: 100, y: 0 });
      });
    });

    it('should constrain delta to vertical axis', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        updateDrag({ x: 10, y: 50 }, true);
        updateDrag({ x: 80, y: 100 }, true);
        expect(dragStore.delta).toEqual({ x: 0, y: 100 });
      });
    });

    it('should return zero delta when not dragging', () => {
      testInRoot(() => {
        expect(dragStore.delta).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('endDrag', () => {
    it('should set isDragging to false', () => {
      testInRoot(() => {
        startDrag({ x: 0, y: 0 }, {});
        endDrag();
        expect(dragStore.isDragging).toBe(false);
      });
    });

    it('should preserve startPoint and currentPoint for commit logic', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, {});
        updateDrag({ x: 100, y: 200 }, false);
        endDrag();
        expect(dragStore.startPoint).toEqual({ x: 10, y: 20 });
        expect(dragStore.currentPoint).toEqual({ x: 100, y: 200 });
      });
    });

    it('should preserve originalOrigins for commit logic', () => {
      testInRoot(() => {
        const origins = { 'view-1': { x: 10, y: 20 } };
        startDrag({ x: 0, y: 0 }, origins);
        endDrag();
        expect(dragStore.originalOrigins).toEqual(origins);
      });
    });
  });

  describe('cancelDrag', () => {
    it('should reset all state', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, { 'view-1': { x: 0, y: 0 } });
        updateDrag({ x: 100, y: 200 }, true);
        cancelDrag();

        expect(dragStore.isDragging).toBe(false);
        expect(dragStore.startPoint).toBeNull();
        expect(dragStore.currentPoint).toBeNull();
        expect(Object.keys(dragStore.originalOrigins).length).toBe(0);
        expect(dragStore.constrainedAxis).toBeNull();
      });
    });
  });

  describe('resetDrag', () => {
    it('should reset all state to initial values', () => {
      testInRoot(() => {
        startDrag({ x: 10, y: 20 }, { 'view-1': { x: 5, y: 10 } });
        updateDrag({ x: 100, y: 200 }, true);
        resetDrag();

        expect(dragStore.isDragging).toBe(false);
        expect(dragStore.startPoint).toBeNull();
        expect(dragStore.currentPoint).toBeNull();
        expect(Object.keys(dragStore.originalOrigins).length).toBe(0);
        expect(dragStore.constrainedAxis).toBeNull();
        expect(dragStore.delta).toEqual({ x: 0, y: 0 });
      });
    });
  });
});
