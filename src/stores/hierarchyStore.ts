import { createSignal } from 'solid-js';

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
}

export function expandNode(nodeId: string): void {
  const current = expandedIds();
  if (!current.has(nodeId)) {
    const newSet = new Set(current);
    newSet.add(nodeId);
    setExpandedIds(newSet);
  }
}

export function collapseNode(nodeId: string): void {
  const current = expandedIds();
  if (current.has(nodeId)) {
    const newSet = new Set(current);
    newSet.delete(nodeId);
    setExpandedIds(newSet);
  }
}

export function expandAll(nodeIds: string[]): void {
  setExpandedIds(new Set(nodeIds));
}

export function isExpanded(nodeId: string): boolean {
  return expandedIds().has(nodeId);
}

export function resetHierarchy(): void {
  setExpandedIds(new Set<string>());
}
