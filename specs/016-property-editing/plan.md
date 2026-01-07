# Implementation Plan: Property Editing

**Branch**: `016-property-editing` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-property-editing/spec.md`

## Summary

Enable editing of view attributes through the properties panel with type-appropriate input controls (text, number, boolean, enum, point, color/font/bitmap pickers), live preview of changes on canvas, validation feedback for invalid inputs, multi-selection editing support, and full undo/redo integration via existing historyStore.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store, @floating-ui/dom 1.7.4 (for picker dropdowns)
**Storage**: In-memory SolidJS store (extends existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern evergreen browsers)
**Project Type**: Single SPA (SolidJS frontend)
**Performance Goals**: <100ms for property change to canvas update, <50ms for validation feedback
**Constraints**: No new dependencies required; reuse existing stores and patterns
**Scale/Scope**: Supports editing 100+ views simultaneously without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All components will have tests written before implementation |
| II. Technology Stack | ✅ PASS | Using SolidJS signals/stores, no React |
| III. Security & Compliance | ✅ PASS | Input validation for all user inputs |
| IV. Code Quality | ✅ PASS | Will run biome/stylelint/tsc checks |
| V. GUI Editor Domain | ✅ PASS | Undo/redo required (FR-013), real-time feedback (FR-009) |
| VI. Testing Standards | ✅ PASS | Unit tests for editors, integration for panel |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React hooks |
| XV. Styling Architecture | ✅ PASS | CSS Modules for editor components |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass before completion |
| XIX. Domain Knowledge | ✅ PASS | UIDESC_GUIDE.md consulted for attribute types |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted for existing patterns |
| XXI. Static Imports Only | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | All FR/SC requirements will be verified |

**Gate Result**: ✅ PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/016-property-editing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── PropertiesPanel/           # Existing from 011-properties-panel
│   │   ├── PropertiesPanel.tsx
│   │   ├── PropertiesPanel.module.css
│   │   ├── AttributeGroup.tsx
│   │   ├── AttributeRow.tsx       # Will be extended for editing
│   │   └── __tests__/
│   └── editors/                   # NEW: Type-specific attribute editors
│       ├── TextEditor.tsx
│       ├── NumberEditor.tsx
│       ├── BooleanEditor.tsx
│       ├── PointEditor.tsx
│       ├── EnumEditor.tsx
│       ├── ColorPicker.tsx
│       ├── FontPicker.tsx
│       ├── BitmapPicker.tsx
│       └── __tests__/
├── domain/
│   └── properties/
│       ├── attributeTypes.ts      # NEW: Attribute type classification
│       ├── validation.ts          # NEW: Input validation logic
│       └── __tests__/
├── stores/
│   ├── documentStore.ts           # Existing - will add updateViewAttribute()
│   ├── historyStore.ts            # Existing - used for undo/redo
│   └── propertiesStore.ts         # Existing - group expand/collapse state
└── types/
    └── editors.ts                 # NEW: Editor component types
```

**Structure Decision**: Extends existing single-project structure. New editor components in `src/components/editors/`, domain utilities in `src/domain/properties/`. Reuses existing stores (documentStore, historyStore, selectionStore, propertiesStore).

## Complexity Tracking

> No violations to justify. All gates pass.
