# Feature Specification: Canvas Pan Navigation

**Feature Branch**: `004-canvas-pan`
**Created**: 2026-01-05
**Status**: Draft
**Input**: Add pan navigation to canvas with middle-mouse drag and Space+drag

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Middle-Mouse Pan (Priority: P1)

A user viewing a uidesc template that extends beyond the visible viewport wants to navigate to different areas of the canvas. They press and hold the middle mouse button, then drag to pan the view, revealing previously hidden portions of the template.

**Why this priority**: Middle-mouse pan is the most common and intuitive pan method in graphics editors. It doesn't require keyboard interaction and works with any mouse.

**Independent Test**: Load a template larger than the viewport, middle-click and drag, verify the canvas content moves in the expected direction.

**Acceptance Scenarios**:

1. **Given** a canvas with content, **When** user presses middle mouse button and drags right, **Then** the canvas content moves right (viewport moves left relative to content)
2. **Given** a canvas with content, **When** user presses middle mouse button and drags in any direction, **Then** the canvas content follows the mouse movement 1:1
3. **Given** user is panning, **When** user releases middle mouse button, **Then** panning stops and current position is preserved

---

### User Story 2 - Space+Drag Pan (Priority: P2)

A user without a middle mouse button (e.g., trackpad user) or who prefers keyboard shortcuts wants to pan the canvas. They hold the Space key and drag with the left mouse button to pan.

**Why this priority**: Alternative input method for accessibility and preference. Depends on the same underlying pan mechanism as US1.

**Independent Test**: Load a template, hold Space, left-click and drag, verify the canvas pans.

**Acceptance Scenarios**:

1. **Given** a canvas with content, **When** user holds Space key and left-click drags, **Then** the canvas content pans following the mouse
2. **Given** user is Space+dragging, **When** user releases Space key, **Then** panning stops
3. **Given** user is Space+dragging, **When** user releases mouse button, **Then** panning stops

---

### User Story 3 - Pan Cursor Feedback (Priority: P3)

A user wants visual feedback that pan mode is active. When panning is possible or active, the cursor changes to indicate the pan state.

**Why this priority**: Visual polish that improves UX but is not essential for core functionality.

**Independent Test**: Initiate pan, verify cursor changes to grab/grabbing cursor.

**Acceptance Scenarios**:

1. **Given** Space key is held, **When** cursor is over canvas, **Then** cursor shows "grab" style
2. **Given** user is actively panning (any method), **When** dragging, **Then** cursor shows "grabbing" style
3. **Given** pan ends, **When** mouse button released, **Then** cursor returns to default

---

### Edge Cases

- What happens when user pans beyond reasonable bounds? Canvas position is not artificially limited; user can pan freely.
- What happens when Space is pressed during another operation? Space+drag only activates pan when no other drag operation is in progress.
- What happens when middle-click occurs on a view element? Pan still initiates; view elements do not capture middle-click.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Canvas MUST support panning via middle mouse button drag
- **FR-002**: Canvas MUST support panning via Space key + left mouse button drag
- **FR-003**: Pan movement MUST move canvas content in the same direction as mouse movement (1:1 ratio)
- **FR-004**: Pan offset MUST be preserved when pan gesture ends
- **FR-005**: Cursor MUST change to "grab" when Space is held over canvas
- **FR-006**: Cursor MUST change to "grabbing" during active pan drag

### Key Entities

- **PanState**: Current pan offset (x, y coordinates) and whether pan is active

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can pan canvas content to any position using middle-mouse drag
- **SC-002**: User can pan canvas content to any position using Space+left-drag
- **SC-003**: Pan gesture feels immediate with no perceptible lag (visual update within 16ms / same frame as input)
- **SC-004**: Cursor feedback accurately reflects pan state (grab/grabbing)

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | Canvas.spec.tsx: "should initiate pan mode when middle mouse button pressed" |
| FR-002 | ✅ MET | Canvas.spec.tsx: "should initiate pan mode when Space held and left mouse button pressed" |
| FR-003 | ✅ MET | Canvas.spec.tsx: "should update panOffset when mouse moves during pan" (delta = mouse delta) |
| FR-004 | ✅ MET | Canvas.spec.tsx: "should end pan and preserve panOffset when mouse released" |
| FR-005 | ✅ MET | Canvas.spec.tsx: "should apply grab cursor class when Space is held" |
| FR-006 | ✅ MET | Canvas.spec.tsx: "should apply grabbing cursor class when panning is active" |
| SC-001 | ✅ MET | Canvas.spec.tsx: 8 tests for middle-mouse pan, all passing |
| SC-002 | ✅ MET | Canvas.spec.tsx: 7 tests for Space+drag pan, all passing |
| SC-003 | ✅ MET | CSS transform uses GPU-accelerated translate(), reactive signals ensure same-frame updates |
| SC-004 | ✅ MET | Canvas.spec.tsx: 5 tests for cursor feedback (grab/grabbing), all passing |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [x] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [x] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [x] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [x] **Git Status Check**: Run `git status` to verify all changes are committed
- [x] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [x] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [x] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
