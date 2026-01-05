# Tasks: Zoom Controls

**Input**: Design documents from `/specs/006-zoom-controls/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Test-first development (TDD) is required per constitution principle I.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify project baseline before feature work

- [x] T001 Run `npm test` to verify all 356 existing tests pass
- [x] T002 Run `npx tsc --noEmit` to verify no TypeScript errors
- [x] T003 **Commit**: No commit needed (verification only)

**Checkpoint**: Baseline verified, ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utility needed by all user stories for zoom percentage display (FR-001)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T005 Write test for `formatZoomPercent()` in `src/domain/canvas/__tests__/zoom.spec.ts`
- [x] T006 Implement `formatZoomPercent(zoom: number): string` in `src/domain/canvas/zoom.ts`
- [x] T007 Run tests to verify formatZoomPercent passes
- [x] T008 **Commit**: Stage and commit Phase 2 changes with message "feat(006-zoom-controls): add formatZoomPercent utility"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Zoom Level Display and Manual Zoom (Priority: P1) 🎯 MVP

**Goal**: Display current zoom percentage and provide +/- buttons and keyboard shortcuts for manual zoom control

**Independent Test**: Load a template, observe zoom indicator showing "100%", click +/- buttons, verify indicator updates. Press +/- keys with canvas focused.

**Requirements Covered**: FR-001, FR-002, FR-003, FR-006, FR-007, SC-001, SC-002, SC-006

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T009 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T010 [P] [US1] Write tests for `zoomIn()` action in `src/stores/__tests__/canvasStore.spec.ts`
- [x] T011 [P] [US1] Write tests for `zoomOut()` action in `src/stores/__tests__/canvasStore.spec.ts`
- [x] T012 [US1] Run tests to verify zoomIn/zoomOut tests fail (red phase)

### Implementation for User Story 1 - Store Actions

- [x] T013 [US1] Implement `zoomIn()` action in `src/stores/canvasStore.ts` (multiply by ZOOM_FACTOR)
- [x] T014 [US1] Implement `zoomOut()` action in `src/stores/canvasStore.ts` (divide by ZOOM_FACTOR)
- [x] T015 [US1] Run tests to verify zoomIn/zoomOut tests pass (green phase)

### Tests for User Story 1 - ZoomToolbar Component ⚠️

- [x] T016 [US1] Create test file `src/components/ZoomToolbar/__tests__/ZoomToolbar.spec.tsx`
- [x] T017 [P] [US1] Write test: displays current zoom level as percentage
- [x] T018 [P] [US1] Write test: clicking + button calls zoomIn
- [x] T019 [P] [US1] Write test: clicking - button calls zoomOut
- [x] T020 [US1] Run tests to verify ZoomToolbar tests fail (red phase)

### Implementation for User Story 1 - ZoomToolbar Component

- [x] T021 [US1] Create `src/components/ZoomToolbar/ZoomToolbar.tsx` with zoom display and +/- buttons
- [x] T022 [P] [US1] Create `src/components/ZoomToolbar/ZoomToolbar.module.css` with component styles using design tokens
- [x] T023 [US1] Export ZoomToolbar from `src/components/ZoomToolbar/index.ts`
- [x] T024 [US1] Run tests to verify ZoomToolbar tests pass (green phase)

### Tests for User Story 1 - Keyboard Shortcuts ⚠️

- [x] T025 [US1] Write test: + key triggers zoomIn when canvas has focus in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [x] T026 [P] [US1] Write test: = key triggers zoomIn when canvas has focus (alternative key)
- [x] T027 [P] [US1] Write test: - key triggers zoomOut when canvas has focus
- [x] T028 [US1] Run tests to verify keyboard tests fail (red phase)

### Implementation for User Story 1 - Keyboard Shortcuts

- [x] T029 [US1] Add keyboard event handler to Canvas container in `src/components/Canvas/Canvas.tsx`
- [x] T030 [US1] Implement +/= and - key handlers that call zoomIn/zoomOut
- [x] T031 [US1] Integrate ZoomToolbar into Canvas component
- [x] T032 [US1] Run tests to verify keyboard tests pass (green phase)
- [x] T033 [US1] Run `npx biome check --write .` to fix linting issues
- [x] T034 [US1] Run `npm test` to verify all tests pass
- [x] T035 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(006-zoom-controls): add zoom display, +/- buttons, keyboard shortcuts"

**Checkpoint**: User Story 1 complete - zoom display and manual zoom functional

---

## Phase 4: User Story 2 - Reset to 100% (Priority: P2)

**Goal**: Provide 100% button and 0 keyboard shortcut to reset zoom to exactly 100%

**Independent Test**: Zoom to any level, click 100% button or press 0, verify zoom returns to exactly 100%.

**Requirements Covered**: FR-005, FR-009, SC-003

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T036 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T037 [P] [US2] Write test: clicking 100% button resets zoom to 1.0 in `src/components/ZoomToolbar/__tests__/ZoomToolbar.spec.tsx`
- [x] T038 [P] [US2] Write test: 0 key triggers resetZoom when canvas has focus in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [x] T039 [US2] Run tests to verify reset tests fail (red phase)

### Implementation for User Story 2

- [x] T040 [US2] Add 100% button to ZoomToolbar that calls `resetZoom()` in `src/components/ZoomToolbar/ZoomToolbar.tsx`
- [x] T041 [US2] Add 0 key handler to Canvas keyboard handler in `src/components/Canvas/Canvas.tsx`
- [x] T042 [US2] Run tests to verify reset tests pass (green phase)
- [x] T043 [US2] Run `npx biome check --write .` to fix linting issues
- [x] T044 [US2] Run `npm test` to verify all tests pass
- [x] T045 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(006-zoom-controls): add 100% reset button and keyboard shortcut"

**Checkpoint**: User Stories 1 AND 2 complete - manual zoom and reset functional

---

## Phase 5: User Story 3 - Fit to View (Priority: P3)

**Goal**: Provide Fit button and F keyboard shortcut to fit template within viewport with padding

**Independent Test**: Load any template, click Fit button or press F, verify entire template visible with padding.

**Requirements Covered**: FR-004, FR-008, FR-010, FR-011, SC-004, SC-005

### Tests for User Story 3 - Fit Calculation ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T046 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T047 [US3] Create test file `src/domain/canvas/__tests__/fitToView.spec.ts`
- [x] T048 [P] [US3] Write test: calculateFitZoom returns zoom that fits template in viewport
- [x] T049 [P] [US3] Write test: calculateFitZoom includes 5% padding margin
- [x] T050 [P] [US3] Write test: calculateFitZoom caps zoom at 1.0 for small templates (FR-011)
- [x] T051 [P] [US3] Write test: calculateFitZoom handles edge case of 0x0 template dimensions
- [x] T052 [US3] Run tests to verify fit calculation tests fail (red phase)

### Implementation for User Story 3 - Fit Calculation

- [x] T053 [US3] Create `src/domain/canvas/fitToView.ts` with `calculateFitZoom(templateSize, viewportSize, padding)` function
- [x] T054 [US3] Run tests to verify fit calculation tests pass (green phase)

### Tests for User Story 3 - Store Action ⚠️

- [x] T055 [US3] Write test for `fitToView()` action in `src/stores/__tests__/canvasStore.spec.ts`
- [x] T056 [US3] Run tests to verify fitToView action test fails (red phase)

### Implementation for User Story 3 - Store Action

- [x] T057 [US3] Implement `fitToView(viewportSize, templateSize)` action in `src/stores/canvasStore.ts`
- [x] T058 [US3] Run tests to verify fitToView action test passes (green phase)

### Tests for User Story 3 - UI ⚠️

- [x] T059 [P] [US3] Write test: clicking Fit button triggers fitToView in `src/components/ZoomToolbar/__tests__/ZoomToolbar.spec.tsx`
- [x] T060 [P] [US3] Write test: F key triggers fitToView when canvas has focus in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [x] T061 [P] [US3] Write test: Fit button gracefully no-ops when no template loaded
- [x] T062 [US3] Run tests to verify UI tests fail (red phase)

### Implementation for User Story 3 - UI

- [x] T063 [US3] Add Fit button to ZoomToolbar in `src/components/ZoomToolbar/ZoomToolbar.tsx`
- [x] T064 [US3] Add F key handler to Canvas keyboard handler in `src/components/Canvas/Canvas.tsx`
- [x] T065 [US3] Run tests to verify UI tests pass (green phase)
- [x] T066 [US3] Run `npx biome check --write .` to fix linting issues
- [x] T067 [US3] Run `npm test` to verify all tests pass
- [x] T068 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(006-zoom-controls): add fit-to-view with calculation and UI"

**Checkpoint**: All user stories complete - full zoom control functionality

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Disabled States (FR-012)

- [x] T069 Write test: + button disabled at MAX_ZOOM in `src/components/ZoomToolbar/__tests__/ZoomToolbar.spec.tsx`
- [x] T070 [P] Write test: - button disabled at MIN_ZOOM
- [x] T071 Implement disabled state derivation using createMemo in `src/components/ZoomToolbar/ZoomToolbar.tsx`
- [x] T072 Add disabled button styles in `src/components/ZoomToolbar/ZoomToolbar.module.css` (using existing disabled styles)

### Keyboard Filter (FR-013)

- [x] T073 Write test: keyboard shortcuts ignored when focus in text input in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [x] T074 Implement focus filter in keyboard handler to skip when `e.target` is input/textarea

### Final Verification

- [x] T075 Run `npm test` to verify all tests pass
- [x] T076 Run `npm run test:coverage` to verify 80%+ coverage on new code (new zoom code: 100%)
- [x] T077 Run `npx tsc --noEmit` to verify no TypeScript errors
- [x] T078 Run `npx biome check --write .` to fix any remaining lint issues
- [x] T079 [P] Update CLAUDE.md with new ZoomToolbar component and fitToView utility documentation
- [x] T080 **Commit**: Stage and commit Polish phase changes with message "feat(006-zoom-controls): add disabled states, keyboard filter, documentation"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [x] T081 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [x] T082 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [x] T083 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [x] T084 **Update Compliance Table**: Fill out FR/SC compliance table in `specs/006-zoom-controls/spec.md`

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed AND compliance table is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification only
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs ZoomToolbar, keyboard handler)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (needs ZoomToolbar, keyboard handler)
- **Polish (Phase 6)**: Depends on all user stories
- **Final (Phase 7)**: Depends on Polish

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Creates core infrastructure
- **User Story 2 (P2)**: Depends on US1 - Extends ZoomToolbar and keyboard handler
- **User Story 3 (P3)**: Depends on US1 - Extends ZoomToolbar and keyboard handler

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation (Red phase)
- Implementation makes tests pass (Green phase)
- Run biome check after implementation
- Story complete before moving to next priority

### Parallel Opportunities

Within Phase 3 (User Story 1):
- T010, T011 (store tests) can run in parallel
- T017, T018, T019 (component tests) can run in parallel
- T022 (CSS) can run in parallel with T021 (component)
- T025, T026, T027 (keyboard tests) can run in parallel

Within Phase 5 (User Story 3):
- T048, T049, T050, T051 (fit calculation tests) can run in parallel
- T059, T060, T061 (UI tests) can run in parallel

---

## Parallel Example: User Story 1 Store Tests

```bash
# Launch store tests in parallel:
Task: "Write tests for zoomIn() action in src/stores/__tests__/canvasStore.spec.ts"
Task: "Write tests for zoomOut() action in src/stores/__tests__/canvasStore.spec.ts"
```

## Parallel Example: User Story 3 Fit Calculation Tests

```bash
# Launch fit calculation tests in parallel:
Task: "Write test: calculateFitZoom returns zoom that fits template"
Task: "Write test: calculateFitZoom includes 5% padding margin"
Task: "Write test: calculateFitZoom caps zoom at 1.0"
Task: "Write test: calculateFitZoom handles 0x0 template"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 2: Foundational (formatZoomPercent)
3. Complete Phase 3: User Story 1 (zoom display, +/- buttons, keyboard)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo: Users can see zoom level and manually zoom in/out

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → MVP - basic zoom controls
3. Add User Story 2 → Reset to 100% functionality
4. Add User Story 3 → Fit-to-view functionality
5. Polish → Disabled states, keyboard filter, docs

---

## Task Summary

| Phase | Story | Task Count |
|-------|-------|------------|
| Setup | - | 3 |
| Foundational | - | 5 |
| User Story 1 | US1 | 27 |
| User Story 2 | US2 | 10 |
| User Story 3 | US3 | 23 |
| Polish | - | 12 |
| Final | - | 4 |
| **Total** | | **84** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing (Red-Green-Refactor)
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- **SC-006 (performance)**: Verified by manual observation; SolidJS fine-grained reactivity ensures sub-frame (<16ms) updates
- **100% button behavior**: Resets zoom only, preserves pan offset (use `resetCanvas()` for full reset)
