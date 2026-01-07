# Feature Specification: Hierarchy Reparenting

**Feature Branch**: `018-hierarchy-reparenting`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Hierarchy reparenting: drag-and-drop in hierarchy panel to reparent views, drag to reorder siblings (z-order), group selected views into new CViewContainer, ungroup (move children up and delete empty container). All operations support undo/redo."

## Clarifications

### Session 2026-01-07
- Q: How should users initiate a drag in the hierarchy panel? → A: Standard click-and-hold to start drag

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reparent View via Drag-and-Drop (Priority: P1)

As a user, I want to drag a view in the hierarchy panel and drop it onto a container to change its parent, so I can reorganize my UI structure without recreating views.

**Why this priority**: Reparenting is the core operation that enables flexible UI organization. Without it, users must delete and recreate views to change hierarchy.

**Independent Test**: Can be fully tested by dragging a view onto a different container and verifying it becomes a child of that container.

**Acceptance Scenarios**:

1. **Given** a view "Button1" is a child of "Container1", **When** I drag "Button1" onto "Container2", **Then** "Button1" becomes a child of "Container2" and is removed from "Container1"
2. **Given** a view "Knob1" is selected, **When** I drag it onto a non-container view like "CTextLabel", **Then** the drop is rejected and "Knob1" remains in its original location
3. **Given** I drag "ViewA" onto "ViewA" (itself), **When** I release, **Then** nothing happens (self-drop is ignored)
4. **Given** "Container1" contains "Container2", **When** I try to drag "Container1" onto "Container2" (its own descendant), **Then** the drop is rejected to prevent circular hierarchy

---

### User Story 2 - Reorder Siblings via Drag-and-Drop (Priority: P1)

As a user, I want to drag views within the same parent to reorder them, so I can control the z-order (rendering order) of sibling views.

**Why this priority**: Z-order control is essential for layered UIs where some views must appear above others.

**Independent Test**: Can be fully tested by dragging a view before or after its sibling within the same parent.

**Acceptance Scenarios**:

1. **Given** "Container1" has children ["ViewA", "ViewB", "ViewC"] in order, **When** I drag "ViewC" above "ViewA", **Then** the order becomes ["ViewC", "ViewA", "ViewB"]
2. **Given** "Container1" has children ["ViewA", "ViewB"], **When** I drag "ViewA" below "ViewB", **Then** the order becomes ["ViewB", "ViewA"]
3. **Given** I drag "ViewA" to the same position, **When** I release, **Then** no change occurs (no-op)

---

### User Story 3 - Undo/Redo Reparent and Reorder Operations (Priority: P1)

As a user, I want to undo and redo reparenting and reordering operations, so I can easily correct mistakes.

**Why this priority**: Undo/redo is critical for any destructive operation. Users expect to be able to revert changes.

**Independent Test**: Can be fully tested by performing a reparent, pressing Ctrl+Z to undo, and verifying the view returns to its original parent.

**Acceptance Scenarios**:

1. **Given** I reparented "ViewA" from "Container1" to "Container2", **When** I press Ctrl+Z, **Then** "ViewA" returns to "Container1" at its original position
2. **Given** I reordered children in "Container1", **When** I press Ctrl+Z, **Then** the original order is restored
3. **Given** I undid a reparent operation, **When** I press Ctrl+Y, **Then** the reparent is re-applied

---

### User Story 4 - Group Selected Views (Priority: P2)

As a user, I want to group selected views into a new container, so I can organize related views together and move/resize them as a unit.

**Why this priority**: Grouping is a common organization pattern but builds on the reparenting foundation.

**Independent Test**: Can be fully tested by selecting multiple views and invoking the group command.

**Acceptance Scenarios**:

1. **Given** I have "ViewA" and "ViewB" selected (siblings in "Container1"), **When** I invoke the Group command (Ctrl+G), **Then** a new "CViewContainer" is created in "Container1" containing "ViewA" and "ViewB"
2. **Given** I group "ViewA" and "ViewB", **When** the new container is created, **Then** it is sized to encompass both views with their relative positions preserved
3. **Given** I have only one view selected, **When** I invoke Group, **Then** nothing happens (need 2+ views to group)
4. **Given** I select views from different parents, **When** I invoke Group, **Then** nothing happens (must be siblings to group)

---

### User Story 5 - Ungroup Container (Priority: P2)

As a user, I want to ungroup a container by moving its children to the parent and deleting the empty container, so I can flatten my hierarchy when needed.

**Why this priority**: Ungroup is the inverse of group and completes the organizational toolset.

**Independent Test**: Can be fully tested by selecting a container and invoking the ungroup command.

**Acceptance Scenarios**:

