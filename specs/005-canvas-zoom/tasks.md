# Tasks: Canvas Zoom Navigation

**Input**: Design documents from `/specs/005-canvas-zoom/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Required per constitution (Test-First Development)

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create zoom utilities module and extend canvasStore

- [ ] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T002 [P] Create zoom constants and clampZoom utility with tests in `src/domain/canvas/zoom.ts` and `src/domain/canvas/__tests__/zoom.spec.ts`
- [ ] T003 [P] Add zoomLevel signal to canvasStore with getter in `src/stores/canvasStore.ts`
- [ ] T004 **Commit**: Stage and commit Phase 1 changes with descriptive message

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core zoom calculation logic that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create calculateNewZoom function with tests in `src/domain/canvas/zoom.ts` - handles zoom factor multiplication
- [ ] T006 Create calculateZoomPanAdjustment function with tests in `src/domain/canvas/zoom.ts` - cursor-centered zoom math
- [ ] T007 Add setZoom and resetZoom actions to canvasStore with tests in `src/stores/__tests__/canvasStore.spec.ts`
- [ ] T008 **Commit**: Stage and commit Phase 2 changes with descriptive message

**Checkpoint**: Foundation ready - zoom utilities complete, user story implementation can begin

---

## Phase 3: User Story 1 - Zoom In/Out with Mouse Wheel (Priority: P1) 🎯 MVP

**Goal**: Users can zoom in/out using mouse wheel, centered on cursor position

**Independent Test**: Load template, scroll wheel up → zoom increases; scroll down → zoom decreases; point under cursor stays stationary

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [US1] Write component test for wheel up triggers zoom in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T010 [US1] Write component test for wheel down triggers zoom out `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T011 [US1] Write component test for preventDefault on wheel event `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T012 [P] [US1] Write edge case test for zoom with cursor outside canvas bounds `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T013 [P] [US1] Write edge case test for zoom interaction with existing pan offset `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T014 [P] [US1] Write edge case test for rapid wheel scrolling (multiple events) `src/components/Canvas/__tests__/Canvas.spec.tsx`

### Implementation for User Story 1

- [ ] T015 [US1] Add applyZoom action to canvasStore that calculates new zoom and pan adjustment `src/stores/canvasStore.ts`
- [ ] T016 [US1] Add handleWheel event handler to Canvas component `src/components/Canvas/Canvas.tsx`
- [ ] T017 [US1] Update transform style to include scale(zoomLevel) `src/components/Canvas/Canvas.tsx`
- [ ] T018 [US1] Verify tests pass and zoom centers on cursor position
- [ ] T019 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: User Story 1 complete - wheel zoom works with cursor centering (FR-001, FR-002, FR-003, FR-007, FR-008)

---

## Phase 4: User Story 2 - Zoom Level Limits (Priority: P2)

**Goal**: Zoom is constrained to 10%-500% range, preventing unusable extremes

**Independent Test**: Zoom all the way out → stops at 10%; zoom all the way in → stops at 500%

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [US2] Write unit test for clampZoom enforces minimum 0.1 `src/domain/canvas/__tests__/zoom.spec.ts`
- [ ] T021 [US2] Write unit test for clampZoom enforces maximum 5.0 `src/domain/canvas/__tests__/zoom.spec.ts`
- [ ] T022 [US2] Write integration test for zoom stops at limits `src/components/Canvas/__tests__/Canvas.spec.tsx`

### Implementation for User Story 2

- [ ] T023 [US2] Ensure clampZoom is applied in calculateNewZoom `src/domain/canvas/zoom.ts`
- [ ] T024 [US2] Verify applyZoom respects limits in canvasStore `src/stores/canvasStore.ts`
- [ ] T025 [US2] Verify tests pass - zoom cannot exceed limits
- [ ] T026 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: User Story 2 complete - zoom respects 10%-500% limits (FR-004, FR-005)

---

## Phase 5: User Story 3 - Zoom State Persistence (Priority: P3)

**Goal**: Zoom level stored in application state, resets on new document load

**Independent Test**: Zoom to 200%, verify canvasStore.zoomLevel returns 2.0; load new document, verify reset to 1.0

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [US3] Write test for zoomLevel signal accurately reflects current zoom `src/stores/__tests__/canvasStore.spec.ts`
- [ ] T028 [US3] Write test for resetZoom sets level to 1.0 `src/stores/__tests__/canvasStore.spec.ts`
- [ ] T029 [US3] Write test for resetCanvas resets both zoom and pan `src/stores/__tests__/canvasStore.spec.ts`

### Implementation for User Story 3

- [ ] T030 [US3] Add resetCanvas function that calls resetZoom and resetPan `src/stores/canvasStore.ts`
- [ ] T031 [US3] Integrate resetCanvas call in documentStore loadFile success path `src/stores/documentStore.ts`
- [ ] T032 [US3] Verify tests pass - state persistence and reset work correctly
- [ ] T033 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: User Story 3 complete - zoom state persists and resets on document load (FR-006, FR-009)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, documentation, and cleanup

- [ ] T034 Run full test suite and verify all tests pass `npm test`
- [ ] T035 Run code quality checks `npx biome check --write . && npx tsc --noEmit`
- [ ] T036 Update CLAUDE.md with new canvasStore utilities (zoomLevel, applyZoom, resetZoom, resetCanvas)
- [ ] T037 Verify SC requirements with specific measurements:
  - SC-001: Count wheel ticks to go 100%→500%, multiply by typical wheel interval (~100ms) - must be <3s
  - SC-002: Count wheel ticks to go 100%→10%, multiply by typical wheel interval (~100ms) - must be <3s
  - SC-003: Write test that records cursor screen position before/after zoom, assert delta <5px
  - SC-004: Verify zoomLevel signal updates synchronously (no async delay >100ms)
- [ ] T038 Update spec.md compliance table with evidence for all FR and SC requirements
- [ ] T039 **Commit**: Stage and commit Polish phase changes with descriptive message

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T040 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T041 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T042 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational completion
- **Polish (Phase 6)**: Depends on all user stories complete
- **Git Verification (Final)**: Depends on Polish complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational - No dependencies on other stories
- **User Story 2 (P2)**: After Foundational - Independent of US1 (limit logic is in shared utils)
- **User Story 3 (P3)**: After Foundational - Independent of US1/US2 (state persistence)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Verify tests pass after implementation
- Commit at end of each user story

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002 (zoom utils) || T003 (canvasStore signal)
```

