# Feature Specification: Batch Edit

**Feature Branch**: `039-batch-edit`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Batch edit multiple selected views - edit shared attributes and apply changes to all selected views in one operation with single undo/redo entry"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Shared Attribute Across Multiple Views (Priority: P1)

A plugin developer selects multiple button views and wants to change their background color to match the new design. They select all 5 buttons, open the Properties panel, and change the `background-color` attribute. The new color is applied to all 5 buttons immediately.

**Why this priority**: This is the core functionality - enabling editing of attributes that currently show as "Mixed" values. Without this, users must edit each view individually, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by selecting 2+ views with different attribute values, editing the attribute, and verifying all selected views receive the new value.

**Acceptance Scenarios**:

1. **Given** 3 views are selected with different `opacity` values (50, 75, 100), **When** the user changes `opacity` to 80, **Then** all 3 views have `opacity` set to 80.
2. **Given** 2 views are selected showing "Mixed" for `background-color`, **When** the user clicks on the color picker and selects a new color, **Then** both views display the new color.
3. **Given** 4 views are selected with identical `font` values, **When** the user changes the font, **Then** all 4 views update to the new font (existing behavior, must continue working).

---

### User Story 2 - Single Undo/Redo for Batch Changes (Priority: P1)

After batch-editing 10 views' `opacity` values, the developer realizes the change was wrong. They press Ctrl+Z once and all 10 views revert to their original (different) values.

**Why this priority**: Proper undo/redo is essential for a production editor. Without single-operation undo, users would need to undo 10 times for a batch edit of 10 views, making the feature nearly unusable.

**Independent Test**: Can be tested by performing a batch edit on views with different original values, then verifying a single undo restores each view to its individual previous value.

**Acceptance Scenarios**:

1. **Given** 3 views with `opacity` values 50, 75, and 100 are batch-edited to 80, **When** the user presses Ctrl+Z, **Then** the views revert to 50, 75, and 100 respectively.
2. **Given** a batch edit was undone, **When** the user presses Ctrl+Shift+Z (redo), **Then** all views return to the batch-edited value (80).
3. **Given** a batch edit of 5 views, **When** the user checks the undo menu description, **Then** it shows "Change opacity on 5 views" (or similar descriptive text).

---

### User Story 3 - Visual Feedback for Mixed Values (Priority: P2)

When multiple views with different values are selected, the Properties panel shows "Mixed" as a placeholder. The user understands they can edit this field and the new value will replace all existing values.

**Why this priority**: Clear visual communication helps users understand the batch edit capability. This builds on P1 by making the feature discoverable and intuitive.

**Independent Test**: Can be tested by selecting views with different values and verifying the "Mixed" indicator is displayed and the field is editable.

**Acceptance Scenarios**:

1. **Given** 2 views with different `title` values are selected, **When** the Properties panel displays the `title` attribute, **Then** it shows "Mixed" as grayed placeholder text inside the input field.
2. **Given** a "Mixed" attribute is displayed, **When** the user focuses the field, **Then** the placeholder clears and the field becomes editable (text input, dropdown, etc. based on attribute type).
3. **Given** a "Mixed" attribute is being edited, **When** the user presses Escape, **Then** the edit is cancelled and no changes are applied.

---

### User Story 4 - Live Preview During Batch Edit (Priority: P2)

While editing a shared attribute, the developer sees all selected views update in real-time on the canvas, allowing them to preview the change before committing.

**Why this priority**: Live preview provides immediate visual feedback, improving the editing experience. This mirrors existing single-view editing behavior.

**Independent Test**: Can be tested by starting a batch edit and verifying canvas views update as the value changes (before commit).

**Acceptance Scenarios**:

1. **Given** 3 views are selected and the user is editing `opacity`, **When** the user types a new value, **Then** all 3 views on the canvas update to show the new opacity.
2. **Given** the user is previewing a batch color change, **When** they press Escape to cancel, **Then** all views revert to their original appearance.

---

### Edge Cases

- **Single view selected**: Editing works exactly as before (no regression in existing functionality).
- **Empty selection**: Properties panel shows empty state, no editing available.
- **Selection includes locked views**: Locked views are skipped during batch edit; only unlocked views are modified.
- **Validation failure**: If the new value fails validation (e.g., invalid point format), the edit is rejected and no views are modified.
- **Mixed view classes**: When different view classes are selected, only shared attributes appear in the Properties panel. Editing a shared attribute applies to all views that support it.
- **Attribute not present on some views**: If an attribute exists on some selected views but not others, editing applies the value to views that have it; views without the attribute remain unchanged.

## Clarifications

### Session 2026-01-11

- Q: How should the "Mixed" indicator be displayed in the editor field? → A: Show "Mixed" as grayed placeholder text inside the input field (clears on focus)
- Q: When an attribute exists on some selected views but not others, what should happen to views without the attribute? → A: Skip views without the attribute (only modify views that already have it)

