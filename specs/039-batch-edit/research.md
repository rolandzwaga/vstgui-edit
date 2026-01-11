# Research: Batch Edit

**Feature**: 039-batch-edit | **Date**: 2026-01-11

## Research Questions & Findings

### Q1: Current canEdit() Implementation

**Question**: How does the current `canEdit()` function work in AttributeRow.tsx?

**Finding**: Line 44 in `src/components/PropertiesPanel/AttributeRow.tsx`:
```typescript
const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;
```

The `!props.entry.isMixed` condition explicitly blocks editing when multiple views have different values.

**Decision**: Remove `!props.entry.isMixed` from the condition.
**Rationale**: This is the primary blocker for batch editing. All other infrastructure already exists.

---

### Q2: Batch Commit Infrastructure

**Question**: How does `handleValueCommit` in PropertiesPanel currently handle batch edits?

**Finding**: Lines 118-138 in `src/components/PropertiesPanel/PropertiesPanel.tsx`:
```typescript
const handleValueCommit = (name: string, newValue: string, originalValue: string) => {
  const selectedIds = Array.from(selectionStore.selectedIds);
  if (selectedIds.length === 0) return;

  const previousValues: Record<string, string | undefined> = {};
  for (const viewId of selectedIds) {
    previousValues[viewId] = originalValue;  // PROBLEM: Same value for all!
  }

  const operation = createPropertyEditOperation(
    { viewIds: selectedIds, attributeName: name, previousValues, newValue },
    name
  );
  pushOperation(operation);
};
```

**Decision**: Modify to capture per-view original values when editing mixed attributes.
**Rationale**: The `previousValues` record already supports per-view values, but current implementation uses single `originalValue` for all views.

---

### Q3: Per-View Undo Support

**Question**: How does `createPropertyEditOperation` handle batch undo?

**Finding**: In `src/domain/properties/historyOperations.ts`:
```typescript
export function createPropertyEditOperation(
  data: PropertyEditData,
  attributeName: string
): HistoryOperation {
  const { viewIds, previousValues, newValue } = data;

  return {
    type: 'property-change',
    description: viewCount === 1 ? `Change ${attributeName}` : `Change ${attributeName} on ${viewCount} views`,
    undo: () => {
      for (const viewId of viewIds) {
        const prevValue = previousValues[viewId];  // Per-view value!
        if (prevValue !== undefined) {
          updateViewAttribute(viewId, attributeName, prevValue);
        }
      }
    },
    redo: () => {
      for (const viewId of viewIds) {
        updateViewAttribute(viewId, attributeName, newValue);
      }
    },
  };
}
```

**Decision**: No changes needed to this function.
**Rationale**: Already fully supports per-view original values in undo callback.

---

### Q4: Locked View Handling

**Question**: How to handle locked views during batch edit?

**Finding**: In `src/stores/lockHideStore.ts`:
```typescript
export function isLocked(viewId: string): boolean {
  return lockedIds().has(viewId);
}
```

**Decision**: Filter locked views in both `handleValueChange` and `handleValueCommit`.
**Rationale**: Locked views should not be modified by any edit operation (FR-008).

---

### Q5: Mixed Placeholder Display

**Question**: How to show "Mixed" placeholder in editors?

**Finding**: Current implementation in AttributeRow.tsx (lines 136-137):
```tsx
<Show when={props.entry.isMixed}>
  <span class={styles.mixed}>Mixed</span>
</Show>
```

This shows "Mixed" in the value display, but editors need placeholder support.

**Decision**: Add `placeholder` prop to inline editors (TextEditor, PointEditor, NumberEditor).
**Rationale**: When editing a mixed value, the field should start empty with "Mixed" as placeholder, matching spec requirement.

---

### Q6: Immediate Editor Original Value Capture

**Question**: How do immediate editors (boolean, enum, color, font, bitmap) capture original values?

**Finding**: In AttributeRow.tsx:
```typescript
const handleEnumChange = (newValue: string) => {
  const currentValue = props.entry.value ?? '';  // NULL for mixed!
  props.onValueChange?.(props.entry.name, newValue);
  props.onValueCommit?.(props.entry.name, newValue, currentValue);
};
```

For mixed values, `props.entry.value` is `null`, so `currentValue` would be empty string, losing the original per-view values.

**Decision**: Use special marker `'__MIXED__'` to signal PropertiesPanel to fetch per-view originals.
**Rationale**: AttributeRow doesn't have access to `getViewAttribute()`, so PropertiesPanel must handle per-view value lookup.

---

## Architecture Decision Record

### ADR-001: Per-View Original Value Capture Strategy

**Context**: When editing a "Mixed" attribute, we need to capture each view's original value for proper undo functionality.

**Options Considered**:

1. **Capture in AttributeRow at edit start**
   - Pros: Localized, clear ownership
   - Cons: AttributeRow lacks access to view data

2. **Capture in PropertiesPanel at commit time**
   - Pros: Has access to all needed data
   - Cons: Values may have changed during live preview

3. **Capture in PropertiesPanel at first change**
   - Pros: Captures before modifications
   - Cons: Complex state tracking

**Decision**: Hybrid approach with `'__MIXED__'` marker

1. AttributeRow signals mixed edit by passing `'__MIXED__'` as originalValue
2. PropertiesPanel detects marker and fetches per-view values via `getViewAttribute()`
3. For inline editors, values are fetched at commit time (after preview changes)

**Consequences**:
- Need to track that undo should restore to values at commit time, not at edit start
- This is acceptable because undo will restore each view to its state just before commit
- Live preview changes are already reverted on cancel

---

### ADR-002: Locked View Filtering

**Context**: Locked views should not be modified during batch edits (FR-008).

**Decision**: Filter at PropertiesPanel level in both handlers:
- `handleValueChange`: Skip locked views during live preview
- `handleValueCommit`: Exclude locked views from history operation

**Consequences**:
- Locked views remain unchanged during preview and commit
- History operation only includes unlocked views
- Undo/redo only affects unlocked views

---

## Alternatives Rejected

### Alternative: New "Batch Edit Mode"

**Proposal**: Add explicit batch edit mode with separate UI

**Rejected Because**:
- Existing infrastructure already supports batch operations
- Adding mode would complicate UX
- Spec explicitly states minimal changes needed

### Alternative: Store Original Values in Signals

**Proposal**: Store per-view original values in component signals

**Rejected Because**:
- AttributeRow doesn't have view IDs or access to documentStore
- Would require significant prop drilling
- PropertiesPanel already has all needed access

---

## Dependencies Verified

| Dependency | Version | Status |
|------------|---------|--------|
| SolidJS | 1.9.x | No changes needed |
| documentStore | - | getViewAttribute exists |
| lockHideStore | - | isLocked exists |
| historyStore | - | pushOperation exists |

No new dependencies required.

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Regression in single-view edit | Low | High | Keep original code paths for non-mixed |
| Performance with many views | Low | Medium | Map operations are O(n), n typically < 20 |
| Incorrect undo values | Medium | High | Test with known different values |

---

## Open Questions (Resolved)

1. **Q**: Should validation occur before or after applying to all views?
   **A**: Before. If validation fails, reject entire batch (FR-009).

2. **Q**: What value to show in editor when editing mixed?
   **A**: Empty field with "Mixed" placeholder (spec clarification).

3. **Q**: How to handle attribute not present on some views?
   **A**: Skip views without attribute (spec clarification: "only modify views that already have it").
