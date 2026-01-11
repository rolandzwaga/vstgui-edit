# Data Model: Batch Edit

**Feature**: 039-batch-edit | **Date**: 2026-01-11

## Overview

No new data models required. This feature leverages existing types and structures.

## Existing Types (No Changes)

### AttributeEntry (src/types/properties.ts)

```typescript
interface AttributeEntry {
  name: string;
  value: string | null;     // null when isMixed is true
  isMixed: boolean;         // true when selected views have different values
  isCopyable: boolean;
  isUnset: boolean;
  editorType: EditorType;
  enumValues?: string[];
  description?: string;
}
```

**Usage in Batch Edit**:
- `isMixed: true` indicates the attribute can be batch-edited
- `value: null` means editors show empty field with "Mixed" placeholder
- After edit, `value` becomes the new unified value

### PropertyEditData (src/types/editors.ts)

```typescript
interface PropertyEditData {
  viewIds: string[];                              // All affected view IDs
  attributeName: string;                          // The attribute being changed
  previousValues: Record<string, string | undefined>;  // Per-view original values
  newValue: string;                               // New value for all views
}
```

**Usage in Batch Edit**:
- `previousValues` is keyed by viewId, enabling per-view undo
- `newValue` is applied to all views on redo

### HistoryOperation (src/types/history.ts)

```typescript
interface HistoryOperation {
  type: string;
  description: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}
```

**Usage in Batch Edit**:
- Single operation for entire batch
- Description: "Change {attribute} on N views"
- undo() restores each view to its individual previous value
- redo() applies newValue to all views

## State Flow

### Before Batch Edit

```
selectionStore.selectedIds = Set(['view-1', 'view-2', 'view-3'])

mergeSelections() returns:
{
  groups: [{
    attributes: [{
      name: 'opacity',
      value: null,      // Different values
      isMixed: true,    // Signals batch edit available
    }]
  }],
  selectionCount: 3,
  sameClass: true,
  className: 'CView'
}
```

### During Batch Edit (Live Preview)

```
User types '80' in opacity field

handleValueChange() calls for each view:
  updateViewAttribute('view-1', 'opacity', '80')
  updateViewAttribute('view-2', 'opacity', '80')
  updateViewAttribute('view-3', 'opacity', '80')

Document state updated, canvas reflects changes
```

### On Commit

```
handleValueCommit() receives:
  name: 'opacity'
  newValue: '80'
  originalValue: '__MIXED__'  // Special marker

getOriginalValues() fetches:
  {
    'view-1': '50',
    'view-2': '75',
    'view-3': '100'
  }

createPropertyEditOperation() creates:
  {
    type: 'property-change',
    description: 'Change opacity on 3 views',
    undo: () => {
      updateViewAttribute('view-1', 'opacity', '50')
      updateViewAttribute('view-2', 'opacity', '75')
      updateViewAttribute('view-3', 'opacity', '100')
    },
    redo: () => {
      updateViewAttribute('view-1', 'opacity', '80')
      updateViewAttribute('view-2', 'opacity', '80')
      updateViewAttribute('view-3', 'opacity', '80')
    }
  }
```

### After Undo

```
Each view restored to original value:
  view-1: opacity = '50'
  view-2: opacity = '75'
  view-3: opacity = '100'

mergeSelections() returns isMixed: true again
```

## Component Props Changes

### AttributeRowProps (Modified)

```typescript
interface AttributeRowProps {
  entry: AttributeEntry;
  onCopy?: (value: string) => void;
  onValueChange?: (name: string, newValue: string) => void;
  onValueCommit?: (name: string, newValue: string, originalValue: string) => void;
  editable?: boolean;
  documentColors?: string[];
  documentFonts?: string[];
  documentBitmaps?: string[];
  // NEW: Callback to get per-view original values
  getOriginalValues?: (name: string) => Record<string, string | undefined>;
}
```

**New Prop**: `getOriginalValues`
- Called by AttributeRow when committing mixed value changes
- Returns map of viewId -> original value
- Provided by PropertiesPanel

## Constants

### Mixed Value Marker

```typescript
const MIXED_MARKER = '__MIXED__';
```

Used to signal that originalValue should be fetched per-view rather than using a single value.

## Validation Rules (Unchanged)

Existing validation in `src/domain/properties/validation.ts` applies:
- `validatePoint()` for point/size attributes
- `validateNumber()` for numeric attributes
- Validation runs before commit; failure rejects entire batch
