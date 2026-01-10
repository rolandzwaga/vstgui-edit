# Tasks: Custom Guides

**Input**: Design documents from `/specs/033-custom-guides/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included per specification requirement (TDD approach). Each test task must be written and failing BEFORE implementation.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types and Design Tokens)

**Purpose**: Create type definitions and design tokens needed by all user stories

- [X] T001 Create guide type definitions in src/types/guides.ts (GuideOrientation, CustomGuide, GuidesState, GuideCreationDrag, GuideRepositionDrag per data-model.md) [FR-001, FR-002, FR-017]
- [X] T001.5 [P] Verify src/types/snap.ts has SnapSource type and guide-related fields (snappedTo, guideId) on SnapResult - add if missing [FR-009, FR-010]
- [X] T002 [P] Update src/types/history.ts to add guide operation types to HistoryOperation.type union ('guide-create', 'guide-delete', 'guide-reposition', 'guide-clear-all') [FR-022]
- [X] T003 [P] Add guide design token to src/styles/tokens.css (--color-custom-guide: #00bfff) [FR-006]
- [X] T004 **Commit**: Stage and commit Phase 1 changes with message "feat(033): add guide types and design tokens"

---

## Phase 2: Foundational (Domain Utilities and Store)

**Purpose**: Pure domain logic and state management that MUST be complete before ANY user story components

**CRITICAL**: No component work can begin until this phase is complete

### Domain: guideOperations.ts (Test-First)

- [X] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with test tasks
- [X] T006 [P] Write tests for generateGuideId in src/domain/guides/__tests__/guideOperations.spec.ts (unique IDs, format 'guide-{timestamp}-{random}')
- [X] T007 [P] Write tests for createGuide in src/domain/guides/__tests__/guideOperations.spec.ts (creates with ID, correct orientation and position)
- [X] T008 [P] Write tests for guideExistsAtPosition and findGuideByPosition in src/domain/guides/__tests__/guideOperations.spec.ts (finds exact match, different orientation not match, findGuideByPosition returns guide or null) [FR-020]
- [X] T009 [P] Write tests for addGuideToCollection in src/domain/guides/__tests__/guideOperations.spec.ts (adds new guide, returns null for duplicate) [FR-020]
- [X] T010 [P] Write tests for removeGuideFromCollection in src/domain/guides/__tests__/guideOperations.spec.ts (removes by ID, returns null if not found)
- [X] T011 [P] Write tests for updateGuidePosition in src/domain/guides/__tests__/guideOperations.spec.ts (updates position, returns false if not found or unchanged)
- [X] T012 [P] Write tests for canAddGuide in src/domain/guides/__tests__/guideOperations.spec.ts (validates duplicate, max guides exceeded at 50) [FR-020, SC-004]
- [X] T013 [P] Write tests for utility functions in src/domain/guides/__tests__/guideOperations.spec.ts (roundGuidePosition, getHorizontalGuides, getVerticalGuides, sortGuidesByPosition)
- [X] T014 Implement guideOperations.ts in src/domain/guides/guideOperations.ts with all functions per contract

### Domain: historyOperations.ts (Test-First)

- [X] T015 [P] Write tests for createGuideCreateOperation in src/domain/guides/__tests__/historyOperations.spec.ts (type, description, undo deletes, redo re-adds) [FR-022]
- [X] T016 [P] Write tests for createGuideDeleteOperation in src/domain/guides/__tests__/historyOperations.spec.ts (type, description, undo re-adds, redo deletes) [FR-022]
- [X] T017 [P] Write tests for createGuideRepositionOperation in src/domain/guides/__tests__/historyOperations.spec.ts (type, description, undo restores old position, redo applies new) [FR-022]
- [X] T018 [P] Write tests for createGuideClearAllOperation in src/domain/guides/__tests__/historyOperations.spec.ts (type, description, undo restores all guides, redo clears) [FR-022]
- [X] T019 [P] Write tests for description formatters in src/domain/guides/__tests__/historyOperations.spec.ts (formatGuideCreateDescription, formatGuideDeleteDescription, formatGuideRepositionDescription, formatGuideClearAllDescription)
- [X] T020 Implement historyOperations.ts in src/domain/guides/historyOperations.ts with all functions per contract

### Domain: guideSnap.ts (Test-First)

- [X] T021 [P] Write tests for snapToGuide in src/domain/guides/__tests__/guideSnap.spec.ts (snaps to nearest guide within threshold, returns no-snap when outside threshold, filters by orientation) [FR-009, FR-010]
- [X] T022 [P] Write tests for snapToNearest in src/domain/guides/__tests__/guideSnap.spec.ts (prefers closer of grid or guide, respects enabled flags, handles both disabled) [FR-009, FR-010]
- [X] T023 [P] Write tests for snapPointWithGuides in src/domain/guides/__tests__/guideSnap.spec.ts (snaps X to vertical guides, Y to horizontal guides, returns snapped guide IDs) [FR-009]
- [X] T024 [P] Write tests for snapEdgesWithGuides in src/domain/guides/__tests__/guideSnap.spec.ts (snaps active edges based on handle, all 8 handles tested) [FR-010]
- [X] T025 [P] Write tests for applySnapToMoveWithGuides in src/domain/guides/__tests__/guideSnap.spec.ts (anchor view snaps, delta applied to all, returns guide IDs) [FR-009]
- [X] T026 [P] Write tests for applySnapToResizeWithGuides in src/domain/guides/__tests__/guideSnap.spec.ts (edge snaps, returns adjusted origin/size) [FR-010]
- [X] T027 [P] Write tests for utility functions in src/domain/guides/__tests__/guideSnap.spec.ts (filterGuidesByOrientation, findClosestGuide)
- [X] T028 Implement guideSnap.ts in src/domain/guides/guideSnap.ts with all functions per contract

### Domain: Barrel Export

- [X] T029 Create barrel exports in src/domain/guides/index.ts (export all functions and constants from guideOperations, historyOperations, guideSnap)

### Store: guidesStore (Test-First)

- [X] T030 Write tests for guidesStore initial state in src/stores/__tests__/guidesStore.spec.ts (empty guides, isVisible true, isSnapEnabled true, no active drags) using testInRoot wrapper
- [X] T031 [P] Write tests for CRUD actions in src/stores/__tests__/guidesStore.spec.ts (addGuide, deleteGuide, repositionGuide, clearAllGuides, getGuideById) [FR-004, FR-019, FR-020, FR-021]
- [X] T032 [P] Write tests for history-enabled CRUD in src/stores/__tests__/guidesStore.spec.ts (addGuideWithHistory, deleteGuideWithHistory, repositionGuideWithHistory, clearAllGuidesWithHistory push to historyStore) [FR-022]
- [X] T033 [P] Write tests for visibility/snap toggles in src/stores/__tests__/guidesStore.spec.ts (toggleGuidesVisibility, setGuidesVisibility, toggleGuidesSnap, setGuidesSnap, isSnapEnabled returns false when hidden) [FR-012, FR-013]
- [X] T034 [P] Write tests for creation drag lifecycle in src/stores/__tests__/guidesStore.spec.ts (startCreationDrag, updateCreationDrag, completeCreationDrag creates guide when over canvas, cancelCreationDrag) [FR-001, FR-002, FR-003, FR-018]
- [X] T035 [P] Write tests for reposition drag lifecycle in src/stores/__tests__/guidesStore.spec.ts (startRepositionDrag, updateRepositionDrag, completeRepositionDrag repositions or deletes, cancelRepositionDrag restores position) [FR-015, FR-017, FR-018]
- [X] T036 [P] Write tests for convenience accessors in src/stores/__tests__/guidesStore.spec.ts (horizontalGuides, verticalGuides filter correctly)
- [X] T037 [P] Write tests for resetGuidesStore in src/stores/__tests__/guidesStore.spec.ts (clears all state) [FR-019]
- [X] T038 Implement guidesStore in src/stores/guidesStore.ts with all exports per contract

- [X] T039 **Commit**: Stage and commit Phase 2 changes with message "feat(033): add guide domain utilities and store"

**Checkpoint**: Foundation ready - all domain utilities tested and working, store ready

---

## Phase 3: User Story 1 - Create Guide by Dragging from Ruler (Priority: P1)

**Goal**: Users can drag from horizontal or vertical ruler to create persistent guide lines on the canvas

**Independent Test**: Drag from ruler onto canvas, verify guide line appears and persists after release

**Acceptance Criteria**:
- Horizontal guide created by dragging from top ruler
- Vertical guide created by dragging from left ruler
- Preview shows during drag
- Release over canvas creates guide
- Release outside canvas or Escape cancels

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T040 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T041 [P] [US1] Write tests for GuidePreview in src/components/Canvas/Guides/__tests__/GuidePreview.spec.tsx (renders during creationDrag, correct orientation line, follows cursor position, hidden when no drag) [FR-003]
- [X] T042 [P] [US1] Write tests for drag-to-create in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (mousedown starts creation drag with horizontal orientation, mousemove updates position) [FR-001]
- [X] T043 [P] [US1] Write tests for drag-to-create in src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx (mousedown starts creation drag with vertical orientation, mousemove updates position) [FR-002]

### Implementation for User Story 1

- [X] T044 [P] [US1] Create GuidePreview component in src/components/Canvas/Guides/GuidePreview.tsx (reads creationDrag from guidesStore, renders line at currentPosition, zoom-invariant stroke) [FR-003]
- [X] T045 [P] [US1] Create GuidePreview.module.css in src/components/Canvas/Guides/GuidePreview.module.css (dashed cyan line using --color-custom-guide token)
- [X] T046 [US1] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to add onMouseDown handler that starts horizontal creation drag [FR-001]
- [X] T047 [US1] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx to add onMouseDown handler that starts vertical creation drag [FR-002]
- [X] T048 [US1] Update RulerContainer or Canvas to handle document mousemove/mouseup for creation drag updates and completion [FR-001, FR-002, FR-018]
- [X] T049 [US1] Add keyboard handler for Escape to cancel creation drag [FR-018]
- [X] T050 [US1] Create barrel exports in src/components/Canvas/Guides/index.ts
- [X] T051 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(033): add drag-to-create guides from rulers"

**Checkpoint**: Users can create guides by dragging from rulers

---

## Phase 4: User Story 3 - Visual Guide Display (Priority: P1)

**Goal**: Guides render as visually distinct dashed cyan lines spanning full canvas dimension

**Independent Test**: Create a guide and verify it renders as a dashed cyan line across the full canvas

**Acceptance Criteria**:
- Horizontal guides span full canvas width at fixed Y
- Vertical guides span full canvas height at fixed X
- Guides move with pan
- Guides scale with zoom
- Guides are visually distinct from smart guides and grid

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T052 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T053 [P] [US3] Write tests for GuideLine in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (renders horizontal line full width, renders vertical line full height, uses cyan color, dashed pattern, data-testid includes guide ID) [FR-005, FR-006]
- [X] T054 [P] [US3] Write tests for GuideLine zoom behavior in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (stroke-width inversely scales with zoom for constant screen-space thickness) [FR-008, SC-006]
- [X] T055 [P] [US3] Write tests for GuidesOverlay in src/components/Canvas/Guides/__tests__/GuidesOverlay.spec.tsx (renders all guides from store, hidden when isVisible false, updates reactively) [FR-005, FR-012]

### Implementation for User Story 3

- [X] T056 [P] [US3] Create GuideLine component in src/components/Canvas/Guides/GuideLine.tsx (SVG line, full canvas span, zoom-invariant stroke) [FR-005, FR-006, FR-008]
- [X] T057 [P] [US3] Create GuideLine.module.css in src/components/Canvas/Guides/GuideLine.module.css (dashed stroke using --color-custom-guide, cursor styles)
- [X] T058 [US3] Create GuidesOverlay component in src/components/Canvas/Guides/GuidesOverlay.tsx (maps guidesStore.guides to GuideLine components, respects isVisible, includes GuidePreview) [FR-005, FR-007, FR-012]
- [X] T059 [US3] Update barrel exports in src/components/Canvas/Guides/index.ts to include GuideLine, GuidesOverlay
- [X] T060 [US3] Integrate GuidesOverlay into Canvas.tsx (render above template content but below selection overlays) [FR-005, FR-007]
- [X] T061 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(033): add guide visual rendering with zoom support"

**Checkpoint**: Guides display as visually distinct lines that work with pan/zoom

---

## Phase 5: User Story 2 - Snap to Guides During Move/Resize (Priority: P1)

**Goal**: Views snap to custom guides during move and resize operations when guide snapping is enabled

**Independent Test**: Create a guide, drag a view near it, verify view snaps to guide position

**Acceptance Criteria**:
- Top/bottom edges snap to horizontal guides during move
- Left/right edges snap to vertical guides during move
- Resize edges snap to appropriate guides
- Guide snap respects enabled/disabled state
- Grid and guide snapping coexist (closer wins)

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T062 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T063 [P] [US2] Write integration tests for move snap in src/components/Canvas/__tests__/Canvas.snap.integration.spec.tsx (view edge snaps to guide within threshold, no snap when disabled, guide snap takes precedence when closer than grid) [FR-009, FR-011, SC-002]
- [ ] T064 [P] [US2] Write integration tests for resize snap in src/components/Canvas/__tests__/Canvas.snap.integration.spec.tsx (resize edge snaps to guide, all 8 handles tested with guides) [FR-010]

### Implementation for User Story 2

- [ ] T065 [US2] Update move operation handlers in Canvas.tsx or relevant component to use applySnapToMoveWithGuides instead of existing snap function [FR-009]
- [ ] T066 [US2] Update resize operation handlers in Canvas.tsx or relevant component to use applySnapToResizeWithGuides instead of existing snap function [FR-010]
- [ ] T067 [US2] Ensure guidesStore.isSnapEnabled is checked before applying guide snap (includes hidden check per FR-013) [FR-011, FR-013]
- [ ] T068 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(033): integrate guide snapping with move and resize"

**Checkpoint**: Views snap to guides during move/resize operations

---

## Phase 6: User Story 4 - Toggle Guide Visibility (Priority: P2)

**Goal**: Users can show/hide all guides with Ctrl+; shortcut while preserving guide positions

**Independent Test**: Create guides, press Ctrl+;, verify guides disappear visually, press again to restore

**Acceptance Criteria**:
- Ctrl+; toggles guide visibility
- Hidden guides do not render
- Hidden guides do not participate in snapping
- Creating new guide while hidden shows the new guide immediately

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T069 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T070 [P] [US4] Write tests for keyboard shortcut in src/components/Canvas/__tests__/Canvas.keyboard.spec.tsx (Ctrl+; calls toggleGuidesVisibility) [FR-012]
- [ ] T071 [P] [US4] Write tests for visibility behavior in src/components/Canvas/Guides/__tests__/GuidesOverlay.spec.tsx (guides hidden when isVisible false, new guide appears even when others hidden) [FR-012, FR-013]

### Implementation for User Story 4

- [ ] T072 [US4] Add Ctrl+; keyboard handler to Canvas.tsx or keyboard handler component that calls toggleGuidesVisibility() [FR-012]
- [ ] T073 [US4] Verify GuidesOverlay respects isVisible (implemented in US3, verify no additional work needed) [FR-012]
- [ ] T074 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(033): add guide visibility toggle with Ctrl+; shortcut"

**Checkpoint**: Guide visibility can be toggled with keyboard shortcut

---

## Phase 7: User Story 5 - Delete Individual Guide (Priority: P2)

**Goal**: Users can delete individual guides by double-clicking or dragging back to source ruler

**Independent Test**: Create a guide, double-click it, verify it is removed

**Acceptance Criteria**:
- Double-click on guide deletes it
- Dragging guide to source ruler deletes it
- Only the targeted guide is deleted
- Deletion is undoable

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T075 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T076 [P] [US5] Write tests for double-click delete in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (double-click calls deleteGuideWithHistory, guide removed from store) [FR-014]
- [ ] T077 [P] [US5] Write tests for drag-to-ruler delete in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (drag to ruler area during reposition triggers delete) [FR-015]

### Implementation for User Story 5

- [ ] T078 [US5] Add onDblClick handler to GuideLine that calls deleteGuideWithHistory [FR-014]
- [ ] T079 [US5] Update completeRepositionDrag logic to delete when isOverRuler is true (already in store contract, verify implementation) [FR-015]
- [ ] T080 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(033): add guide deletion by double-click and drag-to-ruler"

**Checkpoint**: Individual guides can be deleted via double-click or drag-to-ruler

---

## Phase 8: User Story 6 - Precise Guide Positioning (Priority: P2)

**Goal**: Users can create guides at exact positions via context menu on rulers

**Independent Test**: Right-click ruler, enter position 250, verify guide created at exactly 250

**Acceptance Criteria**:
- Right-click on ruler shows context menu with "Add Guide at Position..."
- Dialog allows entering numeric pixel value
- Guide created at exact specified coordinate
- Right-click existing guide allows repositioning to exact value

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T081 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T082 [P] [US6] Write tests for context menu in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (right-click shows prompt, entering valid number creates guide at position) [FR-016]
- [ ] T083 [P] [US6] Write tests for context menu in src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx (same for vertical ruler) [FR-016]

### Implementation for User Story 6

- [ ] T084 [US6] Add onContextMenu handler to HorizontalRuler that prompts for position and creates guide [FR-016]
- [ ] T085 [US6] Add onContextMenu handler to VerticalRuler that prompts for position and creates guide [FR-016]
- [ ] T086 [US6] Add onContextMenu handler to GuideLine for repositioning existing guide via prompt [FR-016]
- [ ] T087 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(033): add context menu for precise guide positioning"

**Checkpoint**: Guides can be positioned precisely via context menu

---

## Phase 9: User Story 7 - Drag to Reposition Guide (Priority: P3)

**Goal**: Users can drag existing guides to new positions

**Independent Test**: Create a guide, drag it to a new position, verify it moves

**Acceptance Criteria**:
- Click and drag on guide line moves it
- Horizontal guides move vertically only
- Vertical guides move horizontally only
- Escape cancels and restores original position
- Snap to grid works during repositioning

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T088 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T089 [P] [US7] Write tests for guide drag in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (mousedown starts reposition drag, mousemove updates position, mouseup completes) [FR-017]
- [ ] T090 [P] [US7] Write tests for reposition cancel in src/components/Canvas/Guides/__tests__/GuideLine.spec.tsx (Escape restores original position) [FR-018]

### Implementation for User Story 7

- [ ] T091 [US7] Add onMouseDown handler to GuideLine that starts reposition drag [FR-017]
- [ ] T092 [US7] Add document mousemove/mouseup handlers for reposition drag updates and completion [FR-017]
- [ ] T093 [US7] Add keyboard handler for Escape to cancel reposition drag [FR-018]
- [ ] T094 [US7] **Commit**: Stage and commit User Story 7 changes with message "feat(033): add guide repositioning by drag"

**Checkpoint**: Guides can be repositioned by dragging

---

## Phase 10: User Story 8 - Clear All Guides (Priority: P3)

**Goal**: Users can remove all guides at once

**Independent Test**: Create multiple guides, use Clear All, verify all are removed

**Acceptance Criteria**:
- Clear All action removes all guides
- Operation is undoable
- Canvas is ready for new guides after clearing

### Tests for User Story 8

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T095 [US8] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T096 [P] [US8] Write tests for clear all in src/stores/__tests__/guidesStore.spec.ts (clearAllGuidesWithHistory removes all, undo restores all) [FR-021, FR-022]

### Implementation for User Story 8

- [ ] T097 [US8] Verify clearAllGuidesWithHistory is implemented (done in Phase 2) [FR-021]
- [ ] T098 [US8] Add Clear All Guides option to View menu or toolbar (if exists) or document context menu [FR-021]
- [ ] T099 [US8] **Commit**: Stage and commit User Story 8 changes with message "feat(033): add clear all guides action"

**Checkpoint**: All guides can be cleared at once with undo support

---

## Phase 11: Integration & Template Lifecycle

**Purpose**: Wire guides into template lifecycle, ensure cleanup

### Integration

- [ ] T100 Update documentStore or Canvas.tsx to call resetGuidesStore when template is unloaded [FR-019]
- [ ] T101 Write integration test for template unload in src/components/Canvas/__tests__/Canvas.integration.spec.tsx (guides cleared when template unloaded) [FR-019]

### Undo/Redo Integration Tests

- [ ] T102 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T103 Write integration tests for undo/redo in src/domain/guides/__tests__/integration.spec.ts (create+undo, delete+undo, reposition+undo, clear all+undo all work correctly with historyStore) [FR-022]

### Documentation

- [ ] T104 Update CLAUDE.md with guidesStore documentation in Stores section
- [ ] T105 Update CLAUDE.md with guide domain utilities in Domain Utilities section
- [ ] T106 Update CLAUDE.md Recent Changes table with 033-custom-guides entry

- [ ] T107 **Commit**: Stage and commit Phase 11 changes with message "feat(033): integrate guides with template lifecycle and add documentation"

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, performance, and documentation

- [ ] T108 Verify all tests pass with `npm test`
- [ ] T109 Verify performance requirements (60fps during guide drag, snap within 16ms, 50 guides without degradation) [SC-001, SC-002, SC-003, SC-004, SC-007]
- [ ] T110 Run quickstart.md validation scenarios
- [ ] T111 Fill out requirement compliance table in spec.md (FR-001 through FR-022, SC-001 through SC-007)
- [ ] T112 **Commit**: Stage and commit Polish phase changes with message "feat(033): complete custom guides implementation polish"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user story components
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (P1): Creates guides - foundational for all other stories
  - US3 (P1): Visual display - required to see guides
  - US2 (P1): Snap integration - core value proposition
  - US4-US8 (P2-P3): Enhancements and convenience features
- **Integration (Phase 11)**: Depends on US1-US3 minimum
- **Polish (Phase 12)**: Depends on all desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (domain utilities, store) - No dependencies on other stories
- **User Story 3 (P1)**: Can run in parallel with US1 (different components, uses store)
- **User Story 2 (P1)**: Depends on US1 (needs guides to snap to), can run parallel with US3
- **User Story 4 (P2)**: Depends on US3 (toggle visibility of rendered guides)
- **User Story 5 (P2)**: Depends on US1, US3 (need guides to delete and see them)
- **User Story 6 (P2)**: Depends on US1 (precise creation is variant of guide creation)
- **User Story 7 (P3)**: Depends on US1, US3 (need guides to reposition and see them)
- **User Story 8 (P3)**: Depends on US1 (need guides to clear)

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- CSS modules in parallel with components
- Integration after core implementation

### Parallel Opportunities

Within Phase 2 (Foundational):
```bash
# All domain test tasks can run in parallel:
T006, T007, T008, T009, T010, T011, T012, T013 (guideOperations tests)
T015, T016, T017, T018, T019 (historyOperations tests)
T021, T022, T023, T024, T025, T026, T027 (guideSnap tests)

