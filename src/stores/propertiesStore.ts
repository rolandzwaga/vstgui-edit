import { createSignal } from 'solid-js';
import type { AttributeGroupId } from '../types/properties';
import { ALL_GROUP_IDS } from '../types/properties';
import { scheduleStateSave } from './projectStore';

const [expandedGroups, setExpandedGroups] = createSignal<Set<AttributeGroupId>>(
  new Set(ALL_GROUP_IDS.filter(id => id !== 'identity'))
);

export const propertiesStore = {
  get expandedGroups() {
    return expandedGroups();
  },
};

export function toggleGroup(groupId: AttributeGroupId): void {
  if (groupId === 'identity') return;

  const current = expandedGroups();
  const newSet = new Set(current);

  if (newSet.has(groupId)) {
    newSet.delete(groupId);
  } else {
    newSet.add(groupId);
  }

  setExpandedGroups(newSet);
  scheduleStateSave();
}

export function expandGroup(groupId: AttributeGroupId): void {
  if (groupId === 'identity') return;

  const current = expandedGroups();
  if (!current.has(groupId)) {
    const newSet = new Set(current);
    newSet.add(groupId);
    setExpandedGroups(newSet);
    scheduleStateSave();
  }
}

export function collapseGroup(groupId: AttributeGroupId): void {
  if (groupId === 'identity') return;

  const current = expandedGroups();
  if (current.has(groupId)) {
    const newSet = new Set(current);
    newSet.delete(groupId);
    setExpandedGroups(newSet);
    scheduleStateSave();
  }
}

export function isGroupExpanded(groupId: AttributeGroupId): boolean {
  if (groupId === 'identity') return true;
  return expandedGroups().has(groupId);
}

export function resetProperties(): void {
  setExpandedGroups(new Set(ALL_GROUP_IDS.filter(id => id !== 'identity')));
}

/**
 * Restore properties state from a project.
 * Used when opening an existing project - does NOT trigger auto-save.
 */
export function restorePropertiesState(groupIds: string[]): void {
  // Filter to only valid group IDs and exclude 'identity'
  const validGroupIds = groupIds.filter(
    (id): id is AttributeGroupId =>
      ALL_GROUP_IDS.includes(id as AttributeGroupId) && id !== 'identity'
  );
  setExpandedGroups(new Set(validGroupIds));
}
