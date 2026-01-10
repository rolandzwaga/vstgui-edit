# Feature Specification: Lock and Hide Views

**Feature Branch**: `034-lock-hide-views`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Lock and hide views for managing complex layouts in the VSTGUI visual editor"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lock Views to Prevent Accidental Modifications (Priority: P1)

A plugin developer working on a complex UI layout has finalized the position and size of the background panel and several decorative elements. They want to lock these views so they can continue editing other elements without accidentally moving or resizing the finalized components.

**Why this priority**: Locking views is the core protective feature that prevents accidental modifications during complex editing sessions. This is the most critical functionality as it directly addresses the primary use case of protecting finalized elements.

**Independent Test**: Can be fully tested by locking a view with Ctrl+L and verifying it cannot be moved, resized, or deleted. Delivers immediate value by protecting views from accidental changes.

**Acceptance Scenarios**:

1. **Given** a view is selected on the canvas, **When** the user presses Ctrl+L, **Then** the view becomes locked and displays a locked selection style (no resize handles visible)
2. **Given** a locked view is selected, **When** the user attempts to drag it, **Then** the view does not move
3. **Given** a locked view is selected, **When** the user presses Delete or Backspace, **Then** nothing happens and the view remains in place
4. **Given** a locked view is selected, **When** the user attempts to resize via keyboard (arrow keys with modifiers), **Then** nothing happens
5. **Given** multiple views are selected (some locked, some unlocked), **When** the user drags, **Then** only unlocked views move

---

### User Story 2 - Unlock Views to Resume Editing (Priority: P1)

After completing work on overlapping elements, the developer needs to modify a previously locked background panel. They unlock it to make adjustments.

**Why this priority**: Unlocking is the complementary action to locking - without it, locked views would be permanently frozen. This is essential for the complete lock/unlock workflow.

**Independent Test**: Can be tested by locking a view, then unlocking with Ctrl+Shift+L and verifying it can be moved and resized again.

**Acceptance Scenarios**:

1. **Given** a locked view is selected, **When** the user presses Ctrl+Shift+L, **Then** the view becomes unlocked and displays normal selection style with resize handles
2. **Given** an unlocked view is selected, **When** the user presses Ctrl+Shift+L, **Then** nothing changes (view remains unlocked)
3. **Given** multiple locked views are selected, **When** the user presses Ctrl+Shift+L, **Then** all selected views become unlocked

---

### User Story 3 - Hide Views to Simplify Complex Layouts (Priority: P2)

A developer is working on a complex synth UI with many overlapping controls. To focus on editing a specific layer of controls, they hide the top layer temporarily to access and select elements underneath.

**Why this priority**: Hiding views is a productivity feature that simplifies editing of complex, layered layouts. While important for workflow efficiency, it is secondary to the protective locking functionality.

**Independent Test**: Can be tested by hiding a view with Ctrl+H and verifying it disappears from the canvas while remaining visible in the hierarchy panel.

**Acceptance Scenarios**:

1. **Given** a view is selected on the canvas, **When** the user presses Ctrl+H, **Then** the view disappears from the canvas but remains visible in the hierarchy panel with a hidden indicator
2. **Given** a hidden view exists, **When** the user clicks on the canvas area where the view was, **Then** the hidden view is not selected (click passes through)
3. **Given** a hidden view exists, **When** the user uses marquee selection over its area, **Then** the hidden view is not included in the selection
4. **Given** a parent container is hidden, **When** the user examines the canvas, **Then** all child views are also hidden

---

### User Story 4 - Show Hidden Views (Priority: P2)

After completing edits on the lower layer, the developer wants to reveal all hidden views to see the complete UI and verify the layout.

**Why this priority**: Showing hidden views is the complementary action to hiding - essential for the complete hide/show workflow.

**Independent Test**: Can be tested by hiding views, then pressing Ctrl+Shift+H and verifying all hidden views reappear on the canvas.

