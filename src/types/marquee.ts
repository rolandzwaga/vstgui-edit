import type { CanvasPoint } from './selection';

export interface MarqueeState {
  isActive: boolean;
  startPoint: CanvasPoint | null;
  currentPoint: CanvasPoint | null;
  isAdditive: boolean;
  previousSelection: Set<string>;
}

export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
