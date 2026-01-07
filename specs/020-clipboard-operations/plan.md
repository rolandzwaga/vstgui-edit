# Implementation Plan: Clipboard Operations

**Branch**: `020-clipboard-operations` | **Date**: 2026-01-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-clipboard-operations/spec.md`

## Summary

Implement clipboard operations (copy, cut, paste, duplicate) for selected views with full undo/redo support. Views are serialized to an internal clipboard store and can be pasted with incremental offsets.

**DISCOVERY**: The core clipboard functionality is **already implemented** in the codebase from a previous feature (017-view-creation). This plan focuses on verification, testing, and completing any gaps.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed)
**Storage**: N/A (in-memory clipboard via SolidJS signals)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (SPA)
**Project Type**: Single SolidJS web application
**Performance Goals**: All clipboard operations complete instantly (< 100ms)
**Constraints**: Internal clipboard only (no system clipboard integration)
**Scale/Scope**: Typical uidesc files with 50-200 views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS Only (No React) | ✅ PASS | Using createSignal for clipboard state |
| Test-First Development | ✅ PASS | Will write tests before any new implementation |
| Static Imports Only | ✅ PASS | No dynamic imports required |
| No Unauthorized Dependencies | ✅ PASS | No new dependencies needed |

## Project Structure

### Documentation (this feature)

```text
specs/020-clipboard-operations/
├── plan.md              # This file
├── research.md          # Phase 0 output - existing implementation analysis
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

**EXISTING IMPLEMENTATION** (already in codebase):

```text
src/
├── domain/
│   ├── canvas/
│   │   └── viewOperations.ts      # copySelectedViews, cutSelectedViews, pasteViews, duplicateSelectedViews
│   └── views/
│       ├── serialization.ts        # serializeView, deserializeView, applyOffsetToSerialized
│       └── index.ts                # barrel export
├── hooks/
│   └── canvas/
│       └── useCanvasKeyboard.ts    # Ctrl+C/X/V/D handlers (lines 94-132)
├── stores/
│   └── clipboardStore.ts           # clipboardStore, copyToClipboard, getClipboardContent
└── types/
    └── views.ts                    # SerializedView, ClipboardData interfaces
```

**TO VERIFY/ADD**:
```text
src/
├── domain/
│   └── canvas/
│       └── __tests__/
│           └── viewOperations.spec.ts  # Clipboard operation tests (may need expansion)
├── hooks/
│   └── canvas/
│       └── __tests__/
│           └── useCanvasKeyboard.spec.ts  # Keyboard shortcut tests (verify clipboard)
└── stores/
    └── __tests__/
        └── clipboardStore.spec.ts   # Store tests
```

**Structure Decision**: Single SolidJS web application with domain logic in `/domain/`, UI hooks in `/hooks/`, and state in `/stores/`. All clipboard infrastructure exists.

## Complexity Tracking

> No violations requiring justification. Feature uses existing patterns.

## Existing Implementation Analysis

### Already Implemented (from 017-view-creation)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| FR-001: Copy to clipboard (Ctrl+C) | `useCanvasKeyboard.ts:108-112` | ✅ Implemented |
| FR-002: Copy children recursively | `serialization.ts:serializeView` | ✅ Implemented |
| FR-003: Paste with unique IDs (Ctrl+V) | `viewOperations.ts:pasteViews` | ✅ Implemented |
| FR-004: Offset pasted views | `PASTE_OFFSET = 10` in viewOperations.ts | ✅ Implemented |
| FR-005: Preserve relative positions | `collectOriginsFromSerialized` | ✅ Implemented |
| FR-006: Cut (Ctrl+X) | `useCanvasKeyboard.ts:114-122` | ✅ Implemented |
| FR-007: Undo cut | History operation created | ✅ Implemented |
| FR-008: Undo paste | `createPasteOperation` | ✅ Implemented |
| FR-009: Duplicate (Ctrl+D) | `useCanvasKeyboard.ts:94-106` | ✅ Implemented |
| FR-012: Prevent empty selection ops | Guard checks in all operations | ✅ Implemented |
| FR-013: Prevent cutting root | `removeView` returns null for root | ✅ Implemented |
| FR-014: Select pasted views | `selectAll(pastedIds)` | ✅ Implemented |
| FR-015: Preserve attributes | `cloneViewNode` deep copies | ✅ Implemented |

### Needs Verification/Implementation

| Requirement | Gap | Action Needed |
|-------------|-----|---------------|
| FR-010: Paste into selected container | Not clearly implemented | Verify behavior or implement |
| FR-011: Paste as siblings when no container | Current behavior unclear | Verify and test |
| SC-003: All operations instant | Not tested | Add performance verification |
| SC-004: 100% undo reversibility | Redo operations may be incomplete | Verify redo handlers |

### Test Coverage Gaps

The existing implementation likely has tests, but need to verify:
1. Full copy/paste cycle with undo/redo
2. Cut operation with undo
3. Duplicate with undo
4. Multi-view operations
5. Container with children operations
6. Edge cases (empty clipboard, root protection)

## Implementation Tasks

### Phase 1: Verification & Gap Analysis

1. **Review existing tests** for clipboardStore, viewOperations, useCanvasKeyboard
2. **Identify missing test coverage** against FR-xxx requirements
3. **Test paste-into-container behavior** (FR-010/FR-011)
4. **Verify redo operations** work correctly

### Phase 2: Fill Implementation Gaps (if any)

Based on verification, implement any missing functionality:
- Paste-into-container logic
- Redo handler fixes
- Edge case handling

### Phase 3: Complete Test Coverage

Write tests for any untested requirements:
- Each FR-xxx requirement must have a test
- Each SC-xxx must be verifiable

### Phase 4: Quality Gates

1. Run `npm run lint:css` - MUST pass
2. Run `npm run check` - MUST pass  
3. Run `npm run typecheck` - MUST pass
4. Update spec.md compliance table

## Next Steps

1. Run `/speckit.tasks` to generate detailed task list
2. Execute verification phase
3. Complete any implementation gaps
4. Finalize test coverage
