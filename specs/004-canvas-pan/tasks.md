# Tasks: Canvas Pan Navigation

**Input**: Design documents from `/specs/004-canvas-pan/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No additional setup required - project already initialized with SolidJS, Vitest, and CSS Modules.

- [x] T001 Verify project builds and tests pass by running `npm test && npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and store that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T003 Add `PanState` interface to `src/types/canvas.ts` with panOffset, isPanning, panStart fields
- [ ] T004 [P] Write tests for canvasStore in `src/stores/__tests__/canvasStore.spec.ts` covering startPan, updatePan, endPan, resetPan actions
- [ ] T005 Create `src/stores/canvasStore.ts` with reactive store using createSignal for pan state management
- [ ] T006 Run quality checks: `npx biome check --write . && npx tsc --noEmit && npm test`
- [ ] T007 **Commit**: Stage and commit Phase 2 changes with message "feat(004): add canvasStore and PanState type"

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Middle-Mouse Pan (Priority: P1) 🎯 MVP

**Goal**: Enable canvas panning via middle mouse button drag (FR-001, FR-003, FR-004, SC-001)

**Independent Test**: Load a template, middle-click and drag, verify canvas content moves 1:1 with mouse.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T008 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T009 [US1] Write test in `src/components/Canvas/__tests__/Canvas.spec.tsx`: middle-mousedown (button=1) initiates pan mode
- [ ] T010 [US1] Write test: mousemove during pan updates panOffset by delta
- [ ] T011 [US1] Write test: mouseup ends pan and preserves panOffset
- [ ] T012 [US1] Write test: canvas transform style reflects panOffset
- [ ] T013 [US1] Write test: middle-click on view element still initiates pan (edge case)

### Implementation for User Story 1

- [ ] T014 [US1] Add pan event handlers to Canvas wrapper div in `src/components/Canvas/Canvas.tsx` for mousedown (button=1)
- [ ] T015 [US1] Implement document-level mousemove/mouseup listeners during pan gesture
- [ ] T016 [US1] Apply CSS transform `translate(x, y)` to canvas wrapper based on panOffset from store
- [ ] T017 [US1] Prevent default browser auto-scroll on middle-click
- [ ] T018 [US1] Run quality checks and verify all tests pass
- [ ] T019 [US1] **Commit**: Stage and commit US1 changes with message "feat(004): implement middle-mouse pan navigation"

**Checkpoint**: Middle-mouse pan fully functional. Can be tested independently.

---

## Phase 4: User Story 2 - Space+Drag Pan (Priority: P2)

**Goal**: Enable canvas panning via Space key + left mouse button drag (FR-002, SC-002)

**Independent Test**: Load a template, hold Space, left-click and drag, verify canvas pans.

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T020 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T021 [US2] Write test in `src/components/Canvas/__tests__/Canvas.spec.tsx`: Space keydown sets spaceHeld state
- [ ] T022 [US2] Write test: Space+left-click (button=0) initiates pan mode
- [ ] T023 [US2] Write test: Space keyup during pan ends the pan gesture
- [ ] T024 [US2] Write test: mouseup during Space+drag ends pan
- [ ] T025 [US2] Write test: Space+drag ignored when another drag operation is in progress (edge case)

### Implementation for User Story 2

- [ ] T026 [US2] Add spaceHeld signal to Canvas component
- [ ] T027 [US2] Implement document-level keydown/keyup listeners for Space key in `src/components/Canvas/Canvas.tsx`
- [ ] T028 [US2] Modify mousedown handler to check spaceHeld + button=0 as alternative pan trigger
- [ ] T029 [US2] Prevent default Space behavior (page scroll) when over canvas
- [ ] T030 [US2] Clean up keyboard listeners on component unmount using onCleanup
- [ ] T031 [US2] Run quality checks and verify all tests pass
- [ ] T032 [US2] **Commit**: Stage and commit US2 changes with message "feat(004): implement Space+drag pan navigation"

**Checkpoint**: Both pan methods (middle-mouse and Space+drag) fully functional.

---

## Phase 5: User Story 3 - Pan Cursor Feedback (Priority: P3)

**Goal**: Show visual cursor feedback for pan states (FR-005, FR-006, SC-004)

**Independent Test**: Hold Space over canvas → grab cursor; drag → grabbing cursor; release → default cursor.

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T033 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T034 [US3] Write test in `src/components/Canvas/__tests__/Canvas.spec.tsx`: spaceHeld applies grab cursor class
- [ ] T035 [US3] Write test: isPanning applies grabbing cursor class
- [ ] T036 [US3] Write test: cursor returns to default when pan ends

### Implementation for User Story 3

- [ ] T037 [US3] Add `.grab` and `.grabbing` cursor classes to `src/components/Canvas/Canvas.module.css`
- [ ] T038 [US3] Apply cursor classes conditionally using classList on canvas wrapper in `src/components/Canvas/Canvas.tsx`
- [ ] T039 [US3] Run quality checks and verify all tests pass
- [ ] T040 [US3] **Commit**: Stage and commit US3 changes with message "feat(004): add pan cursor feedback (grab/grabbing)"

**Checkpoint**: All pan functionality with visual feedback complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T041 Run full test suite with coverage: `npm run test:coverage`
- [ ] T042 Verify 80% coverage threshold for new code (canvasStore, Canvas pan logic)
- [ ] T043 Run quickstart.md validation - manually verify all scenarios
- [ ] T044 Update `CLAUDE.md` with canvasStore utility documentation
- [ ] T045 **Commit**: Stage and commit polish changes with message "docs(004): update CLAUDE.md with canvasStore"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete.

- [ ] T046 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T047 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T048 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T049 **Update Compliance Table**: Fill in spec.md compliance table with ✅ MET status and evidence for all FR-xxx and SC-xxx

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify only
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational (can run parallel to US1 if desired)
- **User Story 3 (Phase 5)**: Depends on US1 or US2 (needs isPanning state)
- **Polish (Phase 6)**: Depends on all user stories
- **Git Verification (Final)**: Depends on Polish

### User Story Dependencies

```
Foundational (Phase 2)
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
    US1 (P1)           US2 (P2)
  Middle-Mouse        Space+Drag
        │                  │
        └────────┬─────────┘
                 │
                 ▼
             US3 (P3)
          Cursor Feedback
```

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```
T003 (types) ─────┬───── T004 (store tests)
                  │
                  └───── Then T005 (store implementation)
```

**Within Phase 3 (US1)**:
```
T009, T010, T011, T012, T013 can be written in parallel (all tests)
Then T014-T017 implementation (sequential due to dependencies)
```

**Between User Stories** (with two developers):
```
Developer A: US1 (Phase 3) → US3 (Phase 5)
Developer B: US2 (Phase 4) → assist US3
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify)
2. Complete Phase 2: Foundational (types + store)
3. Complete Phase 3: User Story 1 (middle-mouse pan)
4. **STOP and VALIDATE**: Test US1 independently
5. Demo/deploy if acceptable

### Incremental Delivery

1. Foundation → types + store ready
2. Add US1 → Middle-mouse pan works → Demo (MVP!)
3. Add US2 → Space+drag works → Demo
4. Add US3 → Cursor feedback → Demo (Complete!)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- IMPORTANT: Complete "Phase Final: Git Verification" before marking feature complete
