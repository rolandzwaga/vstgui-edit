# Implementation Plan: Canvas Rulers

**Branch**: `032-rulers` | **Date**: 2026-01-10 | **Spec**: [specs/032-rulers/spec.md](spec.md)
**Input**: Feature specification from `/specs/032-rulers/spec.md`

## Summary

Implement horizontal and vertical rulers along the canvas edges that provide visual coordinate context for UI element positioning. Rulers display tick marks with coordinate labels, respond to zoom/pan changes, show cursor position indicators, and highlight template bounds. The rulers use a fixed 20px thickness with 10px font and base 100px major intervals that scale by powers of 2 based on zoom level.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10 (signals, createMemo, For), existing canvasStore/gridStore/documentStore
**Storage**: N/A - ruler state is computed from existing stores
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge)
**Project Type**: SolidJS web application
**Performance Goals**: 60fps during pan/zoom, cursor indicator updates within 16ms (single frame)
**Constraints**: Rulers occupy fixed 20px screen space, minimum 30px between numbered ticks
**Scale/Scope**: Template sizes up to 4000x4000 pixels, zoom range 10%-500%

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS ONLY (not React) | PASS | Will use createSignal, createMemo, For |
| Static imports ONLY | PASS | No dynamic imports needed |
| Test-first development | PASS | All domain utilities and components will have tests first |
| CSS Modules approach | PASS | Will use Ruler.module.css with design tokens |
| No unauthorized dependencies | PASS | Using existing SolidJS stores and DOM APIs only |
| 80% coverage threshold | PASS | Will target full coverage for domain utilities |
| Quality gates | PASS | lint:css, check, typecheck will be run |

## Project Structure

### Documentation (this feature)

```text
specs/032-rulers/
├── plan.md              # This file
├── research.md          # Phase 0 output - tick calculation algorithms
├── data-model.md        # Phase 1 output - ruler types and interfaces
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/           # Phase 1 output - component API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Rulers/
│       │   ├── HorizontalRuler.tsx       # Horizontal ruler component
│       │   ├── HorizontalRuler.module.css
│       │   ├── VerticalRuler.tsx         # Vertical ruler component
│       │   ├── VerticalRuler.module.css
│       │   ├── RulerOrigin.tsx           # Origin indicator component
│       │   ├── RulerOrigin.module.css
│       │   ├── RulerContainer.tsx        # Layout container for rulers
│       │   ├── RulerContainer.module.css
│       │   ├── CursorIndicator.tsx       # Cursor position indicator
│       │   ├── index.ts                  # Barrel exports
│       │   └── __tests__/
│       │       ├── HorizontalRuler.spec.tsx
│       │       ├── VerticalRuler.spec.tsx
│       │       ├── RulerOrigin.spec.tsx
│       │       ├── RulerContainer.spec.tsx
│       │       ├── CursorIndicator.spec.tsx
│       │       └── Rulers.integration.spec.tsx
│       └── Canvas.tsx                    # Updated to include RulerContainer
├── domain/
│   └── rulers/
│       ├── tickCalculation.ts            # Tick mark interval calculation
│       ├── tickGeneration.ts             # Generate tick arrays for rendering
│       ├── coordinateMapping.ts          # Screen <-> canvas coordinate mapping
│       ├── index.ts                      # Barrel exports
│       └── __tests__/
│           ├── tickCalculation.spec.ts
│           ├── tickGeneration.spec.ts
│           └── coordinateMapping.spec.ts
├── stores/
│   └── rulerStore.ts                     # Cursor position state for rulers
│   └── __tests__/
│       └── rulerStore.spec.ts
├── types/
│   └── ruler.ts                          # Ruler type definitions
└── styles/
    └── tokens.css                        # Add ruler design tokens
```

**Structure Decision**: Rulers are placed within the Canvas component hierarchy since they are tightly coupled with canvas state (zoom, pan, template bounds). A dedicated `Rulers/` subdirectory keeps the components organized while maintaining proximity to Canvas.

## Complexity Tracking

> No constitution violations requiring justification. Design follows established patterns.

| Decision | Rationale |
|----------|-----------|
| Dedicated rulerStore | Only tracks cursor position - simple signal, not complex store |
| Domain utilities in separate directory | Tick calculation is pure math, benefits from isolation |
| Component hierarchy | RulerContainer wraps Canvas + Rulers to manage positioning |

---

## Phase 0: Research (Complete)

See [research.md](research.md) for detailed findings.

### Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Tick Scaling | Power-of-2 (100, 200, 400...) | Maintains minimum 30px screen spacing |
| Rendering | HTML divs, not SVG | Fixed screen space, simpler text rendering |
| Coordinate Mapping | Simple math with pan/zoom | Consistent with existing codebase |
| Cursor Indicator | CSS transform positioning | GPU-accelerated, smooth updates |
| Template Bounds | Background shading | Subtle, non-distracting |
| Grid Alignment | Adjust interval to grid multiple | Reinforces snap-to-grid visual feedback |

### Resolved Unknowns

All clarifications from spec have been incorporated:
- 20px ruler thickness with 10px font
- Base 100px intervals, power-of-2 scaling
- Accent line + tooltip for cursor indicator
- Pan offset coordinates for origin indicator
- Subtle shaded region for template bounds

---

## Phase 1: Design (Complete)

