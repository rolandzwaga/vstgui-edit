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
