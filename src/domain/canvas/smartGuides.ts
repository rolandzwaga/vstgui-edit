import type { RenderableView } from '../../types/canvas';
import type {
  GuideOrientation,
  GuideType,
  SmartGuide,
  SpacingGuide,
  ViewBounds,
} from '../../types/smartGuides';

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

export function findParentCenterGuides(
  dragged: ViewBounds,
  parent: ViewBounds | null | undefined
): SmartGuide[] {
  if (!parent) {
    return [];
  }

  const guides: SmartGuide[] = [];

  if (isWithinThreshold(dragged.centerX - parent.centerX)) {
    guides.push(createGuide('vertical', parent.centerX, 'parent-center', [dragged.id, parent.id]));
  }

  if (isWithinThreshold(dragged.centerY - parent.centerY)) {
    guides.push(
      createGuide('horizontal', parent.centerY, 'parent-center', [dragged.id, parent.id])
    );
  }

  return guides;
}

function createSpacingGuide(
  orientation: GuideOrientation,
  position: number,
  distance: number,
  measureStart: number,
  measureEnd: number,
  participatingViewIds: string[]
): SpacingGuide {
  guideCounter += 1;
  return {
    id: `${orientation}-spacing-${guideCounter}`,
    orientation,
    position,
    type: 'spacing',
    participatingViewIds,
    distance,
    measureStart,
    measureEnd,
  };
}

function viewsOverlapVertically(a: ViewBounds, b: ViewBounds): boolean {
  return a.top < b.bottom && a.bottom > b.top;
}

function viewsOverlapHorizontally(a: ViewBounds, b: ViewBounds): boolean {
  return a.left < b.right && a.right > b.left;
}

export function findSpacingGuides(dragged: ViewBounds, siblings: ViewBounds[]): SpacingGuide[] {
  const filtered = siblings.filter(s => s.id !== dragged.id);
  if (filtered.length < 2) {
    return [];
  }

  const guides: SpacingGuide[] = [];

  const horizontallyAligned = filtered.filter(s => viewsOverlapVertically(dragged, s));
  if (horizontallyAligned.length >= 2) {
    const leftNeighbors = horizontallyAligned.filter(s => s.right <= dragged.left);
    const rightNeighbors = horizontallyAligned.filter(s => s.left >= dragged.right);

    for (const leftSibling of leftNeighbors) {
      for (const rightSibling of rightNeighbors) {
        const leftGap = dragged.left - leftSibling.right;
        const rightGap = rightSibling.left - dragged.right;

        if (leftGap > 0 && rightGap > 0 && isWithinThreshold(leftGap - rightGap)) {
          const avgDistance = (leftGap + rightGap) / 2;
          const leftMidpoint = leftSibling.right + leftGap / 2;
          const rightMidpoint = dragged.right + rightGap / 2;

          guides.push(
            createSpacingGuide(
              'horizontal',
              leftMidpoint,
              avgDistance,
              leftSibling.right,
              dragged.left,
              [dragged.id, leftSibling.id, rightSibling.id]
            )
          );
          guides.push(
            createSpacingGuide(
              'horizontal',
              rightMidpoint,
              avgDistance,
              dragged.right,
              rightSibling.left,
              [dragged.id, leftSibling.id, rightSibling.id]
            )
          );
        }
      }
    }
  }

  const verticallyAligned = filtered.filter(s => viewsOverlapHorizontally(dragged, s));
  if (verticallyAligned.length >= 2) {
    const topNeighbors = verticallyAligned.filter(s => s.bottom <= dragged.top);
    const bottomNeighbors = verticallyAligned.filter(s => s.top >= dragged.bottom);

    for (const topSibling of topNeighbors) {
      for (const bottomSibling of bottomNeighbors) {
        const topGap = dragged.top - topSibling.bottom;
        const bottomGap = bottomSibling.top - dragged.bottom;

        if (topGap > 0 && bottomGap > 0 && isWithinThreshold(topGap - bottomGap)) {
          const avgDistance = (topGap + bottomGap) / 2;
          const topMidpoint = topSibling.bottom + topGap / 2;
          const bottomMidpoint = dragged.bottom + bottomGap / 2;

          guides.push(
            createSpacingGuide(
              'vertical',
              topMidpoint,
              avgDistance,
              topSibling.bottom,
              dragged.top,
              [dragged.id, topSibling.id, bottomSibling.id]
            )
          );
          guides.push(
            createSpacingGuide(
              'vertical',
              bottomMidpoint,
              avgDistance,
              dragged.bottom,
              bottomSibling.top,
              [dragged.id, topSibling.id, bottomSibling.id]
            )
          );
        }
      }
    }
  }

  return guides;
}

export function calculateSmartGuides(
  dragged: ViewBounds,
  siblings: ViewBounds[],
  parentBounds?: ViewBounds | null
): SmartGuide[] {
  const filteredSiblings = siblings.filter(s => s.id !== dragged.id);
  const allGuides: SmartGuide[] = [];

  if (filteredSiblings.length > 0) {
    allGuides.push(...findEdgeAlignments(dragged, filteredSiblings));
    allGuides.push(...findCenterAlignments(dragged, filteredSiblings));
    allGuides.push(...findSpacingGuides(dragged, filteredSiblings));
  }

  if (parentBounds) {
    allGuides.push(...findParentCenterGuides(dragged, parentBounds));
  }

  if (allGuides.length === 0) {
    return [];
  }

  const uniqueGuides = new Map<string, SmartGuide>();
  for (const guide of allGuides) {
    const key = `${guide.orientation}-${guide.position}-${guide.type}`;
    if (!uniqueGuides.has(key)) {
      uniqueGuides.set(key, guide);
    }
  }

  return Array.from(uniqueGuides.values());
}
