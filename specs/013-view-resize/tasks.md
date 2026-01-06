# Tasks: View Resize

**Input**: Design documents from `/specs/013-view-resize/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Test-first development (TDD) as required by project constitution.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and foundational structures

- [ ] T001 [P] Create resize type definitions in `src/types/resize.ts`
- [ ] T002 [P] Export resize types from `src/types/index.ts`
- [ ] T003 **Commit**: Stage and commit Phase 1 changes - "feat(013): add resize type definitions"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Write tests for resizeStore in `src/stores/__tests__/resizeStore.spec.ts`
- [ ] T006 [P] Write tests for updateViewSize in `src/stores/__tests__/documentStore.resize.spec.ts`
- [ ] T007 [P] Write tests for resize utilities in `src/domain/canvas/__tests__/resize.spec.ts`
- [ ] T008 Implement resizeStore in `src/stores/resizeStore.ts` (pass T005 tests)
- [ ] T009 Implement updateViewSize in `src/stores/documentStore.ts` (pass T006 tests)
- [ ] T010 Implement resize utilities (calculateResizeBounds, clampToMinimumSize, formatSize, createResizeOperation) in `src/domain/canvas/resize.ts` (pass T007 tests)
- [ ] T011 Export resize utilities from `src/domain/canvas/index.ts`
- [ ] T012 Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T013 **Commit**: Stage and commit Phase 2 changes - "feat(013): add resizeStore and resize utilities"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Drag Handles to Resize (Priority: P1) 🎯 MVP

**Goal**: Enable resizing selected views by dragging any of the 8 resize handles

**Independent Test**: Select a view, drag a corner handle, verify size updates on mouse release

**Requirements Covered**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-009, FR-014, FR-015, SC-001, SC-004

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T015 [P] [US1] Write SelectionOverlay handle mousedown tests in `src/components/Canvas/__tests__/SelectionOverlay.resize.spec.tsx`
- [ ] T016 [P] [US1] Write Canvas resize integration tests in `src/components/Canvas/__tests__/Canvas.resize.spec.tsx`

### Implementation for User Story 1

- [ ] T017 [US1] Add onResizeStart callback prop to SelectionOverlay in `src/components/Canvas/SelectionOverlay.tsx`
- [ ] T018 [US1] Add mousedown handlers to handle circles in `src/components/Canvas/SelectionOverlay.tsx` (pass T015 tests)
- [ ] T019 [US1] Add handleResizeStart to Canvas in `src/components/Canvas/Canvas.tsx`
- [ ] T020 [US1] Add handleResizeMove to Canvas mousemove handler in `src/components/Canvas/Canvas.tsx`
- [ ] T021 [US1] Add handleResizeEnd to Canvas mouseup handler in `src/components/Canvas/Canvas.tsx` (pass T016 tests)
- [ ] T022 [US1] Run `npx vitest run` - verify all tests pass
- [ ] T023 [US1] Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T024 [US1] **Commit**: Stage and commit User Story 1 changes - "feat(013): implement basic resize via handle drag"

**Checkpoint**: Basic resize functionality complete and testable

---

## Phase 4: User Story 2 - Undo/Redo Resize Operations (Priority: P1)

**Goal**: Enable undo/redo for resize operations using existing history infrastructure

**Independent Test**: Resize a view, press Ctrl+Z to undo, verify size reverts, Ctrl+Y to redo

**Requirements Covered**: FR-006, FR-007, FR-008, SC-002, SC-003

### Tests for User Story 2 ⚠️

- [ ] T025 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T026 [P] [US2] Write undo/redo tests in `src/components/Canvas/__tests__/Canvas.resize.undo.spec.tsx`

### Implementation for User Story 2

- [ ] T027 [US2] Verify createResizeOperation exists in `src/domain/canvas/resize.ts` (created in T010)
- [ ] T028 [US2] Integrate pushOperation in handleResizeEnd in `src/components/Canvas/Canvas.tsx` (pass T026 tests)
- [ ] T029 [US2] Run `npx vitest run` - verify all tests pass
- [ ] T030 [US2] Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T031 [US2] **Commit**: Stage and commit User Story 2 changes - "feat(013): integrate resize with undo/redo"

**Checkpoint**: Resize operations are fully reversible

---

## Phase 5: User Story 3 - Aspect Ratio Lock (Priority: P2)

**Goal**: Hold Shift while resizing to maintain aspect ratio

**Independent Test**: Hold Shift, drag corner handle, verify width/height maintain original ratio

**Requirements Covered**: FR-010

### Tests for User Story 3 ⚠️

- [ ] T032 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T033 [P] [US3] Write aspect ratio tests in `src/components/Canvas/__tests__/Canvas.resize.aspect.spec.tsx`
- [ ] T034 [P] [US3] Add aspect ratio unit tests to `src/domain/canvas/__tests__/resize.spec.ts`

### Implementation for User Story 3

- [ ] T035 [US3] Add maintainAspectRatio option to calculateResizeBounds in `src/domain/canvas/resize.ts` (pass T034 tests)
- [ ] T036 [US3] Pass shiftKey to updateResize in Canvas mousemove handler in `src/components/Canvas/Canvas.tsx`
- [ ] T037 [US3] Update resizeStore.updateResize to apply aspect ratio lock in `src/stores/resizeStore.ts` (pass T033 tests)
- [ ] T038 [US3] Run `npx vitest run` - verify all tests pass
- [ ] T039 [US3] Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T040 [US3] **Commit**: Stage and commit User Story 3 changes - "feat(013): add Shift for aspect ratio lock"

**Checkpoint**: Aspect ratio lock works independently

---

## Phase 6: User Story 4 - Center Resize (Priority: P2)

**Goal**: Hold Alt while resizing to resize symmetrically from center

**Independent Test**: Hold Alt, drag corner handle, verify view center stays fixed

**Requirements Covered**: FR-011

### Tests for User Story 4 ⚠️

- [ ] T041 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T042 [P] [US4] Write center resize tests in `src/components/Canvas/__tests__/Canvas.resize.center.spec.tsx`
- [ ] T043 [P] [US4] Add center resize unit tests to `src/domain/canvas/__tests__/resize.spec.ts`

### Implementation for User Story 4

- [ ] T044 [US4] Add resizeFromCenter option to calculateResizeBounds in `src/domain/canvas/resize.ts` (pass T043 tests)
- [ ] T045 [US4] Pass altKey to updateResize in Canvas mousemove handler in `src/components/Canvas/Canvas.tsx`
- [ ] T046 [US4] Update resizeStore.updateResize to apply center resize in `src/stores/resizeStore.ts` (pass T042 tests)
- [ ] T047 [US4] Run `npx vitest run` - verify all tests pass
- [ ] T048 [US4] Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T049 [US4] **Commit**: Stage and commit User Story 4 changes - "feat(013): add Alt for center resize"

**Checkpoint**: Center resize works independently, combined with Shift+Alt also works

---

## Phase 7: User Story 5 - Visual Feedback During Resize (Priority: P3)

**Goal**: Show ghost preview and dimension indicator during resize

**Independent Test**: Initiate resize, verify semi-transparent preview and "200×150" indicator appear

**Requirements Covered**: FR-012, FR-013, FR-016, SC-005

### Tests for User Story 5 ⚠️

- [ ] T050 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T051 [P] [US5] Write ResizePreview tests in `src/components/Canvas/__tests__/ResizePreview.spec.tsx`
- [ ] T052 [P] [US5] Write DimensionIndicator tests in `src/components/Canvas/__tests__/DimensionIndicator.spec.tsx`
- [ ] T053 [P] [US5] Write Escape cancel tests in `src/components/Canvas/__tests__/Canvas.resize.cancel.spec.tsx`

### Implementation for User Story 5

- [ ] T054 [P] [US5] Create ResizePreview component in `src/components/Canvas/ResizePreview.tsx` (pass T051 tests)
- [ ] T055 [P] [US5] Create ResizePreview styles in `src/components/Canvas/ResizePreview.module.css`
- [ ] T056 [P] [US5] Create DimensionIndicator component in `src/components/Canvas/DimensionIndicator.tsx` (pass T052 tests)
- [ ] T057 [P] [US5] Create DimensionIndicator styles in `src/components/Canvas/DimensionIndicator.module.css`
- [ ] T058 [US5] Integrate ResizePreview into Canvas SVG in `src/components/Canvas/Canvas.tsx`
- [ ] T059 [US5] Integrate DimensionIndicator into Canvas in `src/components/Canvas/Canvas.tsx`
- [ ] T060 [US5] Add Escape key handler to cancel resize in `src/components/Canvas/Canvas.tsx` (pass T053 tests)
- [ ] T061 [US5] Run `npx vitest run` - verify all tests pass
- [ ] T062 [US5] Run `npx biome check --write .` and `npx tsc --noEmit` - fix any issues
- [ ] T063 [US5] **Commit**: Stage and commit User Story 5 changes - "feat(013): add resize preview and dimension indicator"

**Checkpoint**: All visual feedback complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, verification, and final checks

- [ ] T064 Update CLAUDE.md with resizeStore documentation
- [ ] T065 Update CLAUDE.md with resize utilities documentation
- [ ] T066 Run `npx vitest run --coverage` - verify 80%+ coverage for new code
- [ ] T067 Update spec.md compliance table with ✅ MET for all requirements
- [ ] T068 Run `npx biome check --write .` and `npx tsc --noEmit` - final check
- [ ] T069 **Commit**: Stage and commit Polish phase changes - "docs(013): update CLAUDE.md and spec compliance"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T070 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T071 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T072 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1, but US2 depends on US1 (needs resize to undo)
  - US3 and US4 are both P2 and can run in parallel after US1
  - US5 is P3 and can run after US1
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
        │
        ▼
┌───────────────────┐
│ US1: Basic Resize │ (P1 - MVP)
└────────┬──────────┘
         │
    ┌────┴────┬────────┬─────────┐
    ▼         ▼        ▼         ▼
┌───────┐  ┌───────┐ ┌───────┐ ┌──────────┐
│ US2   │  │ US3   │ │ US4   │ │ US5      │
│ Undo  │  │ Shift │ │ Alt   │ │ Preview  │
│ (P1)  │  │ (P2)  │ │ (P2)  │ │ (P3)     │
└───────┘  └───────┘ └───────┘ └──────────┘
```

