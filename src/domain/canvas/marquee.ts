import type { RenderableView } from '../../types/canvas';
import type { MarqueeRect } from '../../types/marquee';
import type { CanvasPoint } from '../../types/selection';

export const MIN_MARQUEE_SIZE = 5;

export function normalizeRect(start: CanvasPoint, current: CanvasPoint): MarqueeRect {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  return { x, y, width, height };
}

export function isMinimumSize(start: CanvasPoint, current: CanvasPoint): boolean {
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  return width >= MIN_MARQUEE_SIZE && height >= MIN_MARQUEE_SIZE;
}

export function rectIntersect(a: MarqueeRect, b: MarqueeRect): boolean {
  if (a.width === 0 || a.height === 0 || b.width === 0 || b.height === 0) {
    return false;
  }

  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  return !(aRight < b.x || a.x > bRight || aBottom < b.y || a.y > bBottom);
}

export function findIntersectingViews(marqueeRect: MarqueeRect, views: RenderableView[]): string[] {
  return views
    .filter(view => {
      const viewRect: MarqueeRect = {
        x: view.absoluteX,
        y: view.absoluteY,
        width: view.width,
        height: view.height,
      };
      return rectIntersect(marqueeRect, viewRect);
    })
    .map(view => view.id);
}
