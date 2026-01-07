# Tasks: Smart Guides

**Input**: Design documents from `/specs/015-smart-guides/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, store, and design tokens needed by all user stories

- [x] T001 [P] Create smart guide type definitions in `src/types/smartGuides.ts` (GuideOrientation, GuideType, SmartGuide, SpacingGuide, SmartGuidesState, GuideMatch, ViewBounds)
- [x] T002 [P] Add smart guide design tokens to `src/styles/tokens.css` (--color-smart-guide, --color-smart-guide-label-bg, --color-smart-guide-label-text)
- [x] T003 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with tests
- [x] T004 Write unit tests for smartGuidesStore in `src/stores/__tests__/smartGuidesStore.spec.ts` (tests written FIRST, will fail until T005)
- [x] T005 Create smartGuidesStore in `src/stores/smartGuidesStore.ts` (isEnabled, activeGuides, toggleSmartGuides, setActiveGuides, clearActiveGuides, resetSmartGuides)
- [x] T006 **Commit**: Stage and commit Phase 1 changes with message "feat(smart-guides): add types, store, and design tokens"

---

## Phase 2: Foundational (Core Utilities)

**Purpose**: ViewBounds helper and base guide calculation functions needed by ALL user stories

**⚠️ CRITICAL**: User story implementation depends on these utilities

- [x] T007 Write unit tests for foundational utilities in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T008-T010)
- [x] T008 Create getViewBounds utility in `src/domain/canvas/smartGuides.ts` (converts RenderableView to ViewBounds with left/right/top/bottom/centerX/centerY)
- [x] T009 Create isWithinThreshold utility in `src/domain/canvas/smartGuides.ts` (checks if distance <= GUIDE_THRESHOLD)
- [x] T010 Create createGuide utility in `src/domain/canvas/smartGuides.ts` (factory for SmartGuide objects with unique IDs)
- [x] T011 **Commit**: Stage and commit Phase 2 changes with message "feat(smart-guides): add foundational calculation utilities"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1+2 - Edge & Center Alignment Guides (Priority: P1) 🎯 MVP

**Goal**: Display guide lines when dragging view edges or centers align with sibling edges or centers (within 5px threshold)

**Independent Test**: Drag a view near a sibling's edge/center and verify guide lines appear; drag away and verify they disappear

**Note**: US1 (edges) and US2 (centers) are combined as they share implementation patterns and are both P1 priority

### Implementation for User Story 1+2

- [x] T012 [US1+US2] Write unit tests for findEdgeAlignments in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T015)
- [x] T013 [US1+US2] Write unit tests for findCenterAlignments in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T016)
- [x] T014 [US1+US2] Write unit tests for calculateSmartGuides in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T017)
- [x] T015 [US1] Implement findEdgeAlignments function in `src/domain/canvas/smartGuides.ts` (check left/right edges against sibling left/right, top/bottom against sibling top/bottom)
- [x] T016 [US2] Implement findCenterAlignments function in `src/domain/canvas/smartGuides.ts` (check centerX against sibling centerX, centerY against sibling centerY)
- [x] T017 [US1+US2] Implement calculateSmartGuides function in `src/domain/canvas/smartGuides.ts` (orchestrates edge + center alignment checks, returns SmartGuide[])
- [x] T018 [US1+US2] Write component tests for SmartGuideLines in `src/components/Canvas/__tests__/SmartGuideLines.spec.tsx` (tests written FIRST, will fail until T019)
- [x] T019 [P] [US1+US2] Create SmartGuideLines component in `src/components/Canvas/SmartGuideLines.tsx` (renders SVG lines from activeGuides, full viewport extent)
- [x] T020 [US1+US2] Integrate guide calculation into useCanvasInteractions hook in `src/hooks/canvas/useCanvasInteractions.ts` (call calculateSmartGuides in handleDragMove, clear in handleDragUp)
- [x] T021 [US1+US2] Add SmartGuideLines to Canvas component in `src/components/Canvas/Canvas.tsx`
- [x] T022 [US1+US2] Write integration tests for guide display during drag in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx`
- [x] T023 [US1+US2] **Commit**: Stage and commit User Story 1+2 changes with message "feat(smart-guides): implement edge and center alignment guides"

