# Tasks: Marquee Selection

**Input**: Design documents from `/specs/009-marquee-selection/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: REQUIRED per constitution (Test-First Development principle)

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and design tokens needed by all stories

- [ ] T001 [P] Create MarqueeState and MarqueeRect types in `src/types/marquee.ts`
- [ ] T002 [P] Add marquee design tokens (--color-marquee-fill, --color-marquee-stroke) in `src/styles/tokens.css`
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(009): add marquee types and design tokens"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain utilities and store that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Utilities Tests

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Write unit tests for `normalizeRect()` in `src/domain/canvas/__tests__/marquee.spec.ts` - test all drag directions (up-left, down-right, etc.)
- [ ] T006 [P] Write unit tests for `rectIntersect()` in `src/domain/canvas/__tests__/marquee.spec.ts` - test overlap, edge touch, no overlap, zero-size cases
- [ ] T007 [P] Write unit tests for `isMinimumSize()` in `src/domain/canvas/__tests__/marquee.spec.ts` - test 5x5 threshold, edge cases
- [ ] T008 [P] Write unit tests for `findIntersectingViews()` in `src/domain/canvas/__tests__/marquee.spec.ts` - test no match, all match, partial match

### Domain Utilities Implementation

- [ ] T009 Implement `normalizeRect()`, `rectIntersect()`, `isMinimumSize()`, `findIntersectingViews()` in `src/domain/canvas/marquee.ts` - ensure all tests pass
- [ ] T010 Export marquee utilities from `src/domain/canvas/index.ts`

### Store Tests

- [ ] T011 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T012 [P] Write unit tests for marqueeStore initial state in `src/stores/__tests__/marqueeStore.spec.ts`
- [ ] T013 [P] Write unit tests for `startMarquee()` in `src/stores/__tests__/marqueeStore.spec.ts` - verify all fields set correctly
- [ ] T014 [P] Write unit tests for `updateMarquee()` in `src/stores/__tests__/marqueeStore.spec.ts` - test active and inactive states
- [ ] T015 [P] Write unit tests for `completeMarquee()` and `cancelMarquee()` in `src/stores/__tests__/marqueeStore.spec.ts` - verify reset to initial state
- [ ] T016 [P] Write unit test verifying `previousSelection` is a copy, not reference in `src/stores/__tests__/marqueeStore.spec.ts`

### Store Implementation

- [ ] T017 Implement marqueeStore with signals and actions in `src/stores/marqueeStore.ts` - ensure all tests pass
- [ ] T018 **Commit**: Stage and commit Phase 2 changes with message "feat(009): add marquee domain utilities and store"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Basic Marquee Selection (Priority: P1) 🎯 MVP

**Goal**: Click+drag on empty canvas draws selection rectangle that selects all intersecting views on release

**Independent Test**: Load uidesc with multiple views, click+drag on empty canvas area, verify rectangle appears and intersected views are selected on release

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T019 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T020 [P] [US1] Write component tests for MarqueeRectangle visibility when active/inactive in `src/components/Canvas/__tests__/MarqueeRectangle.spec.tsx`
- [ ] T021 [P] [US1] Write component tests for MarqueeRectangle using normalized coordinates in `src/components/Canvas/__tests__/MarqueeRectangle.spec.tsx`
- [ ] T022 [P] [US1] Write integration tests for mousedown on empty canvas starts marquee in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T023 [P] [US1] Write integration tests for mousedown on view does NOT start marquee in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T024 [P] [US1] Write integration tests for mouseup selects intersecting views in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T025 [P] [US1] Write integration tests for marquee < 5x5px clears selection (FR-010) in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`

### Implementation for User Story 1

- [ ] T026 [US1] Create MarqueeRectangle component in `src/components/Canvas/MarqueeRectangle.tsx` - renders SVG rect with normalized bounds
- [ ] T027 [US1] Add `.marqueeRect` CSS class in `src/components/Canvas/Canvas.module.css` - basic styling (detailed styling in US4)
- [ ] T028 [US1] Modify Canvas.tsx: Add mousedown handler to detect empty canvas click and call `startMarquee()` in `src/components/Canvas/Canvas.tsx`
- [ ] T029 [US1] Modify Canvas.tsx: Add document-level mousemove handler to call `updateMarquee()` in `src/components/Canvas/Canvas.tsx`
- [ ] T030 [US1] Modify Canvas.tsx: Add document-level mouseup handler to compute intersection and update selection in `src/components/Canvas/Canvas.tsx`
- [ ] T031 [US1] Modify Canvas.tsx: Render `<MarqueeRectangle />` inside SVG when marqueeStore.isActive in `src/components/Canvas/Canvas.tsx`
- [ ] T032 [US1] Run all tests and quality checks (`npm test`, `npx biome check --write .`, `npx tsc --noEmit`)
- [ ] T033 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(009): implement basic marquee selection"

