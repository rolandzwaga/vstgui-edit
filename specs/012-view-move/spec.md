# Feature Specification: View Move

**Feature Branch**: `012-view-move`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "Drag selected views to move them on canvas with arrow key nudge support, shift-constrain to axis, ghost preview while dragging, and undo/redo history system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag to Move Selected Views (Priority: P1)

As a user, I want to drag selected views to reposition them on the canvas so I can arrange my UI layout visually.

**Why this priority**: This is the core functionality - without drag-to-move, the editor cannot edit layouts. It's the fundamental editing operation.

**Independent Test**: Can be fully tested by selecting a view, dragging it to a new position, and verifying the view's origin attribute updates correctly.

**Acceptance Scenarios**:

1. **Given** a single view is selected, **When** I click and drag it, **Then** the view moves with my cursor and its origin updates on mouse release
2. **Given** multiple views are selected, **When** I drag any selected view, **Then** all selected views move together maintaining their relative positions
3. **Given** I am dragging a view, **When** I release the mouse button, **Then** the view's new position is persisted to the document

---

### User Story 2 - Undo/Redo Move Operations (Priority: P1)

As a user, I want to undo and redo my move operations so I can correct mistakes without manually repositioning views.

**Why this priority**: Equal priority with drag - any editing operation without undo is unusable in a production editor.

**Independent Test**: Can be tested by moving a view, pressing Ctrl+Z to undo, verifying position reverts, then pressing Ctrl+Y to redo.

**Acceptance Scenarios**:

1. **Given** I just moved a view, **When** I press Ctrl+Z, **Then** the view returns to its previous position
2. **Given** I just undid a move, **When** I press Ctrl+Y (or Ctrl+Shift+Z), **Then** the view returns to the moved position
3. **Given** I have performed multiple moves, **When** I press Ctrl+Z multiple times, **Then** each move is undone in reverse order

---

### User Story 3 - Arrow Key Nudge (Priority: P2)

As a user, I want to move selected views using arrow keys for precise pixel-level adjustments.

**Why this priority**: Essential for precision work, but drag-to-move covers basic needs first.

**Independent Test**: Can be tested by selecting a view and pressing arrow keys to verify 1px movement per press.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I press an arrow key, **Then** the view moves 1 pixel in that direction
2. **Given** a view is selected, **When** I press Shift+Arrow, **Then** the view moves 10 pixels in that direction
3. **Given** multiple views are selected, **When** I press an arrow key, **Then** all selected views move together

---

### User Story 4 - Constrained Movement (Priority: P2)

As a user, I want to hold Shift while dragging to constrain movement to horizontal or vertical axis for aligned positioning.

**Why this priority**: Improves precision but not essential for basic editing.

**Independent Test**: Can be tested by holding Shift while dragging and verifying movement is locked to one axis.

**Acceptance Scenarios**:

1. **Given** I am dragging a view and hold Shift, **When** I move primarily horizontally, **Then** movement is constrained to horizontal axis only
2. **Given** I am dragging a view and hold Shift, **When** I move primarily vertically, **Then** movement is constrained to vertical axis only
3. **Given** I am dragging with Shift held, **When** I release Shift, **Then** movement becomes unconstrained

---

### User Story 5 - Visual Feedback During Drag (Priority: P3)

As a user, I want to see a ghost preview of where views will land while dragging so I can position them accurately.

**Why this priority**: Polish feature - basic move works without it, but improves UX significantly.

**Independent Test**: Can be tested by initiating a drag and verifying a semi-transparent preview appears at the cursor position.

**Acceptance Scenarios**:

1. **Given** I am dragging a view, **When** I move my cursor, **Then** a ghost outline shows the view's target position
2. **Given** I am dragging multiple views, **When** I move my cursor, **Then** ghost outlines show all views' target positions
3. **Given** I am dragging a view, **When** I release the mouse, **Then** the ghost preview disappears and the view snaps to that position

---

### Edge Cases

- What happens when dragging a view to negative coordinates? System allows it - uidesc supports negative origins.
- What happens when dragging outside the canvas viewport? View continues to follow cursor; canvas does not auto-pan (future feature).
- What happens when pressing arrow keys with no selection? No action taken.
- What happens when undoing with no history? No action taken; undo is disabled.
- What happens when redoing with no redo stack? No action taken; redo is disabled.
- What happens when making a new change after undoing? Redo stack is cleared.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow dragging selected view(s) to a new position on mouse release
- **FR-002**: System MUST update the view's `origin` attribute when a move is completed
- **FR-003**: System MUST move all selected views together when dragging, maintaining relative positions
- **FR-004**: System MUST support Ctrl+Z to undo the last move operation
- **FR-005**: System MUST support Ctrl+Y and Ctrl+Shift+Z to redo an undone move operation
- **FR-006**: System MUST maintain a history stack of move operations for undo/redo (maximum 100 operations; oldest dropped when exceeded)
- **FR-007**: System MUST clear the redo stack when a new move operation is performed after undoing
- **FR-008**: System MUST support arrow keys to nudge selected view(s) by 1 pixel
- **FR-009**: System MUST support Shift+Arrow to nudge selected view(s) by 10 pixels
- **FR-010**: System MUST constrain movement to horizontal or vertical axis when Shift is held during drag
- **FR-011**: System MUST determine constraint axis based on initial drag direction (first 5+ pixels of movement)
- **FR-012**: System MUST display a ghost preview of the view's target position during drag (50% opacity, dashed stroke)
- **FR-013**: System MUST use the move cursor during drag operations
- **FR-014**: System MUST NOT initiate a move if the drag distance is less than 3 pixels (click tolerance)
- **FR-015**: Arrow key nudge operations MUST be recorded in history for undo/redo

### Key Entities

- **MoveOperation**: Represents a single move action - contains view IDs, original positions, and new positions
- **HistoryStack**: Maintains undo and redo stacks of operations for reverting/replaying changes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reposition any view by dragging within 100ms response time
- **SC-002**: Undo reverts view position to exact previous coordinates
- **SC-003**: 100% of move operations are reversible via undo
- **SC-004**: Arrow key nudge responds within 16ms (single frame) per keypress
- **SC-005**: Ghost preview updates position at 60fps during drag operations

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ⬜ PENDING | [Test or file that verifies this] |
| FR-002 | ⬜ PENDING | [Test or file that verifies this] |
| FR-003 | ⬜ PENDING | [Test or file that verifies this] |
| FR-004 | ⬜ PENDING | [Test or file that verifies this] |
| FR-005 | ⬜ PENDING | [Test or file that verifies this] |
| FR-006 | ⬜ PENDING | [Test or file that verifies this] |
| FR-007 | ⬜ PENDING | [Test or file that verifies this] |
| FR-008 | ⬜ PENDING | [Test or file that verifies this] |
| FR-009 | ⬜ PENDING | [Test or file that verifies this] |
| FR-010 | ⬜ PENDING | [Test or file that verifies this] |
| FR-011 | ⬜ PENDING | [Test or file that verifies this] |
| FR-012 | ⬜ PENDING | [Test or file that verifies this] |
| FR-013 | ⬜ PENDING | [Test or file that verifies this] |
| FR-014 | ⬜ PENDING | [Test or file that verifies this] |
| FR-015 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
