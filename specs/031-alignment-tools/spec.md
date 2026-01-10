# Feature Specification: Alignment Tools

**Feature Branch**: `031-alignment-tools`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Alignment Tools - Align Left/Center/Right, Align Top/Middle/Bottom, Align to Parent, Align to Selection, Distribution Tools"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Align Multiple Views Horizontally (Priority: P1)

A plugin developer is laying out a row of control knobs in their UI. They have selected 4 knobs that should be aligned along their top edges. By clicking the "Align Top" button in the toolbar, all selected knobs instantly snap to share the same top Y coordinate, creating a visually consistent row.

**Why this priority**: Horizontal/vertical alignment is the most fundamental alignment operation. It delivers immediate value by eliminating tedious manual positioning and is used in nearly every layout task.

**Independent Test**: Can be fully tested by selecting 2+ views with different Y positions and clicking "Align Top" - verifies views move to share a common edge.

**Acceptance Scenarios**:

1. **Given** 3 views are selected with varying top Y coordinates (10, 25, 40), **When** user clicks "Align Top", **Then** all views move to have top Y coordinate of 10 (matching the topmost view).

2. **Given** 3 views are selected with varying left X coordinates (20, 50, 80), **When** user clicks "Align Left", **Then** all views move to have left X coordinate of 20 (matching the leftmost view).

3. **Given** 3 views are selected with varying horizontal centers, **When** user clicks "Align Center (Horizontal)", **Then** all views move to share the same horizontal center X coordinate.

4. **Given** an alignment operation is performed, **When** user presses Ctrl+Z, **Then** all views return to their original positions.

---

### User Story 2 - Align Single View to Parent (Priority: P2)

A developer wants to center a logo view within its parent container. With only the logo selected, they click "Align Center Horizontal" and then "Align Center Vertical". The logo moves to the exact center of its parent container.

**Why this priority**: Single-view alignment to parent is essential for centering elements in containers, a very common layout pattern in audio plugin UIs.

**Independent Test**: Can be fully tested by selecting a single view inside a container and clicking "Align Center (Horizontal)" - verifies the view centers within its parent bounds.

**Acceptance Scenarios**:

1. **Given** a single view is selected inside a container, **When** user clicks "Align Center (Horizontal)", **Then** the view moves to be horizontally centered within its parent container.

2. **Given** a single view is selected inside a container, **When** user clicks "Align Center (Vertical)", **Then** the view moves to be vertically centered within its parent container.

3. **Given** a single view is the root template view, **When** user clicks any alignment button, **Then** no operation occurs (root cannot be aligned).

4. **Given** the toolbar is undocked and positioned at (400, 100), **When** user reloads the page, **Then** the toolbar loads in the floating state at position (400, 100) (state persisted via localStorage).

---

### User Story 3 - Keyboard Shortcuts for Alignment (Priority: P2)

An experienced user wants to quickly align views without using the mouse. They select multiple views and press Ctrl+Shift+L to align left, or Ctrl+Shift+C to center horizontally. The alignment happens instantly without needing to move to the toolbar. Note: Distribution operations do not have keyboard shortcuts as they are less frequently used (P3 priority) and the Ctrl+Shift modifier space is already occupied by the 6 alignment shortcuts.

**Why this priority**: Keyboard shortcuts significantly improve workflow efficiency for power users and are expected in professional editing tools.

**Independent Test**: Can be fully tested by selecting views and pressing the alignment shortcut key - verifies the same result as clicking the toolbar button.

**Acceptance Scenarios**:

1. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+L, **Then** views align left (same as clicking "Align Left" button).

2. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+R, **Then** views align right (same as clicking "Align Right" button).

3. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+C, **Then** views align center horizontally.

4. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+T, **Then** views align top.

5. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+M, **Then** views align middle vertically.

6. **Given** 2+ views are selected, **When** user presses Ctrl+Shift+B, **Then** views align bottom.

---

### User Story 4 - Distribute Views Evenly (Priority: P3)

A developer has 5 buttons that need equal horizontal spacing across a panel. They select all 5 buttons and click "Distribute Horizontally". The outer buttons stay in place while the 3 inner buttons redistribute to create equal gaps between all adjacent pairs.

**Why this priority**: Distribution is a more advanced alignment operation that builds on basic alignment. While very useful, it is needed less frequently than simple alignment.

**Independent Test**: Can be fully tested by selecting 3+ views and clicking "Distribute Horizontally" - verifies the spacing between adjacent views becomes equal.

**Acceptance Scenarios**:

1. **Given** 4 views are selected at X positions 10, 30, 80, 100 (widths of 20 each), **When** user clicks "Distribute Horizontally", **Then** views redistribute so gaps between adjacent views are equal (leftmost and rightmost stay in place).

