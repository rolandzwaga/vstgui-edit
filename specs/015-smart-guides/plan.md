# Implementation Plan: Smart Guides

**Branch**: `015-smart-guides` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-smart-guides/spec.md`

## Summary

Implement visual alignment guides that appear during drag operations when views align with sibling edges, centers, or parent centers. Guides provide visual feedback only (no snapping) - grid snap handles positioning. Includes spacing guides for equal distribution and `S` key toggle.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (in-memory state via SolidJS signals)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SolidJS web application
**Performance Goals**: 60fps during drag operations, guide calculation <16ms per frame
**Constraints**: Guide lines must not cause frame drops; visual feedback only (no snapping)
**Scale/Scope**: Typical uidesc files have 10-100 views; guide calculation must scale linearly

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All tasks include test-first workflow |
| II. Technology Stack | ✅ PASS | SolidJS only, no new dependencies |
| III. Security & Compliance | ✅ PASS | N/A - no user data, internal feature |
| IV. Code Quality | ✅ PASS | Biome, Stylelint, tsc checks required |
| V. GUI Editor Domain | ✅ PASS | Visual feedback during editing |
| VI. Testing Standards | ✅ PASS | 80% coverage target, co-located tests |
| VII. Development Workflow | ✅ PASS | Red-Green-Refactor per task |
| VIII. Performance & UX | ✅ PASS | 60fps, <16ms calculation targets |
| IX. Accessibility | ✅ PASS | Visual aids only; keyboard control via S key |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XXI. Static Imports Only | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | Compliance table required |

## Project Structure

### Documentation (this feature)

```text
specs/015-smart-guides/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (no API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── canvas/
│       └── smartGuides.ts              # NEW: Guide calculation utilities
├── stores/
│   └── smartGuidesStore.ts             # NEW: Smart guides state store
├── components/
│   └── Canvas/
│       ├── SmartGuideLines.tsx         # NEW: SVG guide line rendering
│       └── SmartGuideLines.module.css  # NEW: Spacing label styles
├── hooks/
│   └── canvas/
│       ├── useCanvasKeyboard.ts        # MODIFY: Add S key handler
│       └── useCanvasInteractions.ts    # MODIFY: Calculate guides during drag
├── types/
│   └── smartGuides.ts                  # NEW: Smart guide type definitions
└── styles/
    └── tokens.css                      # MODIFY: Add guide color tokens
```

**Structure Decision**: Follows existing canvas domain pattern - calculation utilities in `domain/canvas/`, transient state in `stores/`, SVG rendering in `components/Canvas/`, keyboard handling in hooks.

## Complexity Tracking

> No violations - all complexity within constitution guidelines.