1. **Given** "GroupContainer" contains "ViewA" and "ViewB" and is a child of "Parent1", **When** I select "GroupContainer" and invoke Ungroup (Ctrl+Shift+G), **Then** "ViewA" and "ViewB" become direct children of "Parent1" and "GroupContainer" is deleted
2. **Given** I ungroup "GroupContainer", **When** the children are moved, **Then** their absolute positions on canvas are preserved (origins adjusted to maintain visual position)
3. **Given** I select a view that is not a container, **When** I invoke Ungroup, **Then** nothing happens
4. **Given** I select a container with no children, **When** I invoke Ungroup, **Then** the empty container is simply deleted

---

### User Story 6 - Visual Feedback During Drag (Priority: P2)

As a user, I want to see visual feedback during drag operations in the hierarchy panel, so I know where the view will be placed when I drop it.

**Why this priority**: Visual feedback is essential for usability but the core functionality works without it.

**Independent Test**: Can be tested by initiating a drag and observing visual indicators.

**Acceptance Scenarios**:

1. **Given** I am dragging a view, **When** I hover over a valid container target, **Then** the target is highlighted to indicate it will accept the drop
2. **Given** I am dragging a view, **When** I hover over an invalid target (non-container or would create cycle), **Then** no highlight appears (or a rejection indicator shows)
3. **Given** I am dragging a view between siblings, **When** I hover between two items, **Then** a drop indicator line shows where the view will be inserted

---

### Edge Cases

- What happens when dragging multiple selected views? All selected views should be reparented/reordered together.
- What happens when dragging a view that contains the currently selected view? The operation should proceed normally; selection state is independent.
- What happens when the target container already has a child with the same key? The moved view's key should be preserved; uidesc allows duplicate keys (they're identifiers, not unique constraints).
- What happens when ungrouping the root template container? The operation should be rejected (cannot ungroup root).

## Requirements *(mandatory)*

### Functional Requirements

#### Reparenting
- **FR-001**: System MUST allow dragging a view in the hierarchy panel onto a container view to change its parent (drag initiated via standard click-and-hold)
- **FR-002**: System MUST reject drops onto non-container views (only CViewContainer and subclasses accept children)
- **FR-003**: System MUST reject drops that would create circular hierarchy (dropping a parent onto its descendant)
- **FR-004**: System MUST preserve the view's attributes when reparenting (only parent reference changes)
- **FR-005**: System MUST update the view's origin to maintain its absolute canvas position after reparenting

#### Reordering
- **FR-006**: System MUST allow dragging a view to reorder it among siblings within the same parent
- **FR-007**: System MUST provide visual indication of the drop position between siblings (insertion line)
- **FR-008**: System MUST update the z-order in the document to reflect the new sibling order

#### Grouping
- **FR-009**: System MUST provide a Group command (Ctrl+G) that wraps selected views in a new CViewContainer
- **FR-010**: System MUST only allow grouping when 2+ sibling views are selected
- **FR-011**: System MUST size the new container to encompass all grouped views with their relative positions preserved
- **FR-012**: System MUST place the new container at the position of the top-left-most grouped view
- **FR-013**: System MUST select the new container after grouping

#### Ungrouping
- **FR-014**: System MUST provide an Ungroup command (Ctrl+Shift+G) that moves container children to the parent
- **FR-015**: System MUST delete the container after moving its children
- **FR-016**: System MUST preserve absolute canvas positions of children when ungrouping (adjust origins)
- **FR-017**: System MUST reject ungrouping the root template container
- **FR-018**: System MUST select the ungrouped children after the operation

#### Undo/Redo
- **FR-019**: System MUST support undo for all reparent operations
- **FR-020**: System MUST support undo for all reorder operations
- **FR-021**: System MUST support undo for group operations (deletes container, restores children to original parent)
- **FR-022**: System MUST support undo for ungroup operations (recreates container, moves children back)

#### Visual Feedback
- **FR-023**: System MUST highlight valid drop targets during drag
- **FR-024**: System MUST show insertion indicator when dragging between siblings
- **FR-025**: System MUST show a "not allowed" indicator for invalid drop targets

#### Multi-Selection
- **FR-026**: System MUST support reparenting multiple selected views together
- **FR-027**: System MUST support reordering multiple selected views together (maintain their relative order)

### Key Entities

