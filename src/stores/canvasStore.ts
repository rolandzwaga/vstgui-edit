/**
 * Canvas Store - Pan and zoom state management for canvas navigation.
 *
 * Uses SolidJS signals for reactive state with fine-grained updates.
 */
import { createSignal } from 'solid-js';
import { calculateFitZoom, type Size } from '../domain/canvas/fitToView';
import {
  calculateNewZoom,
  calculateZoomPanAdjustment,
  clampZoom,
  ZOOM_FACTOR,
} from '../domain/canvas/zoom';
import type { Point } from '../types/canvas';
import { scheduleStateSave } from './projectStore';

// --- Signals for pan state ---

const [panOffset, setPanOffset] = createSignal<Point>({ x: 0, y: 0 });
const [isPanning, setIsPanning] = createSignal(false);
const [panStart, setPanStart] = createSignal<Point | null>(null);

// --- Signals for zoom state ---

const [zoomLevel, setZoomLevel] = createSignal(1.0);

// --- Reactive store object ---

/**
 * Reactive canvas store exposing pan and zoom state.
 * Access values as getters (they are signals).
 */
export const canvasStore = {
  get panOffset() {
    return panOffset();
  },
  get isPanning() {
    return isPanning();
  },
  get panStart() {
    return panStart();
  },
  get zoomLevel() {
    return zoomLevel();
  },
};

// --- Actions ---

/**
 * Start a pan gesture at the given mouse position.
 * Sets isPanning to true and records the start position.
 */
export function startPan(x: number, y: number): void {
  setIsPanning(true);
  setPanStart({ x, y });
}

/**
 * Update pan during a drag gesture.
 * Calculates delta from panStart and adds it to panOffset.
 * Updates panStart to current position for next delta calculation.
 */
export function updatePan(x: number, y: number): void {
  const start = panStart();
  if (!isPanning() || !start) {
    return;
  }

  const deltaX = x - start.x;
  const deltaY = y - start.y;

  setPanOffset(current => ({
    x: current.x + deltaX,
    y: current.y + deltaY,
  }));

  setPanStart({ x, y });
}

/**
 * End the current pan gesture.
 * Preserves panOffset for the next gesture.
 * Schedules state save for project persistence.
 */
export function endPan(): void {
  setIsPanning(false);
  setPanStart(null);
  scheduleStateSave();
}

/**
 * Reset all pan state to initial values.
 */
export function resetPan(): void {
  setPanOffset({ x: 0, y: 0 });
  setIsPanning(false);
  setPanStart(null);
}

// --- Zoom Actions ---

/**
 * Set the zoom level, clamped to valid range [MIN_ZOOM, MAX_ZOOM].
 * Schedules state save for project persistence.
 */
export function setZoom(level: number): void {
  setZoomLevel(clampZoom(level));
  scheduleStateSave();
}

/**
 * Reset zoom level to default (1.0 = 100%).
 */
export function resetZoom(): void {
  setZoomLevel(1.0);
}

/**
 * Zoom in by one step (multiply by ZOOM_FACTOR).
 * Schedules state save for project persistence.
 */
export function zoomIn(): void {
  setZoomLevel(clampZoom(zoomLevel() * ZOOM_FACTOR));
  scheduleStateSave();
}

/**
 * Zoom out by one step (divide by ZOOM_FACTOR).
 * Schedules state save for project persistence.
 */
export function zoomOut(): void {
  setZoomLevel(clampZoom(zoomLevel() / ZOOM_FACTOR));
  scheduleStateSave();
}

/**
 * Reset all canvas state (pan and zoom) to initial values.
 * Call this when loading a new document.
 */
export function resetCanvas(): void {
  resetPan();
  resetZoom();
}

/**
 * Apply zoom based on wheel delta, centered on cursor position.
 * Adjusts both zoom level and pan offset to keep the point under cursor stationary.
 * Schedules state save for project persistence.
 */
export function applyZoom(
  cursorX: number,
  cursorY: number,
  wrapperRect: DOMRect,
  deltaY: number
): void {
  const oldZoom = zoomLevel();
  const newZoom = calculateNewZoom(oldZoom, deltaY);

  // Only update if zoom actually changed (not clamped at limits)
  if (newZoom !== oldZoom) {
    const newPan = calculateZoomPanAdjustment(
      cursorX,
      cursorY,
      wrapperRect,
      panOffset(),
      oldZoom,
      newZoom
    );

    setPanOffset(newPan);
    setZoomLevel(newZoom);
    scheduleStateSave();
  }
}

/**
 * Fit the template to the viewport with padding.
 * Sets zoom and pan to center the template in the viewport.
 * Schedules state save for project persistence.
 */
export function fitToView(viewportSize: Size, templateSize: Size): void {
  const result = calculateFitZoom(templateSize, viewportSize);
  setZoomLevel(result.zoom);
  setPanOffset({ x: result.panX, y: result.panY });
  scheduleStateSave();
}

/**
 * Restore canvas state from a project.
 * Used when opening an existing project - does NOT trigger auto-save.
 */
export function restoreCanvasState(pan: Point, zoom: number): void {
  setPanOffset({ x: pan.x, y: pan.y });
  setZoomLevel(clampZoom(zoom));
}
