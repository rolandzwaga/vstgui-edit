# Feature Specification: View Deletion

**Feature Branch**: `019-view-deletion`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Delete selected views from the canvas and hierarchy with undo support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Single View (Priority: P1)

As a user editing a UI layout, I want to delete a selected view by pressing the Delete key so that I can remove unwanted elements from my design.

**Why this priority**: Core deletion functionality - without this, users cannot remove any views from their design, making the editor incomplete.

**Independent Test**: Select any view on the canvas, press Delete, verify the view is removed from both canvas and hierarchy panel.

**Acceptance Scenarios**:

1. **Given** a view is selected on the canvas, **When** I press the Delete key, **Then** the view is removed from the canvas and hierarchy panel
2. **Given** a view is selected on the canvas, **When** I press the Backspace key, **Then** the view is removed (alternative key binding)
3. **Given** no view is selected, **When** I press Delete, **Then** nothing happens (no error, no action)

---

### User Story 2 - Delete Multiple Views (Priority: P1)

As a user, I want to delete multiple selected views at once so that I can efficiently clean up my layout.

**Why this priority**: Multi-selection delete is essential for efficient workflow and builds directly on existing multi-selection functionality.

**Independent Test**: Select multiple views using Shift+click or marquee selection, press Delete, verify all selected views are removed.

**Acceptance Scenarios**:

1. **Given** multiple views are selected, **When** I press Delete, **Then** all selected views are removed simultaneously
2. **Given** 3 views are selected across different containers, **When** I press Delete, **Then** all 3 views are removed from their respective parents

---

### User Story 3 - Undo Deletion (Priority: P1)

As a user, I want to undo a deletion so that I can recover accidentally deleted views.

**Why this priority**: Undo support is critical for user confidence - users will avoid using delete if they fear losing work.

**Independent Test**: Delete a view, press Ctrl+Z, verify the view is restored to its original position and parent.

**Acceptance Scenarios**:

1. **Given** I just deleted a view, **When** I press Ctrl+Z, **Then** the view is restored to its original position in the hierarchy
2. **Given** I deleted multiple views, **When** I press Ctrl+Z, **Then** all deleted views are restored in a single undo operation
3. **Given** I deleted a view and then undid it, **When** I press Ctrl+Y, **Then** the view is deleted again (redo)

---

### User Story 4 - Delete Container with Children (Priority: P2)

As a user, I want to delete a container view so that I can remove entire sections of my UI including all nested children.

**Why this priority**: Container deletion is common when reorganizing layouts, but is secondary to basic view deletion.

**Independent Test**: Select a CViewContainer that has child views, press Delete, verify the container and all its children are removed.

**Acceptance Scenarios**:

1. **Given** a container with 3 child views is selected, **When** I press Delete, **Then** the container and all 3 children are removed
2. **Given** a container with nested containers is selected, **When** I press Delete, **Then** the entire hierarchy is removed recursively
3. **Given** I deleted a container with children, **When** I press Ctrl+Z, **Then** the container and all children are restored with their original hierarchy

---

### User Story 5 - Delete from Hierarchy Panel (Priority: P2)

As a user, I want to delete views by selecting them in the hierarchy panel so that I can remove views that may be obscured on the canvas.

**Why this priority**: Hierarchy-based deletion provides an alternative workflow for complex layouts where canvas selection is difficult.

**Independent Test**: Select a view in the hierarchy panel, press Delete, verify the view is removed.

**Acceptance Scenarios**:

1. **Given** a view is selected via the hierarchy panel, **When** I press Delete, **Then** the view is removed
2. **Given** multiple views are selected in the hierarchy panel, **When** I press Delete, **Then** all selected views are removed

---

### User Story 6 - Context Menu Delete (Priority: P3)

As a user, I want to right-click and select "Delete" from a context menu so that I have a discoverable way to delete views.

**Why this priority**: Context menu provides discoverability but is not essential since keyboard shortcuts exist.

**Independent Test**: Right-click on a selected view, click "Delete" option, verify view is removed.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I right-click and select "Delete", **Then** the view is removed
2. **Given** no view is selected, **When** I right-click on empty canvas, **Then** no Delete option appears (or it is disabled)

---

### Edge Cases

- What happens when trying to delete the root template view? The root template cannot be deleted - deletion should be blocked or ignored.
- What happens when deleting a view that is referenced by another view's `template` attribute? The view is deleted; reference validation is out of scope for this feature.
- What happens when the selection includes both a parent and its child? Both are deleted, but effectively only the parent deletion matters since the child would be removed anyway.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove selected view(s) from the document when Delete or Backspace key is pressed
- **FR-002**: System MUST remove all children recursively when deleting a container view
- **FR-003**: System MUST update the hierarchy panel immediately after deletion
- **FR-004**: System MUST update the canvas immediately after deletion
- **FR-005**: System MUST clear selection after deletion (no view selected)
- **FR-006**: System MUST support undo for single view deletion, restoring view to original parent and position
- **FR-007**: System MUST support undo for multi-view deletion, restoring all views in a single undo operation
- **FR-008**: System MUST support redo for deletion operations
- **FR-009**: System MUST prevent deletion of the root template view
- **FR-010**: System MUST provide a context menu "Delete" option for selected views
- **FR-011**: System MUST handle deletion when views are selected via canvas or hierarchy panel identically

### Key Entities

- **Selection**: Set of view IDs currently selected - determines what gets deleted
- **View**: The view node being deleted, including its attributes and children
- **History Operation**: Captures deleted view data for undo/redo support

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can delete a selected view within 1 keypress (Delete or Backspace)
- **SC-002**: Deletion of a container with 10+ nested views completes instantly (no perceptible delay)
- **SC-003**: Undo restores deleted view(s) to exact original position in hierarchy
- **SC-004**: All deletion operations appear in undo history with descriptive names
- **SC-005**: 100% of deletion scenarios can be fully reversed with undo

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | `useCanvasKeyboard.ts` lines 240-252; `viewOperations.spec.ts` delete tests |
| FR-002 | ✅ MET | `documentStore.ts` `removeView()` removes children; test "should delete container with all children" |
| FR-003 | ✅ MET | SolidJS reactive store updates hierarchy panel automatically |
| FR-004 | ✅ MET | SolidJS reactive store updates canvas automatically |
| FR-005 | ✅ MET | `viewOperations.ts` `deleteSelectedViews()` calls `clearSelection()` |
| FR-006 | ✅ MET | `viewOperations.spec.ts` "should undo deletion by restoring views" |
| FR-007 | ✅ MET | `createDeleteOperation()` captures all removed views; single undo restores all |
| FR-008 | ✅ MET | `viewOperations.spec.ts` "should redo deletion by removing views again" |
| FR-009 | ✅ MET | `documentStore.ts` `removeView()` line 480-482 returns null for root template |
| FR-010 | ✅ MET | `ContextMenu` component with Delete option; `ContextMenu.spec.tsx` tests |
| FR-011 | ✅ MET | Selection store shared between canvas and hierarchy; same `deleteSelectedViews()` function |
| SC-001 | ✅ MET | Single Delete/Backspace keypress triggers deletion |
| SC-002 | ✅ MET | Deletion uses SolidJS fine-grained reactivity; no perceptible delay |
| SC-003 | ✅ MET | `restoreView()` restores exact position via `RemovedViewInfo.viewData` |
| SC-004 | ✅ MET | `createDeleteOperation()` generates descriptive description for history |
| SC-005 | ✅ MET | All deletion operations reversible via undo; tests verify round-trip |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
