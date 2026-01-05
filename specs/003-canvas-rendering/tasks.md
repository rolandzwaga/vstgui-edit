# Tasks: Canvas Rendering

**Input**: Design documents from `/specs/003-canvas-rendering/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Required per constitution (Test-First Development is NON-NEGOTIABLE)

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project structure and shared types

- [x] T001 Create Canvas component directory structure at src/components/Canvas/
- [x] T002 Create domain canvas directory structure at src/domain/canvas/
- [x] T003 [P] Define ViewCategory type in src/types/canvas.ts
- [x] T004 [P] Define Point and Size interfaces in src/types/canvas.ts
- [x] T005 [P] Define RenderableView interface in src/types/canvas.ts
- [x] T006 [P] Define TemplateBounds interface in src/types/canvas.ts
- [x] T007 Add category color design tokens to src/styles/tokens.css
- [x] T008 **Commit**: Stage and commit Phase 1 changes with message "feat(003): setup canvas types and project structure"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T009 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T010 [P] Write tests for parsePoint in src/domain/canvas/__tests__/coordinates.spec.ts
- [x] T011 [P] Write tests for parseSize in src/domain/canvas/__tests__/coordinates.spec.ts

### Implementation for Foundational

- [x] T012 [P] Implement parsePoint function in src/domain/canvas/coordinates.ts
- [x] T013 [P] Implement parseSize function in src/domain/canvas/coordinates.ts
- [x] T014 Create barrel export in src/domain/canvas/index.ts
- [x] T015 **Commit**: Stage and commit Phase 2 changes with message "feat(003): add coordinate parsing utilities"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Template Layout (Priority: P1) 🎯 MVP

**Goal**: Render uidesc template views as rectangles with correct positions and sizes

**Independent Test**: Load a uidesc file and verify all views appear as rectangles at correct canvas coordinates

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T016 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T017 [P] [US1] Write tests for basic flattenHierarchy (single view) in src/domain/canvas/__tests__/flattenHierarchy.spec.ts
- [x] T018 [P] [US1] Write tests for EmptyState component in src/components/Canvas/__tests__/EmptyState.spec.tsx
- [x] T019 [P] [US1] Write tests for basic ViewRectangle (position/size only) in src/components/Canvas/__tests__/ViewRectangle.spec.tsx
- [x] T020 [P] [US1] Write tests for Canvas component (empty state + basic rendering) in src/components/Canvas/__tests__/Canvas.spec.tsx

### Implementation for User Story 1

- [x] T021 [US1] Implement basic flattenHierarchy (single view, no recursion yet) in src/domain/canvas/flattenHierarchy.ts
- [x] T022 [P] [US1] Implement EmptyState component in src/components/Canvas/EmptyState.tsx
- [x] T023 [P] [US1] Add empty state styles to src/components/Canvas/Canvas.module.css
- [x] T024 [US1] Implement basic ViewRectangle component (SVG rect only, no label) in src/components/Canvas/ViewRectangle.tsx
- [x] T025 [US1] Add basic rectangle styles to src/components/Canvas/Canvas.module.css
- [x] T026 [US1] Implement Canvas component with documentStore integration in src/components/Canvas/Canvas.tsx
- [x] T027 [US1] Export Canvas component from src/components/Canvas/index.ts
- [x] T028 [US1] **Commit**: Stage and commit US1 changes with message "feat(003): implement basic canvas rendering (US1)"

**Checkpoint**: Basic rectangles render at correct positions - MVP testable

---

## Phase 4: User Story 2 - View Hierarchy Display (Priority: P1)

**Goal**: Render nested child views correctly on top of parents with absolute positions

**Independent Test**: Load uidesc with nested containers and verify children appear inside and on top of parents at correct absolute positions

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T029 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T030 [P] [US2] Write tests for recursive flattenHierarchy in src/domain/canvas/__tests__/flattenHierarchy.spec.ts
- [x] T031 [P] [US2] Write tests for absolute position calculation in src/domain/canvas/__tests__/flattenHierarchy.spec.ts
- [x] T032 [P] [US2] Write tests for z-ordering (DOM order) in src/components/Canvas/__tests__/Canvas.spec.tsx

### Implementation for User Story 2

- [x] T033 [US2] Extend flattenHierarchy with recursive child processing in src/domain/canvas/flattenHierarchy.ts
- [x] T034 [US2] Implement absolute position calculation (parent + child origin) in src/domain/canvas/flattenHierarchy.ts
- [x] T035 [US2] Implement zIndex assignment based on traversal order in src/domain/canvas/flattenHierarchy.ts
- [x] T036 [US2] Verify Canvas renders views in correct DOM order for z-ordering
- [x] T037 [US2] **Commit**: Stage and commit US2 changes with message "feat(003): implement view hierarchy with z-ordering (US2)"

**Checkpoint**: Nested views render with correct parent-child positioning

---

## Phase 5: User Story 3 - View Identification (Priority: P2)

**Goal**: Display class name labels on each view rectangle

**Independent Test**: Render views and verify class labels are visible and legible on each rectangle

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T038 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T039 [P] [US3] Write tests for formatLabel in src/domain/canvas/__tests__/labelFormat.spec.ts
- [x] T040 [P] [US3] Write tests for label rendering in ViewRectangle in src/components/Canvas/__tests__/ViewRectangle.spec.tsx
- [x] T041 [P] [US3] Write tests for label truncation on small views in src/components/Canvas/__tests__/ViewRectangle.spec.tsx

### Implementation for User Story 3

- [x] T042 [US3] Implement formatLabel function (basic, no [Custom] yet) in src/domain/canvas/labelFormat.ts
- [x] T043 [US3] Add SVG text element to ViewRectangle for label display in src/components/Canvas/ViewRectangle.tsx
- [x] T044 [US3] Add label typography styles to src/components/Canvas/Canvas.module.css
- [x] T045 [US3] Implement label truncation/hiding for views under 60px wide in src/components/Canvas/ViewRectangle.tsx
- [x] T046 [US3] Update barrel export in src/domain/canvas/index.ts
- [x] T047 [US3] **Commit**: Stage and commit US3 changes with message "feat(003): add view class labels (US3)"

**Checkpoint**: All views display their class name labels

---

## Phase 6: User Story 4 - View Category Coloring (Priority: P2)

**Goal**: Color-code views by category (containers, controls, displays, custom)

**Independent Test**: Render views of different categories and verify distinct fill/border colors

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T048 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T049 [P] [US4] Write tests for getViewCategory in src/domain/canvas/__tests__/viewCategory.spec.ts
- [x] T050 [P] [US4] Write tests for [Custom] indicator in formatLabel in src/domain/canvas/__tests__/labelFormat.spec.ts
- [x] T051 [P] [US4] Write tests for category-based CSS class application in src/components/Canvas/__tests__/ViewRectangle.spec.tsx

### Implementation for User Story 4

- [x] T052 [P] [US4] Define CONTAINER_CLASSES, CONTROL_CLASSES, DISPLAY_CLASSES sets in src/domain/canvas/viewCategory.ts
- [x] T053 [US4] Implement getViewCategory function in src/domain/canvas/viewCategory.ts
- [x] T054 [US4] Update formatLabel to add [Custom] indicator for custom category in src/domain/canvas/labelFormat.ts
- [x] T055 [US4] Add category property to RenderableView in flattenHierarchy in src/domain/canvas/flattenHierarchy.ts
- [x] T056 [US4] Apply category-based CSS classes in ViewRectangle in src/components/Canvas/ViewRectangle.tsx
- [x] T057 [US4] Add category color styles (.container, .control, .display, .custom) to src/components/Canvas/Canvas.module.css
- [x] T058 [US4] Update barrel export in src/domain/canvas/index.ts
- [x] T059 [US4] **Commit**: Stage and commit US4 changes with message "feat(003): add category color coding (US4)"

**Checkpoint**: Views are visually distinguishable by category color

---

## Phase 7: User Story 5 - Template Bounds Indicator (Priority: P3)

**Goal**: Show distinct border around template root dimensions

**Independent Test**: Load template and verify distinct border appears around template's root size

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T060 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T061 [P] [US5] Write tests for TemplateBounds component in src/components/Canvas/__tests__/TemplateBounds.spec.tsx
- [x] T062 [P] [US5] Write tests for template bounds rendering in Canvas in src/components/Canvas/__tests__/Canvas.spec.tsx

### Implementation for User Story 5

- [x] T063 [US5] Implement TemplateBounds component in src/components/Canvas/TemplateBounds.tsx
- [x] T064 [US5] Add template bounds styles (dashed, thicker stroke) to src/components/Canvas/Canvas.module.css
- [x] T065 [US5] Integrate TemplateBounds into Canvas component in src/components/Canvas/Canvas.tsx
- [x] T066 [US5] **Commit**: Stage and commit US5 changes with message "feat(003): add template bounds indicator (US5)"

**Checkpoint**: Template bounds are clearly visible and distinguishable

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification and documentation

- [x] T067 Run all tests and verify 100% pass rate with `npm test`
- [x] T068 Run Biome linting/formatting with `npx biome check --write .`
- [x] T069 Run TypeScript type checking with `npx tsc --noEmit`
- [x] T070 Verify coverage meets 80% threshold with `npm run test:coverage` (skipped - @vitest/coverage-v8 not installed)
- [x] T071 Update CLAUDE.md with new Canvas utilities and patterns
- [x] T072 **Commit**: Stage and commit Polish phase changes with message "chore(003): polish and documentation"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T073 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T074 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T075 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
┌───────────────────────────────────────────────────────┐
│  User Stories can proceed in priority order:          │
│  Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3)       │
│                → Phase 6 (US4) → Phase 7 (US5)        │
└───────────────────────────────────────────────────────┘
    ↓
Phase 8: Polish
    ↓
Phase Final: Git Verification
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (P1) | Foundational | Phase 2 complete |
| US2 (P1) | US1 | Phase 3 complete (extends flattenHierarchy) |
| US3 (P2) | US1 | Phase 3 complete (adds labels to ViewRectangle) |
| US4 (P2) | US3 | Phase 5 complete (extends formatLabel with [Custom]) |
| US5 (P3) | US1 | Phase 3 complete (adds TemplateBounds to Canvas) |

### Parallel Opportunities per Phase

**Phase 1 (Setup)**: T003, T004, T005, T006 can run in parallel
**Phase 2 (Foundational)**: T010, T011 tests in parallel (after T009 guide check); T012, T013 impl in parallel
**Phase 3 (US1)**: T017, T018, T019, T020 tests in parallel (after T016 guide check); T022, T023 in parallel
**Phase 4 (US2)**: T030, T031, T032 tests in parallel (after T029 guide check)
**Phase 5 (US3)**: T039, T040, T041 tests in parallel (after T038 guide check)
**Phase 6 (US4)**: T049, T050, T051 tests in parallel (after T048 guide check); T052 can start early
**Phase 7 (US5)**: T061, T062 tests in parallel (after T060 guide check)

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - Basic rectangles at correct positions
4. Complete Phase 4: US2 - Nested views with z-ordering
5. **STOP and VALIDATE**: Test core rendering independently
6. Deploy/demo if ready - rectangles visible!

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 | Views render as rectangles with correct hierarchy |
| +Labels | US3 | Users can identify view types |
| +Colors | US4 | Quick visual category distinction |
| +Bounds | US5 | Clear template boundaries |

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 75 |
| Setup Tasks | 8 |
| Foundational Tasks | 7 |
| US1 Tasks | 13 |
| US2 Tasks | 9 |
| US3 Tasks | 10 |
| US4 Tasks | 12 |
| US5 Tasks | 7 |
| Polish Tasks | 6 |
| Final Tasks | 3 |
| Testing Guide Verifications | 6 |
| Parallelizable Tasks | 28 |

---

## Notes

- Test-First Development is required per constitution
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Each phase ends with a commit task
- SVG rendering approach - see research.md for rationale
- Domain layer (src/domain/canvas/) is renderer-agnostic for future Canvas pivot
- Use `<For>` component for view list rendering (SolidJS)
- Signals are getter functions - call `count()` not `count`