## Existing Functionality for Reuse

The codebase already has substantial infrastructure for batch editing:

1. **`mergeSelections` function** (`src/domain/properties/mergeSelections.ts`): Already identifies mixed values and shared attributes across multiple selections. Returns `isMixed: true` for attributes with different values.

2. **`handleValueChange` in PropertiesPanel** (`src/components/PropertiesPanel/PropertiesPanel.tsx`): Already iterates through all selected view IDs and calls `updateViewAttribute` for each.

3. **`handleValueCommit` in PropertiesPanel**: Already creates a single history operation with `previousValues` keyed by view ID, enabling per-view undo.

4. **`createPropertyEditOperation`** (`src/domain/properties/historyOperations.ts`): Already supports multiple view IDs and individual previous values, with proper undo/redo callbacks.

5. **History store** (`src/stores/historyStore.ts`): Already supports single-operation undo/redo for batch changes.

**Gap to address**: The `canEdit()` function in `AttributeRow.tsx` currently returns `false` when `isMixed` is true, blocking edits. The fix requires:
- Removing the `!props.entry.isMixed` condition from `canEdit()`
- Capturing each view's original value before editing starts (currently uses a single `originalValue` for all views)
- Passing proper `previousValues` map to the commit handler

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow editing of attributes marked as "Mixed" when multiple views are selected.
- **FR-002**: System MUST apply the edited value to all selected views that support the attribute.
- **FR-003**: System MUST record each view's original value before a batch edit begins.
- **FR-004**: System MUST create a single history operation for the batch edit, not one per view.
- **FR-005**: Undo MUST restore each view to its individual original value (not a single shared value).
- **FR-006**: Redo MUST reapply the batch-edited value to all affected views.
- **FR-007**: System MUST provide live preview of changes across all selected views during editing.
- **FR-008**: System MUST skip locked views when applying batch edits (locked views remain unchanged).
- **FR-009**: System MUST validate the new value before applying to any view; invalid values reject the entire batch edit.
- **FR-010**: System MUST continue to support single-view editing without regression.
- **FR-011**: Escape key MUST cancel the batch edit and revert all views to their original values.
- **FR-012**: The history operation description MUST indicate the number of views affected (e.g., "Change opacity on 5 views").

### Key Entities

- **AttributeEntry**: Extended to track whether editing is allowed despite mixed values. Contains `isMixed` flag indicating different values across selection.
- **PropertyEditData**: Already includes `previousValues: Record<string, string | undefined>` to store per-view original values for proper undo.
- **Batch Edit Session**: Transient state tracking original values for all selected views when edit begins, enabling cancel and undo functionality.

## Assumptions

- **Attribute applicability**: An attribute is editable if at least one selected view has it defined. Views without the attribute are silently skipped.
- **Validation scope**: Validation uses the same rules as single-view editing. If validation passes, the value is valid for all view types.
- **Locked view handling**: Follows existing lock behavior from 034-lock-hide-views. Locked views are excluded from modification.
- **Class attribute readonly**: The `class` attribute remains read-only even for batch edit, consistent with single-view behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can batch-edit a shared attribute across 10 selected views in under 5 seconds (compared to 30+ seconds editing individually).
- **SC-002**: A single Ctrl+Z undoes all changes from a batch edit, regardless of number of views affected.
- **SC-003**: 100% of existing single-view property editing tests continue to pass (no regression).
- **SC-004**: Batch edits on 20+ views complete without noticeable lag (under 100ms for the commit operation).
- **SC-005**: All editor types (text, point, number, boolean, enum, color, font, bitmap) support batch editing.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status     | Evidence                                  |
|-------------|------------|-------------------------------------------|
| FR-001      | PENDING    | [Test or file that verifies this]         |
| FR-002      | PENDING    | [Test or file that verifies this]         |
| FR-003      | PENDING    | [Test or file that verifies this]         |
| FR-004      | PENDING    | [Test or file that verifies this]         |
| FR-005      | PENDING    | [Test or file that verifies this]         |
| FR-006      | PENDING    | [Test or file that verifies this]         |
| FR-007      | PENDING    | [Test or file that verifies this]         |
| FR-008      | PENDING    | [Test or file that verifies this]         |
| FR-009      | PENDING    | [Test or file that verifies this]         |
| FR-010      | PENDING    | [Test or file that verifies this]         |
| FR-011      | PENDING    | [Test or file that verifies this]         |
| FR-012      | PENDING    | [Test or file that verifies this]         |
| SC-001      | PENDING    | [Measurement or test result]              |
| SC-002      | PENDING    | [Measurement or test result]              |
| SC-003      | PENDING    | [Measurement or test result]              |
| SC-004      | PENDING    | [Measurement or test result]              |
| SC-005      | PENDING    | [Measurement or test result]              |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
