# Feature Specification: Snap to Grid

**Feature Branch**: `014-snap-to-grid`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Snap views to grid during move and resize operations with toggle on/off, Alt to temporarily disable, configurable snap threshold, and visual feedback when snap engages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Snap Views to Grid During Move (Priority: P1)

As a user, I want views to automatically snap to grid lines when I drag them so I can align my UI elements precisely without manual pixel-perfect positioning.

**Why this priority**: This is the core functionality - snapping during move is the most frequent alignment operation. Without it, users must manually align views pixel-by-pixel, which is tedious and error-prone.

**Independent Test**: Can be fully tested by enabling snap, dragging a view near a grid line, and verifying the view snaps to the nearest grid position when within the snap threshold.

**Acceptance Scenarios**:

1. **Given** snap is enabled and I am dragging a view, **When** the view's edge or origin comes within the snap threshold of a grid line, **Then** the view snaps to that grid line
2. **Given** snap is enabled and I am dragging a view, **When** I release the mouse, **Then** the view's final position reflects the snapped coordinates
3. **Given** snap is enabled and I am dragging multiple selected views, **When** any view snaps to a grid line, **Then** all selected views move together maintaining their relative positions

---

### User Story 2 - Snap Views to Grid During Resize (Priority: P1)

As a user, I want view edges to snap to grid lines when I resize them so I can create consistently sized and aligned UI elements.

**Why this priority**: Equal priority with move snapping - resize is just as common an operation, and grid-aligned sizes ensure consistent spacing and layout.

**Independent Test**: Can be fully tested by enabling snap, resizing a view, and verifying the resized edge snaps to the nearest grid line.

**Acceptance Scenarios**:

1. **Given** snap is enabled and I am resizing a view, **When** the dragged edge comes within the snap threshold of a grid line, **Then** the edge snaps to that grid line
2. **Given** snap is enabled and I am resizing with a corner handle, **When** either edge comes within snap threshold, **Then** that edge snaps independently
3. **Given** snap is enabled and I complete a resize, **When** I release the mouse, **Then** the view's final size and position reflect the snapped coordinates

---

### User Story 3 - Toggle Snap On/Off (Priority: P2)

As a user, I want to toggle snapping on and off via a keyboard shortcut or toolbar button so I can switch between precise grid alignment and free positioning.

**Why this priority**: Essential for workflow flexibility - users need to quickly enable/disable snap based on their current task, but core snap functionality comes first.

**Independent Test**: Can be tested by pressing the toggle shortcut, dragging a view, and verifying snap behavior changes accordingly.

**Acceptance Scenarios**:

1. **Given** snap is currently enabled, **When** I press the toggle shortcut (Shift+G), **Then** snap is disabled and views move/resize freely
2. **Given** snap is currently disabled, **When** I press the toggle shortcut (Shift+G), **Then** snap is enabled and views snap to grid
3. **Given** I am in the canvas, **When** I look at the toolbar, **Then** I can see the current snap state (enabled/disabled indicator)

---

### User Story 4 - Temporarily Disable Snap with Alt Key (Priority: P2)

As a user, I want to hold Alt while dragging to temporarily disable snapping so I can make fine adjustments without changing my global snap setting.

**Why this priority**: Important for precision work - allows micro-adjustments without the overhead of toggling snap on/off, but basic snap toggle covers most needs first.

**Independent Test**: Can be tested by enabling snap, starting a drag, holding Alt, and verifying the view moves freely without snapping.

**Acceptance Scenarios**:

1. **Given** snap is enabled and I am dragging a view, **When** I hold the Alt key, **Then** snap is temporarily disabled and the view moves freely
2. **Given** snap is enabled and I am resizing a view, **When** I hold the Alt key, **Then** snap is temporarily disabled and the edge moves freely
3. **Given** I am dragging with Alt held, **When** I release Alt (while still dragging), **Then** snap re-engages and the view snaps to the nearest grid line

---

### User Story 5 - Visual Feedback When Snap Engages (Priority: P3)

As a user, I want visual feedback when a view snaps to a grid line so I can confirm the snap occurred and see the alignment.

**Why this priority**: Polish feature - snap works without visual feedback, but the feedback improves user confidence and awareness.

