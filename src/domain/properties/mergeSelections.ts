import type {
  AttributeEntry,
  AttributeGroup,
  AttributeGroupId,
  GroupedAttributes,
} from '../../types/properties';
import { GROUP_LABELS, GROUP_PRIORITY } from '../../types/properties';
import { getAttributeConfig } from './attributeTypes';
import { getAttributeGroup } from './groupAttributes';
import { findCommonBaseClass, getAttributesForClass } from './schemaAttributes';

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

  const groupedEntries: Record<AttributeGroupId, AttributeEntry[]> = {
    identity: [],
    geometry: [],
    appearance: [],
    text: [],
    behavior: [],
    other: [],
  };

  const effectiveClass = sameClass ? classNames[0] : findCommonBaseClass(classNames);
  const schemaInfo = getAttributesForClass(effectiveClass);
  const schemaAttrMap = new Map(schemaInfo.attributes.map(a => [a.name, a]));

  for (const schemaDef of schemaInfo.attributes) {
    const attrName = schemaDef.name;
    const values: string[] = [];
    let anyHasAttribute = false;
    let allHaveAttribute = true;

    for (const attrs of viewAttributes) {
      if (attrName in attrs) {
        anyHasAttribute = true;
        values.push(stringifyValue(attrs[attrName]));
      } else {
        allHaveAttribute = false;
      }
    }

    const isUnset = !anyHasAttribute;
    const uniqueValues = new Set(values);
    const isMixed = anyHasAttribute && (!allHaveAttribute || uniqueValues.size > 1);
    const value = isUnset || isMixed ? null : values[0];
    const isCopyable = !isMixed && !isUnset && value !== '';

    const groupId = getAttributeGroup(attrName);
    groupedEntries[groupId].push({
      name: attrName,
      value,
      isMixed,
      isCopyable,
      isUnset,
      editorType: schemaDef.editorType,
      enumValues: schemaDef.enumValues,
      description: schemaDef.description,
    });
  }

  for (const attrs of viewAttributes) {
    for (const attrName of Object.keys(attrs)) {
      if (!schemaAttrMap.has(attrName)) {
        const values: string[] = [];
        let allHaveAttribute = true;

        for (const viewAttrs of viewAttributes) {
          if (attrName in viewAttrs) {
            values.push(stringifyValue(viewAttrs[attrName]));
          } else {
            allHaveAttribute = false;
          }
        }

        if (values.length === 0) continue;

        const uniqueValues = new Set(values);
        const isMixed = !allHaveAttribute || uniqueValues.size > 1;
        const value = isMixed ? null : values[0];
        const isCopyable = !isMixed && value !== '';

        const groupId = getAttributeGroup(attrName);
        const existingEntry = groupedEntries[groupId].find(e => e.name === attrName);
        if (!existingEntry) {
          const config = getAttributeConfig(attrName);
          groupedEntries[groupId].push({
            name: attrName,
            value,
            isMixed,
            isCopyable,
            isUnset: false,
            editorType: config.editorType,
            enumValues: config.options,
          });
        }
      }
    }
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