- **View**: A UI element with parent reference, origin, size, and attributes
- **Container**: A view that can have child views (CViewContainer and subclasses)
- **Hierarchy**: The parent-child tree structure of views within a template
- **Z-Order**: The rendering order of sibling views (later in children array = rendered on top)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reparent a view via drag-and-drop in under 2 seconds *(UX design target; automated tests verify operation completes successfully)*
- **SC-002**: Users can reorder siblings via drag-and-drop in under 2 seconds *(UX design target; automated tests verify operation completes successfully)*
- **SC-003**: Group command creates container and reparents children in a single undoable operation
- **SC-004**: Ungroup command moves children and deletes container in a single undoable operation
- **SC-005**: All hierarchy operations can be undone/redone without data loss
- **SC-006**: Visual feedback appears within 100ms of drag start *(UX design target; automated tests verify feedback elements exist)*
- **SC-007**: View positions are preserved (no visual jump) after reparent or ungroup operations

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | `TreeNode.tsx` drag handlers + `useHierarchyDrag.ts` + `reparent.spec.ts` (17 tests) |
| FR-002 | ✅ MET | `validateReparent()` in `reparent.ts` checks container class |
| FR-003 | ✅ MET | `isDescendantOf()` in `reparent.ts` + tests in `reparent.spec.ts` |
| FR-004 | ✅ MET | `reparentView()` in `documentStore.ts` preserves all attributes |
| FR-005 | ✅ MET | `calculateNewOrigin()` in `reparent.ts` adjusts origin for parent change |
| FR-006 | ✅ MET | `reorderView()` in `documentStore.ts` + `reorder.spec.ts` (17 tests) |
| FR-007 | ✅ MET | `.dropBefore`/`.dropAfter` styles in `HierarchyPanel.module.css` |
| FR-008 | ✅ MET | `reorderView()` mutation updates children order in document |
| FR-009 | ✅ MET | Ctrl+G handler in `useCanvasKeyboard.ts` + `group.spec.ts` (21 tests) |
| FR-010 | ✅ MET | `validateGroup()` returns `need-multiple` for <2 views |
| FR-011 | ✅ MET | `calculateGroupBounds()` computes bounding box, `createGroupOperation()` sets relative origins |
| FR-012 | ✅ MET | `containerOrigin` in `GroupOperation` is set to min X/Y of grouped views |
| FR-013 | ✅ MET | `createGroupHistoryOperation()` calls `selectAll([result.groupId])` |
| FR-014 | ✅ MET | Ctrl+Shift+G handler in `useCanvasKeyboard.ts` |
| FR-015 | ✅ MET | `ungroupContainer()` in `documentStore.ts` deletes container after moving children |
| FR-016 | ✅ MET | `createUngroupOperation()` calculates adjusted origins for children |
| FR-017 | ✅ MET | `validateUngroup()` returns `is-root` when no parent exists |
| FR-018 | ✅ MET | `createUngroupHistoryOperation()` calls `selectAll(result.childIds)` |
| FR-019 | ✅ MET | `createReparentOperation()` returns undo/redo closures, integrated with historyStore |
| FR-020 | ✅ MET | `createReorderOperation()` returns undo/redo closures, integrated with historyStore |
| FR-021 | ✅ MET | `createGroupHistoryOperation()` undo restores children to original parent with original origins |
| FR-022 | ✅ MET | `createUngroupHistoryOperation()` undo recreates container and moves children back |
| FR-023 | ✅ MET | `.dropTarget` style in `HierarchyPanel.module.css` highlights valid containers |
| FR-024 | ✅ MET | `.dropBefore`/`.dropAfter` insertion line indicators in CSS |
| FR-025 | ✅ MET | `.dropInvalid` style in `HierarchyPanel.module.css` for rejection indicator |
| FR-026 | ✅ MET | `createMultiReparentOperation()` + TreeNode drop handler reparents all selected views |
| FR-027 | ✅ MET | `createMultiReorderOperation()` maintains relative order of selected views |
| SC-001 | ✅ MET | Drag-drop reparent completes in single user action; tests verify operation success |
| SC-002 | ✅ MET | Drag-drop reorder completes in single user action; tests verify operation success |
| SC-003 | ✅ MET | `createGroupHistoryOperation()` returns single HistoryOperation with undo/redo |
| SC-004 | ✅ MET | `createUngroupHistoryOperation()` returns single HistoryOperation with undo/redo |
| SC-005 | ✅ MET | All operations use historyStore push; undo/redo tested in domain specs |
| SC-006 | ✅ MET | CSS classes applied synchronously during drag via `onDragEnter`/`onDragLeave` |
| SC-007 | ✅ MET | `calculateNewOrigin()` and `createUngroupOperation()` preserve absolute positions |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [x] **Compliance Table Complete**: All 27 FR-xxx and 7 SC-xxx requirements verified with ✅ MET status
- [x] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [x] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [x] **Quality Gate - CSS**: Run `npm run lint:css` - PASSED with zero errors/warnings
- [x] **Quality Gate - Code**: Run `npm run check` - PASSED with zero errors/warnings
- [x] **Quality Gate - Types**: Run `npm run typecheck` - PASSED with zero errors/warnings
- [x] **Git Status Check**: Run `git status` to verify all changes are committed
- [x] **Commit Any Remaining Work**: All changes committed
- [x] **Confirm Clean Working Tree**: Working tree clean
- [x] **Update Documentation**: CLAUDE.md updated with feature technologies