**Independent Test**: Can be tested by dragging a view near a grid line and observing visual indicators when snap engages.

**Acceptance Scenarios**:

1. **Given** snap is enabled and I am dragging a view, **When** the view snaps to a grid line, **Then** a visual indicator appears briefly at the snap point
2. **Given** the snap indicator is showing, **When** I continue dragging away from the grid line, **Then** the indicator disappears
3. **Given** I am dragging a view, **When** snap engages, **Then** the snapped edge/corner is highlighted

---

### Edge Cases

- What happens when a view is dragged exactly between two grid lines? The view snaps to the nearest grid line (round to nearest).
- What happens when snap threshold is larger than half the grid size? Snap threshold is clamped to half the grid size to prevent overlapping snap zones.
- What happens when grid is hidden but snap is enabled? Snap still works - grid visibility and snap are independent settings.
- What happens when snapping would violate minimum view size during resize? Minimum size takes precedence over snap.
- What happens when Alt+Shift are both held during move? Alt (disable snap) and Shift (constrain axis) both apply - free movement along constrained axis.
- What happens when Alt+Shift are both held during resize? Alt (disable snap) applies; Shift maintains aspect ratio with un-snapped dimensions.
- What happens when snap is enabled but grid size is very small (5px)? Snap still works but may feel "stickier" due to frequent grid intersections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST snap view origin and edges to grid lines during move operations when snap is enabled
- **FR-002**: System MUST snap view edges to grid lines during resize operations when snap is enabled
- **FR-003**: System MUST provide a toggle to enable/disable snap (default: enabled)
- **FR-004**: System MUST respond to Shift+G keyboard shortcut to toggle snap on/off
- **FR-005**: System MUST temporarily disable snap when Alt key is held during drag/resize
- **FR-006**: System MUST re-engage snap when Alt key is released during an active drag/resize
- **FR-007**: System MUST use a default snap threshold of 5 pixels
- **FR-008**: System MUST snap to the nearest grid line when within the snap threshold
- **FR-009**: System MUST snap both edges independently during corner resize operations
- **FR-010**: System MUST maintain relative positions of multiple selected views when any view snaps during move
- **FR-011**: System MUST display a visual indicator when snap engages (brief highlight at snap point)
- **FR-012**: System MUST persist snap enabled/disabled state for the session (in-memory, not across app restarts)
- **FR-013**: System MUST indicate snap state in the toolbar UI (enabled/disabled visual indicator)
- **FR-014**: System MUST enforce minimum view size over snap (snap cannot make views smaller than 10x10)
- **FR-015**: System MUST clamp snap threshold to half the grid size maximum to prevent overlapping zones

### Key Entities

- **SnapState**: Represents the current snap configuration - enabled flag, threshold value
- **SnapResult**: Represents the outcome of a snap calculation - snapped coordinates, which edges/points snapped, snap delta applied

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can align views to grid in one drag operation (no manual adjustment needed)
- **SC-002**: Snap engages within 16ms of view entering snap threshold (single frame response)
- **SC-003**: 100% of move and resize operations respect snap setting when enabled
- **SC-004**: Users can toggle snap state in under 500ms (single keypress)
- **SC-005**: Visual snap indicator appears within 16ms of snap engaging

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | PENDING | [Test or file that verifies this] |
| FR-002 | PENDING | [Test or file that verifies this] |
| FR-003 | PENDING | [Test or file that verifies this] |
| FR-004 | PENDING | [Test or file that verifies this] |
| FR-005 | PENDING | [Test or file that verifies this] |
| FR-006 | PENDING | [Test or file that verifies this] |
| FR-007 | PENDING | [Test or file that verifies this] |
| FR-008 | PENDING | [Test or file that verifies this] |
| FR-009 | PENDING | [Test or file that verifies this] |
| FR-010 | PENDING | [Test or file that verifies this] |
| FR-011 | PENDING | [Test or file that verifies this] |
| FR-012 | PENDING | [Test or file that verifies this] |
| FR-013 | PENDING | [Test or file that verifies this] |
| FR-014 | PENDING | [Test or file that verifies this] |
| FR-015 | PENDING | [Test or file that verifies this] |
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
