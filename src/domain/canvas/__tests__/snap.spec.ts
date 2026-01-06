import { describe, expect, test } from 'vitest';
import { getEffectiveThreshold, snapEdges, snapPoint, snapToGrid } from '../snap';

describe('getEffectiveThreshold', () => {
  test('returns threshold when less than half grid size', () => {
    expect(getEffectiveThreshold(5, 20)).toBe(5);
  });

  test('clamps threshold to half grid size when threshold exceeds it', () => {
    expect(getEffectiveThreshold(10, 16)).toBe(8);
  });

  test('clamps threshold exactly at half grid size', () => {
    expect(getEffectiveThreshold(6, 10)).toBe(5);
  });

  test('handles small grid sizes', () => {
    expect(getEffectiveThreshold(5, 8)).toBe(4);
  });
});

describe('snapToGrid', () => {
  test('snaps coordinate within threshold to nearest grid line', () => {
    const result = snapToGrid(23, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(20);
    expect(result.snapDelta).toBe(-3);
    expect(result.gridLine).toBe(20);
  });

  test('snaps coordinate exactly on grid line', () => {
    const result = snapToGrid(30, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(30);
    expect(result.snapDelta).toBe(0);
    expect(result.gridLine).toBe(30);
  });

  test('does not snap coordinate outside threshold', () => {
    const result = snapToGrid(15, 10, 4);
    expect(result.snapped).toBe(false);
    expect(result.value).toBe(15);
    expect(result.snapDelta).toBe(0);
    expect(result.gridLine).toBe(null);
  });

  test('snaps to higher grid line when closer', () => {
    const result = snapToGrid(28, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(30);
    expect(result.snapDelta).toBe(2);
    expect(result.gridLine).toBe(30);
  });

  test('handles negative coordinates', () => {
    const result = snapToGrid(-12, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(-10);
    expect(result.snapDelta).toBe(2);
    expect(result.gridLine).toBe(-10);
  });

  test('handles coordinate at exact threshold boundary (should snap)', () => {
    const result = snapToGrid(25, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(30);
  });

  test('handles zero coordinate', () => {
    const result = snapToGrid(0, 10, 5);
    expect(result.snapped).toBe(true);
    expect(result.value).toBe(0);
    expect(result.gridLine).toBe(0);
  });
});

describe('snapPoint', () => {
  test('snaps both x and y independently', () => {
    const result = snapPoint({ x: 23, y: 47 }, 10, 5);
    expect(result.x.snapped).toBe(true);
    expect(result.x.value).toBe(20);
    expect(result.y.snapped).toBe(true);
    expect(result.y.value).toBe(50);
    expect(result.point).toEqual({ x: 20, y: 50 });
  });

  test('snaps x only when y is outside threshold', () => {
    const result = snapPoint({ x: 23, y: 15 }, 10, 4);
    expect(result.x.snapped).toBe(true);
    expect(result.y.snapped).toBe(false);
    expect(result.point).toEqual({ x: 20, y: 15 });
  });

  test('does not snap either coordinate when both outside threshold', () => {
    const result = snapPoint({ x: 15, y: 15 }, 10, 4);
    expect(result.x.snapped).toBe(false);
    expect(result.y.snapped).toBe(false);
    expect(result.point).toEqual({ x: 15, y: 15 });
  });
});

describe('snapEdges', () => {
  const bounds = {
    origin: { x: 50, y: 50 },
    size: { width: 100, height: 80 },
  };

  test('snaps right edge when dragging east handle', () => {
    const result = snapEdges(bounds, 'e', 10, 5);
    expect(result.left).toBe(null);
    expect(result.right?.snapped).toBe(true);
    expect(result.right?.value).toBe(150);
    expect(result.top).toBe(null);
    expect(result.bottom).toBe(null);
  });

  test('snaps left edge when dragging west handle', () => {
    const result = snapEdges(bounds, 'w', 10, 5);
    expect(result.left?.snapped).toBe(true);
    expect(result.left?.value).toBe(50);
    expect(result.right).toBe(null);
  });

  test('snaps top edge when dragging north handle', () => {
    const result = snapEdges(bounds, 'n', 10, 5);
    expect(result.top?.snapped).toBe(true);
    expect(result.top?.value).toBe(50);
    expect(result.bottom).toBe(null);
  });

  test('snaps bottom edge when dragging south handle', () => {
    const result = snapEdges(bounds, 's', 10, 5);
    expect(result.bottom?.snapped).toBe(true);
    expect(result.bottom?.value).toBe(130);
    expect(result.top).toBe(null);
  });

  test('snaps both edges for corner handle (se)', () => {
    const result = snapEdges(bounds, 'se', 10, 5);
    expect(result.right?.snapped).toBe(true);
    expect(result.bottom?.snapped).toBe(true);
    expect(result.left).toBe(null);
    expect(result.top).toBe(null);
  });

  test('snaps both edges for corner handle (nw)', () => {
    const result = snapEdges(bounds, 'nw', 10, 5);
    expect(result.left?.snapped).toBe(true);
    expect(result.top?.snapped).toBe(true);
    expect(result.right).toBe(null);
    expect(result.bottom).toBe(null);
  });

  test('snaps both edges for corner handle (ne)', () => {
    const result = snapEdges(bounds, 'ne', 10, 5);
    expect(result.right?.snapped).toBe(true);
    expect(result.top?.snapped).toBe(true);
  });

  test('snaps both edges for corner handle (sw)', () => {
    const result = snapEdges(bounds, 'sw', 10, 5);
    expect(result.left?.snapped).toBe(true);
    expect(result.bottom?.snapped).toBe(true);
  });
});
