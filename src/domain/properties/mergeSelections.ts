import type {
  AttributeEntry,
  AttributeGroup,
  AttributeGroupId,
  GroupedAttributes,
} from '../../types/properties';
import { GROUP_LABELS, GROUP_PRIORITY } from '../../types/properties';
import { getAttributeGroup } from './groupAttributes';

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

export function mergeSelections(
  viewAttributes: Array<Record<string, unknown>>,
  classNames: string[]
): GroupedAttributes {
  if (viewAttributes.length === 0) {
    return {
      groups: [],
      selectionCount: 0,
      className: null,
      sameClass: false,
    };
  }

  const selectionCount = viewAttributes.length;
  const uniqueClasses = new Set(classNames);
  const sameClass = uniqueClasses.size === 1;
  const className = sameClass ? classNames[0] : null;

  const allAttrNames = new Set<string>();
  for (const attrs of viewAttributes) {
    for (const name of Object.keys(attrs)) {
      allAttrNames.add(name);
    }
  }

  const groupedEntries: Record<AttributeGroupId, AttributeEntry[]> = {
    identity: [],
    geometry: [],
    appearance: [],
    text: [],
    behavior: [],
    other: [],
  };

  for (const attrName of allAttrNames) {
    const values: string[] = [];
    let allHaveAttribute = true;

    for (const attrs of viewAttributes) {
      if (attrName in attrs) {
        values.push(stringifyValue(attrs[attrName]));
      } else {
        allHaveAttribute = false;
      }
    }

    if (values.length === 0) {
      continue;
    }

    const uniqueValues = new Set(values);
    const isMixed = !allHaveAttribute || uniqueValues.size > 1;
    const value = isMixed ? null : values[0];
    const isCopyable = !isMixed && value !== '';

    const groupId = getAttributeGroup(attrName);
    groupedEntries[groupId].push({
      name: attrName,
      value,
      isMixed,
      isCopyable,
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

  return {
    groups,
    selectionCount,
    className,
    sameClass,
  };
}
