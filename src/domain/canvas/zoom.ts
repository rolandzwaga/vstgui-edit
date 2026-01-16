/**
 * Zoom utilities for canvas navigation.
 *
 * Provides constants and functions for calculating zoom levels
 * with top-left anchored zooming behavior.
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
 * Calculates the pan offset adjustment needed when zooming.
 *
 * Uses top-left anchored zoom: the canvas origin (0,0) stays at the same
 * screen position. Since screen position of (0,0) = panOffset, no adjustment
 * is needed - we simply return the current pan unchanged.
 *
 * Note: Parameters are kept for API compatibility, allowing easy switch
 * back to cursor-centered zoom if needed.
 */
export function calculateZoomPanAdjustment(
  _cursorX: number,
  _cursorY: number,
  _wrapperRect: DOMRect,
  currentPan: Point,
  _oldZoom: number,
  _newZoom: number
): Point {
  // Top-left anchored zoom: canvas origin (0,0) stays at same screen position
  // Screen position of (0,0) = currentPan, so no adjustment needed
  return { x: currentPan.x, y: currentPan.y };
}
