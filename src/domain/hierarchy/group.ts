import { getChildIds, getChildIndex, getParentId, getView } from '../../stores/documentStore';
import type { GroupOperation, UngroupOperation } from '../../types/hierarchy';
import { parsePoint } from '../canvas';

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

export interface GroupValidationResult {
  isValid: boolean;
  reason?: 'need-multiple' | 'different-parents';
}

export function validateGroup(viewIds: string[]): GroupValidationResult {
  if (viewIds.length < 2) {
    return { isValid: false, reason: 'need-multiple' };
  }

  const parentIds = viewIds.map(id => getParentId(id));
  const firstParentId = parentIds[0];

  if (!firstParentId || parentIds.some(p => p !== firstParentId)) {
    return { isValid: false, reason: 'different-parents' };
  }

  return { isValid: true };
}

export interface GroupBounds {
  origin: string;
  size: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function parseSize(size: string | undefined): { width: number; height: number } {
  if (!size) return { width: 0, height: 0 };
  const parts = size.split(',').map(p => Number.parseInt(p.trim(), 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return { width: 0, height: 0 };
  }
  return { width: parts[0], height: parts[1] };
}

export function calculateGroupBounds(viewIds: string[]): GroupBounds | null {
  if (viewIds.length === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const viewId of viewIds) {
    const view = getView(viewId);
    if (!view) return null;

    const origin = parsePoint(view.attributes.origin);
    const size = parseSize(view.attributes.size);

    minX = Math.min(minX, origin.x);
    minY = Math.min(minY, origin.y);
    maxX = Math.max(maxX, origin.x + size.width);
    maxY = Math.max(maxY, origin.y + size.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    origin: `${minX}, ${minY}`,
    size: `${width}, ${height}`,
    minX,
    minY,
    maxX,
    maxY,
  };
}

let groupCounter = 0;

function generateGroupId(): string {
  groupCounter++;
  return `group-${groupCounter}`;
}

export function createGroupOperation(viewIds: string[]): GroupOperation | null {
  const validation = validateGroup(viewIds);
  if (!validation.isValid) return null;

  const bounds = calculateGroupBounds(viewIds);
  if (!bounds) return null;

  const parentId = getParentId(viewIds[0]);
  if (!parentId) return null;

  const originalIndices: number[] = [];
  const originalOrigins: string[] = [];
  const newOrigins: string[] = [];

  for (const viewId of viewIds) {
    const view = getView(viewId);
    if (!view) return null;

    originalIndices.push(getChildIndex(viewId));
    originalOrigins.push(view.attributes.origin || '0, 0');

    const origin = parsePoint(view.attributes.origin);
    const relativeX = origin.x - bounds.minX;
    const relativeY = origin.y - bounds.minY;
    newOrigins.push(`${relativeX}, ${relativeY}`);
  }

  return {
    viewIds,
    parentId,
    originalIndices,
    originalOrigins,
    newContainerId: generateGroupId(),
    containerOrigin: bounds.origin,
    containerSize: bounds.size,
    newOrigins,
  };
}

export interface UngroupValidationResult {
  isValid: boolean;
  reason?: 'is-root' | 'not-container' | 'not-found';
}

export function validateUngroup(containerId: string): UngroupValidationResult {
  const parentId = getParentId(containerId);
  if (!parentId) {
    return { isValid: false, reason: 'is-root' };
  }

  const view = getView(containerId);
  if (!view) {
    return { isValid: false, reason: 'not-found' };
  }

  if (!isContainerClass(view.attributes.class)) {
    return { isValid: false, reason: 'not-container' };
  }

  return { isValid: true };
}

export function createUngroupOperation(containerId: string): UngroupOperation | null {
  const validation = validateUngroup(containerId);
  if (!validation.isValid) return null;

  const parentId = getParentId(containerId);
  if (!parentId) return null;

  const container = getView(containerId);
  if (!container) return null;

  const containerOrigin = container.attributes.origin || '0, 0';
  const containerSize = container.attributes.size || '0, 0';
  const containerIndex = getChildIndex(containerId);

  const containerAttrs = parsePoint(containerOrigin);

  const containerAttributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(container.attributes)) {
    if (typeof value === 'string') {
      containerAttributes[key] = value;
    }
  }

  const childIds = getChildIds(containerId);
  const childOriginalOrigins: string[] = [];
  const childNewOrigins: string[] = [];

  for (const childId of childIds) {
    const child = getView(childId);
    if (!child) continue;

    const childOrigin = child.attributes.origin || '0, 0';
    childOriginalOrigins.push(childOrigin);

    const origin = parsePoint(childOrigin);
    const newX = origin.x + containerAttrs.x;
    const newY = origin.y + containerAttrs.y;
    childNewOrigins.push(`${newX}, ${newY}`);
  }

  return {
    containerId,
    parentId,
    containerIndex,
    containerOrigin,
    containerSize,
    containerAttributes,
    childIds,
    childOriginalOrigins,
    childNewOrigins,
  };
}
