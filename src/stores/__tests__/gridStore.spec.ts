import { describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import { DEFAULT_SNAP_THRESHOLD } from '../../types/snap';
import {
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_STYLE,
  GRID_SIZE_PRESETS,
  gridStore,
  MAJOR_LINE_INTERVAL,
  resetGrid,
  setGridSize,
  setGridStyle,
  setSnapThreshold,
  toggleSnap,
  toggleVisibility,
} from '../gridStore';

describe('gridStore', () => {
  describe('constants', () => {
    test('GRID_SIZE_PRESETS contains expected values', () => {
      expect(GRID_SIZE_PRESETS).toEqual([5, 8, 10, 12, 16, 20]);
    });

    test('DEFAULT_GRID_SIZE is 10', () => {
      expect(DEFAULT_GRID_SIZE).toBe(10);
    });

    test('DEFAULT_GRID_STYLE is lines', () => {
      expect(DEFAULT_GRID_STYLE).toBe('lines');
    });

    test('MAJOR_LINE_INTERVAL is 5', () => {
      expect(MAJOR_LINE_INTERVAL).toBe(5);
    });
  });

  describe('initial state', () => {
    test('isVisible is true by default', () => {
      testInRoot(() => {
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
      });
    });

    test('size is DEFAULT_GRID_SIZE (10) by default', () => {
      testInRoot(() => {
        resetGrid();
        expect(gridStore.size).toBe(10);
      });
    });

    test('style is DEFAULT_GRID_STYLE (lines) by default', () => {
      testInRoot(() => {
        resetGrid();
        expect(gridStore.style).toBe('lines');
      });
    });
  });

  describe('toggleVisibility', () => {
    test('toggles isVisible from true to false', () => {
      testInRoot(() => {
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
        toggleVisibility();
        expect(gridStore.isVisible).toBe(false);
      });
    });

    test('toggles isVisible from false to true', () => {
      testInRoot(() => {
        resetGrid();
        toggleVisibility(); // true -> false
        toggleVisibility(); // false -> true
        expect(gridStore.isVisible).toBe(true);
      });
    });

    test('handles multiple toggles', () => {
      testInRoot(() => {
        resetGrid();
        toggleVisibility(); // false
        toggleVisibility(); // true
        toggleVisibility(); // false
        toggleVisibility(); // true
        toggleVisibility(); // false
        expect(gridStore.isVisible).toBe(false);
      });
    });
  });

  describe('setGridSize', () => {
    test('sets size to valid preset 5', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(5);
        expect(gridStore.size).toBe(5);
      });
    });

    test('sets size to valid preset 8', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(8);
        expect(gridStore.size).toBe(8);
      });
    });

    test('sets size to valid preset 12', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(12);
        expect(gridStore.size).toBe(12);
      });
    });

    test('sets size to valid preset 16', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(16);
        expect(gridStore.size).toBe(16);
      });
    });

    test('sets size to valid preset 20', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(20);
        expect(gridStore.size).toBe(20);
      });
    });

    test('allows changing size multiple times', () => {
      testInRoot(() => {
        resetGrid();
        setGridSize(5);
        expect(gridStore.size).toBe(5);
        setGridSize(20);
        expect(gridStore.size).toBe(20);
        setGridSize(10);
        expect(gridStore.size).toBe(10);
      });
    });
  });

  describe('setGridStyle', () => {
    test('sets style to lines', () => {
      testInRoot(() => {
        resetGrid();
        setGridStyle('dots');
        setGridStyle('lines');
        expect(gridStore.style).toBe('lines');
      });
    });

    test('sets style to dots', () => {
      testInRoot(() => {
        resetGrid();
        setGridStyle('dots');
        expect(gridStore.style).toBe('dots');
      });
    });

    test('sets style to crosshairs', () => {
      testInRoot(() => {
        resetGrid();
        setGridStyle('crosshairs');
        expect(gridStore.style).toBe('crosshairs');
      });
    });

    test('allows changing style multiple times', () => {
      testInRoot(() => {
        resetGrid();
        setGridStyle('dots');
        expect(gridStore.style).toBe('dots');
        setGridStyle('crosshairs');
        expect(gridStore.style).toBe('crosshairs');
        setGridStyle('lines');
        expect(gridStore.style).toBe('lines');
      });
    });
  });

  describe('resetGrid', () => {
    test('resets isVisible to true', () => {
      testInRoot(() => {
        toggleVisibility();
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
      });
    });

    test('resets size to DEFAULT_GRID_SIZE', () => {
      testInRoot(() => {
        setGridSize(20);
        resetGrid();
        expect(gridStore.size).toBe(DEFAULT_GRID_SIZE);
      });
    });

    test('resets style to DEFAULT_GRID_STYLE', () => {
      testInRoot(() => {
        setGridStyle('crosshairs');
        resetGrid();
        expect(gridStore.style).toBe(DEFAULT_GRID_STYLE);
      });
    });

    test('resets all state at once', () => {
      testInRoot(() => {
        toggleVisibility(); // false
        setGridSize(5);
        setGridStyle('dots');
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
        expect(gridStore.size).toBe(10);
        expect(gridStore.style).toBe('lines');
      });
    });

    test('can be called multiple times safely', () => {
      testInRoot(() => {
        setGridSize(20);
        resetGrid();
        resetGrid();
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
        expect(gridStore.size).toBe(10);
        expect(gridStore.style).toBe('lines');
      });
    });
  });

  describe('combined operations', () => {
    test('all operations work together', () => {
      testInRoot(() => {
        resetGrid();

        // Toggle visibility
        toggleVisibility();
        expect(gridStore.isVisible).toBe(false);

        // Change size
        setGridSize(16);
        expect(gridStore.size).toBe(16);

        // Change style
        setGridStyle('crosshairs');
        expect(gridStore.style).toBe('crosshairs');

        // Visibility is still false
        expect(gridStore.isVisible).toBe(false);

        // Toggle back
        toggleVisibility();
        expect(gridStore.isVisible).toBe(true);

        // Reset everything
        resetGrid();
        expect(gridStore.isVisible).toBe(true);
        expect(gridStore.size).toBe(10);
        expect(gridStore.style).toBe('lines');
      });
    });
  });

  describe('snap state', () => {
    describe('initial state', () => {
      test('isSnapEnabled is true by default', () => {
        testInRoot(() => {
          resetGrid();
          expect(gridStore.isSnapEnabled).toBe(true);
        });
      });

      test('snapThreshold is DEFAULT_SNAP_THRESHOLD (5) by default', () => {
        testInRoot(() => {
          resetGrid();
          expect(gridStore.snapThreshold).toBe(DEFAULT_SNAP_THRESHOLD);
        });
      });
    });

    describe('toggleSnap', () => {
      test('toggles isSnapEnabled from true to false', () => {
        testInRoot(() => {
          resetGrid();
          expect(gridStore.isSnapEnabled).toBe(true);
          toggleSnap();
          expect(gridStore.isSnapEnabled).toBe(false);
        });
      });

      test('toggles isSnapEnabled from false to true', () => {
        testInRoot(() => {
          resetGrid();
          toggleSnap();
          toggleSnap();
          expect(gridStore.isSnapEnabled).toBe(true);
        });
      });

      test('handles multiple toggles', () => {
        testInRoot(() => {
          resetGrid();
          toggleSnap();
          toggleSnap();
          toggleSnap();
          expect(gridStore.isSnapEnabled).toBe(false);
        });
      });
    });

    describe('setSnapThreshold', () => {
      test('sets threshold to valid value', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(10);
          expect(gridStore.snapThreshold).toBe(10);
        });
      });

      test('clamps threshold to minimum of 1', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(0);
          expect(gridStore.snapThreshold).toBe(1);
        });
      });

      test('clamps negative threshold to minimum of 1', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(-5);
          expect(gridStore.snapThreshold).toBe(1);
        });
      });

      test('clamps threshold to maximum of 20', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(50);
          expect(gridStore.snapThreshold).toBe(20);
        });
      });

      test('allows values within valid range', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(3);
          expect(gridStore.snapThreshold).toBe(3);
          setSnapThreshold(15);
          expect(gridStore.snapThreshold).toBe(15);
        });
      });
    });

    describe('resetGrid with snap state', () => {
      test('resets isSnapEnabled to true', () => {
        testInRoot(() => {
          toggleSnap();
          resetGrid();
          expect(gridStore.isSnapEnabled).toBe(true);
        });
      });

      test('resets snapThreshold to DEFAULT_SNAP_THRESHOLD', () => {
        testInRoot(() => {
          setSnapThreshold(15);
          resetGrid();
          expect(gridStore.snapThreshold).toBe(DEFAULT_SNAP_THRESHOLD);
        });
      });

      test('resets all snap state at once', () => {
        testInRoot(() => {
          toggleSnap();
          setSnapThreshold(10);
          resetGrid();
          expect(gridStore.isSnapEnabled).toBe(true);
          expect(gridStore.snapThreshold).toBe(DEFAULT_SNAP_THRESHOLD);
        });
      });
    });

    describe('snap state persists during session', () => {
      test('snap enabled state persists across grid visibility toggles', () => {
        testInRoot(() => {
          resetGrid();
          toggleSnap();
          toggleVisibility();
          toggleVisibility();
          expect(gridStore.isSnapEnabled).toBe(false);
        });
      });

      test('snap threshold persists across grid size changes', () => {
        testInRoot(() => {
          resetGrid();
          setSnapThreshold(8);
          setGridSize(20);
          expect(gridStore.snapThreshold).toBe(8);
        });
      });
    });
  });
});
