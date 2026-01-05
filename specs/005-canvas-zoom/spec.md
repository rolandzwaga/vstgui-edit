# Feature Specification: Canvas Zoom Navigation

**Feature Branch**: `005-canvas-zoom`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Mouse wheel zoom for canvas navigation. Zoom in/out with mouse wheel, centered on cursor position. Store zoom level in canvasStore. Min/max zoom limits (10% to 500%). Apply scale transform to canvas wrapper. Not in scope: zoom controls UI, fit-to-view, keyboard shortcuts."

## Clarifications

### Session 2026-01-05

- Q: What happens to zoom level when a new document is loaded? → A: Reset zoom to 100% when loading a new document

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Zoom In/Out with Mouse Wheel (Priority: P1)

Users want to zoom in on specific areas of the canvas to see view details more clearly, and zoom out to get an overview of the entire template layout. The zoom should feel natural by centering on where the cursor is pointing.

**Why this priority**: Zoom is essential for working with templates of any size. Without zoom, users cannot inspect small views or get an overview of large templates. This is the core functionality.

**Independent Test**: Load a uidesc template, position cursor over a view, scroll mouse wheel up to zoom in - verify the area under cursor stays in place while scaling up.

**Acceptance Scenarios**:

1. **Given** a template is loaded on the canvas, **When** user scrolls mouse wheel up (toward screen), **Then** the canvas zooms in (scale increases)
2. **Given** a template is loaded on the canvas, **When** user scrolls mouse wheel down (away from screen), **Then** the canvas zooms out (scale decreases)
3. **Given** cursor is positioned at coordinates (X, Y) on canvas, **When** user zooms, **Then** the point under cursor remains visually stationary (zoom centers on cursor)

---

### User Story 2 - Zoom Level Limits (Priority: P2)

Users need zoom limits to prevent the canvas from becoming too small to be useful or too large to navigate. Reasonable limits ensure a usable experience.

**Why this priority**: Without limits, users could zoom to unusable extremes (infinitely small or large), requiring a way to recover. Limits prevent frustration.

**Independent Test**: Zoom all the way out until limit is reached - verify zoom stops at 10%. Zoom all the way in until limit is reached - verify zoom stops at 500%.

**Acceptance Scenarios**:

1. **Given** zoom level is at 10%, **When** user scrolls to zoom out further, **Then** zoom level remains at 10% (minimum limit)
2. **Given** zoom level is at 500%, **When** user scrolls to zoom in further, **Then** zoom level remains at 500% (maximum limit)
3. **Given** zoom level is between limits, **When** user zooms, **Then** zoom level changes smoothly in increments

---

### User Story 3 - Zoom State Persistence (Priority: P3)

The current zoom level should be preserved in application state so other components can react to it and the zoom persists during the session.

**Why this priority**: State management enables future features (zoom indicator, zoom controls) and ensures consistent behavior. Lower priority because it's infrastructure for future features.

**Independent Test**: Zoom to 200%, verify canvasStore reflects 200% zoom level that can be read by other components.

**Acceptance Scenarios**:

1. **Given** user zooms to any level, **When** checking application state, **Then** current zoom level is accurately stored
2. **Given** canvas is re-rendered, **When** zoom level exists in state, **Then** canvas renders at the stored zoom level

---

### Edge Cases

- What happens when zooming with cursor outside the canvas bounds?
  - Zoom should still work, centering on the cursor position relative to canvas
- How does zoom interact with existing pan offset?
  - Zoom and pan should work together - zooming adjusts pan offset to keep cursor point stationary
- What happens on very fast mouse wheel scrolling?
  - Zoom should increment/decrement smoothly without jumping erratically
- What is the zoom increment per wheel tick?
  - 10% per wheel tick (multiplicative: ×1.1 for zoom in, ÷1.1 for zoom out)
- What happens when a new document is loaded?
  - Zoom level resets to 100% (1.0 scale factor) to provide consistent starting view

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST zoom in when user scrolls mouse wheel up (negative deltaY)
- **FR-002**: System MUST zoom out when user scrolls mouse wheel down (positive deltaY)
- **FR-003**: System MUST center zoom on the cursor position (point under cursor remains stationary)
- **FR-004**: System MUST enforce minimum zoom limit of 10% (0.1 scale factor)
- **FR-005**: System MUST enforce maximum zoom limit of 500% (5.0 scale factor)
- **FR-006**: System MUST store current zoom level in application state
- **FR-007**: System MUST apply zoom as a scale transform to the canvas content
- **FR-008**: System MUST prevent default browser zoom behavior when zooming canvas
- **FR-009**: System MUST reset zoom level to 100% when a new document is loaded

### Key Entities

- **ZoomState**: Current zoom level (scale factor), stored alongside pan state in canvasStore
- **Point**: Cursor position used for zoom center calculation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can zoom from 100% to 500% in under 3 seconds using mouse wheel
- **SC-002**: Users can zoom from 100% to 10% in under 3 seconds using mouse wheel
- **SC-003**: When zooming, the point under the cursor moves less than 5 pixels from its original screen position (cursor-centered zoom accuracy)
- **SC-004**: Zoom level is accurately reflected in application state within 100ms of wheel event

---

## Assumptions

- Mouse wheel deltaY direction follows standard convention (negative = scroll up = zoom in)
- Zoom increment of 10% per wheel tick provides smooth experience
- Scale transform combined with translate transform (from pan) will be applied correctly
- Initial zoom level is 100% (1.0 scale factor)

## Out of Scope

- Zoom controls UI (buttons, slider)
- Fit-to-view functionality
- Keyboard shortcuts for zoom (e.g., Ctrl+Plus/Minus)
- Pinch-to-zoom for touch devices
- Zoom level display/indicator

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
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |

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