### Parallel Opportunities

Within Phase 2 (Foundational):
- T005, T006, T007 can run in parallel (different test files)
- T008, T009, T010 must wait for their respective tests

Within User Story phases:
- Test tasks marked [P] can run in parallel
- Implementation follows test completion

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (stores, utilities)
3. Complete Phase 3: User Story 1 (basic resize)
4. **STOP and VALIDATE**: Manual test resize functionality
5. Continue to US2 for undo/redo (essential for production)

### Incremental Delivery

| Phase | User Stories | Value Delivered |
|-------|--------------|-----------------|
| 1-2 | Setup | Infrastructure ready |
| 3 | US1 | Basic resize works |
| 4 | US2 | Resize is undoable |
| 5-6 | US3, US4 | Modifier keys (Shift, Alt) |
| 7 | US5 | Visual polish |
| 8 | Polish | Documentation complete |

---

## Task Summary

| Phase | Tasks | Key Files |
|-------|-------|-----------|
| 1. Setup | 3 | `src/types/resize.ts` |
| 2. Foundational | 10 | `resizeStore.ts`, `resize.ts`, `documentStore.ts` |
| 3. US1 Basic Resize | 11 | `Canvas.tsx`, `SelectionOverlay.tsx` |
| 4. US2 Undo/Redo | 7 | `Canvas.tsx` (history integration) |
| 5. US3 Aspect Ratio | 9 | `resize.ts`, `resizeStore.ts` |
| 6. US4 Center Resize | 9 | `resize.ts`, `resizeStore.ts` |
| 7. US5 Visual Feedback | 14 | `ResizePreview.tsx`, `DimensionIndicator.tsx` |
| 8. Polish | 6 | `CLAUDE.md`, `spec.md` |
| Final. Git | 3 | - |
| **Total** | **72** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- **Testing Guide**: Read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase**
- Stop at any checkpoint to validate independently