**Phase 2 (Foundational)**:
```
T005, T006, T007 can run sequentially (same files, dependencies)
```

**User Stories** (after Foundational):
```
US1, US2, US3 are largely independent and could be parallelized
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 (T009-T019)
4. **STOP and VALIDATE**: Test wheel zoom with cursor centering + edge cases
5. Delivers: FR-001, FR-002, FR-003, FR-007, FR-008

### Incremental Delivery

1. Setup + Foundational → Zoom utilities ready
2. Add US1 → Wheel zoom works → **MVP!**
3. Add US2 → Zoom limits enforced
4. Add US3 → State persistence complete
5. Polish → Full feature complete

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 42 |
| Phase 1 (Setup) | 4 tasks (T001-T004) |
| Phase 2 (Foundational) | 4 tasks (T005-T008) |
| Phase 3 (US1 - Zoom In/Out) | 11 tasks (T009-T019) |
| Phase 4 (US2 - Limits) | 7 tasks (T020-T026) |
| Phase 5 (US3 - State) | 7 tasks (T027-T033) |
| Phase 6 (Polish) | 6 tasks (T034-T039) |
| Phase Final (Git) | 3 tasks (T040-T042) |

**MVP Scope**: Phases 1-3 (19 tasks) delivers core wheel zoom functionality with edge cases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Constitution requires Test-First: write failing tests before implementation
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Commit after each phase
- All 9 FR requirements covered across US1, US2, US3
