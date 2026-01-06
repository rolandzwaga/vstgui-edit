import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  activateMarquee,
  beginTracking,
  cancelMarquee,
  completeMarquee,
  marqueeStore,
  resetMarquee,
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

    it('should have isPending as false', () => {
      testInRoot(() => {
        expect(marqueeStore.isPending).toBe(false);
      });
    });

    it('should have clickTarget as null', () => {
      testInRoot(() => {
        expect(marqueeStore.clickTarget).toBeNull();
      });
    });
  });

  describe('beginTracking', () => {
    it('should set isPending to true', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, false, new Set(), null);
        expect(marqueeStore.isPending).toBe(true);
      });
    });

    it('should keep isActive as false', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, false, new Set(), null);
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should set startPoint to provided coordinates', () => {
      testInRoot(() => {
        beginTracking({ x: 100, y: 200 }, false, new Set(), null);
        expect(marqueeStore.startPoint).toEqual({ x: 100, y: 200 });
      });
    });

    it('should set currentPoint to same as startPoint initially', () => {
      testInRoot(() => {
        beginTracking({ x: 50, y: 75 }, false, new Set(), null);
        expect(marqueeStore.currentPoint).toEqual({ x: 50, y: 75 });
      });
    });

    it('should set isAdditive to true when shift is held', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, true, new Set(), null);
        expect(marqueeStore.isAdditive).toBe(true);
      });
    });

    it('should set isAdditive to false when shift is not held', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        expect(marqueeStore.isAdditive).toBe(false);
      });
    });

    it('should copy currentSelection to previousSelection', () => {
      testInRoot(() => {
        const selection = new Set(['view-1', 'view-2']);
        beginTracking({ x: 0, y: 0 }, false, selection, null);
        expect(marqueeStore.previousSelection.has('view-1')).toBe(true);
        expect(marqueeStore.previousSelection.has('view-2')).toBe(true);
        expect(marqueeStore.previousSelection.size).toBe(2);
      });
    });

    it('should store a copy of selection, not a reference', () => {
      testInRoot(() => {
        const selection = new Set(['view-1']);
        beginTracking({ x: 0, y: 0 }, false, selection, null);

        selection.add('view-2');

        expect(marqueeStore.previousSelection.has('view-2')).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(1);
      });
    });

    it('should set clickTarget when provided', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), 'view-1');
        expect(marqueeStore.clickTarget).toBe('view-1');
      });
    });

    it('should set clickTarget to null when not provided', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        expect(marqueeStore.clickTarget).toBeNull();
      });
    });
  });

  describe('activateMarquee', () => {
    it('should set isActive to true when pending', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        expect(marqueeStore.isActive).toBe(true);
      });
    });

    it('should set isPending to false when activating', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        expect(marqueeStore.isPending).toBe(false);
      });
    });

    it('should do nothing when not pending', () => {
      testInRoot(() => {
        activateMarquee();
        expect(marqueeStore.isActive).toBe(false);
        expect(marqueeStore.isPending).toBe(false);
      });
    });
  });

  describe('updateMarquee', () => {
    it('should update currentPoint when tracking is pending', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.currentPoint).toEqual({ x: 100, y: 150 });
      });
    });

    it('should update currentPoint when marquee is active', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.currentPoint).toEqual({ x: 100, y: 150 });
      });
    });

    it('should not affect startPoint', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, false, new Set(), null);
        updateMarquee({ x: 100, y: 150 });
        expect(marqueeStore.startPoint).toEqual({ x: 10, y: 20 });
      });
    });

    it('should allow multiple updates', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
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
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        completeMarquee();
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should reset isPending to false', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        completeMarquee();
        expect(marqueeStore.isPending).toBe(false);
      });
    });

    it('should reset startPoint to null', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, false, new Set(), null);
        completeMarquee();
        expect(marqueeStore.startPoint).toBeNull();
      });
    });

    it('should reset currentPoint to null', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        updateMarquee({ x: 100, y: 100 });
        completeMarquee();
        expect(marqueeStore.currentPoint).toBeNull();
      });
    });

    it('should reset isAdditive to false', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, true, new Set(), null);
        completeMarquee();
        expect(marqueeStore.isAdditive).toBe(false);
      });
    });

    it('should reset previousSelection to empty', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(['view-1']), null);
        completeMarquee();
        expect(marqueeStore.previousSelection.size).toBe(0);
      });
    });

    it('should reset clickTarget to null', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), 'view-1');
        completeMarquee();
        expect(marqueeStore.clickTarget).toBeNull();
      });
    });
  });

  describe('cancelMarquee', () => {
    it('should reset isActive to false', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        cancelMarquee();
        expect(marqueeStore.isActive).toBe(false);
      });
    });

    it('should reset all state to initial values', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, true, new Set(['view-1', 'view-2']), 'view-3');
        updateMarquee({ x: 100, y: 100 });
        cancelMarquee();

        expect(marqueeStore.isActive).toBe(false);
        expect(marqueeStore.isPending).toBe(false);
        expect(marqueeStore.startPoint).toBeNull();
        expect(marqueeStore.currentPoint).toBeNull();
        expect(marqueeStore.isAdditive).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(0);
        expect(marqueeStore.clickTarget).toBeNull();
      });
    });
  });

  describe('resetMarquee', () => {
    it('should reset all state to initial values', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, true, new Set(['view-1']), 'view-2');
        updateMarquee({ x: 100, y: 100 });
        resetMarquee();

        expect(marqueeStore.isActive).toBe(false);
        expect(marqueeStore.isPending).toBe(false);
        expect(marqueeStore.startPoint).toBeNull();
        expect(marqueeStore.currentPoint).toBeNull();
        expect(marqueeStore.isAdditive).toBe(false);
        expect(marqueeStore.previousSelection.size).toBe(0);
        expect(marqueeStore.clickTarget).toBeNull();
      });
    });
  });
});
