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

export function findEdgeAlignments(dragged: ViewBounds, siblings: ViewBounds[]): SmartGuide[] {
  const guides: SmartGuide[] = [];

  for (const sibling of siblings) {
    if (sibling.id === dragged.id) continue;

    if (isWithinThreshold(dragged.left - sibling.left)) {
      guides.push(createGuide('vertical', sibling.left, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.left - sibling.right)) {
      guides.push(createGuide('vertical', sibling.right, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.right - sibling.right)) {
      guides.push(createGuide('vertical', sibling.right, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.right - sibling.left)) {
      guides.push(createGuide('vertical', sibling.left, 'edge', [dragged.id, sibling.id]));
    }

    if (isWithinThreshold(dragged.top - sibling.top)) {
      guides.push(createGuide('horizontal', sibling.top, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.top - sibling.bottom)) {
      guides.push(createGuide('horizontal', sibling.bottom, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.bottom - sibling.bottom)) {
      guides.push(createGuide('horizontal', sibling.bottom, 'edge', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.bottom - sibling.top)) {
      guides.push(createGuide('horizontal', sibling.top, 'edge', [dragged.id, sibling.id]));
    }
  }

  return guides;
}

export function findCenterAlignments(dragged: ViewBounds, siblings: ViewBounds[]): SmartGuide[] {
  const guides: SmartGuide[] = [];

  for (const sibling of siblings) {
    if (sibling.id === dragged.id) continue;

    if (isWithinThreshold(dragged.centerX - sibling.centerX)) {
      guides.push(createGuide('vertical', sibling.centerX, 'center', [dragged.id, sibling.id]));
    }
    if (isWithinThreshold(dragged.centerY - sibling.centerY)) {
      guides.push(createGuide('horizontal', sibling.centerY, 'center', [dragged.id, sibling.id]));
    }
  }

  return guides;
}

export function calculateSmartGuides(dragged: ViewBounds, siblings: ViewBounds[]): SmartGuide[] {
  const filteredSiblings = siblings.filter(s => s.id !== dragged.id);

  if (filteredSiblings.length === 0) {
    return [];
  }

  const edgeGuides = findEdgeAlignments(dragged, filteredSiblings);
  const centerGuides = findCenterAlignments(dragged, filteredSiblings);
  const allGuides = [...edgeGuides, ...centerGuides];

  const uniqueGuides = new Map<string, SmartGuide>();
  for (const guide of allGuides) {
    const key = `${guide.orientation}-${guide.position}`;
    if (!uniqueGuides.has(key)) {
      uniqueGuides.set(key, guide);
    }
  }

  return Array.from(uniqueGuides.values());
}
