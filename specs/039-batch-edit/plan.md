# Implementation Plan: Batch Edit

**Branch**: `039-batch-edit` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/039-batch-edit/spec.md`

## Summary

Enable editing of attributes marked as "Mixed" when multiple views are selected. Apply changes to all selected views in a single operation with proper per-view undo/redo. Most infrastructure exists - primary change is removing the `isMixed` check from `canEdit()` and tracking per-view original values.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.x, @solidjs/testing-library 0.8.10
**Storage**: In-memory via SolidJS stores (documentStore, lockHideStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Vite dev server)
**Project Type**: Single SolidJS web application
**Performance Goals**: <100ms for batch edit commit on 20+ views (FR-009, SC-004)
**Constraints**: Single undo/redo operation for entire batch, skip locked views
**Scale/Scope**: Typical selection of 2-20 views for batch edit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Will write failing tests before implementation |
| II. Technology Stack | PASS | Using SolidJS signals/stores, Vitest |
| III. Security & Compliance | PASS | No security concerns - editor-only feature |
| IV. Code Quality | PASS | Will run biome, stylelint, tsc after each task |
| V. GUI Editor Domain | PASS | Undo/redo for all modifications, immediate feedback |
| VI. Testing Standards | PASS | Unit + component tests required |
| VII. Development Workflow | PASS | Red-Green-Refactor |
| XI. Dependency Management | PASS | No new dependencies required |
| XII. SolidJS Only | PASS | Using createSignal, createMemo, not React |
| XIII. Debugging Limit | PASS | Will stop after 5 failed attempts |
| XVIII. Zero Failing Tests | PASS | All tests must pass |
| XXI. Static Imports Only | PASS | No dynamic imports needed |
| XXII. Honest Completion | PASS | Will verify all FR-xxx and SC-xxx |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck must pass |
| XXIV. Test Suite Efficiency | PASS | Run test suite once per task |

## Project Structure

### Documentation (this feature)

```text
specs/039-batch-edit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty - no new APIs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── PropertiesPanel/
│       ├── AttributeRow.tsx        # MODIFY: Remove isMixed from canEdit()
│       ├── AttributeRow.module.css # MODIFY: Add mixed placeholder styles
│       └── __tests__/
│           └── AttributeRow.spec.tsx # MODIFY: Add batch edit tests
├── domain/
│   └── properties/
│       ├── historyOperations.ts    # NO CHANGE: Already supports batch
│       └── mergeSelections.ts      # NO CHANGE: Already identifies mixed values
├── stores/
│   ├── documentStore.ts            # NO CHANGE: getViewAttribute exists
│   └── lockHideStore.ts            # NO CHANGE: isLocked() exists
└── types/
    └── properties.ts               # NO CHANGE: isMixed already in AttributeEntry
