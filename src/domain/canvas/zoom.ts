/**
 * Zoom utilities for canvas navigation.
 *
 * Provides constants and functions for calculating zoom levels
 * with cursor-centered zooming behavior.
 */
import type { Point } from '../../types/canvas';

// --- Zoom Constants ---

/** Minimum zoom level: 10% (0.1 scale factor) */
export const MIN_ZOOM = 0.1;

/** Maximum zoom level: 500% (5.0 scale factor) */
export const MAX_ZOOM = 5.0;

/** Zoom factor per wheel tick: 10% (multiplicative) */
export const ZOOM_FACTOR = 1.1;

// --- Zoom Functions ---

/**
 * Clamps a zoom value to the valid range [MIN_ZOOM, MAX_ZOOM].
 */
export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

/**
 * Calculates the new zoom level based on wheel delta.
 * Positive deltaY = zoom out (divide by factor)
 * Negative deltaY = zoom in (multiply by factor)
 */
export function calculateNewZoom(currentZoom: number, deltaY: number): number {
  const newZoom = deltaY < 0 ? currentZoom * ZOOM_FACTOR : currentZoom / ZOOM_FACTOR;
  return clampZoom(newZoom);
}

/**
 * Formats a zoom level as a percentage string (e.g., 1.0 → "100%").
 * Rounds to nearest integer percent.
 */
export function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}

/**
 * Calculates the pan offset adjustment needed to keep the cursor point
 * stationary when zooming.
 *
 * Algorithm:
 * 1. Get cursor position relative to canvas wrapper
 * 2. Calculate canvas-space point under cursor at old zoom
 * 3. Calculate new pan offset to keep same point under cursor at new zoom
 */
export function calculateZoomPanAdjustment(
  cursorX: number,
  cursorY: number,
  wrapperRect: DOMRect,
  currentPan: Point,
  oldZoom: number,
  newZoom: number
): Point {
  // Cursor position relative to wrapper origin
  const relX = cursorX - wrapperRect.left;
  const relY = cursorY - wrapperRect.top;

  // Canvas-space point under cursor (before zoom)
  const canvasX = (relX - currentPan.x) / oldZoom;
  const canvasY = (relY - currentPan.y) / oldZoom;

  // New pan offset to keep same canvas point under cursor
  const newPanX = relX - canvasX * newZoom;
  const newPanY = relY - canvasY * newZoom;

  return { x: newPanX, y: newPanY };
}
