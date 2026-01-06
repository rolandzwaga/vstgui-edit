# Tasks: View Selection

**Input**: Design documents from `/specs/008-view-selection/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: TDD required per project constitution - tests are written before implementation.

**Testing Guide**: Every task involving unit/component tests MUST include reading `specs/TESTING-GUIDE.md` before writing tests.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)

## Path Conventions

- **Single SolidJS app**: `src/` at repository root
- Tests co-located in `__tests__/` directories

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and design tokens needed by all user stories

- [x] T001 [P] Create selection type definitions in `src/types/selection.ts`
- [x] T002 [P] Add selection/hover design tokens to `src/styles/tokens.css`
- [x] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(008-view-selection): add selection types and design tokens"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [x] T004 **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T005 [P] Write tests for selectionStore in `src/stores/__tests__/selectionStore.spec.ts`
- [x] T006 [P] Write tests for hitTest utility in `src/domain/canvas/__tests__/hitTest.spec.ts`
- [x] T007 [P] Write tests for mouseToCanvas utility in `src/domain/canvas/__tests__/mouseToCanvas.spec.ts`

### Implementation for Foundational

- [x] T008 Implement selectionStore in `src/stores/selectionStore.ts` (pass T005 tests)
- [x] T009 [P] Implement hitTest utility in `src/domain/canvas/hitTest.ts` (pass T006 tests)
- [x] T010 [P] Implement mouseToCanvas utility in `src/domain/canvas/mouseToCanvas.ts` (pass T007 tests)
- [x] T011 Add parentId tracking to flattenHierarchy in `src/domain/canvas/flattenHierarchy.ts`
- [x] T012 **Commit**: Stage and commit Phase 2 changes with message "feat(008-view-selection): add selection store and utilities"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Single Click Selection (Priority: P1) 🎯 MVP

**Goal**: Click on a view to select it with visual feedback (border + 8 handles)

**Independent Test**: Load uidesc, click any view, verify selection border and handles appear

### Tests for User Story 1

- [x] T013 [US1] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T014 [P] [US1] Write tests for SelectionOverlay in `src/components/Canvas/__tests__/SelectionOverlay.spec.tsx`
- [x] T015 [P] [US1] Write tests for Canvas click selection in `src/components/Canvas/__tests__/Canvas.selection.spec.tsx`
- [x] T016 [P] [US1] Write tests for ViewRectangle selection styling in `src/components/Canvas/__tests__/ViewRectangle.selection.spec.tsx`

### Implementation for User Story 1

- [x] T017 [US1] Create SelectionOverlay component in `src/components/Canvas/SelectionOverlay.tsx` (pass T014 tests)
- [x] T018 [US1] Add SelectionOverlay styles in `src/components/Canvas/SelectionOverlay.module.css`
- [x] T019 [US1] Add click handler to Canvas in `src/components/Canvas/Canvas.tsx` for single selection (pass T015 tests)
- [x] T020 [US1] Add selection styling to ViewRectangle in `src/components/Canvas/ViewRectangle.tsx` (pass T016 tests)
- [x] T021 [US1] Update ViewRectangle styles in `src/components/Canvas/Canvas.module.css` for selection state
- [x] T022 [US1] Render SelectionOverlay for selected views in Canvas
- [x] T023 [US1] Handle click on empty canvas to deselect (FR-003)
- [x] T024 [US1] Handle nested views - select topmost child (FR-013)
- [x] T025 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(008-view-selection): implement single click selection"

**Checkpoint**: Single click selection fully functional - MVP complete

---

## Phase 4: User Story 2 - Multi-Selection with Shift+Click (Priority: P2)

**Goal**: Shift+click to add/remove views from selection (toggle behavior)

**Independent Test**: Select one view, Shift+click another, verify both selected

### Tests for User Story 2

- [x] T026 [US2] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T027 [P] [US2] Write tests for Shift+click behavior in `src/components/Canvas/__tests__/Canvas.multiselect.spec.tsx`
- [x] T028 [P] [US2] Write tests for toggleSelect store action in `src/stores/__tests__/selectionStore.spec.ts` (extend existing)

### Implementation for User Story 2

- [x] T029 [US2] Add toggleSelect action to selectionStore (pass T028 tests)
- [x] T030 [US2] Add Shift+click handling to Canvas click handler (pass T027 tests)
- [x] T031 [US2] Render multiple SelectionOverlays for multi-selected views
- [x] T032 [US2] Handle click without Shift to clear multi-selection (FR-002)
- [x] T033 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(008-view-selection): implement multi-selection with shift+click"

**Checkpoint**: Multi-selection functional alongside single selection

---

## Phase 5: User Story 3 - Selection Keyboard Shortcuts (Priority: P2)

**Goal**: Ctrl+A to select all, Escape to deselect, ignore in text inputs

**Independent Test**: Press Ctrl+A to select all views, press Escape to deselect

### Tests for User Story 3

- [x] T034 [US3] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T035 [P] [US3] Write tests for Ctrl+A in `src/components/Canvas/__tests__/Canvas.keyboard.spec.tsx`
- [x] T036 [P] [US3] Write tests for Escape key in `src/components/Canvas/__tests__/Canvas.keyboard.spec.tsx`
- [x] T037 [P] [US3] Write tests for text input filter in `src/components/Canvas/__tests__/Canvas.keyboard.spec.tsx`

### Implementation for User Story 3

- [x] T038 [US3] Add selectAll action to selectionStore (takes renderableViews array)
- [x] T039 [US3] Add Ctrl+A keyboard handler to Canvas (FR-005, pass T035 tests)
- [x] T040 [US3] Add Escape keyboard handler to Canvas (FR-006, pass T036 tests)
- [x] T041 [US3] Add text input/textarea filter for keyboard shortcuts (FR-007, pass T037 tests)
- [ ] T042 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(008-view-selection): implement keyboard shortcuts"

**Checkpoint**: Keyboard shortcuts functional

---

## Phase 6: User Story 4 - Hover State Feedback (Priority: P3)

**Goal**: Hover shows subtle highlight, tooltip appears after 500ms with class name and size

**Independent Test**: Hover over view, see highlight, wait 500ms, see tooltip

### Tests for User Story 4

- [ ] T043 [US4] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US4] Write tests for HoverTooltip in `src/components/Canvas/__tests__/HoverTooltip.spec.tsx`
- [ ] T045 [P] [US4] Write tests for hover state in `src/stores/__tests__/selectionStore.spec.ts` (extend existing)
- [ ] T046 [P] [US4] Write tests for ViewRectangle hover styling in `src/components/Canvas/__tests__/ViewRectangle.hover.spec.tsx`

### Implementation for User Story 4

- [ ] T047 [US4] Add hover state (hoveredId, showTooltip) to selectionStore (pass T045 tests)
- [ ] T048 [US4] Create HoverTooltip component in `src/components/Canvas/HoverTooltip.tsx` (pass T044 tests)
- [ ] T049 [US4] Add HoverTooltip styles in `src/components/Canvas/HoverTooltip.module.css`
- [ ] T050 [US4] Add hover highlight to ViewRectangle (FR-010, pass T046 tests)
- [ ] T051 [US4] Update ViewRectangle styles for hover state
- [ ] T052 [US4] Add mouse enter/leave handlers to ViewRectangle for hover tracking
- [ ] T053 [US4] Implement 500ms tooltip delay with timer (SC-003)
- [ ] T054 [US4] Render HoverTooltip in Canvas when showTooltip is true
- [ ] T055 [US4] Format tooltip content as "ClassName (W×H)" (FR-011)
- [ ] T056 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(008-view-selection): implement hover feedback and tooltip"

**Checkpoint**: Hover states and tooltips functional

---

## Phase 7: User Story 5 - Selection Visual Indicators (Priority: P3)

**Goal**: Parent highlight when child selected, cursor change on resize handles

**Independent Test**: Select child view, verify parent shows subtle highlight

### Tests for User Story 5

- [ ] T057 [US5] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T058 [P] [US5] Write tests for getAncestorIds utility in `src/domain/canvas/__tests__/ancestors.spec.ts`
- [ ] T059 [P] [US5] Write tests for parent highlighting in `src/components/Canvas/__tests__/ViewRectangle.parent.spec.tsx`
- [ ] T060 [P] [US5] Write tests for handle cursor change in `src/components/Canvas/__tests__/SelectionOverlay.cursor.spec.tsx`

### Implementation for User Story 5

- [ ] T061 [US5] Create getAncestorIds utility in `src/domain/canvas/ancestors.ts` (pass T058 tests)
- [ ] T062 [US5] Add parent highlight styling to ViewRectangle (FR-012, pass T059 tests)
- [ ] T063 [US5] Update ViewRectangle styles for parent highlight state
- [ ] T064 [US5] Add cursor change on SelectionOverlay handles (FR-014, pass T060 tests)
- [ ] T065 [US5] Verify resize handles are visual only - no resize action (FR-015)
- [ ] T066 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(008-view-selection): implement parent highlight and handle cursors"

**Checkpoint**: All visual indicators complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, documentation, verification

- [ ] T067 [P] Verify hover does not override selection styling (acceptance scenario US4-4)
- [ ] T068 [P] Verify 4:1 contrast ratio for selection visuals (SC-004)
- [ ] T069 [P] Add ARIA labels to SelectionOverlay and HoverTooltip for accessibility
- [ ] T070 Run performance test with 500 views (SC-006)
- [ ] T071 Verify all 15 functional requirements (FR-001 to FR-015) in spec.md
- [ ] T072 Verify all 6 success criteria (SC-001 to SC-006) in spec.md
- [ ] T073 Update CLAUDE.md with selectionStore documentation
- [ ] T074 Run `npx biome check --write .` for code formatting
- [ ] T075 Run `npx tsc --noEmit` for type checking
- [ ] T076 Run `npm run test:coverage` and verify 80% coverage
- [ ] T077 **Commit**: Stage and commit Polish phase changes with message "feat(008-view-selection): polish and verify requirements"

---

## Phase Final: Git Verification & Compliance

**Purpose**: Ensure all work is committed and requirements are met

- [ ] T078 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T079 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T080 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T081 **Update Compliance Table**: Mark all FR/SC requirements as MET in spec.md with evidence
- [ ] T082 **Final Verification**: Complete spec.md Implementation Completion Checklist

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed and compliance table is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Foundational) ──┬──► Phase 3 (US1 - MVP)
                                              │
                                              ├──► Phase 4 (US2) [after US1]
                                              │
                                              ├──► Phase 5 (US3) [after US1]
                                              │
                                              ├──► Phase 6 (US4) [after US1]
                                              │
                                              └──► Phase 7 (US5) [after US1]

All User Stories ──► Phase 8 (Polish) ──► Phase Final
```