```

**Structure Decision**: Minimal changes to existing files. Most infrastructure already exists.

## Complexity Tracking

No constitution violations requiring justification.

---

## Phase 0: Research

### Research Questions

1. **How does the current `canEdit()` function work in AttributeRow.tsx?**
   - Line 44: `const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;`
   - The `!props.entry.isMixed` condition blocks editing of mixed attributes
   - **Resolution**: Remove `!props.entry.isMixed` to enable batch editing

2. **How does `handleValueCommit` in PropertiesPanel currently handle batch edits?**
   - Lines 118-138 in PropertiesPanel.tsx
   - Already iterates through `selectionStore.selectedIds`
   - **Problem**: Uses single `originalValue` parameter for all views
   - **Resolution**: Need to capture per-view original values before editing starts

3. **How does `createPropertyEditOperation` handle batch undo?**
   - Takes `PropertyEditData` with `previousValues: Record<string, string | undefined>`
   - Already supports per-view previous values in undo callback
   - **Resolution**: Infrastructure exists - just need to populate `previousValues` correctly

4. **How to handle locked views during batch edit?**
   - `isLocked(viewId)` from lockHideStore checks if view is locked
   - **Resolution**: Filter out locked views in `handleValueChange` and `handleValueCommit`

5. **How to show "Mixed" placeholder in editors?**
   - Current: Shows "Mixed" text in value display (line 136-137)
   - **Resolution**: For inline editors (text/point/number), show "Mixed" as placeholder text that clears on focus

### Key Findings

1. **Existing infrastructure is 90% complete**:
   - `mergeSelections()` already identifies mixed values
   - `createPropertyEditOperation()` already supports per-view undo
   - `handleValueChange()` already applies to all selected views
   - `handleValueCommit()` already creates single history operation

2. **Gap #1**: `canEdit()` returns false for mixed values
   - **Fix**: Remove `!props.entry.isMixed` condition

3. **Gap #2**: `originalValue` signal captures single value, not per-view values
   - **Fix**: Need to capture per-view original values from `getViewAttribute()` when editing starts
   - This requires passing original values map through to commit handler

4. **Gap #3**: Locked views not filtered
   - **Fix**: Filter out locked views in PropertiesPanel handlers

5. **Gap #4**: No "Mixed" placeholder in editor inputs
   - **Fix**: Pass `isMixed` flag to editors, show as placeholder

### Architecture Decision: Where to capture per-view original values

**Option A**: Capture in AttributeRow when editing starts (handleDoubleClick)
- Pros: Localized change, clear ownership
- Cons: Need to pass selectedIds and getViewAttribute to AttributeRow

**Option B**: Capture in PropertiesPanel handleValueCommit
- Pros: Already has access to selectedIds, can call getViewAttribute
- Cons: Original values might be changed by handleValueChange preview

**Option C**: Capture in PropertiesPanel handleValueChange (on first call)
- Pros: Captures before any changes, has access to needed data
- Cons: Needs state to track "first call" per edit session

**Decision**: **Option B with modification** - Capture original values at commit time using `getViewAttribute()`. Since `handleValueChange` already applies changes, we need to track the original value before the first change. However, for dropdown/color/font editors, changes are committed immediately. So we need to:

1. For inline editors (text, point, number): Capture in AttributeRow at edit start, pass to commit
2. For immediate editors (boolean, enum, color, font, bitmap): Capture in PropertiesPanel before applying change

Actually, reviewing more carefully:
- `handleBooleanChange`, `handleEnumChange`, etc. in AttributeRow call both `onChange` and `onCommit` immediately
- These handlers receive `currentValue` from `props.entry.value` - but for mixed, this is null!
- **Solution**: For immediate editors with mixed values, capture original from `getViewAttribute()` per view

**Final Decision**:
1. Add `getOriginalValues` callback prop to AttributeRow
2. In PropertiesPanel, provide callback that queries `getViewAttribute()` for each selected view
3. AttributeRow calls this when committing mixed value edits to get per-view originals

---

## Phase 1: Design

### Data Model Changes

No new types required. Existing types are sufficient:

```typescript
// Already exists in src/types/properties.ts
interface AttributeEntry {
  name: string;
  value: string | null;     // null when mixed
  isMixed: boolean;         // true when values differ
  isCopyable: boolean;
  isUnset: boolean;
  editorType: EditorType;
  enumValues?: string[];
  description?: string;
}

// Already exists in src/types/editors.ts
interface PropertyEditData {
  viewIds: string[];
  attributeName: string;
  previousValues: Record<string, string | undefined>;  // Per-view originals
  newValue: string;
}
```

### API Contracts

No new APIs. Modifying existing component props:

```typescript
// Updated AttributeRowProps (add one optional prop)
interface AttributeRowProps {
  entry: AttributeEntry;
  onCopy?: (value: string) => void;
  onValueChange?: (name: string, newValue: string) => void;
  onValueCommit?: (name: string, newValue: string, originalValue: string) => void;
  editable?: boolean;
  documentColors?: string[];
  documentFonts?: string[];
  documentBitmaps?: string[];
  // NEW: Get per-view original values for batch edit undo
  getOriginalValues?: (name: string) => Record<string, string | undefined>;
}
```

### Component Changes

#### AttributeRow.tsx

1. **Remove isMixed from canEdit()**:
```typescript
// BEFORE
const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;