2. **Given** 4 views are selected at Y positions 10, 30, 80, 100 (heights of 20 each), **When** user clicks "Distribute Vertically", **Then** views redistribute so gaps between adjacent views are equal.

3. **Given** only 2 views are selected, **When** user clicks "Distribute Horizontally", **Then** no operation occurs (need 3+ views to distribute).

---

### User Story 5 - Alignment Toolbar UI (Priority: P1)

A user sees an alignment section in the toolbar with clearly labeled buttons showing alignment direction icons. The buttons are logically grouped (horizontal alignment buttons together, vertical alignment buttons together, distribution buttons in a separate group). Disabled states indicate when operations cannot be performed.

**Why this priority**: The toolbar UI is the primary interaction point for alignment features. Without clear, accessible UI, users cannot discover or use the functionality.

**Independent Test**: Can be fully tested by rendering the toolbar component with various selection states and verifying correct button enable/disable states.

**Acceptance Scenarios**:

1. **Given** no views are selected, **When** user views the alignment toolbar, **Then** all alignment buttons are disabled.

2. **Given** exactly 1 view is selected (not root), **When** user views the alignment toolbar, **Then** alignment buttons are enabled (align to parent mode).

3. **Given** 2+ views are selected, **When** user views the alignment toolbar, **Then** alignment buttons are enabled.

4. **Given** the root template view is the only selection, **When** user views the alignment toolbar, **Then** all alignment buttons are disabled.

5. **Given** fewer than 3 views are selected, **When** user views the distribution buttons, **Then** distribution buttons are disabled.

---

### Edge Cases

- What happens when views from different parents are selected? Answer: Alignment operates on absolute canvas coordinates, so views from different parents can still be aligned to each other.
- How does the system handle views that would move outside their parent bounds after alignment? Answer: Views are moved regardless of parent bounds (VSTGUI allows this).
- What happens when all selected views already share the same alignment edge? Answer: No movement occurs, no history entry is created.
- What happens if alignment would result in views overlapping? Answer: Views are aligned regardless of overlap (this is expected behavior).
- What happens with zero-size views? Answer: Zero-size views participate in alignment using their origin point.

## Clarifications

### Session 2026-01-10

- Q: What reference point should be used for Align Center/Middle operations? → A: Center of the selection bounding box (geometric center of all selected views)
- Q: Where should the alignment toolbar be positioned in the UI? → A: Hybrid dockable/floating - docked in main toolbar by default, with ability to detach into floating panel and reattach
- Q: How should distribution handle views of different sizes - by gaps between edges or by spacing between centers? → A: Equal gaps between adjacent edges (space between right edge of view N and left edge of view N+1)
- Q: Should distribution also provide keyboard shortcuts, similar to the alignment operations? → A: No keyboard shortcuts for distribution (toolbar-only access)
- Q: When views have different sizes and the user distributes them, should spacing be calculated between view edges or view centers? → A: View edges (equal gaps between adjacent view bounds)

## Requirements *(mandatory)*

### Functional Requirements

#### Alignment Operations

- **FR-001**: System MUST provide "Align Left" to align left edges of selected views to the leftmost view's left edge.
- **FR-002**: System MUST provide "Align Center (Horizontal)" to align horizontal centers of selected views to the horizontal center of the selection bounding box (geometric center of all selected views).
- **FR-003**: System MUST provide "Align Right" to align right edges of selected views to the rightmost view's right edge.
- **FR-004**: System MUST provide "Align Top" to align top edges of selected views to the topmost view's top edge.
- **FR-005**: System MUST provide "Align Middle (Vertical)" to align vertical centers of selected views to the vertical center of the selection bounding box (geometric center of all selected views).
- **FR-006**: System MUST provide "Align Bottom" to align bottom edges of selected views to the bottommost view's bottom edge.

#### Single-View Alignment (Align to Parent)

- **FR-007**: When exactly one non-root view is selected, alignment operations MUST align that view relative to its parent container's bounds.
- **FR-008**: When a single view is aligned horizontally to parent, the view MUST center within the parent's width.
- **FR-009**: When a single view is aligned vertically to parent, the view MUST center within the parent's height.
- **FR-010**: Align Left/Right/Top/Bottom for single view MUST position the view at the respective edge of the parent with no offset.

#### Distribution Operations

- **FR-011**: System MUST provide "Distribute Horizontally" to space 3+ selected views with equal horizontal gaps between adjacent edges (space between right edge of view N and left edge of view N+1).
- **FR-012**: System MUST provide "Distribute Vertically" to space 3+ selected views with equal vertical gaps between adjacent edges (space between bottom edge of view N and top edge of view N+1).
- **FR-013**: Distribution MUST keep the outermost views (leftmost/rightmost or topmost/bottommost) in their original positions.
- **FR-014**: Distribution operations MUST require at least 3 views to be selected (disabled otherwise).