### User Story Dependencies

| Story | Dependencies | Can Start After |
|-------|--------------|-----------------|
| US1 (P1) | Foundational only | Phase 2 complete |
| US2 (P2) | US1 (extends click handler) | Phase 3 complete |
| US3 (P2) | US1 (keyboard on Canvas) | Phase 3 complete |
| US4 (P3) | US1 (ViewRectangle styling) | Phase 3 complete |
| US5 (P3) | US1 (SelectionOverlay) | Phase 3 complete |

### Within Each User Story

1. Verify Testing Guide first
2. Write tests (all [P] tests can run in parallel)
3. Implement to pass tests (some can parallelize)
4. Commit phase

### Parallel Opportunities

**Phase 1**: T001, T002 can run in parallel
**Phase 2**: T005, T006, T007 tests in parallel; T009, T010 implementation in parallel
**Phase 3**: T014, T015, T016 tests in parallel
**Phase 4**: T027, T028 tests in parallel
**Phase 5**: T035, T036, T037 tests in parallel
**Phase 6**: T044, T045, T046 tests in parallel
**Phase 7**: T058, T059, T060 tests in parallel
**Phase 8**: T067, T068, T069 can run in parallel

---

## Parallel Example: Phase 2 Foundational Tests

```bash
# Launch all foundational tests together:
Task: T005 "Write tests for selectionStore"
Task: T006 "Write tests for hitTest utility"
Task: T007 "Write tests for mouseToCanvas utility"
```

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 tests together:
Task: T014 "Write tests for SelectionOverlay"
Task: T015 "Write tests for Canvas click selection"
Task: T016 "Write tests for ViewRectangle selection styling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, tokens)
2. Complete Phase 2: Foundational (store, utilities)
3. Complete Phase 3: User Story 1 (single click selection)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready - basic selection works!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → MVP: Single click selection ✓
3. Add User Story 2 → Multi-selection with Shift+click ✓
4. Add User Story 3 → Keyboard shortcuts ✓
5. Add User Story 4 → Hover feedback and tooltips ✓
6. Add User Story 5 → Visual polish (parent highlight, cursors) ✓
7. Polish → Verify all requirements met

### Sequential Recommendation

For this feature, user stories should be completed **sequentially** in priority order:

1. **US1 (P1)** first - establishes core selection infrastructure
2. **US2 (P2)** extends US1's click handler for Shift+click
3. **US3 (P2)** adds keyboard to Canvas (independent of US2)
4. **US4 (P3)** adds hover styling to ViewRectangle
5. **US5 (P3)** adds parent highlight and cursor changes

---

## Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Phase 1: Setup | 3 | 2 |
| Phase 2: Foundational | 9 | 5 |
| Phase 3: US1 (MVP) | 13 | 3 |
| Phase 4: US2 | 8 | 2 |
| Phase 5: US3 | 9 | 3 |
| Phase 6: US4 | 14 | 3 |
| Phase 7: US5 | 10 | 3 |
| Phase 8: Polish | 11 | 3 |
| Phase Final | 5 | 0 |
| **Total** | **82** | **24** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after completion
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- TDD: Tests MUST be written and FAIL before implementation
- **Commit after each phase** with descriptive message
- Stop at any checkpoint to validate story independently
