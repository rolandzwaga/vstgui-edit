# Implementation Plan: Schema-Driven Property Panel

**Branch**: `022-schema-driven-properties` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-schema-driven-properties/spec.md`

## Summary

Generate the property panel from the JSON schema based on view class, showing ALL valid attributes (not just instance values). This fixes the bug where properties disappear when referenced resources are deleted, and enables setting properties on new/incomplete views.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode
**Primary Dependencies**: SolidJS 1.9.x, Vite 7.x, existing JSON schema (`vstgui-uidesc.schema.json`)
**Storage**: N/A (in-memory document model)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (modern browsers)
**Project Type**: Single SolidJS web application
**Performance Goals**: Schema attribute resolution < 50ms per view class
**Constraints**: Must not break existing property panel functionality, maintain 60fps interactions
**Scale/Scope**: ~34 view classes in schema, ~15-40 attributes per class

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All new code will have tests first |
| II. Technology Stack | ✅ PASS | SolidJS only, no React patterns |
| III. Security & Compliance | ✅ PASS | No sensitive data involved |
| IV. Code Quality | ✅ PASS | Will run biome, stylelint, tsc |
| V. GUI Editor Domain | ✅ PASS | Improves visual fidelity of property editing |
| VI. Testing Standards | ✅ PASS | Unit tests for schema parsing, integration for panel |
| XI. Dependency Management | ✅ PASS | No new dependencies required |
| XII. Framework Restrictions | ✅ PASS | SolidJS primitives only |
| XV. Styling Architecture | ✅ PASS | CSS Modules for new components |
| XIX. Domain Knowledge | ✅ PASS | Uses existing vstgui-uidesc.schema.json |
| XX. Technical Overview | ✅ PASS | Will consult CLAUDE.md |
| XXI. Static Imports | ✅ PASS | All imports will be static |
| XXIII. Quality Gates | ✅ PASS | Will run lint:css, check, typecheck |

## Project Structure

### Documentation (this feature)

```text
specs/022-schema-driven-properties/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── properties/
│       ├── schemaAttributes.ts      # NEW: Schema parsing and attribute resolution
│       ├── attributeTypes.ts        # NEW: Schema-to-editor type mapping
│       ├── mergeSelections.ts       # MODIFY: Use schema for attribute list
│       ├── groupAttributes.ts       # MODIFY: Expand attribute grouping
│       └── __tests__/
│           ├── schemaAttributes.spec.ts  # NEW
│           ├── attributeTypes.spec.ts    # NEW
│           └── mergeSelections.spec.ts   # EXISTING (update)
├── types/
│   └── properties.ts                # MODIFY: Add new AttributeEntry fields
├── components/
│   └── PropertiesPanel/
│       ├── PropertiesPanel.tsx      # MODIFY: Handle unset attributes
│       ├── AttributeRow.tsx         # MODIFY: Visual distinction for unset
│       └── PropertiesPanel.module.css  # MODIFY: Unset styling
└── stores/
    └── documentStore.ts             # MODIFY: Handle attribute addition

vstgui-uidesc.schema.json            # EXISTING: Source of attribute definitions
```

**Structure Decision**: Single project structure. New files added to existing `src/domain/properties/` module. Schema parsing logic co-located with existing property handling code.

## Complexity Tracking

> No constitutional violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
