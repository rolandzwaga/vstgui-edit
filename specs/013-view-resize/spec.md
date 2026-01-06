# Feature Specification: View Resize

**Feature Branch**: `013-view-resize`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "Drag corner/edge resize handles to resize selected views with shift for aspect ratio lock, alt for center resize, minimum size enforcement, and undo/redo integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag Handles to Resize (Priority: P1)

As a user, I want to drag resize handles on selected views to change their size so I can adjust my UI layout visually.

**Why this priority**: This is the core functionality - without resize handles, users cannot adjust view dimensions graphically. Essential editing operation that completes the basic manipulation toolset alongside move.

**Independent Test**: Can be fully tested by selecting a view, dragging a corner handle, and verifying the view's size attribute updates correctly. Delivers core value of visual resizing.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I drag a corner handle (nw, ne, sw, se), **Then** the view resizes in both dimensions and its size updates on mouse release
2. **Given** a view is selected, **When** I drag a horizontal edge handle (e, w), **Then** the view resizes horizontally only
3. **Given** a view is selected, **When** I drag a vertical edge handle (n, s), **Then** the view resizes vertically only
4. **Given** I am dragging a resize handle, **When** I release the mouse button, **Then** the view's new size is persisted to the document

---

### User Story 2 - Undo/Redo Resize Operations (Priority: P1)

As a user, I want to undo and redo my resize operations so I can correct mistakes without manually resizing views back to their original dimensions.

**Why this priority**: Equal priority with resize - any editing operation without undo is unusable in a production editor. Leverages existing history infrastructure from 012-view-move.

**Independent Test**: Can be tested by resizing a view, pressing Ctrl+Z to undo, verifying size reverts, then pressing Ctrl+Y to redo.

**Acceptance Scenarios**:

1. **Given** I just resized a view, **When** I press Ctrl+Z, **Then** the view returns to its previous size and position
2. **Given** I just undid a resize, **When** I press Ctrl+Y (or Ctrl+Shift+Z), **Then** the view returns to the resized dimensions
3. **Given** I have performed multiple resizes, **When** I press Ctrl+Z multiple times, **Then** each resize is undone in reverse order

---

### User Story 3 - Aspect Ratio Lock (Priority: P2)

As a user, I want to hold Shift while resizing to maintain the view's aspect ratio for proportional scaling.

**Why this priority**: Important for maintaining visual consistency when resizing images or proportional UI elements, but basic resize covers most editing needs.

**Independent Test**: Can be tested by holding Shift while dragging a corner handle and verifying width/height change proportionally.

**Acceptance Scenarios**:

1. **Given** I am dragging a corner handle and hold Shift, **When** I resize, **Then** the aspect ratio is maintained (width/height stay proportional)
2. **Given** I am dragging an edge handle and hold Shift, **When** I resize, **Then** both dimensions change proportionally to maintain aspect ratio (e.g., dragging east handle also adjusts height)
3. **Given** I am resizing with Shift held, **When** I release Shift, **Then** resizing becomes unconstrained

---

### User Story 4 - Center Resize (Priority: P2)

As a user, I want to hold Alt while resizing to resize from the center so the view expands/contracts symmetrically around its center point.

**Why this priority**: Useful for centering and symmetric adjustments, but basic corner resize covers most needs first.

**Independent Test**: Can be tested by holding Alt while dragging a corner handle and verifying the view's center remains fixed while both sides expand/contract equally.

**Acceptance Scenarios**:

1. **Given** I am dragging a corner handle and hold Alt, **When** I resize, **Then** the view resizes symmetrically from its center (opposite corner moves equally)
2. **Given** I am dragging an edge handle and hold Alt, **When** I resize, **Then** the opposite edge moves equally in the opposite direction
3. **Given** I am using Alt+Shift together, **When** I resize, **Then** both center resize and aspect ratio lock are applied

---

### User Story 5 - Visual Feedback During Resize (Priority: P3)

As a user, I want to see a ghost preview of the view's new dimensions while dragging so I can size it accurately before committing.

**Why this priority**: Polish feature - basic resize works without it, but improves UX significantly by showing target dimensions before release.

**Independent Test**: Can be tested by initiating a resize and verifying a semi-transparent preview appears showing the target dimensions.

**Acceptance Scenarios**:

1. **Given** I am dragging a resize handle, **When** I move my cursor, **Then** a ghost outline shows the view's target dimensions
2. **Given** I am resizing, **When** I move my cursor, **Then** I see a size indicator showing current dimensions (e.g., "200×150")
3. **Given** I am dragging a resize handle, **When** I release the mouse, **Then** the ghost preview disappears and the view snaps to that size

---

### Edge Cases

- What happens when resizing below minimum size? System enforces minimum 10×10 pixels; resize is clamped to minimum.
- What happens when resizing to negative dimensions (dragging past opposite edge)? System clamps to minimum size; origin adjusts to maintain valid bounds.
- What happens when resizing with multiple views selected? Only the directly-grabbed view resizes (multi-view resize is out of scope for this feature).
- What happens when resizing a view to exceed its parent bounds? Allowed - VSTGUI uidesc supports overflow (no containment enforcement).
- What happens when Alt+resizing causes the view to go to negative coordinates? Allowed - uidesc supports negative origins.
- What happens when the resize drag distance is less than 3 pixels? Treated as a click, no resize initiated (click tolerance consistent with move).
- What happens when pressing Escape during resize? Resize is cancelled and view returns to original size/position.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow resizing selected view by dragging any of the 8 handles (nw, n, ne, e, se, s, sw, w)
- **FR-002**: System MUST update the view's `size` attribute when a resize is completed
- **FR-003**: System MUST update the view's `origin` attribute when resize affects position (nw, n, ne, w, sw handles)
- **FR-004**: Corner handles (nw, ne, sw, se) MUST resize in both dimensions
- **FR-005**: Edge handles (n, s) MUST resize vertically only; (e, w) MUST resize horizontally only
- **FR-006**: System MUST integrate with existing history stack for undo (Ctrl+Z) support
- **FR-007**: System MUST integrate with existing history stack for redo (Ctrl+Y, Ctrl+Shift+Z) support
- **FR-008**: Resize operations MUST be recorded in the existing history stack
- **FR-009**: System MUST enforce minimum view size of 10×10 pixels
- **FR-010**: System MUST maintain aspect ratio when Shift is held during resize
- **FR-011**: System MUST resize from center when Alt is held during resize
- **FR-012**: System MUST display a ghost preview of the view's target size during resize (50% opacity, dashed stroke)
- **FR-013**: System MUST display current dimensions during resize (width×height indicator near cursor)
- **FR-014**: System MUST NOT initiate a resize if the drag distance is less than 3 pixels (click tolerance)
- **FR-015**: System MUST use appropriate resize cursor during drag operations (nwse-resize, ns-resize, ew-resize, nesw-resize)
- **FR-016**: System MUST cancel resize and restore original dimensions when Escape is pressed during resize

### Key Entities

- **ResizeOperation**: Represents a single resize action - contains view ID, original origin/size, and new origin/size for undo/redo
- **ResizeHandle**: The 8 interactive points (nw, n, ne, e, se, s, sw, w) on selected views that initiate resize when dragged

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can resize any view by dragging handles within 100ms response time
- **SC-002**: Undo reverts view size and position to exact previous values
- **SC-003**: 100% of resize operations are reversible via undo
- **SC-004**: Minimum size (10×10) is enforced in 100% of resize operations
- **SC-005**: Ghost preview updates dimensions at 60fps during resize operations

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
| FR-016 | ⬜ PENDING | [Test or file that verifies this] |
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
