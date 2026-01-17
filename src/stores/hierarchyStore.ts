import { createSignal } from 'solid-js';

import { scheduleStateSave } from './projectStore';

const [expandedIds, setExpandedIds] = createSignal<Set<string>>(new Set());

export const hierarchyStore = {
  get expandedIds() {
    return expandedIds();
  },
};

export function toggleExpanded(nodeId: string): void {
  const current = expandedIds();
  const newSet = new Set(current);
  if (newSet.has(nodeId)) {
    newSet.delete(nodeId);
  } else {
    newSet.add(nodeId);
  }
  setExpandedIds(newSet);
  scheduleStateSave();
}

export function expandNode(nodeId: string): void {
  const current = expandedIds();
  if (!current.has(nodeId)) {
    const newSet = new Set(current);
    newSet.add(nodeId);
    setExpandedIds(newSet);
    scheduleStateSave();
  }
}

export function collapseNode(nodeId: string): void {
  const current = expandedIds();
  if (current.has(nodeId)) {
    const newSet = new Set(current);
    newSet.delete(nodeId);
    setExpandedIds(newSet);
    scheduleStateSave();
  }
}

export function expandAll(nodeIds: string[]): void {
  setExpandedIds(new Set(nodeIds));
  scheduleStateSave();
}

export function isExpanded(nodeId: string): boolean {
  return expandedIds().has(nodeId);
}

export function resetHierarchy(): void {
  setExpandedIds(new Set<string>());
}

/**
 * Restore hierarchy state from a project.
 * Used when opening an existing project - does NOT trigger auto-save.
 */
export function restoreHierarchyState(nodeIds: string[]): void {
  setExpandedIds(new Set(nodeIds));
}