// AFTER
const canEdit = () => props.editable && !isReadonly();
```

2. **Show placeholder for mixed values in editors**:
- For TextEditor, PointEditor, NumberEditor: show "Mixed" as placeholder
- When user focuses, placeholder clears and field is editable
- Pass `placeholder` prop to editors

3. **Capture original values when editing mixed**:
```typescript
const handleDoubleClick = () => {
  if (canEdit() && canInlineEdit()) {
    const currentValue = props.entry.isMixed ? '' : (props.entry.value ?? '');
    setOriginalValue(currentValue);
    setEditValue(currentValue);
    setIsEditing(true);
  }
};
```

4. **For immediate editors (boolean, enum, color, font, bitmap)**:
```typescript
const handleEnumChange = (newValue: string) => {
  // For mixed values, we need per-view originals
  if (props.entry.isMixed && props.getOriginalValues) {
    // Pass special marker to commit handler
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, '__MIXED__');
  } else {
    const currentValue = props.entry.value ?? '';
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, currentValue);
  }
};
```

#### PropertiesPanel.tsx

1. **Provide getOriginalValues callback**:
```typescript
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
```

2. **Update handleValueChange to skip locked views**:
```typescript
const handleValueChange = (name: string, newValue: string) => {
  const selectedIds = Array.from(selectionStore.selectedIds);
  for (const viewId of selectedIds) {
    if (!isLocked(viewId)) {
      updateViewAttribute(viewId, name, newValue);
    }
  }
};
```

3. **Update handleValueCommit to handle mixed marker**:
```typescript
const handleValueCommit = (name: string, newValue: string, originalValue: string) => {
  const selectedIds = Array.from(selectionStore.selectedIds)
    .filter(id => !isLocked(id));
  if (selectedIds.length === 0) return;

  let previousValues: Record<string, string | undefined>;

  if (originalValue === '__MIXED__') {
    // Batch edit with mixed values - get per-view originals
    previousValues = getOriginalValues(name);
  } else {
    // Same value for all views
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

### CSS Changes

#### AttributeRow.module.css

Add mixed placeholder styling:
```css
.mixedPlaceholder {
  color: var(--color-text-secondary);
  font-style: italic;
}
```

### Test Plan

1. **Unit Tests** (domain/properties):
   - Verify `mergeSelections` correctly identifies mixed values (existing)
   - Verify `createPropertyEditOperation` handles per-view undo (existing)

2. **Component Tests** (AttributeRow):
   - Test canEdit() returns true for mixed values
   - Test mixed placeholder shown in editor
   - Test editing mixed value applies to display
   - Test cancel reverts mixed edit

3. **Component Tests** (PropertiesPanel):
   - Test batch edit applies to all selected views
   - Test batch edit creates single history operation
   - Test undo restores per-view original values
   - Test redo reapplies batch value
   - Test locked views skipped during batch edit
   - Test validation failure rejects entire batch

4. **Integration Tests**:
   - Full batch edit workflow: select, edit, undo, redo
   - Mixed class selection with shared attributes

---

## Implementation Tasks (Summary)

### Task 1: Enable editing of mixed attributes
- Modify `canEdit()` in AttributeRow.tsx
- Add tests for mixed attribute editing

### Task 2: Add getOriginalValues callback
- Add prop to AttributeRowProps
- Implement in PropertiesPanel
- Pass to AttributeRow component

### Task 3: Handle per-view original values in commit
- Update handleValueCommit for mixed marker
- Update all immediate editor handlers (boolean, enum, color, font, bitmap)
- Filter locked views

### Task 4: Show mixed placeholder in editors
- Add placeholder prop to inline editors
- Style mixed placeholder
- Test placeholder behavior

### Task 5: Integration tests
- Full batch edit workflow tests
- Undo/redo verification
- Locked view filtering

### Task 6: Quality gates and documentation
- Run lint:css, check, typecheck
- Update CLAUDE.md if needed
- Verify all FR/SC requirements

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing single-view editing | Low | High | Comprehensive regression tests |
| Performance on large selections | Low | Medium | Selection typically <20 views |
| Complex undo state management | Low | Medium | Existing infrastructure handles it |

---

## Success Metrics Mapping

| SC | Implementation |
|----|----------------|
| SC-001 | Batch edit 10 views in <5s: Simple UI change enables this |
| SC-002 | Single Ctrl+Z undoes batch: `createPropertyEditOperation` already supports |
| SC-003 | No regression: Comprehensive test suite |
| SC-004 | <100ms commit: Simple map operations, no heavy computation |
| SC-005 | All editor types: Handle in each editor handler |
