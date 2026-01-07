# Tasks: Hierarchy Reparenting

**Input**: Design documents from `/specs/018-hierarchy-reparenting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Following constitution principle I (Test-First Development), tests are written FIRST for all domain logic.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types and Shared Infrastructure)

**Purpose**: Create type definitions and foundational domain logic

- [x] T001 Create hierarchy drag-drop type definitions in `src/types/hierarchy.ts`
- [x] T002 Create barrel export in `src/domain/hierarchy/index.ts`
- [x] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(018): add hierarchy types and barrel export"

---

## Phase 2: Foundational (Document Store Mutations)

**Purpose**: Core mutations that ALL user stories depend on - MUST complete before ANY story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 Write tests for `reparentView` mutation in `src/stores/__tests__/documentStore.spec.ts`
- [ ] T006 Implement `reparentView(viewId, newParentId, index?, newOrigin?)` mutation in `src/stores/documentStore.ts`
- [ ] T007 Write tests for `reorderView` mutation in `src/stores/__tests__/documentStore.spec.ts`
- [ ] T008 Implement `reorderView(viewId, newIndex)` mutation in `src/stores/documentStore.ts`
- [ ] T009 Write tests for `createGroupContainer` mutation in `src/stores/__tests__/documentStore.spec.ts`
- [ ] T010 Implement `createGroupContainer(viewIds, containerId, attrs)` mutation in `src/stores/documentStore.ts`
- [ ] T011 Write tests for `ungroupContainer` mutation in `src/stores/__tests__/documentStore.spec.ts`
- [ ] T012 Implement `ungroupContainer(containerId)` mutation in `src/stores/documentStore.ts`
- [ ] T013 **Commit**: Stage and commit Phase 2 changes with message "feat(018): add document store mutations for hierarchy operations"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Reparent View via Drag-and-Drop (Priority: P1) 🎯 MVP

**Goal**: Drag a view onto a container to change its parent

**Independent Test**: Drag "Button1" from Container1 onto Container2, verify it becomes child of Container2

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005

### Domain Logic for US1

- [ ] T014 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T015 [P] [US1] Write tests for `isDescendantOf()` in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T016 [P] [US1] Write tests for `validateReparent()` in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T017 [P] [US1] Write tests for `calculateNewOrigin()` in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T018 [P] [US1] Write tests for `createReparentOperation()` in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T019 [US1] Implement `isDescendantOf()` in `src/domain/hierarchy/reparent.ts`
- [ ] T020 [US1] Implement `validateReparent()` in `src/domain/hierarchy/reparent.ts`
- [ ] T021 [US1] Implement `calculateNewOrigin()` in `src/domain/hierarchy/reparent.ts`
- [ ] T022 [US1] Implement `createReparentOperation()` in `src/domain/hierarchy/reparent.ts`

### Drag Hook for US1

- [ ] T023 [US1] Write tests for drag state in `src/hooks/hierarchy/__tests__/useHierarchyDrag.spec.ts`
- [ ] T024 [US1] Implement `useHierarchyDrag` hook (drag start, drop on container) in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T025 [US1] Create barrel export in `src/hooks/hierarchy/index.ts`

### UI Integration for US1

- [ ] T026 [US1] Add `draggable="true"` and drag event handlers to `src/components/HierarchyPanel/TreeNode.tsx`
- [ ] T027 [US1] Wire up drop-on-container handler in `src/components/HierarchyPanel/TreeNode.tsx`
- [ ] T028 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(018): implement view reparenting via drag-and-drop"

**Checkpoint**: User Story 1 complete - reparenting works via drag-drop

---

## Phase 4: User Story 2 - Reorder Siblings via Drag-and-Drop (Priority: P1)

**Goal**: Drag views within same parent to change z-order

**Independent Test**: Drag ViewC above ViewA in Container1, verify order becomes [ViewC, ViewA, ViewB]

**Requirements**: FR-006, FR-007, FR-008

### Domain Logic for US2

- [ ] T029 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T030 [P] [US2] Write tests for `validateReorder()` in `src/domain/hierarchy/__tests__/reorder.spec.ts`
- [ ] T031 [P] [US2] Write tests for `getDropPosition()` in `src/domain/hierarchy/__tests__/reorder.spec.ts`
- [ ] T032 [P] [US2] Write tests for `createReorderOperation()` in `src/domain/hierarchy/__tests__/reorder.spec.ts`
- [ ] T033 [US2] Implement `validateReorder()` in `src/domain/hierarchy/reorder.ts`
- [ ] T034 [US2] Implement `getDropPosition()` (before/inside/after zones) in `src/domain/hierarchy/reorder.ts`
- [ ] T035 [US2] Implement `createReorderOperation()` in `src/domain/hierarchy/reorder.ts`

### UI Integration for US2

- [ ] T036 [US2] Extend `useHierarchyDrag` with drop-between-siblings detection in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T037 [US2] Add insertion line indicator styles to `src/components/HierarchyPanel/HierarchyPanel.module.css`
- [ ] T038 [US2] Wire up sibling reorder handler in `src/components/HierarchyPanel/TreeNode.tsx`
- [ ] T039 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(018): implement sibling reordering via drag-and-drop"

**Checkpoint**: User Story 2 complete - sibling reorder works via drag-drop

---

## Phase 5: User Story 3 - Undo/Redo for Hierarchy Operations (Priority: P1)

**Goal**: All reparent and reorder operations can be undone/redone

**Independent Test**: Reparent view, press Ctrl+Z, verify view returns to original parent

**Requirements**: FR-019, FR-020

### Integration Tests for US3

- [ ] T040 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T041 [US3] Write tests for undo/redo reparent in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T042 [US3] Write tests for undo/redo reorder in `src/domain/hierarchy/__tests__/reorder.spec.ts`

### Implementation for US3

- [ ] T043 [US3] Integrate `pushOperation()` calls in reparent flow in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T044 [US3] Integrate `pushOperation()` calls in reorder flow in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T045 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(018): integrate undo/redo for reparent and reorder"

**Checkpoint**: User Story 3 complete - undo/redo works for drag operations

---

## Phase 6: User Story 4 - Group Selected Views (Priority: P2)

**Goal**: Ctrl+G wraps selected siblings in new CViewContainer

**Independent Test**: Select ViewA and ViewB (siblings), press Ctrl+G, verify new container created

**Requirements**: FR-009, FR-010, FR-011, FR-012, FR-013, FR-021

### Domain Logic for US4

- [ ] T046 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T047 [P] [US4] Write tests for `validateGroup()` in `src/domain/hierarchy/__tests__/group.spec.ts`
- [ ] T048 [P] [US4] Write tests for `calculateGroupBounds()` in `src/domain/hierarchy/__tests__/group.spec.ts`
- [ ] T049 [P] [US4] Write tests for `createGroupOperation()` in `src/domain/hierarchy/__tests__/group.spec.ts`
- [ ] T050 [US4] Implement `validateGroup()` in `src/domain/hierarchy/group.ts`
- [ ] T051 [US4] Implement `calculateGroupBounds()` in `src/domain/hierarchy/group.ts`
- [ ] T052 [US4] Implement `createGroupOperation()` in `src/domain/hierarchy/group.ts`

### Keyboard Integration for US4

- [ ] T053 [US4] Write tests for Ctrl+G handler in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`
- [ ] T054 [US4] Add Ctrl+G handler to `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T055 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(018): implement group views with Ctrl+G"

**Checkpoint**: User Story 4 complete - Ctrl+G groups selected siblings

---

## Phase 7: User Story 5 - Ungroup Container (Priority: P2)

**Goal**: Ctrl+Shift+G moves container children up and deletes container

**Independent Test**: Select a container, press Ctrl+Shift+G, verify children moved to parent

**Requirements**: FR-014, FR-015, FR-016, FR-017, FR-018, FR-022

### Domain Logic for US5

- [ ] T056 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T057 [P] [US5] Write tests for `validateUngroup()` in `src/domain/hierarchy/__tests__/group.spec.ts`
- [ ] T058 [P] [US5] Write tests for `createUngroupOperation()` in `src/domain/hierarchy/__tests__/group.spec.ts`
- [ ] T059 [US5] Implement `validateUngroup()` in `src/domain/hierarchy/group.ts`
- [ ] T060 [US5] Implement `createUngroupOperation()` in `src/domain/hierarchy/group.ts`

### Keyboard Integration for US5

- [ ] T061 [US5] Write tests for Ctrl+Shift+G handler in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`
- [ ] T062 [US5] Add Ctrl+Shift+G handler to `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T063 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(018): implement ungroup container with Ctrl+Shift+G"

**Checkpoint**: User Story 5 complete - Ctrl+Shift+G ungroups container

---

## Phase 8: User Story 6 - Visual Feedback During Drag (Priority: P2)

**Goal**: Show drop indicators and highlights during drag operations

**Independent Test**: Start dragging, verify container highlights and insertion lines appear

**Requirements**: FR-023, FR-024, FR-025

### Styles for US6

> **Note**: Use design tokens from `src/styles/tokens.css` for colors and spacing to ensure consistency.

- [ ] T064 [US6] Add `.dropTarget` highlight style to `src/components/HierarchyPanel/HierarchyPanel.module.css` (use `--color-primary` token)
- [ ] T065 [US6] Add `.dropBefore` / `.dropAfter` insertion line styles to `src/components/HierarchyPanel/HierarchyPanel.module.css` (use `--color-primary` token)
- [ ] T066 [US6] Add `.dropInvalid` rejection indicator style to `src/components/HierarchyPanel/HierarchyPanel.module.css` (use `--color-error` token)
- [ ] T067 [US6] Add `.dragging` semi-transparent style to `src/components/HierarchyPanel/HierarchyPanel.module.css`

### UI Integration for US6

- [ ] T068 [US6] Apply dynamic class names based on drag state in `src/components/HierarchyPanel/TreeNode.tsx`
- [ ] T069 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(018): add visual feedback during hierarchy drag"

**Checkpoint**: User Story 6 complete - visual feedback appears during drag

---

## Phase 9: Multi-Selection Support (Cross-Cutting)

**Purpose**: Extend drag operations to support multiple selected views

**Requirements**: FR-026, FR-027

- [ ] T070 Write tests for multi-view reparent in `src/domain/hierarchy/__tests__/reparent.spec.ts`
- [ ] T071 Write tests for multi-view reorder in `src/domain/hierarchy/__tests__/reorder.spec.ts`
- [ ] T072 Extend `useHierarchyDrag` to handle multiple selected views in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T073 Update reparent flow to move all selected views in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T074 Update reorder flow to maintain relative order of selected views in `src/hooks/hierarchy/useHierarchyDrag.ts`
- [ ] T075 **Commit**: Stage and commit multi-selection changes with message "feat(018): support multi-view drag operations"

---

## Phase 10: Polish & Documentation

**Purpose**: Final touches and documentation updates

- [ ] T076 Update `src/domain/hierarchy/index.ts` barrel with all exports
- [ ] T077 Update CLAUDE.md with new hierarchy utilities and patterns
- [ ] T078 Run quickstart.md validation scenarios
- [ ] T079 **Commit**: Stage and commit polish changes with message "docs(018): update documentation with hierarchy utilities"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings  
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] TFINAL-4 **Update Compliance Table**: Fill in spec.md compliance table with evidence for all FR/SC requirements

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Phase 2 completion
- **Multi-Selection (Phase 9)**: Depends on Phases 3-5 (reparent, reorder, undo/redo)
- **Polish (Phase 10)**: Depends on all user stories complete
- **Quality Gates (Final-1)**: Depends on Phase 10
- **Git Verification (Final)**: Depends on Quality Gates

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Reparent) | Phase 2 | Phase 2 complete |
| US2 (Reorder) | Phase 2 | Phase 2 complete |
| US3 (Undo/Redo) | US1, US2 | US1 and US2 complete |
| US4 (Group) | Phase 2 | Phase 2 complete |
| US5 (Ungroup) | US4 | US4 complete |
| US6 (Visual Feedback) | US1, US2 | US1 and US2 complete |

### Parallel Opportunities

**Within Phase 2** (different mutations):
- T005-T006 (reparentView) can run parallel to T007-T008 (reorderView)
- T009-T010 (createGroupContainer) can run parallel to T011-T012 (ungroupContainer)

**Within User Story 1** (different test files):
- T015, T016, T017, T018 can all run in parallel

**Across User Stories** (after Phase 2):
- US1 and US2 can run in parallel
- US4 can run parallel to US1/US2/US3

---

## Parallel Example: User Story 1

```bash
# Launch all tests in parallel:
T015: "Write tests for isDescendantOf()"
T016: "Write tests for validateReparent()"
T017: "Write tests for calculateNewOrigin()"
T018: "Write tests for createReparentOperation()"

# Then implement sequentially (tests must fail first)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (store mutations)
3. Complete Phase 3: US1 - Reparent
4. Complete Phase 4: US2 - Reorder
5. Complete Phase 5: US3 - Undo/Redo
6. **STOP and VALIDATE**: Test drag-drop operations independently
7. MVP is functional with reparent, reorder, undo/redo

### Full Feature

1. Add Phase 6: US4 - Group (Ctrl+G)
2. Add Phase 7: US5 - Ungroup (Ctrl+Shift+G)
3. Add Phase 8: US6 - Visual Feedback
4. Add Phase 9: Multi-Selection Support
5. Complete Polish and Quality Gates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Tests MUST fail before implementation (TDD)
- **Commit after each phase** - maintains clean history
- US1+US2+US3 = MVP (core drag-drop with undo/redo)
- US4+US5 = Group/Ungroup extensions
- US6 = Visual polish
