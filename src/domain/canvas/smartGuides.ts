import type { RenderableView } from '../../types/canvas';
import type { GuideOrientation, GuideType, SmartGuide, ViewBounds } from '../../types/smartGuides';

export const GUIDE_THRESHOLD = 5;

let guideCounter = 0;

export function getViewBounds(view: RenderableView): ViewBounds {
  const left = view.absoluteX;
  const top = view.absoluteY;
  const right = left + view.width;
  const bottom = top + view.height;

  return {
    id: view.id,
    left,
    right,
    top,
    bottom,
    centerX: left + view.width / 2,
    centerY: top + view.height / 2,
  };
}

export function isWithinThreshold(distance: number): boolean {
  return Math.abs(distance) <= GUIDE_THRESHOLD;
}

export function createGuide(
  orientation: GuideOrientation,
  position: number,
  type: GuideType,
  participatingViewIds: string[]
): SmartGuide {
  guideCounter += 1;
  return {
    id: `${orientation}-${type}-${guideCounter}`,
    orientation,
    position,
    type,
    participatingViewIds,
  };
}