**Checkpoint**: At this point, basic marquee selection (click+drag to select views) should be fully functional

---

## Phase 4: User Story 2 - Additive Selection with Shift (Priority: P2)

**Goal**: Shift+drag adds marquee-selected views to existing selection instead of replacing

**Independent Test**: Select some views, then Shift+drag marquee around different views, verify both sets are selected

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T034 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T035 [P] [US2] Write tests for Shift+drag preserves existing selection in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T036 [P] [US2] Write tests for Shift+drag adds new views to selection in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T037 [P] [US2] Write tests for Shift+drag with overlapping selection (no duplicates) in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T038 [P] [US2] Write tests for regular drag (no Shift) replaces selection in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`

### Implementation for User Story 2

- [ ] T039 [US2] Modify Canvas.tsx mousedown handler: Pass `event.shiftKey` to `startMarquee()` in `src/components/Canvas/Canvas.tsx`
- [ ] T040 [US2] Modify Canvas.tsx mouseup handler: Merge with previousSelection when isAdditive in `src/components/Canvas/Canvas.tsx`
- [ ] T041 [US2] Run all tests and quality checks
- [ ] T042 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(009): add Shift+drag additive selection"

**Checkpoint**: Additive selection with Shift should now work alongside basic marquee

---

## Phase 5: User Story 3 - Marquee Cancellation (Priority: P2)

**Goal**: Escape key and right-click cancel marquee operation, restoring original selection

**Independent Test**: Start marquee, press Escape before release, verify marquee disappears and original selection restored

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T043 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US3] Write tests for Escape cancels marquee and restores selection in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T045 [P] [US3] Write tests for right-click cancels marquee and restores selection in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T046 [P] [US3] Write tests for pan start during marquee cancels marquee (FR-012) in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`

### Implementation for User Story 3

- [ ] T047 [US3] Modify Canvas.tsx handleKeyDown: Cancel marquee on Escape when active in `src/components/Canvas/Canvas.tsx`
- [ ] T048 [US3] Add contextmenu handler to Canvas.tsx: Cancel marquee on right-click in `src/components/Canvas/Canvas.tsx`
- [ ] T049 [US3] Add createEffect to Canvas.tsx: Cancel marquee if canvasStore.isPanning becomes true in `src/components/Canvas/Canvas.tsx`
- [ ] T050 [US3] Ensure cancelMarquee() restores previousSelection via selectionStore in `src/components/Canvas/Canvas.tsx`
- [ ] T051 [US3] Run all tests and quality checks
- [ ] T052 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(009): add marquee cancellation (Escape, right-click, pan conflict)"

**Checkpoint**: Marquee cancellation with Escape, right-click, and pan conflict should now work

---

## Phase 6: User Story 4 - Visual Feedback During Marquee (Priority: P3)

**Goal**: Clear visual feedback during marquee: semi-transparent rectangle with visible border, crosshair cursor

**Independent Test**: Start marquee drag, verify rectangle has visible border and semi-transparent fill, cursor shows crosshair

### Tests for User Story 4 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T053 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T054 [P] [US4] Write tests for marquee rectangle has correct CSS class applied in `src/components/Canvas/__tests__/MarqueeRectangle.spec.tsx`
- [ ] T055 [P] [US4] Write tests for marquee rectangle uses design token colors in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`
- [ ] T056 [P] [US4] Write tests for crosshair cursor applied during marquee in `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx`

### Implementation for User Story 4

- [ ] T057 [US4] Finalize `.marqueeRect` CSS in `src/components/Canvas/Canvas.module.css` - semi-transparent fill (var(--color-marquee-fill)), solid stroke (var(--color-marquee-stroke)), stroke-width 1, pointer-events none
- [ ] T058 [US4] Add `.marqueeCursor` CSS class with cursor: crosshair in `src/components/Canvas/Canvas.module.css`
- [ ] T059 [US4] Apply marqueeCursor class to Canvas wrapper when marqueeStore.isActive in `src/components/Canvas/Canvas.tsx`
- [ ] T060 [US4] Run all tests and quality checks
- [ ] T061 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(009): add marquee visual feedback (styling, cursor)"

**Checkpoint**: Full visual feedback for marquee selection should now be complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification, documentation, and final validation

- [ ] T062 Run full test suite with coverage: `npm run test:coverage`
- [ ] T063 Verify 80% coverage threshold for new files, address gaps if needed
- [ ] T064 Run quality checks: `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T065 [P] Update CLAUDE.md: Add marqueeStore documentation to Utility Modules section
- [ ] T066 [P] Update CLAUDE.md: Add marquee utilities to Canvas Domain Module section
- [ ] T067 [P] Update CLAUDE.md: Add recent changes entry for 009-marquee-selection
- [ ] T068 Complete Requirement Compliance Table in `specs/009-marquee-selection/spec.md` - verify all FR-xxx and SC-xxx
- [ ] T069 **Commit**: Stage and commit Polish phase changes with message "docs(009): update CLAUDE.md and compliance table"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T070 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T071 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] T072 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all user stories being complete
- **Git Verification (Phase Final)**: Depends on Polish completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (uses same mousedown/mouseup handlers) - Extends existing behavior
- **User Story 3 (P2)**: Depends on US1 (cancellation needs active marquee) - Extends existing behavior
- **User Story 4 (P3)**: Depends on US1 (styling needs component to exist) - Enhances existing component

