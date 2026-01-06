# Data Model: Properties Panel

**Feature**: 011-properties-panel  
**Date**: 2026-01-06

## Overview

Type definitions for the Properties Panel feature. These types support:
- Organizing attributes into collapsible groups
- Handling multi-selection with shared/mixed values
- Copy-to-clipboard functionality

## Type Definitions

### Core Types

```typescript
// src/types/properties.ts

/**
 * Attribute group categories for organizing properties panel
 */
export type AttributeGroupId = 
  | 'identity'    // class (always shown, not collapsible)
  | 'geometry'    // origin, size, min-size, max-size
  | 'appearance'  // colors, opacity, bitmap, frame
  | 'text'        // font, text-alignment, title, tooltip
  | 'behavior'    // mouse-enabled, autosize, want-focus
  | 'other';      // custom/unrecognized attributes

/**
 * Display priority for attribute groups (lower = higher priority)
 */
export const GROUP_PRIORITY: Record<AttributeGroupId, number> = {
  identity: 0,
  geometry: 1,
  appearance: 2,
  text: 3,
  behavior: 4,
  other: 5,
};

/**
 * Human-readable labels for attribute groups
 */
export const GROUP_LABELS: Record<AttributeGroupId, string> = {
  identity: 'Identity',
  geometry: 'Geometry',
  appearance: 'Appearance',
  text: 'Text',
  behavior: 'Behavior',
  other: 'Other',
};

/**
 * A single attribute entry with name and value
 */
export interface AttributeEntry {
  /** Attribute name (e.g., "origin", "background-color") */
  name: string;
  
  /** 
   * Attribute value as string for display.
   * For multi-selection with different values, this will be null.
   */
  value: string | null;
  
  /** 
   * True if this attribute has different values across selected views.
   * When true, value is null and "Mixed" indicator should be shown.
   */
  isMixed: boolean;
  
  /** 
   * Whether this value can be copied to clipboard.
   * False for mixed values and empty values.
   */
  isCopyable: boolean;
}

/**
 * A group of related attributes
 */
export interface AttributeGroup {
  /** Group identifier */
  id: AttributeGroupId;
  
  /** Human-readable group label */
  label: string;
  
  /** Attributes in this group, sorted alphabetically by name */
  attributes: AttributeEntry[];
  
  /** Display priority (lower = shown first) */
  priority: number;
}

/**
 * Complete grouped attributes for display in properties panel
 */
export interface GroupedAttributes {
  /** All attribute groups with entries, sorted by priority */
  groups: AttributeGroup[];
  
  /** Total count of selected views */
  selectionCount: number;
  
  /** 
   * Class name for header display.
   * - Single selection: class name (e.g., "CTextButton")
   * - Multi-selection same class: class name (e.g., "CTextButton")
   * - Multi-selection different classes: null
   */
  className: string | null;
  
  /**
   * True if all selected views have the same class
   */
  sameClass: boolean;
}
```

### Attribute Categorization Map

```typescript
// src/domain/properties/groupAttributes.ts

/**
 * Map of attribute names to their group categories.
 * Attributes not in this map go to 'other'.
 */
export const ATTRIBUTE_GROUP_MAP: Record<string, AttributeGroupId> = {
  // Identity (special - always shown at top)
  'class': 'identity',
  
  // Geometry
  'origin': 'geometry',
  'size': 'geometry',
  'min-size': 'geometry',
  'max-size': 'geometry',
  'autosize-to-fit-content-width': 'geometry',
  
  // Appearance
  'background-color': 'appearance',
  'background-color-draw-style': 'appearance',
  'opacity': 'appearance',
  'bitmap': 'appearance',
  'transparent': 'appearance',
  'draw-antialiased': 'appearance',
  'frame-color': 'appearance',
  'frame-width': 'appearance',
  
  // Text
  'font': 'appearance',
  'font-color': 'text',
  'text-alignment': 'text',
  'text-inset': 'text',
  'title': 'text',
  'tooltip': 'text',
  
  // Behavior
  'mouse-enabled': 'behavior',
  'want-focus': 'behavior',
  'tab-navigation-order': 'behavior',
  'autosize': 'behavior',
  'uidesc-label': 'behavior',
};
```

