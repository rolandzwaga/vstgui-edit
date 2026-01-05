# Feature Specification: Zoom Controls

**Feature Branch**: `006-zoom-controls`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Zoom Controls - Add toolbar buttons for zoom in (+), zoom out (-), fit to view, and zoom to 100%. Display current zoom level as percentage. Add keyboard shortcuts: F for fit-to-view, 0 for reset to 100%, + for zoom in, - for zoom out. Fit-to-view should calculate optimal zoom to fit the entire template within the viewport with padding."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Zoom Level Display and Manual Zoom (Priority: P1)

Users need visual feedback showing the current zoom level and basic controls to zoom in and out. This provides essential navigation capability and awareness of the current view state.

**Why this priority**: Zoom level awareness and manual control are foundational - users must know their current zoom state and have precise control over zoom adjustments. This builds on the existing wheel zoom from 005-canvas-zoom.

**Independent Test**: Can be fully tested by loading a template, observing the zoom level indicator showing "100%", clicking zoom in/out buttons, and verifying the indicator updates accordingly.

**Acceptance Scenarios**:

1. **Given** a template is loaded and zoom is at default, **When** the user views the toolbar, **Then** they see a zoom level indicator displaying "100%"
2. **Given** a template is loaded, **When** the user clicks the zoom in (+) button, **Then** the canvas zooms in by one step and the zoom indicator updates to show the new percentage
3. **Given** a template is loaded, **When** the user clicks the zoom out (-) button, **Then** the canvas zooms out by one step and the zoom indicator updates to show the new percentage
4. **Given** zoom is at maximum (500%), **When** the user clicks zoom in, **Then** nothing happens and the zoom remains at 500%
5. **Given** zoom is at minimum (10%), **When** the user clicks zoom out, **Then** nothing happens and the zoom remains at 10%
6. **Given** the canvas area has focus, **When** the user presses the + key, **Then** the canvas zooms in by one step
7. **Given** the canvas area has focus, **When** the user presses the - key, **Then** the canvas zooms out by one step

---

### User Story 2 - Reset to 100% (Priority: P2)

Users need a quick way to return to the default 100% zoom level from any zoom state. This provides a reliable "home base" for viewing.

**Why this priority**: Essential for reorientation after zooming. Users frequently need to return to a known baseline zoom level.

**Independent Test**: Can be fully tested by zooming to any level, clicking the 100% button or pressing 0, and verifying zoom returns to exactly 100%.

**Acceptance Scenarios**:

1. **Given** zoom is at any level other than 100%, **When** the user clicks the "100%" button, **Then** the zoom resets to exactly 100% (pan offset is preserved)
2. **Given** zoom is already at 100%, **When** the user clicks the "100%" button, **Then** nothing visibly changes (zoom remains at 100%)
3. **Given** the canvas area has focus and zoom is not 100%, **When** the user presses the 0 key, **Then** the zoom resets to 100%

---

### User Story 3 - Fit to View (Priority: P3)

Users need to quickly fit the entire template within the visible viewport, which is especially useful when first opening a file or after navigating away from the content.

**Why this priority**: Important convenience feature for orientation, but users can work without it by manually adjusting zoom and pan.

**Independent Test**: Can be fully tested by loading any template size, clicking fit-to-view, and verifying the entire template is visible within the viewport with appropriate padding.

**Acceptance Scenarios**:

1. **Given** a template is loaded, **When** the user clicks the "Fit" button, **Then** the zoom level adjusts so the entire template fits within the viewport with padding
2. **Given** a large template that extends beyond the viewport at 100% zoom, **When** the user clicks "Fit", **Then** the zoom decreases and pan adjusts to show the entire template
3. **Given** a small template that is much smaller than the viewport, **When** the user clicks "Fit", **Then** the zoom increases (up to 100% maximum for fit-to-view) to optimally display the template
4. **Given** the canvas area has focus, **When** the user presses the F key, **Then** the fit-to-view action is triggered
5. **Given** no template is loaded, **When** the user clicks "Fit" or presses F, **Then** nothing happens (graceful no-op)

---

### Edge Cases

- What happens when zoom buttons are clicked rapidly? Each click should increment/decrement by exactly one step.
- What happens when pressing keyboard shortcuts while focus is in a text input? Shortcuts should not trigger zoom actions.
- What happens with fit-to-view on a template with 0x0 dimensions? Should gracefully handle without errors, defaulting to 100% zoom.
- What happens when viewport is resized after fit-to-view? The zoom level remains; user must click fit again to re-fit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the current zoom level as a percentage in the toolbar (e.g., "100%", "150%", "50%")
- **FR-002**: System MUST provide a zoom in button (+) that increases zoom by one step (multiply by zoom factor)
- **FR-003**: System MUST provide a zoom out button (-) that decreases zoom by one step (divide by zoom factor)
- **FR-004**: System MUST provide a fit-to-view button that calculates and applies optimal zoom to fit the template within the viewport
- **FR-005**: System MUST provide a reset button that sets zoom to exactly 100%
- **FR-006**: System MUST support the + key (or =) as a keyboard shortcut for zoom in when canvas has focus
- **FR-007**: System MUST support the - key as a keyboard shortcut for zoom out when canvas has focus
- **FR-008**: System MUST support the F key as a keyboard shortcut for fit-to-view when canvas has focus
- **FR-009**: System MUST support the 0 key as a keyboard shortcut for reset to 100% when canvas has focus
- **FR-010**: Fit-to-view MUST include padding around the template (minimum 5% margin from viewport edges)
- **FR-011**: Fit-to-view MUST NOT zoom above 100% (prevents excessive enlargement of small templates)
- **FR-012**: System MUST disable or visually indicate when zoom buttons have no effect (at min/max limits)
- **FR-013**: Keyboard shortcuts MUST NOT trigger when focus is in a text input field

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can determine the current zoom level within 1 second of looking at the interface
- **SC-002**: Users can zoom in or out with a single click or keypress
- **SC-003**: Users can return to 100% zoom with a single action (click or keypress)
- **SC-004**: Users can fit any template to the viewport with a single action
- **SC-005**: Fit-to-view displays the entire template visibly within the viewport 100% of the time
- **SC-006**: All zoom control actions complete and update the display within 100ms (perceived as instantaneous) - verified by manual observation; SolidJS fine-grained reactivity ensures sub-frame updates

---

## Assumptions

- **Zoom step size**: Uses existing ZOOM_FACTOR (1.1x per step) from the 005-canvas-zoom implementation
- **Zoom limits**: Uses existing MIN_ZOOM (10%) and MAX_ZOOM (500%) from 005-canvas-zoom
- **Padding for fit-to-view**: 5% margin from viewport edges provides adequate visual breathing room
- **Fit-to-view zoom cap**: Capped at 100% to prevent small templates from appearing excessively large
- **Toolbar placement**: Near the canvas area; exact visual layout is an implementation detail
- **Focus context**: Keyboard shortcuts active when the canvas container or its children have focus

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
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |
| SC-006 | PENDING | [Measurement or test result] |

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