See documentation files for detailed contracts:

| Artifact | Purpose |
|----------|---------|
| [data-model.md](data-model.md) | Type definitions, store interfaces, entity relationships |
| [contracts/components.md](contracts/components.md) | Component props, behavior, CSS structure |
| [contracts/domain.md](contracts/domain.md) | Domain utility function contracts |
| [contracts/store.md](contracts/store.md) | rulerStore interface and behavior |
| [quickstart.md](quickstart.md) | Implementation order and patterns |

### Component Architecture

```
RulerContainer (CSS Grid)
├── RulerOrigin (20x20)     → Shows pan offset
├── HorizontalRuler         → X-axis ticks, cursor indicator, template bounds
├── VerticalRuler           → Y-axis ticks, cursor indicator, template bounds
└── Canvas Viewport         → Existing canvas content (unchanged)
```

### Integration Strategy

1. RulerContainer wraps existing Canvas content
2. Mouse events on viewport update rulerStore
3. Ruler components read from canvasStore and rulerStore
4. No changes to existing canvas functionality

---

## Constitution Re-Check (Post-Design)

| Gate | Status | Verification |
|------|--------|--------------|
| SolidJS ONLY | PASS | All components use createSignal, createMemo, For |
| Static imports | PASS | No dynamic imports in design |
| Test-first | PASS | Test files specified for all new code |
| CSS Modules | PASS | Each component has .module.css |
| No new deps | PASS | Only existing SolidJS/DOM APIs |
| 80% coverage | PASS | Domain utilities will have 100% coverage |
| Quality gates | PASS | All checks will be run per task |

---

## Implementation Overview

### New Files (14)

| File | Type | Purpose |
|------|------|---------|
| `src/types/ruler.ts` | Types | Type definitions |
| `src/stores/rulerStore.ts` | Store | Cursor position state |
| `src/domain/rulers/tickCalculation.ts` | Domain | Interval calculation |
| `src/domain/rulers/tickGeneration.ts` | Domain | Tick array generation |
| `src/domain/rulers/coordinateMapping.ts` | Domain | Coordinate conversions |
| `src/domain/rulers/index.ts` | Barrel | Domain exports |
| `src/components/Canvas/Rulers/HorizontalRuler.tsx` | Component | H ruler |
| `src/components/Canvas/Rulers/VerticalRuler.tsx` | Component | V ruler |
| `src/components/Canvas/Rulers/RulerOrigin.tsx` | Component | Origin indicator |
| `src/components/Canvas/Rulers/RulerContainer.tsx` | Component | Layout wrapper |
| `src/components/Canvas/Rulers/CursorIndicator.tsx` | Component | Cursor line+tooltip |
| `src/components/Canvas/Rulers/index.ts` | Barrel | Component exports |
| CSS modules (4) | Styles | Component styles |

### Modified Files (2)

| File | Change |
|------|--------|
| `src/styles/tokens.css` | Add ruler design tokens |
| `src/components/Canvas/Canvas.tsx` | Wrap with RulerContainer |

### Test Files (7)

| File | Coverage |
|------|----------|
| `src/domain/rulers/__tests__/tickCalculation.spec.ts` | calculateTickIntervals, alignIntervalToGrid |
| `src/domain/rulers/__tests__/tickGeneration.spec.ts` | generateTicks, calculateVisibleRange, formatTickLabel |
| `src/domain/rulers/__tests__/coordinateMapping.spec.ts` | All coordinate mapping functions |
| `src/stores/__tests__/rulerStore.spec.ts` | Store actions and state |
| `src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx` | Ticks, cursor, bounds |
| `src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx` | Ticks, cursor, bounds |
| `src/components/Canvas/Rulers/__tests__/Rulers.integration.spec.tsx` | Full integration |

---

## Requirement Traceability

| Requirement | Implementation |
|-------------|----------------|
| FR-001 | HorizontalRuler in RulerContainer |
| FR-002 | VerticalRuler in RulerContainer |
| FR-003 | tickGeneration.generateTicks with formatTickLabel |
| FR-004 | tickCalculation.calculateTickIntervals |
| FR-005 | coordinateMapping functions + canvasStore integration |
| FR-006 | Major ticks with labels in generateTicks |
| FR-007 | Minor ticks (label: null) in generateTicks |
| FR-008 | CursorIndicator component |
| FR-009 | rulerStore + mouse event handlers |
| FR-010 | clearCursorPosition on mouse leave |
| FR-011 | Template bounds indicator in ruler components |
| FR-012 | Conditional rendering via documentStore.parseState |
| FR-013 | RulerOrigin component |
| FR-014 | Power-of-2 scaling in calculateTickIntervals |
| FR-015 | alignIntervalToGrid with gridStore |
| FR-016 | Fixed 20px CSS, not affected by canvas transform |
| SC-001 | Proper coordinate mapping and label formatting |
| SC-002 | MIN_SCREEN_SPACING = 30 in tick calculation |
| SC-003 | Direct signal updates, CSS transforms |
| SC-004 | Memoization, virtual rendering of visible ticks |
| SC-005 | Test-first development |
| SC-006 | calculateVisibleRange handles large templates |
| SC-007 | alignIntervalToGrid supports all presets |

---

## Next Step

Run `/speckit.tasks` to generate detailed implementation tasks from this plan.