**Checkpoint**: Edge and center guides functional - MVP complete

---

## Phase 4: User Story 5 - Guide Visibility Toggle (Priority: P2)

**Goal**: Allow users to toggle smart guides on/off with S key; guides only show when enabled

**Independent Test**: Press S key to toggle, verify guides no longer appear during drag when disabled

**Note**: US5 prioritized before US3 because toggle affects all guide types

### Implementation for User Story 5

- [x] T024 [US5] Write keyboard test for S key toggle in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts` (tests written FIRST, will fail until T026)
- [x] T025 [US5] Write test verifying guides don't appear when disabled in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx` (tests written FIRST, will fail until T027)
- [x] T026 [US5] Add S key handler to useCanvasKeyboard hook in `src/hooks/canvas/useCanvasKeyboard.ts` (calls toggleSmartGuides, filter for text inputs)
- [x] T027 [US5] Update useCanvasInteractions to check isEnabled before calculating guides in `src/hooks/canvas/useCanvasInteractions.ts`
- [ ] T028 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(smart-guides): add S key toggle for visibility"

**Checkpoint**: Users can toggle guides on/off

---

## Phase 5: User Story 3 - Parent Center Guides (Priority: P2)

**Goal**: Display guide lines when a view's center aligns with its parent container's center

**Independent Test**: Drag a view to the center of its parent container and verify parent center guide lines appear

### Implementation for User Story 3

- [ ] T029 [US3] Write unit tests for findParentCenterGuides in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T031)
- [ ] T030 [US3] Write integration test for parent center guides in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx` (tests written FIRST, will fail until T033)
- [ ] T031 [US3] Implement findParentCenterGuides function in `src/domain/canvas/smartGuides.ts` (check centerX/centerY against parent bounds center)
- [ ] T032 [US3] Update calculateSmartGuides to include parent center guides in `src/domain/canvas/smartGuides.ts`
- [ ] T033 [US3] Pass parent bounds to calculateSmartGuides in useCanvasInteractions in `src/hooks/canvas/useCanvasInteractions.ts`
- [ ] T034 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(smart-guides): add parent center alignment guides"

**Checkpoint**: Parent center guides functional

---

## Phase 6: User Story 4 - Spacing Guides (Priority: P3)

**Goal**: Display guide lines with distance labels when a view is positioned with equal spacing between adjacent views

**Independent Test**: Position a view equidistant between two siblings and verify spacing guides appear with distance labels

### Implementation for User Story 4

- [ ] T035 [US4] Write unit tests for findSpacingGuides in `src/domain/canvas/__tests__/smartGuides.spec.ts` (tests written FIRST, will fail until T038)
- [ ] T036 [US4] Write component tests for spacing guide labels in `src/components/Canvas/__tests__/SmartGuideLines.spec.tsx` (tests written FIRST, will fail until T040)
- [ ] T037 [US4] Write integration test for spacing guides in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx` (tests written FIRST, will fail until T041)
- [ ] T038 [US4] Implement findSpacingGuides function in `src/domain/canvas/smartGuides.ts` (find equal gaps in horizontal/vertical bands)
- [ ] T039 [US4] Update calculateSmartGuides to include spacing guides in `src/domain/canvas/smartGuides.ts`
- [ ] T040 [US4] Update SmartGuideLines to render spacing labels in `src/components/Canvas/SmartGuideLines.tsx`
- [ ] T041 [US4] Add CSS for spacing labels in `src/components/Canvas/SmartGuideLines.module.css`
- [ ] T042 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(smart-guides): add spacing guides with distance labels"

**Checkpoint**: Spacing guides with labels functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, edge cases, and cleanup

