export type EditorType =
  | 'color'
  | 'point'
  | 'boolean'
  | 'number'
  | 'enum'
  | 'font'
  | 'bitmap'
  | 'gradient'
  | 'text'
  | 'readonly';

export interface AttributeDefinition {
  name: string;
  editorType: EditorType;
  description?: string;
  enumValues?: string[];
  schemaRef?: string;
}

export interface ViewClassSchema {
  className: string;
  displayName?: string;
  parentClass?: string;
  attributes: AttributeDefinition[];
  inheritanceChain: string[];
}

export type AttributeGroupId =
  | 'identity'
  | 'geometry'
  | 'appearance'
  | 'text'
  | 'behavior'
  | 'other';

export const GROUP_PRIORITY: Record<AttributeGroupId, number> = {
  identity: 0,
  geometry: 1,
  appearance: 2,
  text: 3,
  behavior: 4,
  other: 5,
};

export const GROUP_LABELS: Record<AttributeGroupId, string> = {
  identity: 'Identity',
  geometry: 'Geometry',
  appearance: 'Appearance',
  text: 'Text',
  behavior: 'Behavior',
  other: 'Other',
};

export const ALL_GROUP_IDS: AttributeGroupId[] = [
  'identity',
  'geometry',
  'appearance',
  'text',
  'behavior',
  'other',
];

export interface AttributeEntry {
  name: string;
  value: string | null;
  isMixed: boolean;
  isCopyable: boolean;
  isUnset: boolean;
  editorType: EditorType;
  enumValues?: string[];
  description?: string;
}

export interface AttributeGroup {
  id: AttributeGroupId;
  label: string;
  attributes: AttributeEntry[];
  priority: number;
}

export interface GroupedAttributes {
  groups: AttributeGroup[];
  selectionCount: number;
  className: string | null;
  sameClass: boolean;
}
