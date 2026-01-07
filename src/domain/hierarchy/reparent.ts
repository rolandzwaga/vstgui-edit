import { getChildIndex, getParentId, getView } from '../../stores/documentStore';
import type { DropInfo, ReparentOperation } from '../../types/hierarchy';
import { formatOrigin, parsePoint } from '../canvas';

const CONTAINER_CLASSES = [
  'CViewContainer',
  'CScrollView',
  'CSplitView',
  'CRowColumnView',
  'CLayeredViewContainer',
  'CShadowViewContainer',
  'CAutoLayoutContainerView',
];

function isContainerClass(className: string | undefined): boolean {
  if (!className) return false;
  return CONTAINER_CLASSES.includes(className);
}

export function isDescendantOf(targetId: string, sourceId: string): boolean {
  if (targetId === sourceId) return false;
  return targetId.startsWith(`${sourceId}-`);
}

export function validateReparent(viewId: string, targetId: string): DropInfo {
  if (viewId === targetId) {
    return { targetId, position: 'inside', isValid: false, invalidReason: 'self-drop' };
  }

  if (isDescendantOf(targetId, viewId)) {
    return { targetId, position: 'inside', isValid: false, invalidReason: 'circular' };
  }

  const targetView = getView(targetId);
  if (!targetView) {
    return { targetId, position: 'inside', isValid: false };
  }

  const targetClass = targetView.attributes.class;
  if (!isContainerClass(targetClass)) {
    return { targetId, position: 'inside', isValid: false, invalidReason: 'non-container' };
  }

  return { targetId, position: 'inside', isValid: true };
}

function getAbsoluteOrigin(viewId: string): { x: number; y: number } | null {
  const parts = viewId.split('-');
  let absoluteX = 0;
  let absoluteY = 0;

  let currentId = parts[0];
  const view = getView(currentId);
  if (!view) return null;

  const rootOrigin = parsePoint(view.attributes.origin);
  absoluteX += rootOrigin.x;
  absoluteY += rootOrigin.y;

  for (let i = 1; i < parts.length; i++) {
    currentId = `${currentId}-${parts[i]}`;
    const currentView = getView(currentId);
    if (!currentView) return null;

    const origin = parsePoint(currentView.attributes.origin);
    absoluteX += origin.x;
    absoluteY += origin.y;
  }

  return { x: absoluteX, y: absoluteY };
}

function getContainerAbsoluteOrigin(containerId: string): { x: number; y: number } | null {
  const parts = containerId.split('-');
  let absoluteX = 0;
  let absoluteY = 0;

  let currentId = parts[0];

  for (let i = 0; i <= parts.length - 1; i++) {
    if (i > 0) {
      currentId = `${currentId}-${parts[i]}`;
    }
    const currentView = getView(currentId);
    if (!currentView) return null;

    const origin = parsePoint(currentView.attributes.origin);
    absoluteX += origin.x;
    absoluteY += origin.y;
  }

  return { x: absoluteX, y: absoluteY };
}

export function calculateNewOrigin(
  viewId: string,
  _oldParentId: string,
  newParentId: string
): string | null {
  const viewAbsolute = getAbsoluteOrigin(viewId);
  if (!viewAbsolute) return null;

  const newParentAbsolute = getContainerAbsoluteOrigin(newParentId);
  if (!newParentAbsolute) return null;

  const newRelativeX = viewAbsolute.x - newParentAbsolute.x;
  const newRelativeY = viewAbsolute.y - newParentAbsolute.y;

  return formatOrigin({ x: newRelativeX, y: newRelativeY });
}

export function createReparentOperation(
  viewId: string,
  targetId: string
): ReparentOperation | null {
  const validation = validateReparent(viewId, targetId);
  if (!validation.isValid) return null;

  const oldParentId = getParentId(viewId);
  if (!oldParentId) return null;

  const view = getView(viewId);
  if (!view) return null;

  const oldOrigin = view.attributes.origin || '0, 0';
  const oldIndex = getChildIndex(viewId);

  const newOrigin = calculateNewOrigin(viewId, oldParentId, targetId);
  if (!newOrigin) return null;

  return {
    viewId,
    oldParentId,
    oldIndex,
    oldOrigin,
    newParentId: targetId,
    newOrigin,
  };
}