### Store Types

```typescript
// src/stores/propertiesStore.ts

/**
 * Properties panel store state
 */
export interface PropertiesStoreState {
  /** Set of expanded group IDs */
  expandedGroups: Set<AttributeGroupId>;
}
```

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐
│ selectionStore  │────▶│  Properties     │
│ .selectedIds    │     │  Panel          │
└─────────────────┘     └────────┬────────┘
                                 │
┌─────────────────┐              │
│ documentStore   │──────────────┤
│ .document       │              │
└─────────────────┘              ▼
                        ┌────────────────┐
                        │ groupAttributes│
                        │ ()             │
                        └────────┬───────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ mergeSelections│
                        │ ()             │
                        └────────┬───────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ GroupedAttrs   │
                        │ (render)       │
                        └────────────────┘
```

## Function Signatures

### groupAttributes

```typescript
/**
 * Categorize a single view's attributes into groups
 * 
 * @param attributes - Raw attributes from ViewNode
 * @returns Array of AttributeGroup sorted by priority
 */
export function groupAttributes(
  attributes: Record<string, unknown>
): AttributeGroup[];
```

### mergeSelections

```typescript
/**
 * Merge attributes from multiple selected views
 * 
 * @param viewAttributes - Array of attribute records from each selected view
 * @param classNames - Array of class names from each selected view
 * @returns GroupedAttributes with merged values and mixed indicators
 */
export function mergeSelections(
  viewAttributes: Array<Record<string, unknown>>,
  classNames: string[]
): GroupedAttributes;
```

## Examples

### Single Selection

```typescript
// Input: One view selected
const attrs = {
  class: 'CTextButton',
  origin: '10, 20',
  size: '100, 30',
  'background-color': '#FF5500FF',
  title: 'Click Me'
};

// Output
const result: GroupedAttributes = {
  selectionCount: 1,
  className: 'CTextButton',
  sameClass: true,
  groups: [
    {
      id: 'identity',
      label: 'Identity',
      priority: 0,
      attributes: [
        { name: 'class', value: 'CTextButton', isMixed: false, isCopyable: true }
      ]
    },
    {
      id: 'geometry',
      label: 'Geometry',
      priority: 1,
      attributes: [
        { name: 'origin', value: '10, 20', isMixed: false, isCopyable: true },
        { name: 'size', value: '100, 30', isMixed: false, isCopyable: true }
      ]
    },
    {
      id: 'appearance',
      label: 'Appearance',
      priority: 2,
      attributes: [
        { name: 'background-color', value: '#FF5500FF', isMixed: false, isCopyable: true }
      ]
    },
    {
      id: 'text',
      label: 'Text',
      priority: 3,
      attributes: [
        { name: 'title', value: 'Click Me', isMixed: false, isCopyable: true }
      ]
    }
  ]
};
```

### Multi-Selection with Mixed Values

```typescript
// Input: Two views selected with different sizes
const viewAttrs = [
  { class: 'CTextButton', origin: '10, 20', size: '100, 30' },
  { class: 'CTextButton', origin: '10, 20', size: '200, 40' }
];
const classNames = ['CTextButton', 'CTextButton'];

// Output
const result: GroupedAttributes = {
  selectionCount: 2,
  className: 'CTextButton',
  sameClass: true,
  groups: [
    {
      id: 'identity',
      label: 'Identity',
      priority: 0,
      attributes: [
        { name: 'class', value: 'CTextButton', isMixed: false, isCopyable: true }
      ]
    },
    {
      id: 'geometry',
      label: 'Geometry',
      priority: 1,
      attributes: [
        { name: 'origin', value: '10, 20', isMixed: false, isCopyable: true },
        { name: 'size', value: null, isMixed: true, isCopyable: false }  // Mixed!
      ]
    }
  ]
};
```

## Constraints

1. **Read-only**: All data structures are for display only, no editing
2. **String values**: All attribute values converted to strings for display
3. **No persistence**: Group expand/collapse state is session-only
4. **Performance**: Must handle 50+ selected views efficiently
