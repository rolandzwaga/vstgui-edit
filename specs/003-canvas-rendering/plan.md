# Implementation Plan: Canvas Rendering

**Branch**: `003-canvas-rendering` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-canvas-rendering/spec.md`

## Summary

Implement a 2D canvas component that renders uidesc views as colored rectangles with class labels. The canvas displays view hierarchies from `documentStore.document.templates` with proper z-ordering, category-based coloring, and template bounds indication.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10 (no additional dependencies required)
**Rendering Approach**: SVG with SolidJS reactive rendering (see [research.md](research.md))
**Storage**: N/A (reads from existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Target Platform**: Web browser (modern browsers with SVG support)
**Project Type**: Web application (existing SolidJS SPA)
**Performance Goals**: 60fps during interactions, <100ms response time
**Constraints**: Reactive updates when documentStore changes
**Scale/Scope**: Templates with potentially 100+ nested views

## Rendering Abstraction Strategy

**Goal**: Isolate rendering implementation (SVG) from data transformation logic to enable future pivot to HTML5 Canvas if needed.

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│  Domain Layer (renderer-agnostic)                           │
│  ─────────────────────────────────────────────────────────  │
│  • ViewDefinition → RenderableView transformation           │
│  • Hierarchy flattening with absolute positions             │
│  • View category classification                             │
│  • Coordinate/size parsing                                  │
│  • Label text generation (with [Custom] indicator)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   RenderableView[]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Rendering Layer (SVG implementation)                       │
│  ─────────────────────────────────────────────────────────  │
│  • Takes RenderableView[] as input                          │
│  • Renders using SVG elements                               │
│  • Handles CSS styling via CSS Modules                      │
│  • Could be swapped for Canvas/WebGL implementation         │
└─────────────────────────────────────────────────────────────┘
```

### Key Abstraction: `RenderableView`

All rendering logic consumes a `RenderableView` type that contains pre-computed values:

```typescript
interface RenderableView {
  id: string;
  absoluteX: number;      // Pre-computed from hierarchy
  absoluteY: number;
  width: number;
  height: number;
  label: string;          // "CTextButton" or "CMyKnob [Custom]"
  category: ViewCategory; // 'container' | 'control' | 'display' | 'custom'
  zIndex: number;         // Render order (DOM order for SVG, explicit for Canvas)
}
```

### What's Renderer-Agnostic (in `src/domain/canvas/`)

- `flattenHierarchy(template)` → `RenderableView[]`
- `getViewCategory(className)` → `ViewCategory`
- `parsePoint(origin)` → `{ x, y }`
- `parseSize(size)` → `{ width, height }`
- `formatLabel(className, category)` → `string`

### What's SVG-Specific (in `src/components/Canvas/`)

- JSX rendering of `<svg>`, `<rect>`, `<text>`, `<g>`
- CSS Module class application
- DOM-based z-ordering

### Future Canvas Pivot

To switch to HTML5 Canvas:
1. Domain layer remains unchanged
2. Replace `Canvas.tsx` with imperative canvas drawing
3. Add `createEffect` to redraw on `RenderableView[]` changes
4. Testing would shift to snapshot/visual regression

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| SolidJS Only (XII) | PASS | Using SolidJS reactive primitives with SVG |
| Test-First (I) | PASS | Will write tests before implementation |
| No Unauthorized Dependencies (XI) | PASS | SVG is native browser API, no new dependencies |
| CSS Modules (XV) | PASS | CSS Modules work directly with SVG elements |
| 60fps Performance (VIII) | PASS | SolidJS fine-grained reactivity + SVG handles 100+ elements |
| Accessibility (IX) | PASS | Non-interactive in this phase; SVG supports ARIA |

## Project Structure

### Documentation (this feature)

```text
specs/003-canvas-rendering/
├── plan.md              # This file
├── research.md          # Phase 0 output - canvas approach decision
├── data-model.md        # Phase 1 output - view rendering types
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/           # Phase 1 output - component interfaces
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Canvas.tsx           # Main canvas component (SVG container)
│       ├── Canvas.module.css    # Canvas and view styling
│       ├── ViewRectangle.tsx    # SVG rect + text rendering
│       ├── TemplateBounds.tsx   # Template bounds indicator (SVG)
│       ├── EmptyState.tsx       # "No template loaded" message
│       └── __tests__/
│           ├── Canvas.spec.tsx
│           ├── ViewRectangle.spec.tsx
│           └── TemplateBounds.spec.tsx
├── domain/
│   └── canvas/
│       ├── index.ts             # Barrel export
│       ├── flattenHierarchy.ts  # ViewDefinition → RenderableView[]
│       ├── viewCategory.ts      # View classification logic
│       ├── coordinates.ts       # parsePoint, parseSize utilities
│       ├── labelFormat.ts       # formatLabel with [Custom] indicator
│       └── __tests__/
│           ├── flattenHierarchy.spec.ts
│           ├── viewCategory.spec.ts
│           ├── coordinates.spec.ts
│           └── labelFormat.spec.ts
└── types/
    └── canvas.ts                # RenderableView, ViewCategory types
```

**Structure Decision**:
- **Domain layer** (`src/domain/canvas/`) contains renderer-agnostic logic that can be reused if rendering approach changes
- **Component layer** (`src/components/Canvas/`) contains SVG-specific implementation
- Tests in `__tests__/` directories per constitution

## Complexity Tracking

> No violations identified. Feature uses standard patterns.

