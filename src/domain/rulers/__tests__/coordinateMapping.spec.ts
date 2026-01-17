import { describe, expect, it } from 'vitest';
import {
  calculateTemplateBoundsPosition,
  canvasToScreenPosition,
  screenToCanvasCoordinates,
} from '../coordinateMapping';

describe('screenToCanvasCoordinates', () => {
  describe('no pan 100% zoom', () => {
    it('should subtract ruler offset and apply no transform at 100% zoom with no pan', () => {
      // Screen (120, 70) with 20px ruler offset = canvas (100, 50)
      const result = screenToCanvasCoordinates(120, 70, { x: 0, y: 0 }, 1.0);
      expect(result.x).toBe(100);
      expect(result.y).toBe(50);
    });

    it('should handle screen coordinates at ruler edge', () => {
      // Screen (20, 20) = canvas (0, 0)
      const result = screenToCanvasCoordinates(20, 20, { x: 0, y: 0 }, 1.0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('panned', () => {
    it('should account for positive pan offset (panned right)', () => {
      // Screen 120, pan offset 50, ruler 20
      // canvas x = (120 - 20 - 50) / 1.0 = 50
      const result = screenToCanvasCoordinates(120, 70, { x: 50, y: 0 }, 1.0);
      expect(result.x).toBe(50);
      expect(result.y).toBe(50);
    });

    it('should account for negative pan offset (panned left)', () => {
      // Screen 120, pan offset -50, ruler 20
      // canvas x = (120 - 20 - (-50)) / 1.0 = 150
      const result = screenToCanvasCoordinates(120, 70, { x: -50, y: 0 }, 1.0);
      expect(result.x).toBe(150);
      expect(result.y).toBe(50);
    });
  });

  describe('zoomed', () => {
    it('should divide by zoom level when zoomed in', () => {
      // Screen 120, no pan, ruler 20, zoom 2.0
      // canvas x = (120 - 20 - 0) / 2.0 = 50
      const result = screenToCanvasCoordinates(120, 70, { x: 0, y: 0 }, 2.0);
      expect(result.x).toBe(50);
      expect(result.y).toBe(25);
    });

    it('should multiply visible range when zoomed out', () => {
      // Screen 120, no pan, ruler 20, zoom 0.5
      // canvas x = (120 - 20 - 0) / 0.5 = 200
      const result = screenToCanvasCoordinates(120, 70, { x: 0, y: 0 }, 0.5);
      expect(result.x).toBe(200);
      expect(result.y).toBe(100);
    });
  });

  describe('ruler offset subtraction', () => {
    it('should correctly subtract ruler thickness from both axes', () => {
      // Testing explicit ruler offset behavior
      const result = screenToCanvasCoordinates(40, 40, { x: 0, y: 0 }, 1.0);
      // (40 - 20) = 20 for both x and y
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
    });
  });

  describe('combined pan and zoom', () => {
    it('should handle combined pan and zoom correctly', () => {
      // Screen 120, pan 50, ruler 20, zoom 2.0
      // canvas x = (120 - 20 - 50) / 2.0 = 25
      const result = screenToCanvasCoordinates(120, 70, { x: 50, y: 0 }, 2.0);
      expect(result.x).toBe(25);
      expect(result.y).toBe(25);
    });
  });
});

describe('canvasToScreenPosition', () => {
  describe('no pan 100% zoom', () => {
    it('should return canvas value as screen position at 100% zoom with no pan', () => {
      const result = canvasToScreenPosition(100, 0, 1.0);
      expect(result).toBe(100);
    });

    it('should handle origin', () => {
      const result = canvasToScreenPosition(0, 0, 1.0);
      expect(result).toBe(0);
    });
  });

  describe('panned', () => {
    it('should add pan offset to screen position', () => {
      // Canvas 100, pan 50 = screen 150
      const result = canvasToScreenPosition(100, 50, 1.0);
      expect(result).toBe(150);
    });

    it('should handle negative pan offset', () => {
      // Canvas 100, pan -50 = screen 50
      const result = canvasToScreenPosition(100, -50, 1.0);
      expect(result).toBe(50);
    });
  });

  describe('zoomed', () => {
    it('should multiply by zoom level when zoomed in', () => {
      // Canvas 100 at 200% zoom = screen 200
      const result = canvasToScreenPosition(100, 0, 2.0);
      expect(result).toBe(200);
    });

    it('should divide visible space when zoomed out', () => {
      // Canvas 100 at 50% zoom = screen 50
      const result = canvasToScreenPosition(100, 0, 0.5);
      expect(result).toBe(50);
    });
  });

  describe('negative values', () => {
    it('should handle negative canvas coordinates', () => {
      const result = canvasToScreenPosition(-50, 0, 1.0);
      expect(result).toBe(-50);
    });

    it('should handle negative canvas with pan', () => {
      // Canvas -50 + pan 100 = screen 50
      const result = canvasToScreenPosition(-50, 100, 1.0);
      expect(result).toBe(50);
    });
  });

  describe('formula verification', () => {
    it('should follow screenPos = canvasValue * zoomLevel + panOffset', () => {
      // Test multiple scenarios
      const testCases = [
        { canvas: 100, pan: 0, zoom: 1.0, expected: 100 },
        { canvas: 100, pan: 50, zoom: 1.0, expected: 150 },
        { canvas: 100, pan: 0, zoom: 2.0, expected: 200 },
        { canvas: 100, pan: 50, zoom: 2.0, expected: 250 },
        { canvas: 50, pan: -25, zoom: 0.5, expected: 0 },
      ];

      for (const { canvas, pan, zoom, expected } of testCases) {
        const result = canvasToScreenPosition(canvas, pan, zoom);
        expect(result).toBe(expected);
      }
    });
  });
});

describe('calculateTemplateBoundsPosition', () => {
  describe('no pan 100% zoom', () => {
    it('should return 0 to template extent at 100% zoom with no pan', () => {
      const result = calculateTemplateBoundsPosition(800, 0, 1.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(800);
    });
  });

  describe('panned left', () => {
    it('should shift bounds negative when panned left', () => {
      // Panned left by 100px (negative pan offset)
      const result = calculateTemplateBoundsPosition(800, -100, 1.0);
      expect(result.start).toBe(-100);
      expect(result.end).toBe(700);
    });
  });

  describe('panned right', () => {
    it('should shift bounds positive when panned right', () => {
      // Panned right by 100px (positive pan offset)
      const result = calculateTemplateBoundsPosition(800, 100, 1.0);
      expect(result.start).toBe(100);
      expect(result.end).toBe(900);
    });
  });

  describe('zoomed', () => {
    it('should scale bounds by zoom level when zoomed in', () => {
      // 800px template at 200% zoom
      const result = calculateTemplateBoundsPosition(800, 0, 2.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(1600);
    });

    it('should scale bounds by zoom level when zoomed out', () => {
      // 800px template at 50% zoom
      const result = calculateTemplateBoundsPosition(800, 0, 0.5);
      expect(result.start).toBe(0);
      expect(result.end).toBe(400);
    });
  });

  describe('template sizes up to 4000px', () => {
    it('should handle large 4000px template', () => {
      const result = calculateTemplateBoundsPosition(4000, 0, 1.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(4000);
    });

    it('should handle large template with zoom and pan', () => {
      // 4000px at 25% zoom, panned left by 500px
      const result = calculateTemplateBoundsPosition(4000, -500, 0.25);
      expect(result.start).toBe(-500);
      expect(result.end).toBe(500); // 4000 * 0.25 - 500 = 500
    });
  });

  describe('combined scenarios', () => {
    it('should handle combined pan and zoom', () => {
      // 800px template, panned 100px right, at 50% zoom
      const result = calculateTemplateBoundsPosition(800, 100, 0.5);
      expect(result.start).toBe(100); // 0 * 0.5 + 100
      expect(result.end).toBe(500); // 800 * 0.5 + 100
    });
  });

  describe('start and end relationship', () => {
    it('should always have end > start for positive extent', () => {
      const testCases = [
        { extent: 800, pan: 0, zoom: 1.0 },
        { extent: 800, pan: -500, zoom: 1.0 },
        { extent: 800, pan: 500, zoom: 2.0 },
        { extent: 4000, pan: -1000, zoom: 0.25 },
      ];

      for (const { extent, pan, zoom } of testCases) {
        const result = calculateTemplateBoundsPosition(extent, pan, zoom);
        expect(result.end).toBeGreaterThan(result.start);
      }
    });
  });
});
