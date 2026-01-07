# Feature Specification: View Creation & Deletion

**Feature Branch**: `017-view-creation`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "View Creation & Deletion - Add view palette with categorized view classes, drag-to-create, delete views, duplicate (Ctrl+D), and clipboard operations (copy/cut/paste)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Selected Views (Priority: P1)

As a user editing a uidesc file, I want to delete selected views by pressing the Delete key so that I can remove unwanted elements from my layout.

**Why this priority**: Deletion is the most fundamental operation - users need to remove mistakes or unwanted views before they can effectively build layouts. Without delete, the editor is effectively broken for iterative design.

**Independent Test**: Select one or more views on canvas, press Delete key, verify views are removed from both canvas and document structure. Verify undo restores deleted views.

**Acceptance Scenarios**:

1. **Given** a single view is selected, **When** user presses Delete key, **Then** the view is removed from canvas and document
2. **Given** multiple views are selected, **When** user presses Delete key, **Then** all selected views are removed
3. **Given** a container with children is selected, **When** user presses Delete key, **Then** the container and all its descendants are removed
4. **Given** views were just deleted, **When** user presses Ctrl+Z, **Then** deleted views are restored to their original positions and hierarchy
5. **Given** no views are selected, **When** user presses Delete key, **Then** nothing happens (no error)

---

### User Story 2 - Duplicate Selected Views (Priority: P2)

As a user, I want to duplicate selected views using Ctrl+D so that I can quickly create copies of existing elements without manually recreating them.

**Why this priority**: Duplication is the fastest way to create new content - users often design by copying and modifying existing elements. This accelerates workflow significantly.

**Independent Test**: Select one or more views, press Ctrl+D, verify duplicates appear offset from originals with same properties. Verify undo removes duplicates.

**Acceptance Scenarios**:

1. **Given** a single view is selected, **When** user presses Ctrl+D, **Then** a duplicate is created offset by 10px right and 10px down
2. **Given** multiple views are selected, **When** user presses Ctrl+D, **Then** all selected views are duplicated maintaining their relative positions
3. **Given** a container with children is selected, **When** user presses Ctrl+D, **Then** the container and all descendants are duplicated as a unit
4. **Given** duplicate was just created, **When** user presses Ctrl+Z, **Then** the duplicate is removed
5. **Given** no views are selected, **When** user presses Ctrl+D, **Then** nothing happens (no error)
6. **Given** a view is duplicated, **When** inspecting the duplicate, **Then** it has all the same attributes as the original (except origin)

---

### User Story 3 - Copy, Cut, and Paste Views (Priority: P3)

As a user, I want to copy/cut views and paste them elsewhere so that I can move or replicate content within or across templates.

**Why this priority**: Clipboard operations are essential for complex editing but can be implemented after basic duplicate. They enable cross-template workflows.

**Independent Test**: Select views, copy (Ctrl+C), paste (Ctrl+V), verify pasted views appear. Test cut (Ctrl+X) removes originals. Verify paste works multiple times from single copy.

**Acceptance Scenarios**:

1. **Given** views are selected, **When** user presses Ctrl+C, **Then** views are copied to internal clipboard (no visual change)
2. **Given** views are copied to clipboard, **When** user presses Ctrl+V, **Then** copies appear offset by 10px from original positions
3. **Given** views are selected, **When** user presses Ctrl+X, **Then** views are copied to clipboard AND removed from canvas
4. **Given** views were cut, **When** user presses Ctrl+V, **Then** views are pasted at offset position
5. **Given** views are in clipboard, **When** user presses Ctrl+V multiple times, **Then** each paste creates new copies at incremental offsets
6. **Given** a container with children is copied, **When** pasting, **Then** the entire hierarchy is pasted
7. **Given** views were cut, **When** user presses Ctrl+Z, **Then** cut views are restored (cut is undoable)

---

### User Story 4 - View Palette Panel (Priority: P4)

As a user, I want a palette panel showing all available view classes organized by category so that I can see what types of views I can create.

**Why this priority**: The palette is the UI for discovering and selecting view types. While essential for full creation workflow, basic operations (delete, duplicate, clipboard) work without it.

**Independent Test**: Open editor, verify palette panel displays categorized list of all VSTGUI view classes. Verify categories are collapsible. Verify search filters the list.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** looking at the left sidebar, **Then** a view palette panel is visible below the hierarchy panel
2. **Given** the palette is visible, **When** examining the list, **Then** view classes are organized into categories (Containers, Controls, Displays, etc.)
3. **Given** the palette is visible, **When** clicking a category header, **Then** the category expands/collapses
4. **Given** the palette is visible, **When** typing in the search field, **Then** the list filters to show only matching class names
5. **Given** search has results, **When** clearing the search, **Then** all categories are shown again

