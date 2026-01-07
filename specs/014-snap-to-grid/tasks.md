# Tasks: Snap to Grid

**Input**: Design documents from `/specs/014-snap-to-grid/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: TDD approach required per constitution - tests written FIRST, must FAIL before implementation.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Domain Infrastructure)

**Purpose**: Create type definitions and core snap calculation utilities

- [ ] T001 Create all snap type definitions in `src/types/snap.ts`: SnapResult, SnapPointResult, SnapEdgesResult, SnapIndicatorState interfaces and DEFAULT_SNAP_THRESHOLD constant (per data-model.md)
- [ ] T002 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T003 Write failing tests for snap utilities in `src/domain/canvas/__tests__/snap.spec.ts` (snapToGrid, snapPoint, snapEdges, getEffectiveThreshold)
- [ ] T004 Implement `getEffectiveThreshold()` in `src/domain/canvas/snap.ts` - clamps threshold to gridSize/2
- [ ] T005 Implement `snapToGrid()` in `src/domain/canvas/snap.ts` - snaps single coordinate to nearest grid line
- [ ] T006 Implement `snapPoint()` in `src/domain/canvas/snap.ts` - snaps 2D point (x, y independently)
- [ ] T007 Implement `snapEdges()` in `src/domain/canvas/snap.ts` - snaps view edges based on resize handle
- [ ] T008 Export snap utilities from `src/domain/canvas/index.ts`
- [ ] T009 Run `npx biome check --write .` and `npx tsc --noEmit` to verify Phase 1
- [ ] T010 **Commit**: Stage and commit Phase 1 changes with message "feat(snap): add snap type definitions and calculation utilities"

---

## Phase 2: Foundational (Store Extensions)

**Purpose**: Extend gridStore with snap state - MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T012 Write failing tests for snap state in `src/stores/__tests__/gridStore.spec.ts` (isSnapEnabled, snapThreshold, toggleSnap, setSnapThreshold, resetGrid includes snap, verify session persistence per FR-012)
- [ ] T013 Add `isSnapEnabled` signal to `src/stores/gridStore.ts` (default: true)
- [ ] T014 Add `snapThreshold` signal to `src/stores/gridStore.ts` (default: 5)
- [ ] T015 Add `toggleSnap()` action to `src/stores/gridStore.ts`
- [ ] T016 Add `setSnapThreshold()` action to `src/stores/gridStore.ts`
- [ ] T017 Update `resetGrid()` to reset snap state in `src/stores/gridStore.ts`
- [ ] T018 Update `gridStore` object to expose `isSnapEnabled` and `snapThreshold` getters
- [ ] T019 Run `npx biome check --write .` and `npx tsc --noEmit` to verify Phase 2
- [ ] T020 **Commit**: Stage and commit Phase 2 changes with message "feat(snap): extend gridStore with snap state signals"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Snap During Move (Priority: P1) 🎯 MVP

**Goal**: Views automatically snap to grid lines when dragged within threshold

**Independent Test**: Enable snap, drag view near grid line, verify snaps to nearest grid position

**Requirements Covered**: FR-001, FR-007, FR-008, FR-010, FR-015

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T022 [P] [US1] Write failing tests for snap integration in move handler in `src/hooks/canvas/__tests__/useCanvasInteractions.snap.spec.tsx`

### Implementation for User Story 1

- [ ] T023 [US1] Modify `handleDragUp` in `src/hooks/canvas/useCanvasInteractions.ts` to apply snap when `gridStore.isSnapEnabled` is true
- [ ] T024 [US1] Import snap utilities and gridStore in `src/hooks/canvas/useCanvasInteractions.ts`
- [ ] T025 [US1] Calculate effective threshold using `getEffectiveThreshold(gridStore.snapThreshold, gridStore.size)`
- [ ] T026 [US1] Apply `snapPoint()` to final position for primary dragged view (anchor view)
- [ ] T027 [US1] Apply snap delta to all selected views to maintain relative positions
- [ ] T028 [US1] Verify existing undo/redo still works with snapped positions
- [ ] T029 [US1] Run tests and verify all pass: `npx vitest run`
- [ ] T030 [US1] Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T031 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(snap): snap views to grid during move operations"

**Checkpoint**: Move snap is fully functional and testable independently

---

## Phase 4: User Story 2 - Snap During Resize (Priority: P1)

**Goal**: View edges snap to grid lines when resized

**Independent Test**: Enable snap, resize view, verify edges snap to nearest grid lines

**Requirements Covered**: FR-002, FR-009, FR-014

### Tests for User Story 2 ⚠️

- [ ] T032 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T033 [P] [US2] Write failing tests for snap integration in resize handler in `src/hooks/canvas/__tests__/useCanvasInteractions.resize-snap.spec.tsx`

### Implementation for User Story 2

- [ ] T034 [US2] Modify `handleResizeMove` in `src/hooks/canvas/useCanvasInteractions.ts` to apply edge snapping
- [ ] T035 [US2] Apply `snapEdges()` based on which handle is being dragged
- [ ] T036 [US2] Adjust origin and size based on snapped edge positions
- [ ] T037 [US2] Ensure minimum size (10x10) takes precedence over snap (clamp after snap)
- [ ] T038 [US2] Verify corner handles snap both edges independently
- [ ] T039 [US2] Run tests and verify all pass: `npx vitest run`
- [ ] T040 [US2] Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T041 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(snap): snap view edges to grid during resize operations"

**Checkpoint**: Both move and resize snap are functional

---

## Phase 5: User Story 3 - Toggle Snap On/Off (Priority: P2)

**Goal**: Users can toggle snap via Shift+G keyboard shortcut and see state in toolbar

**Independent Test**: Press Shift+G, verify snap state toggles; check toolbar shows current state

**Requirements Covered**: FR-003, FR-004, FR-012, FR-013

### Tests for User Story 3 ⚠️

- [ ] T042 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T043 [P] [US3] Write failing tests for Shift+G shortcut in `src/hooks/canvas/__tests__/useCanvasKeyboard.snap.spec.tsx`
- [ ] T044 [P] [US3] Write failing tests for snap toggle button in `src/components/GridToolbar/__tests__/GridToolbar.snap.spec.tsx`

### Implementation for User Story 3

- [ ] T045 [US3] Add Shift+G handler to `src/hooks/canvas/useCanvasKeyboard.ts` that calls `toggleSnap()`
- [ ] T046 [US3] Import `toggleSnap` from gridStore in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T047 [US3] Add snap toggle button to `src/components/GridToolbar/GridToolbar.tsx`
- [ ] T048 [US3] Add snap indicator styling (enabled/disabled visual state) in `src/components/GridToolbar/GridToolbar.module.css`
- [ ] T049 [US3] Import `gridStore` and `toggleSnap` in GridToolbar
- [ ] T050 [US3] Run tests and verify all pass: `npx vitest run`
- [ ] T051 [US3] Run `npx biome check --write . && npx stylelint "**/*.css" --fix && npx tsc --noEmit`
- [ ] T052 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(snap): add Shift+G toggle and toolbar indicator"

**Checkpoint**: Snap toggle is fully functional

---

## Phase 6: User Story 4 - Alt Key Temporarily Disables Snap (Priority: P2)

**Goal**: Holding Alt during drag/resize temporarily bypasses snap

**Independent Test**: Enable snap, start drag, hold Alt, verify free movement; release Alt, verify snap re-engages

**Requirements Covered**: FR-005, FR-006

### Tests for User Story 4 ⚠️

- [ ] T053 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T054 [P] [US4] Write failing tests for Alt key behavior in `src/hooks/canvas/__tests__/useCanvasInteractions.alt-snap.spec.tsx`

### Implementation for User Story 4

- [ ] T055 [US4] Modify move snap logic in `src/hooks/canvas/useCanvasInteractions.ts` to check `!e.altKey` before applying snap
- [ ] T056 [US4] Modify resize snap logic in `src/hooks/canvas/useCanvasInteractions.ts` to check `!e.altKey` before applying snap
- [ ] T057 [US4] Ensure Alt+resize still works for center-resize (both behaviors coexist)
- [ ] T058 [US4] Run tests and verify all pass: `npx vitest run`
- [ ] T059 [US4] Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T060 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(snap): Alt key temporarily disables snap during drag/resize"

**Checkpoint**: Alt key modifier is fully functional

---

## Phase 7: User Story 5 - Visual Feedback (Priority: P3)

**Goal**: Visual indicator shows when snap engages

**Independent Test**: Drag view near grid line, observe visual highlight at snap point

**Requirements Covered**: FR-011

### Tests for User Story 5 ⚠️

- [ ] T061 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T062 [P] [US5] Write failing tests for SnapIndicator component in `src/components/SnapIndicator/__tests__/SnapIndicator.spec.tsx`

### Implementation for User Story 5

- [ ] T063 [P] [US5] Create `src/components/SnapIndicator/SnapIndicator.tsx` component
- [ ] T064 [P] [US5] Create `src/components/SnapIndicator/SnapIndicator.module.css` with snap line styling
- [ ] T065 [US5] Add snap indicator design tokens to `src/styles/tokens.css` (--snap-indicator-color, --snap-indicator-width)
- [ ] T066 [US5] Create `src/components/SnapIndicator/index.ts` barrel export
- [ ] T067 [US5] Add snap indicator state tracking in `src/hooks/canvas/useCanvasInteractions.ts` (track which coordinates snapped)
- [ ] T068 [US5] Import and render SnapIndicator in `src/components/Canvas/Canvas.tsx`
- [ ] T069 [US5] Pass snapped coordinates to SnapIndicator as props
- [ ] T070 [US5] Run tests and verify all pass: `npx vitest run`
- [ ] T071 [US5] Run `npx biome check --write . && npx stylelint "**/*.css" --fix && npx tsc --noEmit`
- [ ] T072 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(snap): add visual indicator when snap engages"

**Checkpoint**: All user stories complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, edge cases, and final cleanup

- [ ] T073 Update CLAUDE.md with snap utilities documentation (gridStore extensions, snap.ts functions)
- [ ] T074 Verify all edge cases from spec.md are handled (threshold clamping, grid hidden, minimum size)
- [ ] T075 Run full test suite: `npx vitest run`
- [ ] T076 Run coverage check: `npx vitest run --coverage` (verify 80% threshold)
- [ ] T077 Run all quality checks: `npx biome check --write . && npx stylelint "**/*.css" --fix && npx tsc --noEmit`
- [ ] T078 Update spec.md compliance table with MET status and evidence for all FR-xxx and SC-xxx
- [ ] T079 **Commit**: Stage and commit Polish phase changes with message "docs(snap): update CLAUDE.md and compliance table"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T080 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T081 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T082 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - MVP milestone
- **User Story 2 (Phase 4)**: Depends on Phase 2 - Can run parallel to US1 if desired
- **User Story 3 (Phase 5)**: Depends on Phase 2 - Can run parallel to US1/US2
- **User Story 4 (Phase 6)**: Depends on US1 and US2 (modifies their code)
- **User Story 5 (Phase 7)**: Depends on Phase 2 - Can run parallel to US1-4
- **Polish (Phase 8)**: Depends on all user stories complete
- **Git Verification (Phase Final)**: Depends on Phase 8

### User Story Dependencies

| Story | Priority | Can Start After | Dependencies |
|-------|----------|-----------------|--------------|
| US1 - Move Snap | P1 | Phase 2 | None (MVP) |
| US2 - Resize Snap | P1 | Phase 2 | None |
| US3 - Toggle | P2 | Phase 2 | None |
| US4 - Alt Key | P2 | US1, US2 | Modifies US1/US2 code |
| US5 - Visual | P3 | Phase 2 | None |

### Within Each User Story

1. **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
2. Tests MUST be written and FAIL before implementation
3. Implementation tasks in sequence
4. Quality checks before commit
5. Commit at phase end

### Parallel Opportunities

**Phase 1**:
- T003 (tests) can start after T001-T002

**Phase 2**:
- T012 (tests) can start after T011

**Phase 3-7 (User Stories)**:
- US1, US2, US3, US5 can all proceed in parallel after Phase 2
- US4 must wait for US1 and US2 completion
- Within each story, test tasks marked [P] can run in parallel

---

## Parallel Example: After Phase 2

```bash
# These can all start simultaneously after Phase 2:
Task: T021-T031 (US1 - Move Snap)
Task: T032-T041 (US2 - Resize Snap)  
Task: T042-T052 (US3 - Toggle)
Task: T061-T072 (US5 - Visual Feedback)

