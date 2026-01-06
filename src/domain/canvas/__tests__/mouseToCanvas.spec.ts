/**
 * Mouse to Canvas Coordinate Transform Tests
 * Tests for converting viewport coordinates to canvas space
 */
import { describe, expect, it } from 'vitest';
import { mouseToCanvas } from '../mouseToCanvas';

// Helper to create mock DOMRect
const createMockRect = (
  left: number,
  top: number,
  width = 800,
  height = 600
): DOMRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  x: left,
  y: top,
  toJSON: () => ({}),
});

describe('mouseToCanvas', () => {
  describe('no transform (pan=0, zoom=1)', () => {
    const wrapperRect = createMockRect(0, 0);
    const panOffset = { x: 0, y: 0 };
    const zoomLevel = 1;

    it('should return same coordinates when mouse is at origin', () => {
      const result = mouseToCanvas(0, 0, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should return same coordinates for any point', () => {
      const result = mouseToCanvas(100, 200, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });
  });

  describe('with pan offset', () => {
    const wrapperRect = createMockRect(0, 0);
    const zoomLevel = 1;

    it('should subtract positive pan offset', () => {
      const panOffset = { x: 50, y: 100 };
      const result = mouseToCanvas(150, 200, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(100); // 150 - 50
      expect(result.y).toBe(100); // 200 - 100
    });

    it('should handle negative pan offset', () => {
      const panOffset = { x: -50, y: -100 };
      const result = mouseToCanvas(100, 100, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(150); // 100 - (-50) = 150
      expect(result.y).toBe(200); // 100 - (-100) = 200
    });
  });

  describe('with zoom level', () => {
    const wrapperRect = createMockRect(0, 0);
    const panOffset = { x: 0, y: 0 };

    it('should divide by zoom level when zoomed in', () => {
      const zoomLevel = 2;
      const result = mouseToCanvas(200, 200, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(100); // 200 / 2
      expect(result.y).toBe(100); // 200 / 2
    });

    it('should divide by zoom level when zoomed out', () => {
      const zoomLevel = 0.5;
      const result = mouseToCanvas(100, 100, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(200); // 100 / 0.5
      expect(result.y).toBe(200); // 100 / 0.5
    });
  });

  describe('with wrapper offset', () => {
    const panOffset = { x: 0, y: 0 };
    const zoomLevel = 1;

    it('should account for wrapper position', () => {
      const wrapperRect = createMockRect(100, 50);
      const result = mouseToCanvas(150, 100, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(50); // 150 - 100
      expect(result.y).toBe(50); // 100 - 50
    });
  });

  describe('combined transforms', () => {
    it('should correctly combine wrapper offset, pan, and zoom', () => {
      const wrapperRect = createMockRect(100, 100);
      const panOffset = { x: 50, y: 50 };
      const zoomLevel = 2;

      // Mouse at (300, 300) viewport
      // Relative to wrapper: (300 - 100, 300 - 100) = (200, 200)
      // Minus pan: (200 - 50, 200 - 50) = (150, 150)
      // Divided by zoom: (150 / 2, 150 / 2) = (75, 75)
      const result = mouseToCanvas(300, 300, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(75);
      expect(result.y).toBe(75);
    });

    it('should handle zoom and negative pan', () => {
      const wrapperRect = createMockRect(0, 0);
      const panOffset = { x: -100, y: -100 };
      const zoomLevel = 0.5;

      // Mouse at (100, 100)
      // Minus pan: (100 - (-100), 100 - (-100)) = (200, 200)
      // Divided by zoom: (200 / 0.5, 200 / 0.5) = (400, 400)
      const result = mouseToCanvas(100, 100, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(400);
      expect(result.y).toBe(400);
    });
  });

  describe('edge cases', () => {
    it('should handle zero mouse coordinates', () => {
      const wrapperRect = createMockRect(50, 50);
      const panOffset = { x: 0, y: 0 };
      const zoomLevel = 1;

      const result = mouseToCanvas(0, 0, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(-50);
      expect(result.y).toBe(-50);
    });

    it('should handle very small zoom', () => {
      const wrapperRect = createMockRect(0, 0);
      const panOffset = { x: 0, y: 0 };
      const zoomLevel = 0.1;

      const result = mouseToCanvas(10, 10, wrapperRect, panOffset, zoomLevel);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });
  });
});
