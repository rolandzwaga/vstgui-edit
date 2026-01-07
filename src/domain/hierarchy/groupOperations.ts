import {
  addView,
  createGroupContainer,
  getParentId,
  getView,
  removeView,
  ungroupContainer,
  updateViewOrigin,
} from '../../stores/documentStore';
import { selectAll } from '../../stores/selectionStore';
import type { HistoryOperation } from '../../types/history';
import type { ViewNode } from '../../types/uidesc';
import { createGroupOperation, createUngroupOperation } from './group';

function parseOriginString(origin: string): { x: number; y: number } {
  const parts = origin.split(',').map(s => Number.parseInt(s.trim(), 10));
  return { x: parts[0] || 0, y: parts[1] || 0 };
}

export function createGroupHistoryOperation(viewIds: string[]): HistoryOperation | null {
  const groupOp = createGroupOperation(viewIds);
  if (!groupOp) return null;

  for (let i = 0; i < groupOp.viewIds.length; i++) {
    const origin = parseOriginString(groupOp.newOrigins[i]);
    updateViewOrigin(groupOp.viewIds[i], origin);
  }

  const result = createGroupContainer(groupOp.viewIds, groupOp.newContainerId, {
    origin: groupOp.containerOrigin,
    size: groupOp.containerSize,
  });

  if (!result) return null;

  selectAll([result.groupId]);

  const capturedGroupOp = groupOp;
  const capturedGroupId = result.groupId;

  return {
    type: 'group',
    description: `Group ${viewIds.length} views`,
    timestamp: Date.now(),
    undo: () => {
      const container = getView(capturedGroupId);
      if (!container?.children) return;

      const parentId = getParentId(capturedGroupId);
      if (!parentId) return;

      const restoredIds: string[] = [];
      const childEntries = Object.entries(container.children);
      for (let i = 0; i < childEntries.length; i++) {
        const [, childView] = childEntries[i];
        const originalOrigin = capturedGroupOp.originalOrigins[i];
        const clonedView: ViewNode = {
          attributes: { ...childView.attributes, origin: originalOrigin },
          children: childView.children ? { ...childView.children } : undefined,
        };
        const newId = addView(parentId, clonedView);
        if (newId) restoredIds.push(newId);
      }

      removeView(capturedGroupId);
      selectAll(restoredIds);
    },
    redo: () => {
      const parentId = capturedGroupOp.parentId;
      const currentChildIds: string[] = [];

      for (const originalId of capturedGroupOp.viewIds) {
        const childKey = originalId.split('-').pop()!;
        const currentId = `${parentId}-${childKey}`;
        const view = getView(currentId);
        if (view) {
          currentChildIds.push(currentId);
        }
      }

      if (currentChildIds.length < 2) return;

      for (let i = 0; i < currentChildIds.length; i++) {
        const origin = parseOriginString(capturedGroupOp.newOrigins[i]);
        updateViewOrigin(currentChildIds[i], origin);
      }

      const redoResult = createGroupContainer(currentChildIds, capturedGroupOp.newContainerId, {
        origin: capturedGroupOp.containerOrigin,
        size: capturedGroupOp.containerSize,
      });

      if (redoResult) {
        selectAll([redoResult.groupId]);
      }
    },
  };
}

export function createUngroupHistoryOperation(containerId: string): HistoryOperation | null {
  const ungroupOp = createUngroupOperation(containerId);
  if (!ungroupOp) return null;

  for (let i = 0; i < ungroupOp.childIds.length; i++) {
    const origin = parseOriginString(ungroupOp.childNewOrigins[i]);
    updateViewOrigin(ungroupOp.childIds[i], origin);
  }

  const result = ungroupContainer(containerId);
  if (!result) return null;

  selectAll(result.childIds);

  const capturedUngroupOp = ungroupOp;
  const capturedResultChildIds = result.childIds;

  return {
    type: 'ungroup',
    description: 'Ungroup container',
    timestamp: Date.now(),
    undo: () => {
      const viewIds = capturedResultChildIds;
      if (viewIds.length === 0) return;

      for (let i = 0; i < viewIds.length; i++) {
        const origin = parseOriginString(capturedUngroupOp.childOriginalOrigins[i]);
        updateViewOrigin(viewIds[i], origin);
      }

      const containerKey = capturedUngroupOp.containerId.split('-').pop()!;
      const redoResult = createGroupContainer(viewIds, containerKey, {
        origin: capturedUngroupOp.containerOrigin,
        size: capturedUngroupOp.containerSize,
      });

      if (redoResult) {
        selectAll([redoResult.groupId]);
      }
    },
    redo: () => {
      const container = getView(capturedUngroupOp.containerId);
      if (!container?.children) return;

      const childIds = Object.keys(container.children).map(
        k => `${capturedUngroupOp.containerId}-${k}`
      );

      for (let i = 0; i < childIds.length; i++) {
        if (i < capturedUngroupOp.childNewOrigins.length) {
          const origin = parseOriginString(capturedUngroupOp.childNewOrigins[i]);
          updateViewOrigin(childIds[i], origin);
        }
      }

      const redoResult = ungroupContainer(capturedUngroupOp.containerId);
      if (redoResult) {
        selectAll(redoResult.childIds);
      }
    },
  };
}
