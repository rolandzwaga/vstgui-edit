# Implementation Plan: JSON Save Format Option

**Branch**: `030-json-save-format` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/030-json-save-format/spec.md`

## Summary

Add a split button dropdown to the existing Save button allowing users to choose between JSON and XML save formats. The button displays the current format, remembers the last selection via localStorage, and shows a confirmation dialog when switching from the original file format. Implementation extends the existing SaveButton component with @floating-ui/dom for dropdown positioning and a modal dialog pattern for format change confirmation.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, @floating-ui/dom 1.7.4 (already installed)
**Storage**: localStorage for format preference persistence
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SolidJS application
**Performance Goals**: Dropdown opens within 50ms, no visible lag on format switch
**Constraints**: Must maintain backward compatibility with existing Ctrl+S behavior
**Scale/Scope**: Single component enhancement with supporting utilities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All new code requires tests before implementation |
| II. Technology Stack | PASS | Uses SolidJS, TypeScript, existing @floating-ui/dom |
| III. Security & Compliance | PASS | localStorage for preferences only (no sensitive data) |
| IV. Code Quality | PASS | Will follow Biome, Stylelint, TypeScript checks |
| V. GUI Editor Domain | PASS | Immediate feedback, accessible controls |
| VI. Testing Standards | PASS | Component tests, unit tests, 80%+ coverage |
| XI. Dependency Management | PASS | No new dependencies required |
| XII. SolidJS Only | PASS | Using createSignal, createEffect, createMemo |
| XV. Styling Architecture | PASS | CSS Modules with design tokens |
| XIX. Domain Knowledge | PASS | Extends existing serializer infrastructure |
| XXI. Static Imports | PASS | No dynamic imports |

## Project Structure

### Documentation (this feature)

```text
specs/030-json-save-format/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── SaveButton/
│       ├── SaveButton.tsx              # Extend to SplitSaveButton
│       ├── SaveButton.module.css       # Extend styles
│       ├── FormatChangeDialog.tsx      # NEW: Confirmation modal
│       ├── FormatChangeDialog.module.css # NEW: Dialog styles
│       └── __tests__/
│           ├── SaveButton.spec.tsx     # Extend existing tests
│           └── FormatChangeDialog.spec.tsx # NEW
├── stores/
│   └── saveFormatStore.ts              # NEW: Format preference state
│   └── __tests__/
│       └── saveFormatStore.spec.ts     # NEW
├── domain/
│   └── save/
│       ├── formatPreference.ts         # NEW: localStorage utilities
│       └── __tests__/
│           └── formatPreference.spec.ts # NEW
└── types/
    └── save.ts                         # NEW: SaveFormat type exports
```

**Structure Decision**: Single project structure. New files integrate with existing component and domain organization. SaveButton component will be enhanced in-place rather than creating a new SplitSaveButton component to maintain import compatibility.

## Complexity Tracking

No constitution violations requiring justification.

## Existing Infrastructure

### Serialization (from CLAUDE.md)

- `serializeToJson(doc, options?)` - Already produces pretty-printed JSON with 2-space indentation
- `serializeToXml(doc)` - Existing XML serialization
- `SaveFormat` type already defined in `src/domain/serializer/types.ts`

### File Service

- `downloadDocument(content, filename, format)` - Download fallback
- `saveToFileHandle(handle, content)` - File System Access API
- `showSaveFilePicker(suggestedName)` - File picker dialog
- `hasFileSystemAccess()` - Feature detection

### Document Store

- `documentStore.originalFormat` - Format of loaded file ('json' | 'xml')
- `documentStore.isDirty` - Whether document has unsaved changes
- `documentStore.fileHandle` - Current file handle (if File System Access used)
- `markClean()` - Reset dirty state after save

### UI Patterns

- Dialog pattern: `AddControlTagDialog.tsx` - Modal with backdrop, header, body, footer
- Dropdown pattern: `EnumEditor.tsx` - @floating-ui/dom positioning with keyboard navigation
- Button styles: `SaveButton.module.css` - Existing save button styling

### Design Tokens

- `--z-dropdown: 100` - Dropdown z-index
- `--z-modal: 300` - Modal z-index
- Various color, spacing, and typography tokens available

## Constitution Re-Check (Post-Design)

*GATE: Re-evaluated after Phase 1 design completion.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Test files defined in structure, TDD workflow planned |
| II. Technology Stack | PASS | SolidJS patterns used (createStore, Show, For) |
| III. Security & Compliance | PASS | localStorage stores non-sensitive format preference only |
| IV. Code Quality | PASS | CSS Modules, design tokens, TypeScript strict mode |
| V. GUI Editor Domain | PASS | Immediate visual feedback, accessible split button |
| VI. Testing Standards | PASS | Unit + component tests planned, co-located test files |
| IX. Accessibility | PASS | ARIA roles, keyboard navigation, focus management |
| XI. Dependency Management | PASS | No new dependencies, uses existing @floating-ui/dom |
| XII. SolidJS Only | PASS | No React patterns in design |
| XV. Styling Architecture | PASS | CSS Modules with design tokens |
| XXI. Static Imports | PASS | All imports are static |
| XXII. Honest Completion | PASS | All FR/SC requirements mapped to implementation |

## Implementation Order

1. **Phase 1**: Format preference utilities (`formatPreference.ts`)
2. **Phase 2**: Save format store (`saveFormatStore.ts`)
3. **Phase 3**: Format change dialog component (`FormatChangeDialog.tsx`)
4. **Phase 4**: Extend SaveButton with split button and dropdown
5. **Phase 5**: Integration testing and keyboard accessibility

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| localStorage unavailable in private browsing | Graceful fallback to defaults |
| Dropdown positioning edge cases | Using proven @floating-ui middleware |
| Breaking existing Ctrl+S behavior | Comprehensive test coverage for keyboard shortcuts |
| Focus trap complexity in modal | Reuse proven dialog pattern from AddControlTagDialog |

## References

- Existing patterns: `src/components/editors/EnumEditor.tsx` (dropdown)
- Existing patterns: `src/components/ControlTagsPanel/AddControlTagDialog.tsx` (modal)
- API docs: @floating-ui/dom positioning middleware
- Spec: `/specs/030-json-save-format/spec.md`