**Acceptance Scenarios**:

1. **Given** one or more views are hidden, **When** the user presses Ctrl+Shift+H, **Then** all hidden views become visible on the canvas
2. **Given** no views are hidden, **When** the user presses Ctrl+Shift+H, **Then** nothing changes
3. **Given** views were hidden at different times, **When** the user presses Ctrl+Shift+H, **Then** all hidden views are shown simultaneously

---

### User Story 5 - Visual Indicators in Hierarchy Panel (Priority: P2)

A developer needs to quickly identify which views are locked or hidden by looking at the hierarchy panel, especially when managing a complex layout with many elements.

**Why this priority**: Visual indicators provide essential feedback about view states, enabling users to understand and manage locked/hidden views effectively.

**Independent Test**: Can be tested by locking and hiding views, then verifying appropriate icons appear next to them in the hierarchy panel.

**Acceptance Scenarios**:

1. **Given** a view is locked, **When** the user looks at the hierarchy panel, **Then** a lock icon appears next to the view name
2. **Given** a view is hidden, **When** the user looks at the hierarchy panel, **Then** an eye-slash (hidden) icon appears next to the view name
3. **Given** a view is both locked and hidden, **When** the user looks at the hierarchy panel, **Then** both icons appear next to the view name
4. **Given** a view is neither locked nor hidden, **When** the user looks at the hierarchy panel, **Then** no lock or eye icons appear

---

### User Story 6 - Select Hidden Views from Hierarchy (Priority: P3)

A developer needs to unlock or show a specific hidden view. They locate it in the hierarchy panel and select it there since it cannot be clicked on the canvas.

**Why this priority**: This is an important usability feature that enables management of hidden views, but it builds on top of the core hide/show functionality.

**Independent Test**: Can be tested by hiding a view, clicking on it in the hierarchy panel, and verifying it becomes selected.

**Acceptance Scenarios**:

1. **Given** a view is hidden, **When** the user clicks on it in the hierarchy panel, **Then** the view becomes selected
2. **Given** a hidden view is selected via hierarchy, **When** the user presses Ctrl+Shift+H, **Then** all hidden views become visible (including the selected one)
3. **Given** a hidden view is selected via hierarchy, **When** the user presses Ctrl+H, **Then** the view becomes visible (toggle behavior)

---

### User Story 7 - Lock/Hide via Context Menu (Priority: P3)

A developer prefers using right-click context menus for common operations. They right-click on a view to access lock and hide options.

**Why this priority**: Context menu access is a convenience feature that provides an alternative to keyboard shortcuts, improving discoverability.

**Independent Test**: Can be tested by right-clicking a view and selecting Lock or Hide from the context menu.

**Acceptance Scenarios**:

1. **Given** a view is selected and right-clicked, **When** the context menu appears, **Then** it includes "Lock" and "Hide" options
2. **Given** a locked view is right-clicked, **When** the context menu appears, **Then** it shows "Unlock" instead of "Lock"
3. **Given** a hidden view is right-clicked in the hierarchy, **When** the context menu appears, **Then** it shows "Show" instead of "Hide"

---

### Edge Cases

- What happens when trying to lock/hide an already locked/hidden view? Lock toggles off (unlock), hide toggles off (show) for single selection
- How does hiding a container affect selection of its children? Children are also hidden on canvas but remain visible in hierarchy
- What happens when pasting into a hidden container? Paste succeeds, pasted views are hidden along with their parent
- What happens when all views are hidden? User can still work via hierarchy panel and use Ctrl+Shift+H to show all
- How does undo/redo interact with lock/hide state? Lock/hide actions are undoable/redoable
- What happens to lock/hide state when reloading the document? State is reset (editor-only, not persisted)
- What happens to lock/hide state when saving? Lock/hide state is purely visual editing state and has no effect on save - the uidesc file is saved normally
- Can the user nudge (arrow keys) a locked view? No, nudging is blocked for locked views

