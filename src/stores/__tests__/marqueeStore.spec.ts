import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  cancelMarquee,
  completeMarquee,
  marqueeStore,
  resetMarquee,
  startMarquee,
  updateMarquee,
} from '../marqueeStore';

describe('marqueeStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetMarquee();
    });
  });

  describe('initial state', () => {
    it('should have isActive as false', () => {
      testInRoot(() => {
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should have startPoint as null', () => {
      testInRoot(() => {
        expect(marqueeStore.startPoint).toBeNull();
      });
    });

    it('should have currentPoint as null', () => {
      testInRoot(() => {
        expect(marqueeStore.currentPoint).toBeNull();
      });
    });

    it('should have isAdditive as false', () => {
      testInRoot(() => {
        expect(marqueeStore.isAdditive).toBe(false);
      });
    });

    it('should have empty previousSelection', () => {
      testInRoot(() => {
        expect(marqueeStore.previousSelection.size).toBe(0);
      });
    });
  });

  describe('startMarquee', () => {
    it('should set isActive to true', () => {
      testInRoot(() => {
        startMarquee({ x: 10, y: 20 }, false, new Set());
        expect(marqueeStore.isActive).toBe(true);
      });
    });

    it('should set startPoint to provided coordinates', () => {
      testInRoot(() => {
        startMarquee({ x: 100, y: 200 }, false, new Set());
        expect(marqueeStore.startPoint).toEqual({ x: 100, y: 200 });
      });
    });

    it('should set currentPoint to same as startPoint initially', () => {
      testInRoot(() => {
        startMarquee({ x: 50, y: 75 }, false, new Set());
        expect(marqueeStore.currentPoint).toEqual({ x: 50, y: 75 });
      });
    });

    it('should set isAdditive to true when shift is held', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, true, new Set());
        expect(marqueeStore.isAdditive).toBe(true);
      });
    });

    it('should set isAdditive to false when shift is not held', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        expect(marqueeStore.isAdditive).toBe(false);
      });
    });

    it('should copy currentSelection to previousSelection', () => {
      testInRoot(() => {
        const selection = new Set(['view-1', 'view-2']);
        startMarquee({ x: 0, y: 0 }, false, selection);
        expect(marqueeStore.previousSelection.has('view-1')).toBe(true);
        expect(marqueeStore.previousSelection.has('view-2')).toBe(true);
        expect(marqueeStore.previousSelection.size).toBe(2);
      });
    });

    it('should store a copy of selection, not a reference', () => {
      testInRoot(() => {
        const selection = new Set(['view-1']);
        startMarquee({ x: 0, y: 0 }, false, selection);

        selection.add('view-2');

        expect(marqueeStore.previousSelection.has('view-2')).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(1);
      });
    });
  });

  describe('updateMarquee', () => {
    it('should update currentPoint when marquee is active', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.currentPoint).toEqual({ x: 100, y: 150 });
      });
    });

    it('should do nothing when marquee is inactive', () => {
      testInRoot(() => {
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.currentPoint).toBeNull();
      });
    });

    it('should not affect startPoint', () => {
      testInRoot(() => {
        startMarquee({ x: 10, y: 20 }, false, new Set());
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.startPoint).toEqual({ x: 10, y: 20 });
      });
    });

    it('should allow multiple updates', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        updateMarquee({ x: 50, y: 50 });
        updateMarquee({ x: 100, y: 100 });
        updateMarquee({ x: 200, y: 300 });
        expect(marqueeStore.currentPoint).toEqual({ x: 200, y: 300 });
      });
    });
  });

  describe('completeMarquee', () => {
    it('should reset isActive to false', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        completeMarquee();
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should reset startPoint to null', () => {
      testInRoot(() => {
        startMarquee({ x: 10, y: 20 }, false, new Set());
        completeMarquee();
        expect(marqueeStore.startPoint).toBeNull();
      });
    });

    it('should reset currentPoint to null', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        updateMarquee({ x: 100, y: 100 });
        completeMarquee();
        expect(marqueeStore.currentPoint).toBeNull();
      });
    });

    it('should reset isAdditive to false', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, true, new Set());
        completeMarquee();
        expect(marqueeStore.isAdditive).toBe(false);
      });
    });

    it('should reset previousSelection to empty', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set(['view-1']));
        completeMarquee();
        expect(marqueeStore.previousSelection.size).toBe(0);
      });
    });
  });

  describe('cancelMarquee', () => {
    it('should reset isActive to false', () => {
      testInRoot(() => {
        startMarquee({ x: 0, y: 0 }, false, new Set());
        cancelMarquee();
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should reset all state to initial values', () => {
      testInRoot(() => {
        startMarquee({ x: 10, y: 20 }, true, new Set(['view-1', 'view-2']));
        updateMarquee({ x: 100, y: 100 });
        cancelMarquee();

        expect(marqueeStore.isActive).toBe(false);
        expect(marqueeStore.startPoint).toBeNull();
        expect(marqueeStore.currentPoint).toBeNull();
        expect(marqueeStore.isAdditive).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(0);
      });
    });
  });

  describe('resetMarquee', () => {
    it('should reset all state to initial values', () => {
      testInRoot(() => {
        startMarquee({ x: 10, y: 20 }, true, new Set(['view-1']));
        updateMarquee({ x: 100, y: 100 });
        resetMarquee();

        expect(marqueeStore.isActive).toBe(false);
        expect(marqueeStore.startPoint).toBeNull();
        expect(marqueeStore.currentPoint).toBeNull();
        expect(marqueeStore.isAdditive).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(0);
      });
    });
  });
});