# This must wait:
Task: T053-T060 (US4 - Alt Key) - after US1 and US2 complete
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + snap utilities)
2. Complete Phase 2: Foundational (gridStore extensions)
3. Complete Phase 3: User Story 1 (move snap)
4. **STOP and VALIDATE**: Test move snap independently
5. Snap is usable for basic alignment

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 (Move Snap) → Test → Commit (MVP!)
3. Add US2 (Resize Snap) → Test → Commit
4. Add US3 (Toggle) → Test → Commit
5. Add US4 (Alt Key) → Test → Commit
6. Add US5 (Visual) → Test → Commit
7. Each story adds value without breaking previous stories

---

## Task Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| 1 - Setup | - | T001-T010 (10) | Some |
| 2 - Foundational | - | T011-T020 (10) | Some |
| 3 - Move Snap | US1 | T021-T031 (11) | Some |
| 4 - Resize Snap | US2 | T032-T041 (10) | Some |
| 5 - Toggle | US3 | T042-T052 (11) | Some |
| 6 - Alt Key | US4 | T053-T060 (8) | Some |
| 7 - Visual | US5 | T061-T072 (12) | Some |
| 8 - Polish | - | T073-T079 (7) | Few |
| Final - Git | - | T080-T082 (3) | No |
| **Total** | | **82 tasks** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD: Write failing tests BEFORE implementation
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- **Commit after each phase** - each phase ends with a commit task
- Alt key behavior coexists with existing center-resize (Alt during resize)
- Snap threshold clamped to gridSize/2 to prevent overlapping zones
- Minimum view size (10x10) takes precedence over snap
