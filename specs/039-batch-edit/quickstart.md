# Quickstart: Batch Edit

**Feature**: 039-batch-edit | **Date**: 2026-01-11

## Overview

Enable batch editing of attributes when multiple views are selected with different values. Changes apply to all selected views with single undo/redo.

## Key Files

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/components/PropertiesPanel/AttributeRow.tsx` | MODIFY | Remove isMixed from canEdit(), handle mixed value editing |
| `src/components/PropertiesPanel/PropertiesPanel.tsx` | MODIFY | Add getOriginalValues, filter locked views |
| `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx` | MODIFY | Add batch edit tests |
| `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx` | NEW | Batch edit integration tests |

## Implementation Steps

### Step 1: Enable Mixed Attribute Editing

In `AttributeRow.tsx`, change line 44:

```typescript
// BEFORE
const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;

// AFTER
const canEdit = () => props.editable && !isReadonly();
```

### Step 2: Add getOriginalValues Prop

In `AttributeRow.tsx`, update props interface:

```typescript
export interface AttributeRowProps {
  // ... existing props
  getOriginalValues?: (name: string) => Record<string, string | undefined>;
}
```

### Step 3: Update Immediate Editor Handlers

For each immediate editor handler in `AttributeRow.tsx`:

```typescript
const handleEnumChange = (newValue: string) => {
  if (props.entry.isMixed) {
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, '__MIXED__');
  } else {
    const currentValue = props.entry.value ?? '';
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, currentValue);
  }
};
```

Apply same pattern to: `handleBooleanChange`, `handleColorChange`, `handleFontChange`, `handleBitmapChange`

### Step 4: Update PropertiesPanel Handlers

In `PropertiesPanel.tsx`:

```typescript
import { isLocked } from '../../stores/lockHideStore';
import { getViewAttribute } from '../../stores/documentStore';

const getOriginalValues = (attributeName: string): Record<string, string | undefined> => {
  const selectedIds = Array.from(selectionStore.selectedIds);
  const values: Record<string, string | undefined> = {};
  for (const viewId of selectedIds) {
    if (!isLocked(viewId)) {
      values[viewId] = getViewAttribute(viewId, attributeName);
    }
  }
  return values;
};

const handleValueChange = (name: string, newValue: string) => {
  const selectedIds = Array.from(selectionStore.selectedIds);
  for (const viewId of selectedIds) {
    if (!isLocked(viewId)) {
      updateViewAttribute(viewId, name, newValue);
    }
  }
};

const handleValueCommit = (name: string, newValue: string, originalValue: string) => {
  const selectedIds = Array.from(selectionStore.selectedIds)
    .filter(id => !isLocked(id));
  if (selectedIds.length === 0) return;

  let previousValues: Record<string, string | undefined>;

  if (originalValue === '__MIXED__') {
    previousValues = getOriginalValues(name);
  } else {
    previousValues = {};
    for (const viewId of selectedIds) {
      previousValues[viewId] = originalValue;
    }
  }

  const operation = createPropertyEditOperation(
    { viewIds: selectedIds, attributeName: name, previousValues, newValue },
    name
  );
  pushOperation(operation);
};
```

### Step 5: Pass Callback to AttributeRow

In PropertiesPanel's AttributeGroup render:

```tsx
<AttributeGroup
  group={group}
  // ... existing props
  getOriginalValues={getOriginalValues}
/>
```

Update AttributeGroup to pass through to AttributeRow.

## Test Commands

```bash
# Run specific tests
npx vitest run src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx

# Run all tests
npm test

# Quality gates
npm run lint:css
npm run check
npm run typecheck
```

## Verification Checklist

- [ ] Can edit "Mixed" attributes when multiple views selected
- [ ] Changes apply to all unlocked selected views
- [ ] Single Ctrl+Z undoes all changes
- [ ] Each view restores to its original value on undo
- [ ] Ctrl+Shift+Z redoes batch change
- [ ] Locked views are not modified
- [ ] Existing single-view editing still works
- [ ] All editor types support batch edit (text, point, boolean, number, enum, color, font, bitmap)