#### Toolbar UI

- **FR-015**: System MUST display the alignment toolbar docked in the main toolbar by default when a document is loaded.
- **FR-015a**: System MUST provide a detach/undock affordance (e.g., drag handle or button) allowing users to convert the docked toolbar into a floating panel. Undocking via drag MUST require a minimum drag distance of 20 pixels from the docked position before the toolbar detaches.
- **FR-015b**: System MUST allow the floating alignment panel to be repositioned freely within the application window.
- **FR-015c**: System MUST provide a mechanism to reattach/redock the floating panel back into the main toolbar.
- **FR-015d**: System MUST persist the docked/floating state and floating position across sessions (via localStorage).
- **FR-016**: Alignment toolbar MUST group horizontal alignment buttons (Left, Center, Right) together.
- **FR-017**: Alignment toolbar MUST group vertical alignment buttons (Top, Middle, Bottom) together.
- **FR-018**: Alignment toolbar MUST group distribution buttons (Horizontal, Vertical) in a separate section.
- **FR-019**: Each alignment button MUST have a descriptive icon indicating the alignment direction.
- **FR-020**: Each button MUST have a tooltip describing the action and keyboard shortcut.
- **FR-021**: Buttons MUST be disabled when the operation cannot be performed (no selection, single root view, <3 views for distribution).

#### Keyboard Shortcuts

- **FR-022**: System MUST support Ctrl+Shift+L for Align Left.
- **FR-023**: System MUST support Ctrl+Shift+C for Align Center (Horizontal).
- **FR-024**: System MUST support Ctrl+Shift+R for Align Right.
- **FR-025**: System MUST support Ctrl+Shift+T for Align Top.
- **FR-026**: System MUST support Ctrl+Shift+M for Align Middle (Vertical).
- **FR-027**: System MUST support Ctrl+Shift+B for Align Bottom.
- **FR-027a**: Distribution operations (Distribute Horizontally/Vertically) MUST NOT have keyboard shortcuts; they are accessible via toolbar only.

#### History Integration

- **FR-028**: All alignment and distribution operations MUST be undoable via Ctrl+Z.
- **FR-029**: All alignment and distribution operations MUST be redoable via Ctrl+Y or Ctrl+Shift+Z.
- **FR-030**: History entries MUST have descriptive names (e.g., "Align 3 views left", "Distribute 4 views horizontally").
- **FR-031**: When no views actually move (all already aligned), no history entry MUST be created.

#### Accessibility

- **FR-032**: All toolbar buttons MUST have appropriate aria-labels for screen readers.
- **FR-033**: Keyboard shortcuts MUST work when canvas has focus.
- **FR-034**: Toolbar buttons MUST be keyboard navigable (Tab/Shift+Tab).

### Key Entities

- **AlignmentOperation**: Represents a single alignment action with type (left/center/right/top/middle/bottom), target views, and reference point.
- **DistributionOperation**: Represents a distribution action with direction (horizontal/vertical), target views, and spacing calculation.
- **SelectionBounds**: Calculated bounding rectangle of all selected views, used as reference for alignment calculations.

### Assumptions

