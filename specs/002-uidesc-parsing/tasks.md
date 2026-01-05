# Tasks: Uidesc Parsing and Validation

**Input**: Design documents from `/specs/002-uidesc-parsing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: REQUIRED per project constitution (Test-First Development is NON-NEGOTIABLE)

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Paths follow plan.md structure: `src/domain/parser/`, `src/types/`, `src/stores/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, type generation, foundational types

- [ ] T001 Generate TypeScript types from JSON schema via `npm run generate:types` to create src/types/uidesc.d.ts
- [ ] T002 [P] Create parser types in src/types/parser.ts (FormatType, ParseResult, ValidationError, ParseState)
- [ ] T003 [P] Extend DocumentStoreState in src/types/index.ts with document, parseState, parseErrors, detectedFormat
- [ ] T004 Create parser module structure with src/domain/parser/index.ts barrel export

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Write test for format detector in src/domain/parser/__tests__/formatDetector.spec.ts
- [ ] T006 Implement format detector in src/domain/parser/formatDetector.ts (FR-001, FR-002)
- [ ] T007 Write test for AJV validator setup in src/domain/parser/__tests__/validator.spec.ts
- [ ] T008 Implement AJV validator in src/domain/parser/validator.ts with allErrors, strict mode (FR-004, FR-008a)

**Checkpoint**: Foundation ready - format detection and validator infrastructure complete

---

## Phase 3: User Story 1 - Parse and Validate JSON Uidesc File (P1)

**Goal**: Upload JSON uidesc file → auto-detect as JSON → validate against schema → produce typed document model

**Independent Test**: Upload valid JSON uidesc file, verify document store contains parsed structure with views, colors, fonts, bitmaps

### Tests for User Story 1

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write unit tests for JSON parser in src/domain/parser/__tests__/jsonParser.spec.ts
- [ ] T010 [P] [US1] Write integration test for JSON parsing flow in src/domain/parser/__tests__/parseUidesc.spec.ts

### Implementation for User Story 1

- [ ] T011 [US1] Implement JSON parser in src/domain/parser/jsonParser.ts (FR-005, FR-006, FR-007, FR-008)
- [ ] T012 [US1] Create parseUidesc function in src/domain/parser/index.ts for JSON path
- [ ] T013 [US1] Write test for store integration in src/stores/__tests__/documentStore.parsing.spec.ts
- [ ] T014 [US1] Extend documentStore.ts with parseState machine and auto-parse on upload success (FR-000)
- [ ] T015 [US1] Export public API from src/domain/parser/index.ts (parseUidesc, detectFormat)

**Checkpoint**: JSON parsing functional - can upload JSON uidesc, validate, and access parsed document

---

## Phase 4: User Story 2 - Parse and Validate XML Uidesc File (P1)

**Goal**: Upload XML uidesc file → auto-detect as XML → parse with DOMParser → convert to JSON → validate → produce typed document model

**Independent Test**: Upload valid XML uidesc file, verify document store contains same structure as equivalent JSON file

### Tests for User Story 2

- [ ] T016 [P] [US2] Write unit tests for XML parser in src/domain/parser/__tests__/xmlParser.spec.ts
- [ ] T017 [P] [US2] Write unit tests for XML-to-JSON converter in src/domain/parser/__tests__/xmlToJson.spec.ts
- [ ] T018 [P] [US2] Write integration test for XML parsing flow in src/domain/parser/__tests__/parseUidesc.spec.ts (extend)

### Implementation for User Story 2

- [ ] T019 [US2] Implement XML parser in src/domain/parser/xmlParser.ts using DOMParser (FR-009)
- [ ] T020 [US2] Implement XML-to-JSON converter in src/domain/parser/xmlToJson.ts with path mapping (FR-010, FR-012)
- [ ] T021 [US2] Extend parseUidesc function to handle XML format (FR-011, FR-013)
- [ ] T022 [US2] Add XML path mapping to ValidationError for XML-sourced errors

**Checkpoint**: XML parsing functional - can upload XML uidesc, convert to JSON, validate, and access parsed document

---

## Phase 5: User Story 3 - Handle Invalid or Malformed Files (P2)