# Store tests can run in parallel:
T030, T031, T032, T033, T034, T035, T036, T037 (guidesStore tests)
```

Within User Stories:
```bash
# US1 tests can run in parallel:
T041, T042, T043 (GuidePreview, ruler drag tests)

# US3 tests can run in parallel:
T053, T054, T055 (GuideLine, GuidesOverlay tests)

# Component and CSS can run in parallel:
T044 + T045 (GuidePreview component + CSS)
T056 + T057 (GuideLine component + CSS)
```

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T041: "Write tests for GuidePreview in src/components/Canvas/Guides/__tests__/GuidePreview.spec.tsx"
Task T042: "Write tests for drag-to-create in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx"
Task T043: "Write tests for drag-to-create in src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx"

# Launch component and CSS in parallel:
Task T044: "Create GuidePreview component"
Task T045: "Create GuidePreview.module.css"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (types, tokens)
2. Complete Phase 2: Foundational (domain utilities, store)
3. Complete Phase 3: User Story 1 (create guides from rulers)
4. Complete Phase 4: User Story 3 (visual guide display)
5. Complete Phase 5: User Story 2 (snap to guides)
6. **STOP and VALIDATE**: Test guide creation and snapping independently
7. Deploy/demo if ready

**MVP delivers**: Create guides by dragging, see guides on canvas, snap to guides during move/resize

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 (Create Guide) -> Test -> Deploy (basic creation)
3. Add US3 (Visual Display) -> Test -> Deploy (see guides)
4. Add US2 (Snap to Guides) -> Test -> Deploy (snap functionality)
5. Add US4 (Toggle Visibility) -> Test -> Deploy (hide/show)
6. Add US5-US6 (Delete, Precise Positioning) -> Test -> Deploy (management)
7. Add US7-US8 (Reposition, Clear All) -> Test -> Deploy (convenience)

### Task Count Summary

| Phase | Task Count |
|-------|------------|
| Phase 1: Setup | 5 |
| Phase 2: Foundational | 35 |
| Phase 3: US1 (P1) Create Guide | 12 |
| Phase 4: US3 (P1) Visual Display | 10 |
| Phase 5: US2 (P1) Snap to Guides | 7 |
| Phase 6: US4 (P2) Toggle Visibility | 6 |
| Phase 7: US5 (P2) Delete Guide | 6 |
| Phase 8: US6 (P2) Precise Positioning | 7 |
| Phase 9: US7 (P3) Reposition Guide | 7 |
| Phase 10: US8 (P3) Clear All | 5 |
| Phase 11: Integration | 8 |
| Phase 12: Polish | 5 |
| Phase Final-1: Quality Gates | 4 |
| Phase Final: Git Verification | 3 |
| **Total** | **120** |

---

## Requirement Traceability

| Requirement | Tasks |
|-------------|-------|
| FR-001 | T001, T042, T046, T048 |
| FR-002 | T001, T043, T047, T048 |
| FR-003 | T041, T044, T045 |
| FR-004 | T031 |
| FR-005 | T053, T055, T056, T058, T060 |
| FR-006 | T003, T053, T056, T057 |
| FR-007 | T055, T058, T060 |
| FR-008 | T054, T056 |
| FR-009 | T001.5, T021, T022, T023, T025, T063, T065 |
| FR-010 | T001.5, T021, T022, T024, T026, T064, T066 |
| FR-011 | T033, T063, T067 |
| FR-012 | T033, T055, T070, T071, T072, T073 |
| FR-013 | T033, T067, T071 |
| FR-014 | T076, T078 |
| FR-015 | T035, T077, T079 |
| FR-016 | T082, T083, T084, T085, T086 |
| FR-017 | T001, T035, T089, T091, T092 |
| FR-018 | T034, T035, T048, T049, T090, T093 |
| FR-019 | T031, T037, T100, T101 |
| FR-020 | T008, T009, T012, T031 |
| FR-021 | T031, T096, T097, T098 |
| FR-022 | T002, T015-T020, T032, T096, T103 |
| SC-001 | T109 |
| SC-002 | T063, T109 |
| SC-003 | T109 |
| SC-004 | T012, T109 |
| SC-005 | T108 |
| SC-006 | T054 |
| SC-007 | T109 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns like microtask flushing, testInRoot)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