- Views can be moved outside their parent bounds (VSTGUI supports this).
- Alignment operates on view origins and sizes in canvas coordinates.
- All selected views participate in alignment regardless of their parent hierarchy.
- Distribution calculates equal gaps, not equal spacing from centers.
- Keyboard shortcuts follow common design tool conventions (Figma, Sketch patterns).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can align 2+ views to a common edge in a single click/keystroke.
- **SC-002**: Users can center a single view within its parent in 2 clicks (horizontal + vertical) or 2 keystrokes.
- **SC-003**: Users can distribute 3+ views with equal spacing in a single click.
- **SC-004**: All alignment operations are undoable within 1 second of the action.
- **SC-005**: Toolbar buttons provide clear visual feedback of enabled/disabled state.
- **SC-006**: All 6 alignment operations are accessible via keyboard shortcuts; 2 distribution operations are accessible via toolbar only (no keyboard shortcuts per FR-027a).
- **SC-007**: Alignment toolbar renders without layout shift when document loads.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | `alignViews.spec.ts` - "aligns all views to leftmost left edge" |
| FR-002 | ✅ MET | `alignViews.spec.ts` - "aligns all views to horizontal center of bounding box" |
| FR-003 | ✅ MET | `alignViews.spec.ts` - "aligns all views to rightmost right edge" |
| FR-004 | ✅ MET | `alignViews.spec.ts` - "aligns all views to topmost top edge" |
| FR-005 | ✅ MET | `alignViews.spec.ts` - "aligns all views to vertical center of bounding box" |
| FR-006 | ✅ MET | `alignViews.spec.ts` - "aligns all views to bottommost bottom edge" |
| FR-007 | ✅ MET | `alignViews.spec.ts` - "single-view alignment to parent" describe block |
| FR-008 | ✅ MET | `alignViews.spec.ts` - "aligns center to parent center" |
| FR-009 | ✅ MET | `alignViews.spec.ts` - "aligns middle to parent middle" |
| FR-010 | ✅ MET | `alignViews.spec.ts` - "aligns left/right/top/bottom edge to parent" tests |
| FR-011 | ✅ MET | `distributeViews.spec.ts` - "distributes 3 views with equal gaps" |
| FR-012 | ✅ MET | `distributeViews.spec.ts` - "distributes 3 views vertically with equal gaps" |
| FR-013 | ✅ MET | `distributeViews.spec.ts` - "keeps outer views fixed" |
| FR-014 | ✅ MET | `distributeViews.spec.ts` - "returns empty array for less than 3 views" |
| FR-015 | ✅ MET | `alignmentToolbarStore.spec.ts` - "starts in docked state" |
| FR-015a | ✅ MET | `DragHandle.spec.tsx` - "triggers onUndock when drag exceeds 20px" |
| FR-015b | ✅ MET | `alignmentToolbarStore.spec.ts` - "updateFloatingPosition" tests |
| FR-015c | ✅ MET | `alignmentToolbarStore.spec.ts` - "dock()" sets isDocked to true |
| FR-015d | ✅ MET | `alignmentToolbarStore.spec.ts` - "restores floating position (400, 100) from localStorage" |
| FR-016 | ✅ MET | `AlignmentToolbar.spec.tsx` - "groups buttons correctly" |
| FR-017 | ✅ MET | `AlignmentToolbar.spec.tsx` - "groups buttons correctly" |
| FR-018 | ✅ MET | `AlignmentToolbar.spec.tsx` - "groups buttons correctly" |
| FR-019 | ✅ MET | `AlignmentIcons.tsx` - 8 SVG icons implemented |
| FR-020 | ✅ MET | `AlignmentToolbar.spec.tsx` - "shows keyboard shortcut in tooltip" tests |
| FR-021 | ✅ MET | `AlignmentToolbar.spec.tsx` - "disables all buttons when no selection" |
| FR-022 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+L returns true and triggers align left" |
| FR-023 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+C returns true and triggers align center" |
| FR-024 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+R returns true and triggers align right" |
| FR-025 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+T returns true and triggers align top" |
| FR-026 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+M returns true and triggers align middle" |
| FR-027 | ✅ MET | `shortcuts.spec.ts` - "Ctrl+Shift+B returns true and triggers align bottom" |
| FR-027a | ✅ MET | `shortcuts.spec.ts` - "returns false for unrelated keys" (no distribution shortcuts) |
| FR-028 | ✅ MET | `AlignmentToolbar.integration.spec.tsx` - "restores original positions on undo" |
| FR-029 | ✅ MET | `AlignmentToolbar.integration.spec.tsx` - "reapplies alignment on redo" |
| FR-030 | ✅ MET | `historyOperations.spec.ts` - "generates correct text for left/center/right alignment" |
| FR-031 | ✅ MET | `alignViews.spec.ts` - "returns empty array if views already aligned" |
| FR-032 | ✅ MET | `AlignmentToolbar.spec.tsx` - "has aria-label" test |
| FR-033 | ✅ MET | `shortcuts.spec.ts` - keyboard shortcut handler integration |
| FR-034 | ✅ MET | `AlignmentToolbar.spec.tsx` - "has role=toolbar"`, buttons are focusable |
| SC-001 | ✅ MET | `AlignmentToolbar.integration.spec.tsx` - "selects views, clicks button, verifies positions change" |
| SC-002 | ✅ MET | `alignViews.spec.ts` - single-view alignment tests (center H + V) |
| SC-003 | ✅ MET | `AlignmentToolbar.integration.spec.tsx` - "distributes 3+ views with undo support" |
| SC-004 | ✅ MET | `historyOperations.spec.ts` - undo/redo operations are synchronous |
| SC-005 | ✅ MET | `AlignmentToolbar.spec.tsx` - disabled state tests with visual feedback |
| SC-006 | ✅ MET | `shortcuts.spec.ts` - 6 alignment shortcuts; no distribution shortcuts |
| SC-007 | ✅ MET | `AlignmentToolbar.tsx` - static render, no async loading |

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
