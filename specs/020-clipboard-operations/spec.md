# Feature Specification: Clipboard Operations

**Feature Branch**: `020-clipboard-operations`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Implement clipboard operations (copy, cut, paste, duplicate) for selected views"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Copy and Paste Views (Priority: P1)

As a user editing a UI layout, I want to copy selected views and paste them elsewhere so that I can quickly replicate UI elements without recreating them manually.

**Why this priority**: Copy/paste is the most fundamental clipboard operation and enables rapid UI development by reusing existing elements.

**Independent Test**: Select a view, press Ctrl+C, press Ctrl+V, verify a duplicate view appears offset from the original with all properties preserved.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I press Ctrl+C then Ctrl+V, **Then** a copy of the view appears offset from the original
2. **Given** multiple views are selected, **When** I press Ctrl+C then Ctrl+V, **Then** copies of all selected views appear with their relative positions preserved
3. **Given** I copied a view, **When** I paste multiple times, **Then** each paste creates a new copy at an incremental offset
4. **Given** a container with children is selected, **When** I copy and paste, **Then** the container and all its children are copied as a unit

---

### User Story 2 - Cut and Paste Views (Priority: P1)

As a user, I want to cut views and paste them to move elements between different parts of my layout efficiently.

**Why this priority**: Cut/paste complements copy/paste and is essential for reorganizing layouts without manually recreating elements.

**Independent Test**: Select a view, press Ctrl+X, verify view is removed, press Ctrl+V, verify view appears at paste location.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I press Ctrl+X, **Then** the view is removed from the canvas and stored in clipboard
2. **Given** I cut a view, **When** I press Ctrl+V, **Then** the view appears at the paste location
3. **Given** I cut a view, **When** I press Ctrl+Z, **Then** the cut operation is undone and the view is restored
4. **Given** I cut a view and paste it, **When** I press Ctrl+Z, **Then** the paste is undone (view disappears) and another Ctrl+Z restores the original cut view

---

### User Story 3 - Duplicate Views (Priority: P1)

As a user, I want to quickly duplicate selected views with a single shortcut so that I can rapidly create multiple similar elements.

**Why this priority**: Duplicate is a streamlined single-step operation that combines copy+paste for maximum efficiency.

**Independent Test**: Select a view, press Ctrl+D, verify a duplicate appears immediately offset from the original.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I press Ctrl+D, **Then** a duplicate view appears offset from the original
2. **Given** multiple views are selected, **When** I press Ctrl+D, **Then** all selected views are duplicated with relative positions preserved
3. **Given** I duplicated a view, **When** I press Ctrl+Z, **Then** the duplicate is removed

---

### User Story 4 - Paste into Container (Priority: P2)

As a user, I want to paste copied views as children of a selected container so that I can easily populate containers with content.

**Why this priority**: Enables structured layout building but requires P1 copy/paste to be functional first.

**Independent Test**: Copy a view, select a container, paste, verify the view becomes a child of the container.

**Acceptance Scenarios**:

1. **Given** I copied a view and a container is selected, **When** I paste, **Then** the copied view becomes a child of the selected container
2. **Given** I copied a view and no container is selected, **When** I paste, **Then** the view is pasted as a sibling of the original (same parent)
3. **Given** I copied a view and a non-container view is selected, **When** I paste, **Then** the view is pasted as a sibling of the selected view

---

### User Story 5 - Paste at Cursor Position (Priority: P3)

As a user, I want pasted views to appear near my cursor position so that I can place elements precisely where I want them.

**Why this priority**: Enhances usability but basic offset paste from P1 is sufficient for MVP.

**Independent Test**: Copy a view, move cursor to a specific canvas location, paste, verify view appears near the cursor.

**Acceptance Scenarios**:

1. **Given** I copied a view and my cursor is over the canvas, **When** I paste, **Then** the view appears centered at the cursor position
2. **Given** I copied multiple views and my cursor is over the canvas, **When** I paste, **Then** the views appear with their group centered at the cursor position

---

### Edge Cases

- What happens when pasting views that would exceed parent bounds? Views are pasted anyway; users can reposition afterward.
- What happens when pasting into the root template (which cannot have siblings)? Views are pasted as children of the root.
- What happens when clipboard is empty and user tries to paste? Nothing happens (no error, no action).
- What happens when cutting the root template? Cut operation is blocked; root cannot be cut or deleted.
- What happens when duplicating a view would cause ID conflicts? Each pasted/duplicated view receives a new unique ID.
- What happens when pasting across different templates? Pasted views receive new IDs and are independent copies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST copy selected view(s) to clipboard when Ctrl+C is pressed
- **FR-002**: System MUST copy all children recursively when copying a container view
- **FR-003**: System MUST paste clipboard contents when Ctrl+V is pressed, creating new views with unique IDs
- **FR-004**: System MUST offset pasted views from their original position to make them visible
- **FR-005**: System MUST preserve relative positions when pasting multiple views
- **FR-006**: System MUST cut selected view(s) when Ctrl+X is pressed (copy then delete)
- **FR-007**: System MUST support undo for cut operations (restoring cut views)
- **FR-008**: System MUST support undo for paste operations (removing pasted views)
- **FR-009**: System MUST duplicate selected view(s) when Ctrl+D is pressed (copy and immediately paste)
- **FR-010**: System MUST paste views as children of selected container when one is selected
- **FR-011**: System MUST paste views as siblings when a non-container or no view is selected
- **FR-012**: System MUST prevent cut/copy operations when no views are selected
- **FR-013**: System MUST prevent cutting the root template view
- **FR-014**: System MUST select the newly pasted/duplicated views after the operation
- **FR-015**: System MUST preserve all view attributes (except ID) when copying

### Key Entities

- **Clipboard**: Stores serialized view data (structure with attributes and children) for paste operations
- **View Copy**: A deep clone of a view including all attributes and nested children with new unique IDs
- **Paste Offset**: The displacement applied to pasted views to prevent exact overlap (default: 10px right and down)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can copy and paste a view with a single Ctrl+C, Ctrl+V sequence
- **SC-002**: Users can duplicate a view with a single Ctrl+D keypress
- **SC-003**: All clipboard operations complete instantly (no perceptible delay)
- **SC-004**: 100% of clipboard operations can be fully reversed with undo
- **SC-005**: Pasted views appear in a visible location (not obscured by original)
- **SC-006**: Container hierarchies are preserved when copying/pasting nested views

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
| SC-006 | ⬜ PENDING | [Measurement or test result] |

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