### Within Each Phase

- Tests MUST be written and FAIL before implementation
- Verify Testing Guide is in context before ANY test task
- Implementation follows Red-Green-Refactor cycle
- Quality checks run after each story
- Commit at end of each phase

### Parallel Opportunities

**Phase 1** (parallel):
- T001 and T002 can run in parallel (different files)

**Phase 2** (parallel):
- T005, T006, T007, T008 can run in parallel (same file, different functions)
- T012, T013, T014, T015, T016 can run in parallel (same file, different test blocks)

**User Story 1** (parallel after T019):
- T020, T021 can run in parallel (same test file, different describe blocks)
- T022, T023, T024, T025 can run in parallel (same test file, different describe blocks)

**User Story 2** (parallel after T034):
- T035, T036, T037, T038 can run in parallel

**User Story 3** (parallel after T043):
- T044, T045, T046 can run in parallel

**User Story 4** (parallel after T053):
- T054, T055, T056 can run in parallel

**Phase 7** (parallel):
- T065, T066, T067 can run in parallel (different sections of same file)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write component tests for MarqueeRectangle visibility in Canvas/__tests__/MarqueeRectangle.spec.tsx"
Task: "Write component tests for MarqueeRectangle normalized coordinates in Canvas/__tests__/MarqueeRectangle.spec.tsx"
Task: "Write integration tests for mousedown starts marquee in Canvas/__tests__/Canvas.marquee.spec.tsx"
Task: "Write integration tests for mousedown on view skips marquee in Canvas/__tests__/Canvas.marquee.spec.tsx"
Task: "Write integration tests for mouseup selects views in Canvas/__tests__/Canvas.marquee.spec.tsx"
Task: "Write integration tests for small marquee clears selection in Canvas/__tests__/Canvas.marquee.spec.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, tokens)
2. Complete Phase 2: Foundational (utilities, store)
3. Complete Phase 3: User Story 1 (basic marquee)
4. **STOP and VALIDATE**: Test basic marquee independently
5. Demo: Click+drag on canvas to select multiple views

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP!)
3. Add User Story 2 → Test Shift+drag → Demo
4. Add User Story 3 → Test cancellation → Demo
5. Add User Story 4 → Test visual feedback → Demo
6. Polish + Git Verification → Feature complete

### File Creation Order

| Order | File | Phase |
|-------|------|-------|
| 1 | `src/types/marquee.ts` | Setup |
| 2 | `src/styles/tokens.css` (modify) | Setup |
| 3 | `src/domain/canvas/__tests__/marquee.spec.ts` | Foundational |
| 4 | `src/domain/canvas/marquee.ts` | Foundational |
| 5 | `src/domain/canvas/index.ts` (modify) | Foundational |
| 6 | `src/stores/__tests__/marqueeStore.spec.ts` | Foundational |
| 7 | `src/stores/marqueeStore.ts` | Foundational |
| 8 | `src/components/Canvas/__tests__/MarqueeRectangle.spec.tsx` | US1 |
| 9 | `src/components/Canvas/__tests__/Canvas.marquee.spec.tsx` | US1 |
| 10 | `src/components/Canvas/MarqueeRectangle.tsx` | US1 |
| 11 | `src/components/Canvas/Canvas.module.css` (modify) | US1, US4 |
| 12 | `src/components/Canvas/Canvas.tsx` (modify) | US1, US2, US3, US4 |
| 13 | `CLAUDE.md` (modify) | Polish |

---

## Notes

- [P] tasks = different files or independent test blocks, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing (Red phase)
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