---

### User Story 5 - Drag from Palette to Create (Priority: P5)

As a user, I want to drag a view class from the palette onto the canvas to create a new view instance so that I can add new elements to my layout.

**Why this priority**: This is the primary creation method. It requires the palette (US4) and is the most intuitive way to add new views.

**Independent Test**: Drag a view class from palette onto canvas, verify a new view is created at drop location with default size and properties.

**Acceptance Scenarios**:

1. **Given** user starts dragging a view class from palette, **When** dragging over canvas, **Then** a ghost preview shows where the view will be created
2. **Given** user is dragging over a container on canvas, **When** releasing mouse, **Then** new view is created as child of that container
3. **Given** user is dragging over empty canvas area (template root), **When** releasing mouse, **Then** new view is created as child of template root
4. **Given** user creates a view, **When** examining the new view, **Then** it has sensible default size (100x30 for controls, 200x200 for containers)
5. **Given** user creates a view, **When** examining the new view, **Then** it has the correct class attribute for the dragged type
6. **Given** a view was just created by drag, **When** user presses Ctrl+Z, **Then** the created view is removed
7. **Given** user is dragging, **When** releasing outside the canvas, **Then** no view is created (drag cancelled)
8. **Given** user creates a view, **When** creation completes, **Then** the new view is automatically selected

---

### Edge Cases

- What happens when deleting a view that is referenced by another view's `template` attribute? (Assumption: Allow deletion, no referential integrity enforcement in this phase)
- What happens when pasting views that reference named resources (colors, fonts) that don't exist in target? (Assumption: Paste succeeds, resource references remain as strings)
- What happens when duplicating/pasting would place views outside template bounds? (Assumption: Allow it, user can move views afterward)
- What happens when user tries to create a view inside a non-container view? (Assumption: Create as sibling instead, or at template root)
- What happens when clipboard is empty and user presses Ctrl+V? (Nothing happens, no error)

## Requirements *(mandatory)*

### Functional Requirements

**Deletion:**
- **FR-001**: System MUST delete selected view(s) when user presses Delete or Backspace key
- **FR-002**: System MUST delete container views along with all their descendants
- **FR-003**: System MUST support undo/redo for delete operations
- **FR-004**: System MUST do nothing when Delete is pressed with no selection

**Duplication:**
- **FR-005**: System MUST duplicate selected view(s) when user presses Ctrl+D
- **FR-006**: System MUST offset duplicated views by 10 pixels right and 10 pixels down from originals
- **FR-007**: System MUST duplicate container views along with all their descendants
- **FR-008**: System MUST preserve all attributes of duplicated views (except origin)
- **FR-009**: System MUST select the newly duplicated views after duplication
- **FR-010**: System MUST support undo/redo for duplicate operations

**Clipboard:**
- **FR-011**: System MUST copy selected view(s) to internal clipboard when user presses Ctrl+C
- **FR-012**: System MUST cut selected view(s) (copy + delete) when user presses Ctrl+X
- **FR-013**: System MUST paste clipboard contents when user presses Ctrl+V
- **FR-014**: System MUST offset pasted views by 10 pixels from their original positions
- **FR-015**: System MUST allow multiple pastes from a single copy operation
- **FR-016**: System MUST copy/paste container views along with all their descendants
- **FR-017**: System MUST select the newly pasted views after paste
- **FR-018**: System MUST support undo/redo for cut and paste operations

**View Palette:**
- **FR-019**: System MUST display a view palette panel with all available VSTGUI view classes
- **FR-020**: System MUST organize view classes into logical categories (Containers, Controls, Displays, etc.)
- **FR-021**: System MUST allow expanding/collapsing categories in the palette
- **FR-022**: System MUST provide a search field to filter view classes by name

**Drag-to-Create:**
- **FR-023**: System MUST allow dragging view classes from palette onto canvas
- **FR-024**: System MUST show a ghost preview while dragging over canvas
- **FR-025**: System MUST create new view as child of the container under drop point
- **FR-026**: System MUST create new views with sensible default sizes based on view class
- **FR-027**: System MUST select newly created views after creation
- **FR-028**: System MUST support undo/redo for create operations
- **FR-029**: System MUST generate unique IDs for newly created views

### Key Entities

