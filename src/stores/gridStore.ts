import { createSignal } from 'solid-js';
import type { GridSizePreset, GridStyle } from '../types/grid';
import { DEFAULT_SNAP_THRESHOLD } from '../types/snap';

export const GRID_SIZE_PRESETS: GridSizePreset[] = [5, 8, 10, 12, 16, 20];
export const DEFAULT_GRID_SIZE: GridSizePreset = 10;
export const DEFAULT_GRID_STYLE: GridStyle = 'lines';
export const MAJOR_LINE_INTERVAL = 5;

const MIN_SNAP_THRESHOLD = 1;
const MAX_SNAP_THRESHOLD = 20;

const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [size, setSize] = createSignal<GridSizePreset>(DEFAULT_GRID_SIZE);
const [style, setStyle] = createSignal<GridStyle>(DEFAULT_GRID_STYLE);
const [isSnapEnabled, setIsSnapEnabled] = createSignal<boolean>(true);
const [snapThreshold, setSnapThresholdSignal] = createSignal<number>(DEFAULT_SNAP_THRESHOLD);

export const gridStore = {
  get isVisible() {
    return isVisible();
  },
  get size() {
    return size();
  },
  get style() {
    return style();
  },
  get isSnapEnabled() {
    return isSnapEnabled();
  },
  get snapThreshold() {
    return snapThreshold();
  },
};

export function toggleVisibility(): void {
  setIsVisible(current => !current);
}

export function setGridSize(newSize: GridSizePreset): void {
  setSize(newSize);
}

export function setGridStyle(newStyle: GridStyle): void {
  setStyle(newStyle);
}

export function toggleSnap(): void {
  setIsSnapEnabled(current => !current);
}

export function setSnapThreshold(threshold: number): void {
  const clamped = Math.max(MIN_SNAP_THRESHOLD, Math.min(MAX_SNAP_THRESHOLD, threshold));
  setSnapThresholdSignal(clamped);
}

export function resetGrid(): void {
  setIsVisible(true);
  setSize(DEFAULT_GRID_SIZE);
  setStyle(DEFAULT_GRID_STYLE);
  setIsSnapEnabled(true);
  setSnapThresholdSignal(DEFAULT_SNAP_THRESHOLD);
}