## Requirements *(mandatory)*

### Functional Requirements

**Lock/Unlock Functionality**

- **FR-001**: System MUST allow users to lock selected views using keyboard shortcut Ctrl+L
- **FR-002**: System MUST allow users to unlock selected views using keyboard shortcut Ctrl+Shift+L
- **FR-003**: Locked views MUST NOT be movable via drag operations on the canvas
- **FR-004**: Locked views MUST NOT be resizable via resize handles or keyboard shortcuts
- **FR-005**: Locked views MUST NOT be deletable via Delete or Backspace keys
- **FR-006**: Locked views MUST remain selectable on the canvas and in the hierarchy
- **FR-007**: System MUST display a distinct selection style for locked views (selection border without resize handles)
- **FR-007a**: Locked views MUST display a small lock icon overlay in the top-right corner on the canvas, visible regardless of selection state
- **FR-007b**: Properties Panel MUST block editing of origin and size attributes for locked views (disabled/read-only state with visual indication)

**Hide/Show Functionality**

- **FR-008**: System MUST allow users to hide selected views using keyboard shortcut Ctrl+H
- **FR-009**: System MUST allow users to show all hidden views using keyboard shortcut Ctrl+Shift+H
- **FR-010**: Hidden views MUST NOT be rendered on the canvas
- **FR-011**: Hidden views MUST NOT be selectable via click or marquee selection on the canvas
- **FR-012**: Hidden views MUST remain visible and selectable in the hierarchy panel
- **FR-013**: When a container view is hidden, all its child views MUST also be hidden on the canvas

**Visual Indicators**

- **FR-014**: Hierarchy panel MUST display a lock icon next to locked view names
- **FR-015**: Hierarchy panel MUST display a hidden (eye-slash) icon next to hidden view names
- **FR-016**: Views that are both locked and hidden MUST display both icons in the hierarchy

**State Management**

- **FR-017**: Lock and hide states MUST be editor-only (not persisted to the uidesc file)
- **FR-018**: Lock and hide states MUST be reset when loading a new document
- **FR-019**: Lock/hide actions MUST support undo/redo operations with atomic granularity (bulk lock/hide of N views = single undo step)

**Multi-Selection Behavior**

- **FR-020**: When multiple views are selected and lock is triggered, all selected views MUST become locked
- **FR-021**: When multiple views are selected (mixed locked/unlocked) and dragged, only unlocked views MUST move
- **FR-022**: When multiple views are selected and hide is triggered, all selected views MUST become hidden

**Context Menu**

- **FR-023**: Right-click context menu MUST include Lock/Unlock option based on current view state. For multi-selection with mixed lock states, display "Lock" if any view is unlocked (action locks all), display "Unlock" only if all views are locked
- **FR-024**: Right-click context menu MUST include Hide/Show option based on current view state. For multi-selection with mixed hidden states, display "Hide" if any view is visible (action hides all), display "Show" only if all views are hidden

### Key Entities

- **ViewLockState**: Tracks which views are locked (Set of view IDs)
- **ViewHiddenState**: Tracks which views are hidden (Set of view IDs)
- **LockHideStore**: Reactive store managing lock and hide state for all views, with actions for lock, unlock, hide, show, and bulk operations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can lock any selected view within 1 second using keyboard shortcut
- **SC-002**: Users can visually distinguish locked views from unlocked views on canvas (different selection style)
- **SC-003**: Users can visually identify locked and hidden views in hierarchy panel via icons
- **SC-004**: Hidden views do not interfere with canvas interactions (clicks pass through to views below)
- **SC-005**: Lock/hide state changes can be undone and redone
- **SC-006**: All lock/hide keyboard shortcuts work reliably with zero false activations
- **SC-007**: System supports locking/hiding of 100+ views while maintaining 60fps and <100ms operation time

## Assumptions