- [ ] T043 Update CLAUDE.md with smartGuidesStore documentation in `CLAUDE.md`
- [ ] T044 Update CLAUDE.md with smartGuides domain utilities documentation in `CLAUDE.md`
- [ ] T045 Test multi-view drag scenario (anchor view guides) in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx`
- [ ] T046 Test edge case: only child in container (parent center only) in `src/components/Canvas/__tests__/Canvas.smartGuides.spec.tsx`
- [ ] T047 Run `npx biome check --write .` to lint and format all code
- [ ] T048 Run `npx stylelint "**/*.css" --fix` to lint CSS
- [ ] T049 Run `npx tsc --noEmit` to verify type correctness
- [ ] T050 Run full test suite `npm test` and verify all tests pass
- [ ] T051 **Commit**: Stage and commit Polish phase changes with message "chore(smart-guides): documentation and cleanup"

---

## Phase Final: Git Verification & Compliance

**Purpose**: Ensure all work is committed and requirements met

- [ ] T052 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T053 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T054 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T055 **Update Compliance Table**: Update spec.md compliance table with MET status and evidence for all FR-xxx and SC-xxx requirements

**⚠️ CRITICAL**: Do NOT mark the feature as complete until:
1. All work is committed
2. All tests pass
3. Compliance table shows all requirements MET

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 types - BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 - Core MVP
- **US5 (Phase 4)**: Depends on Phase 3 - Toggle affects guide display
- **US3 (Phase 5)**: Depends on Phase 3 - Extends guide calculations
- **US4 (Phase 6)**: Depends on Phase 3 - Extends guide calculations
- **Polish (Phase 7)**: Depends on all user stories complete
- **Final (Phase 8)**: Depends on Polish

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1+US2 (P1) | Phase 2 | Phase 2 complete |
| US5 (P2) | US1+US2 | Phase 3 complete |
| US3 (P2) | US1+US2 | Phase 3 complete |
| US4 (P3) | US1+US2 | Phase 3 complete |

**Note**: US3, US4, and US5 can potentially run in parallel after Phase 3, but US5 affects guide visibility for all types so is prioritized first.

### Parallel Opportunities

- **Phase 1**: T001, T002 can run in parallel (different files)
- **Phase 3**: T018 (component) can start while T012-T17 (utilities/tests) complete
- **Phase 5-6**: US3 and US4 could run in parallel if needed (different calculation functions)

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (types, store, tokens)
2. Complete Phase 2: Foundational (ViewBounds, utilities)
3. Complete Phase 3: User Story 1+2 (edge + center guides)
4. **STOP and VALIDATE**: Test edge/center guides work during drag
5. This delivers core smart guide functionality

### Incremental Delivery

| Phase | Deliverable | Test |
|-------|-------------|------|
| Setup + Foundational | Store + utilities | Unit tests pass |
| US1+US2 | Edge & center guides | Drag near sibling, guides appear |
| US5 | Toggle visibility | S key toggles, guides hide when disabled |
| US3 | Parent center guides | Drag to parent center, guides appear |
| US4 | Spacing guides | Equal spacing, labels show distance |

### Requirement Mapping

| Requirement | Task(s) |
|-------------|---------|
| FR-001, FR-002 | T012, T015, T022 |
| FR-003, FR-004 | T013, T016, T022 |
| FR-005 | T029, T031, T033 |
| FR-006, FR-007 | T018, T019 |
| FR-008 | T020, T022 |
| FR-009 | T002, T018 |
| FR-010, FR-011 | T024, T026 |
| FR-012, FR-013 | T035-T041 |
| FR-014 | T045 |
| FR-015 | T020 (no snapping applied) |
| FR-016 | T003, T005 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- **Commit after each phase** - maintains clean history
- US1 and US2 combined as they share calculation patterns
- US5 (toggle) prioritized before US3/US4 because it affects all guide types
- FR-015 (no snapping) is implicit - guides are visual-only, no position changes