**Goal**: Clear, actionable error messages for malformed JSON/XML, schema violations, and unknown formats

**Independent Test**: Upload malformed files, verify appropriate error messages with location information

### Tests for User Story 3

- [ ] T023 [P] [US3] Write tests for malformed JSON handling in src/domain/parser/__tests__/jsonParser.spec.ts (extend)
- [ ] T024 [P] [US3] Write tests for malformed XML handling in src/domain/parser/__tests__/xmlParser.spec.ts (extend)
- [ ] T025 [P] [US3] Write tests for unknown format handling in src/domain/parser/__tests__/formatDetector.spec.ts (extend)

### Implementation for User Story 3

- [ ] T026 [US3] Enhance JSON parser with detailed syntax error extraction (line/column)
- [ ] T027 [US3] Enhance XML parser with parsererror extraction and location info
- [ ] T028 [US3] Add format detection error path with clear error message (FR-003)
- [ ] T029 [US3] Ensure all ValidationError objects have actionable location info (SC-003)

**Checkpoint**: Error handling complete - all malformed input produces clear, actionable errors

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality checks, documentation, edge cases, performance validation

- [ ] T030 Handle edge cases: leading whitespace, BOM characters in src/domain/parser/formatDetector.ts
- [ ] T031 [P] Write performance test for parsing 1MB file in src/domain/parser/__tests__/parseUidesc.perf.spec.ts (SC-005)
- [ ] T032 Run `npm run typecheck` and fix any TypeScript errors
- [ ] T033 Run `npm run lint` and fix any linting issues
- [ ] T034 Run `npm test` and verify all tests pass
- [ ] T035 Update CLAUDE.md with new parser utilities and patterns
- [ ] T036 Update requirements checklist in specs/002-uidesc-parsing/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - can start after T008
- **User Story 2 (Phase 4)**: Depends on Foundational - can start after T008 (parallel with US1 if desired)
- **User Story 3 (Phase 5)**: Depends on US1 and US2 - extends error handling
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational - core JSON parsing
- **User Story 2 (P1)**: Can run parallel with US1, but US1 establishes patterns
- **User Story 3 (P2)**: Extends error handling in US1 and US2 implementations

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Core parsing logic before store integration
3. Unit tests before integration tests
4. Verify tests pass after implementation

### Parallel Opportunities

**Phase 1**:
- T002, T003 can run in parallel (different files)

**Phase 3 (US1)**:
- T009, T010 can run in parallel (different test files)

**Phase 4 (US2)**:
- T016, T017, T018 can run in parallel (different test files)

**Phase 5 (US3)**:
- T023, T024, T025 can run in parallel (different test files)

---

## Parallel Example: User Story 2 Tests

```bash
# Launch all tests for User Story 2 together:
Task: "Write unit tests for XML parser in src/domain/parser/__tests__/xmlParser.spec.ts"
Task: "Write unit tests for XML-to-JSON converter in src/domain/parser/__tests__/xmlToJson.spec.ts"
Task: "Write integration test for XML parsing flow in src/domain/parser/__tests__/parseUidesc.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 (T009-T015)
4. **STOP and VALIDATE**: Upload JSON uidesc file, verify parsing works
5. Deploy/demo JSON parsing capability

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → JSON parsing works → First deliverable!
3. Add User Story 2 → XML parsing works → Full format support!
4. Add User Story 3 → Error handling polish → Production ready!
5. Polish → Quality and documentation complete

### Recommended Order (Single Developer)

1. T001 → T002 → T003 → T004 (Setup)
2. T005 → T006 → T007 → T008 (Foundational)
3. T009 → T010 → T011 → T012 → T013 → T014 → T015 (US1)
4. T016 → T017 → T018 → T019 → T020 → T021 → T022 (US2)
5. T023 → T024 → T025 → T026 → T027 → T028 → T029 (US3)
6. T030 → T031 → T032 → T033 → T034 → T035 → T036 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [US1/US2/US3] labels map tasks to user stories for traceability
- Constitution requires Test-First Development - write failing tests before implementation
- Each user story checkpoint validates independent functionality
- Run quality checks (typecheck, lint, test) frequently
- Commit after each task or logical group