- Lock and hide are independent states - a view can be both locked and hidden simultaneously
- The "Show All" command (Ctrl+Shift+H) reveals all hidden views, not just the selected ones
- Hiding a view via Ctrl+H on an already hidden view toggles it to visible (for single selection)
- Lock/hide state is purely cosmetic and does not affect the document structure
- Arrow key nudging is considered a "move" operation and is blocked for locked views
- Property editing is allowed on locked views, EXCEPT for origin and size attributes which are blocked (consistent with spatial modification protection)
- Copy/paste operations work on locked views (copy is allowed, paste is unaffected by lock state)

## Clarifications

### Session 2026-01-10

- Q: Should locked views have a visual overlay or indicator directly on the canvas when NOT selected? → A: Small lock icon overlay on locked views (visible always on canvas)
- Q: When right-clicking with a multi-selection containing mixed lock states, what should the context menu display? → A: Show "Lock" if any view is unlocked (locks all), "Unlock" if all are locked
- Q: Should the Properties Panel block editing of positional attributes (origin, size) for locked views, consistent with drag/resize blocking? → A: Yes, block origin/size property editing for locked views (consistent protection)
- Q: When locking/hiding multiple views at once, should the undo operation restore them as a single atomic action, or as individual per-view undos? → A: Single atomic undo (lock 5 views -> one Ctrl+Z unlocks all 5)

## Re-usable Existing Functionality

The following existing functionality can be leveraged for this feature:

1. **selectionStore** (`src/stores/selectionStore.ts`): Use existing `selectedIds` signal to determine which views to lock/hide. The store pattern (signals + actions) should be followed for the new lockHideStore.

2. **hierarchyStore** (`src/stores/hierarchyStore.ts`): Use the same Set-based state pattern for tracking locked and hidden view IDs.

3. **historyStore** (`src/stores/historyStore.ts`): Use `pushOperation` for undo/redo support of lock/hide actions.

4. **TreeNode component** (`src/components/HierarchyPanel/TreeNode.tsx`): Extend to display lock and hidden icons. The component already uses FontAwesome icons and has the infrastructure for additional icons.

5. **SelectionOverlay component** (`src/components/Canvas/SelectionOverlay.tsx`): Modify to conditionally hide resize handles when a view is locked.

6. **dragStore/resizeStore**: These stores should check lock state before allowing operations to proceed.

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
| FR-007a | ⬜ PENDING | [Test or file that verifies this] |
| FR-007b | ⬜ PENDING | [Test or file that verifies this] |
| FR-008 | ⬜ PENDING | [Test or file that verifies this] |
| FR-009 | ⬜ PENDING | [Test or file that verifies this] |
| FR-010 | ⬜ PENDING | [Test or file that verifies this] |
| FR-011 | ⬜ PENDING | [Test or file that verifies this] |
| FR-012 | ⬜ PENDING | [Test or file that verifies this] |
| FR-013 | ⬜ PENDING | [Test or file that verifies this] |
| FR-014 | ⬜ PENDING | [Test or file that verifies this] |
| FR-015 | ⬜ PENDING | [Test or file that verifies this] |
| FR-016 | ⬜ PENDING | [Test or file that verifies this] |
| FR-017 | ⬜ PENDING | [Test or file that verifies this] |
| FR-018 | ⬜ PENDING | [Test or file that verifies this] |
| FR-019 | ⬜ PENDING | [Test or file that verifies this] |
| FR-020 | ⬜ PENDING | [Test or file that verifies this] |
| FR-021 | ⬜ PENDING | [Test or file that verifies this] |
| FR-022 | ⬜ PENDING | [Test or file that verifies this] |
| FR-023 | ⬜ PENDING | [Test or file that verifies this] |
| FR-024 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |
| SC-006 | ⬜ PENDING | [Measurement or test result] |
| SC-007 | ⬜ PENDING | [Measurement or test result] |

**WARNING**: Any NOT MET requires explicit user approval before claiming completion.

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
