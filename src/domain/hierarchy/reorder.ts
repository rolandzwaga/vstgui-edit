import { getChildIds, getParentId } from '../../stores/documentStore';
import type { DropInfo, DropPosition, ReorderOperation } from '../../types/hierarchy';

export function validateReorder(
  viewId: string,
  targetId: string,
  position: DropPosition
): DropInfo {
  if (viewId === targetId) {
    return { targetId, position, isValid: false, invalidReason: 'self-drop' };
  }

  const viewParentId = getParentId(viewId);
  const targetParentId = getParentId(targetId);

  if (!viewParentId || !targetParentId || viewParentId !== targetParentId) {
    return { targetId, position, isValid: false, invalidReason: 'different-parents' };
  }

  return { targetId, position, isValid: true };
}

export function getDropPosition(offsetY: number, elementHeight: number): DropPosition {
  const thirdHeight = elementHeight / 3;

  if (offsetY < thirdHeight) {
    return 'before';
  }
  if (offsetY < thirdHeight * 2) {
    return 'inside';
  }
  return 'after';
}

export function createReorderOperation(
  viewId: string,
  targetId: string,
  position: DropPosition
): ReorderOperation | null {
  if (position === 'inside') {
    return null;
  }

  const validation = validateReorder(viewId, targetId, position);
  if (!validation.isValid) {
    return null;
  }

  const parentId = getParentId(viewId);
  if (!parentId) {
    return null;
  }

  const siblings = getChildIds(parentId);
  const oldIndex = siblings.indexOf(viewId);
  const targetIndex = siblings.indexOf(targetId);

  if (oldIndex === -1 || targetIndex === -1) {
    return null;
  }

  let newIndex: number;
  if (position === 'before') {
    newIndex = oldIndex < targetIndex ? targetIndex - 1 : targetIndex;
  } else {
    newIndex = oldIndex < targetIndex ? targetIndex : targetIndex + 1;
  }

  if (newIndex < 0) {
    newIndex = 0;
  }
  if (newIndex >= siblings.length) {
    newIndex = siblings.length - 1;
  }

  if (oldIndex === newIndex) {
    return null;
  }

  return {
    viewId,
    parentId,
    oldIndex,
    newIndex,
  };
}

export interface MultiReorderOperation {
  operations: ReorderOperation[];
  parentId: string;
}

export function createMultiReorderOperation(
  viewIds: string[],
  targetId: string,
  position: DropPosition
): MultiReorderOperation | null {
  if (viewIds.length === 0 || position === 'inside') return null;

  const parentId = getParentId(viewIds[0]);
  if (!parentId) return null;

  for (const viewId of viewIds) {
    const viewParentId = getParentId(viewId);
    if (viewParentId !== parentId) return null;
  }

  const targetParentId = getParentId(targetId);
  if (targetParentId !== parentId) return null;

  const siblings = getChildIds(parentId);
  const targetIndex = siblings.indexOf(targetId);
  if (targetIndex === -1) return null;

  const sortedViewIds = [...viewIds].sort((a, b) => {
    const indexA = siblings.indexOf(a);
    const indexB = siblings.indexOf(b);
    return indexA - indexB;
  });

  const operations: ReorderOperation[] = [];
  const oldIndices = sortedViewIds.map(id => siblings.indexOf(id));

  let insertionPoint: number;
  if (position === 'before') {
    insertionPoint = targetIndex;
  } else {
    insertionPoint = targetIndex + 1;
  }

  const selectedBefore = oldIndices.filter(i => i < insertionPoint).length;
  const adjustedInsertionPoint = insertionPoint - selectedBefore;

  for (let i = 0; i < sortedViewIds.length; i++) {
    const viewId = sortedViewIds[i];
    const oldIndex = oldIndices[i];
    const newIndex = Math.min(adjustedInsertionPoint + i, siblings.length - 1);

    if (oldIndex !== newIndex) {
      operations.push({
        viewId,
        parentId,
        oldIndex,
        newIndex,
      });
    }
  }

  if (operations.length === 0) return null;

  return { operations, parentId };
}