- **Clipboard**: Internal storage for copied/cut view data (not system clipboard)
- **View Class**: The type of view to create (e.g., CView, CViewContainer, CKnob, CTextButton)
- **View Instance**: A concrete view in the document with id, class, origin, size, and other attributes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can delete any selected view(s) in under 1 second (single keypress)
- **SC-002**: Users can duplicate selected views in under 1 second (single keyboard shortcut)
- **SC-003**: Users can copy and paste views within 2 seconds (two keyboard shortcuts)
- **SC-004**: Users can create a new view from palette in under 3 seconds (drag and drop)
- **SC-005**: All creation/deletion operations are undoable within 1 second (Ctrl+Z)
- **SC-006**: View palette displays all 30+ VSTGUI view classes in categorized list
- **SC-007**: Search in palette returns matching results as user types (no delay)

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | `useCanvasKeyboard.spec.ts`: "should delete selected views on Delete key", "should delete selected views on Backspace key" |
| FR-002 | ✅ MET | `viewOperations.spec.ts`: "should delete container with all children" |
| FR-003 | ✅ MET | `viewOperations.spec.ts`: "should integrate with history store for undo/redo" |
| FR-004 | ✅ MET | `viewOperations.spec.ts`: "should return empty array when no views are selected" |
| FR-005 | ✅ MET | `useCanvasKeyboard.spec.ts`: "should duplicate selected views on Ctrl+D" |
| FR-006 | ✅ MET | `viewOperations.spec.ts`: "should duplicate a single selected view with 10px offset" |
| FR-007 | ✅ MET | `viewOperations.spec.ts`: "should duplicate container with all children" |
| FR-008 | ✅ MET | `documentStore.ts`: `duplicateView()` uses `cloneViewNode()` to preserve all attributes |
| FR-009 | ✅ MET | `viewOperations.spec.ts`: "should select duplicated views after duplication" |
| FR-010 | ✅ MET | `viewOperations.spec.ts`: "should undo duplication by removing duplicated views" |
| FR-011 | ✅ MET | `viewOperations.spec.ts`: "should copy a selected view to clipboard" |
| FR-012 | ✅ MET | `viewOperations.spec.ts`: "should copy and delete selected views" (cutSelectedViews) |
| FR-013 | ✅ MET | `useCanvasKeyboard.spec.ts`: "should paste views on Ctrl+V" |
| FR-014 | ✅ MET | `viewOperations.spec.ts`: "should paste views from clipboard with offset" |
| FR-015 | ✅ MET | `viewOperations.spec.ts`: "should increment paste offset on multiple pastes" |
| FR-016 | ✅ MET | `serialization.ts`: `serializeView()` and `deserializeView()` handle nested children |
| FR-017 | ✅ MET | `viewOperations.ts`: `pasteViews()` calls `selectAll(pastedIds)` |
| FR-018 | ✅ MET | `viewOperations.spec.ts`: "should undo paste by removing pasted views" |
| FR-019 | ✅ MET | `ViewPalette.spec.tsx`: "renders all categories" - 5 categories with 32 view classes |
| FR-020 | ✅ MET | `viewClasses.ts`: `PALETTE_CATEGORIES` defines Containers, Controls, Displays, Text Input, Animation |
| FR-021 | ✅ MET | `PaletteCategory.spec.tsx`: "toggles expansion on click", "toggles expansion on Enter key" |
| FR-022 | ✅ MET | `ViewPalette.spec.tsx`: "filters items when searching", "search is case-insensitive" |
| FR-023 | ✅ MET | `PaletteItem.tsx`: `draggable="true"` with `onDragStart` handler |
| FR-024 | ⚠️ PARTIAL | `Canvas.module.css`: `.dropTarget` shows dashed outline; ghost preview not implemented |
| FR-025 | ✅ MET | `viewOperations.spec.ts`: "should create a view with default size" using `findContainerAtPoint()` |
| FR-026 | ✅ MET | `viewDefaults.ts`: `getDefaultSize()` returns sensible defaults per view class |
| FR-027 | ✅ MET | `viewOperations.spec.ts`: "should select the new view after creation" |
| FR-028 | ✅ MET | `viewOperations.spec.ts`: "should undo creation by removing the view" |
| FR-029 | ✅ MET | `idGenerator.ts`: `generateViewId()` creates unique IDs; `documentStore.ts` uses `generateChildKey()` |
| SC-001 | ✅ MET | Delete key triggers immediate deletion via keyboard event handler |
| SC-002 | ✅ MET | Ctrl+D triggers immediate duplication via keyboard event handler |
| SC-003 | ✅ MET | Ctrl+C and Ctrl+V work via keyboard event handlers |
| SC-004 | ✅ MET | Drag-drop creates view on mouse release |
| SC-005 | ✅ MET | All operations create history operations with undo functions |
| SC-006 | ✅ MET | `viewClasses.ts`: 32 view classes across 5 categories |
| SC-007 | ✅ MET | `paletteStore.ts`: `filteredClasses` computed memo updates on search input |

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
