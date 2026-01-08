# Tasks: Template Management

**Input**: Design documents from `/specs/028-template-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and basic structure needed for template management

- [x] T001 Create template store file skeleton in src/stores/templateStore.ts
- [x] T002 [P] Create templates domain directory structure: src/domain/templates/
- [x] T003 [P] Create TemplatesPanel component directory: src/components/TemplatesPanel/
- [x] T004 [P] Extend history types in src/types/history.ts with template operation types
- [ ] T005 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Template Store

- [ ] T006 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T007 Write tests for templateStore in src/stores/__tests__/templateStore.spec.ts
- [ ] T008 Implement templateStore (activeTemplateId signal, setActiveTemplate, resetTemplateStore) in src/stores/templateStore.ts

### Template Validation Domain

- [ ] T009 [P] Write tests for template name validation in src/domain/templates/__tests__/validation.spec.ts
- [ ] T010 [P] Implement isValidTemplateName, generateUniqueTemplateName, generateDuplicateName in src/domain/templates/validation.ts

### DocumentStore Template Read Operations

- [ ] T011 Write tests for getTemplates, getTemplate, getTemplateNames in src/stores/__tests__/documentStore.templates.spec.ts
- [ ] T012 Implement getTemplates, getTemplate, getTemplateNames in src/stores/documentStore.ts

### Barrel Export

- [ ] T013 Create barrel export in src/domain/templates/index.ts

- [ ] T014 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View and Switch Templates (Priority: P1) 🎯 MVP

**Goal**: Display template list showing all templates, allow switching between templates, canvas updates to show selected template

**Independent Test**: Load multi-template uidesc file, verify list shows all templates, click template to switch, verify canvas updates

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-012, FR-013

### Tests for User Story 1

- [ ] T015 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T016 [P] [US1] Write tests for useCanvasData active template integration in src/hooks/canvas/__tests__/useCanvasData.spec.ts
- [ ] T017 [P] [US1] Write tests for TemplatesPanel display in src/components/TemplatesPanel/__tests__/TemplatesPanel.spec.tsx
- [ ] T018 [P] [US1] Write tests for TemplateItem component in src/components/TemplatesPanel/__tests__/TemplateItem.spec.tsx

### Implementation for User Story 1

- [ ] T019 [US1] Modify useCanvasData.ts to use templateStore.activeTemplateId instead of hardcoded first template in src/hooks/canvas/useCanvasData.ts
- [ ] T020 [US1] Add auto-select first template on document load (integrate with documentStore.loadFile) in src/stores/templateStore.ts
- [ ] T021 [US1] Clear selection when switching templates (call clearSelection in setActiveTemplate) in src/stores/templateStore.ts
- [ ] T022 [P] [US1] Create EmptyState component in src/components/TemplatesPanel/EmptyState.tsx
- [ ] T023 [P] [US1] Create TemplateItem component (name display, active highlight, click handler) in src/components/TemplatesPanel/TemplateItem.tsx
- [ ] T024 [P] [US1] Create TemplateItem styles in src/components/TemplatesPanel/TemplateItem.module.css
- [ ] T025 [US1] Create TemplatesPanel component (CollapsibleSection, For loop over templates) in src/components/TemplatesPanel/TemplatesPanel.tsx
- [ ] T026 [US1] Create TemplatesPanel styles in src/components/TemplatesPanel/TemplatesPanel.module.css
- [ ] T027 [US1] Add TemplatesPanel to App.tsx sidebar (above HierarchyPanel) in src/App.tsx

- [ ] T028 [US1] **Commit**: Stage and commit User Story 1 changes

**Checkpoint**: Template list displays, switching works, canvas updates - MVP complete

---

## Phase 4: User Story 2 - Rename Template (Priority: P2)

**Goal**: Allow users to rename templates via double-click inline editing with validation

**Independent Test**: Double-click template name, edit, press Enter - name updates in list and document

**Requirements**: FR-006, FR-011, FR-015

### Tests for User Story 2

- [ ] T029 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T030 [P] [US2] Write tests for renameTemplate in src/stores/__tests__/documentStore.templates.spec.ts
- [ ] T031 [P] [US2] Write tests for rename history operation in src/domain/templates/__tests__/historyOperations.spec.ts
- [ ] T032 [P] [US2] Write tests for TemplateItem inline editing in src/components/TemplatesPanel/__tests__/TemplateItem.spec.tsx

### Implementation for User Story 2

- [ ] T033 [US2] Implement renameTemplate in src/stores/documentStore.ts (validate name, check duplicates, update document)
- [ ] T034 [US2] Implement createRenameTemplateOperation in src/domain/templates/historyOperations.ts
- [ ] T035 [US2] Add inline editing to TemplateItem (double-click, input field, Enter/Escape handling) in src/components/TemplatesPanel/TemplateItem.tsx
- [ ] T036 [US2] Add validation feedback (error state for invalid/duplicate names) in src/components/TemplatesPanel/TemplateItem.tsx
- [ ] T037 [US2] Update activeTemplateId if renamed template was active in src/stores/templateStore.ts

- [ ] T038 [US2] **Commit**: Stage and commit User Story 2 changes

**Checkpoint**: Template renaming works with validation and undo/redo support

---

## Phase 5: User Story 3 - Create New Template (Priority: P2)

**Goal**: Allow users to create new templates with default root CViewContainer

**Independent Test**: Click Add button, enter name, verify new template in list with default size

**Requirements**: FR-007, FR-011, FR-014

### Tests for User Story 3

- [ ] T039 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T040 [P] [US3] Write tests for addTemplate in src/stores/__tests__/documentStore.templates.spec.ts
- [ ] T041 [P] [US3] Write tests for add history operation in src/domain/templates/__tests__/historyOperations.spec.ts
- [ ] T042 [P] [US3] Write tests for AddTemplateButton in src/components/TemplatesPanel/__tests__/AddTemplateButton.spec.tsx

### Implementation for User Story 3

- [ ] T043 [US3] Implement addTemplate in src/stores/documentStore.ts (create default CViewContainer, size 400x300)
- [ ] T044 [US3] Implement createAddTemplateOperation in src/domain/templates/historyOperations.ts
- [ ] T045 [US3] Create AddTemplateButton component in src/components/TemplatesPanel/AddTemplateButton.tsx
- [ ] T046 [US3] Add AddTemplateButton to TemplatesPanel header in src/components/TemplatesPanel/TemplatesPanel.tsx
- [ ] T047 [US3] Auto-switch to newly created template in src/components/TemplatesPanel/TemplatesPanel.tsx

- [ ] T048 [US3] **Commit**: Stage and commit User Story 3 changes

**Checkpoint**: Template creation works with default settings and undo support

---

## Phase 6: User Story 4 - Duplicate Template (Priority: P2)

**Goal**: Allow users to duplicate existing templates with deep copy and unique name

**Independent Test**: Select template, click duplicate, verify copy appears with "Name Copy" naming

**Requirements**: FR-008, FR-011, FR-014

### Tests for User Story 4

- [ ] T049 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T050 [P] [US4] Write tests for duplicateTemplate (deep copy) in src/stores/__tests__/documentStore.templates.spec.ts
- [ ] T051 [P] [US4] Write tests for duplicate history operation in src/domain/templates/__tests__/historyOperations.spec.ts

### Implementation for User Story 4

- [ ] T052 [US4] Implement duplicateTemplate in src/stores/documentStore.ts (deep copy structure, unique name)
- [ ] T053 [US4] Implement createDuplicateTemplateOperation in src/domain/templates/historyOperations.ts
- [ ] T054 [US4] Add duplicate button to TemplateItem in src/components/TemplatesPanel/TemplateItem.tsx
- [ ] T055 [US4] Wire up duplicate handler in TemplatesPanel in src/components/TemplatesPanel/TemplatesPanel.tsx

- [ ] T056 [US4] **Commit**: Stage and commit User Story 4 changes

**Checkpoint**: Template duplication works with deep copy and unique naming

---

## Phase 7: User Story 5 - Delete Template (Priority: P3)

**Goal**: Allow users to delete templates with confirmation dialog, prevent deleting last template

**Independent Test**: Select template, click delete, confirm, verify removal. Try to delete last - should be prevented.

**Requirements**: FR-009, FR-011

### Tests for User Story 5

- [ ] T057 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T058 [P] [US5] Write tests for deleteTemplate (including last-template prevention) in src/stores/__tests__/documentStore.templates.spec.ts
- [ ] T059 [P] [US5] Write tests for delete history operation in src/domain/templates/__tests__/historyOperations.spec.ts
- [ ] T060 [P] [US5] Write tests for delete confirmation dialog in src/components/TemplatesPanel/__tests__/TemplatesPanel.spec.tsx

### Implementation for User Story 5

- [ ] T061 [US5] Implement deleteTemplate in src/stores/documentStore.ts (prevent last, return deleted for undo)
- [ ] T062 [US5] Implement createDeleteTemplateOperation in src/domain/templates/historyOperations.ts
- [ ] T063 [US5] Add delete button to TemplateItem in src/components/TemplatesPanel/TemplateItem.tsx
- [ ] T064 [US5] Add confirmation dialog to TemplatesPanel in src/components/TemplatesPanel/TemplatesPanel.tsx
- [ ] T065 [US5] Handle active template deletion (switch to first remaining) in src/stores/templateStore.ts

- [ ] T066 [US5] **Commit**: Stage and commit User Story 5 changes

**Checkpoint**: Template deletion works with confirmation and undo support

---

## Phase 8: User Story 6 - Edit Template Properties (Priority: P3)

**Goal**: Allow editing template size via existing properties panel (root view selection)

**Independent Test**: Select template root, modify size in properties panel, verify canvas bounds update

**Requirements**: FR-010, FR-011

### Implementation for User Story 6

- [ ] T067 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T068 [US6] Write tests verifying template root size changes update canvas bounds in src/hooks/canvas/__tests__/useCanvasData.spec.ts
- [ ] T069 [US6] Verify existing PropertiesPanel can edit template root size attribute in src/components/PropertiesPanel/ (expected: already works via updateViewAttribute - this is verification only, no new code needed)
- [ ] T070 [US6] Add size display to TemplateItem (optional enhancement) in src/components/TemplatesPanel/TemplateItem.tsx

- [ ] T071 [US6] **Commit**: Stage and commit User Story 6 changes

**Checkpoint**: Template properties editable via existing properties panel

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, documentation, performance verification, and final touches

- [ ] T072 [P] Update CLAUDE.md with templateStore and templates domain utilities
- [ ] T073 [P] Add aria-labels and keyboard navigation to TemplatesPanel
- [ ] T074 Verify scrollable template list with 50+ templates (edge case for SC-003)
- [ ] T075 [P] Manual performance verification: template switch <1s (SC-001), CRUD operations <500ms (SC-002)
- [ ] T076 [P] Write explicit data integrity test: switch templates and verify no data loss (SC-005) in src/stores/__tests__/templateStore.spec.ts
- [ ] T077 Run all tests and verify passing: npm test
- [ ] T078 **Commit**: Stage and commit Polish phase changes

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**NO EXCEPTIONS**: The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP
- **User Stories 2-6 (Phases 4-8)**: Depend on Foundational, can run in parallel after US1
- **Polish (Phase 9)**: Depends on all user stories
- **Quality Gates (Final-1)**: Depends on Polish
- **Git Verification (Final)**: Depends on Quality Gates

### User Story Dependencies

| Story | Dependencies | Notes |
|-------|--------------|-------|
| US1 (View/Switch) | Foundational only | MVP - must complete first |
| US2 (Rename) | Foundational only | Can parallel with US3-6 after US1 |
| US3 (Create) | Foundational only | Can parallel with US2,4-6 |
| US4 (Duplicate) | Foundational only | Can parallel with US2-3,5-6 |
| US5 (Delete) | Foundational only | Can parallel with US2-4,6 |
| US6 (Properties) | Foundational only | Can parallel with US2-5 |

### Parallel Opportunities per Phase

**Phase 2 (Foundational)**:
```
T009 (validation tests) || T010 (validation impl)
T006-T008 (templateStore) sequential
T011-T012 (documentStore reads) sequential
```

**Phase 3 (US1 - View/Switch)**:
```
T016 || T017 || T018 (all tests in parallel)
T022 || T023 || T024 (EmptyState, TemplateItem, styles in parallel)
```

**Phases 4-8 (US2-6)**: Entire user stories can run in parallel if team capacity allows

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (View/Switch)
4. **VALIDATE**: Test template list and switching
5. Deploy/demo - users can now work with multi-template files

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 | View all templates, switch between them |
| +Rename | US1+US2 | Organize templates with meaningful names |
| +Create | US1-3 | Build new templates from scratch |
| +Duplicate | US1-4 | Create variations quickly |
| +Delete | US1-5 | Clean up unused templates |
| +Properties | US1-6 | Configure template dimensions |

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 78 |
| Setup Tasks | 5 |
| Foundational Tasks | 9 |
| US1 Tasks | 14 |
| US2 Tasks | 10 |
| US3 Tasks | 10 |
| US4 Tasks | 8 |
| US5 Tasks | 10 |
| US6 Tasks | 5 |
| Polish Tasks | 7 |
| Quality Gate Tasks | 4 |
| Git Verification Tasks | 3 |

**Parallel Opportunities**: 27+ tasks marked [P] can run in parallel within their phases
