import type { AttributeEntry, AttributeGroup, AttributeGroupId } from '../../types/properties';
import { GROUP_LABELS, GROUP_PRIORITY } from '../../types/properties';

export const ATTRIBUTE_GROUP_MAP: Record<string, AttributeGroupId> = {
  class: 'identity',

  origin: 'geometry',
  size: 'geometry',
  'min-size': 'geometry',
  'max-size': 'geometry',
  'autosize-to-fit-content-width': 'geometry',

  'background-color': 'appearance',
  'background-color-draw-style': 'appearance',
  opacity: 'appearance',
  bitmap: 'appearance',
  transparent: 'appearance',
  'draw-antialiased': 'appearance',
  'frame-color': 'appearance',
  'frame-width': 'appearance',

  font: 'text',
  'font-color': 'text',
  'text-alignment': 'text',
  'text-inset': 'text',
  title: 'text',
  tooltip: 'text',

  'mouse-enabled': 'behavior',
  'want-focus': 'behavior',
  'tab-navigation-order': 'behavior',
  autosize: 'behavior',
  'uidesc-label': 'behavior',
};

export function getAttributeGroup(attributeName: string): AttributeGroupId {
  return ATTRIBUTE_GROUP_MAP[attributeName] ?? 'other';
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function groupAttributes(attributes: Record<string, unknown>): AttributeGroup[] {
  const groupedEntries: Record<AttributeGroupId, AttributeEntry[]> = {
    identity: [],
    geometry: [],
    appearance: [],
    text: [],
    behavior: [],
    other: [],
  };

  for (const [name, value] of Object.entries(attributes)) {
    const groupId = getAttributeGroup(name);
    const stringValue = stringifyValue(value);

    groupedEntries[groupId].push({
      name,
      value: stringValue,
      isMixed: false,
      isCopyable: stringValue !== '',
      isUnset: false,
      editorType: 'text',
    });
  }

  for (const entries of Object.values(groupedEntries)) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  const groups: AttributeGroup[] = [];

  for (const [id, entries] of Object.entries(groupedEntries) as [
    AttributeGroupId,
    AttributeEntry[],
  ][]) {
    if (entries.length > 0) {
      groups.push({
        id,
        label: GROUP_LABELS[id],
        attributes: entries,
        priority: GROUP_PRIORITY[id],
      });
    }
  }

  groups.sort((a, b) => a.priority - b.priority);

  return groups;
}
