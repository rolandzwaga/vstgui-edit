# Quickstart: Canvas Rendering Implementation

**Feature**: 003-canvas-rendering
**Date**: 2026-01-05

## Prerequisites

- Existing `documentStore` with `document` property containing parsed uidesc
- SolidJS 1.9.10 with TypeScript
- Vitest + @solidjs/testing-library configured

## Implementation Order

Follow test-first development. For each item: write test → implement → verify.

### Phase 1: Types and Domain Logic (Renderer-Agnostic)

1. **Types** (`src/types/canvas.ts`)
   - `ViewCategory` type
   - `Point`, `Size` interfaces
   - `RenderableView` interface
   - `TemplateBounds` interface

2. **Coordinate Parsing** (`src/domain/canvas/coordinates.ts`)
   - `parsePoint(origin)` - handles undefined, "x, y", negative values
   - `parseSize(size)` - handles undefined, "w, h", minimum size

3. **View Category** (`src/domain/canvas/viewCategory.ts`)
   - `CONTAINER_CLASSES`, `CONTROL_CLASSES`, `DISPLAY_CLASSES` sets
   - `getViewCategory(className)` - returns category or 'custom'

4. **Label Formatting** (`src/domain/canvas/labelFormat.ts`)
   - `formatLabel(className, category)` - adds [Custom] indicator

5. **Hierarchy Flattening** (`src/domain/canvas/flattenHierarchy.ts`)
   - `flattenHierarchy(root, rootId)` - recursive tree → array
   - Computes absolute positions, assigns zIndex

### Phase 2: Components (SVG Implementation)

6. **EmptyState** (`src/components/Canvas/EmptyState.tsx`)
   - Simple centered message component
   - Testable with @solidjs/testing-library

7. **TemplateBounds** (`src/components/Canvas/TemplateBounds.tsx`)
   - SVG rect with distinct styling
   - Props: `{ bounds: TemplateBounds }`

8. **ViewRectangle** (`src/components/Canvas/ViewRectangle.tsx`)
   - SVG group with rect + text
   - Category-based CSS class
   - Label truncation for small views

9. **Canvas** (`src/components/Canvas/Canvas.tsx`)
   - Main container reading from documentStore
   - Conditional rendering (EmptyState vs SVG)
   - Uses `<For>` for view list

### Phase 3: Styling

10. **CSS Module** (`src/components/Canvas/Canvas.module.css`)
    - Category colors using design tokens
    - Template bounds styling
    - Label typography
    - Empty state styling

## Key Implementation Patterns

### Reading from documentStore

```typescript
import { documentStore } from '../../stores/documentStore';

// In component
const templates = () => documentStore.document?.['vstgui-ui-description']?.templates;
const firstTemplate = () => {
  const t = templates();
  return t ? Object.values(t)[0] : null;
};
```

### Reactive View List

```typescript
const renderableViews = createMemo(() => {
  const template = firstTemplate();
  if (!template) return [];
  return flattenHierarchy(template);
});
```

### SVG Coordinate System

- SVG `viewBox` matches template bounds: `viewBox="0 0 {width} {height}"`
- Origin at top-left (matches uidesc convention)
- Pixel units (1 SVG unit = 1 pixel)

### Category Styling

```css
/* Use design tokens from src/styles/tokens.css */
.container {
  fill: var(--color-category-container-fill);
  stroke: var(--color-category-container-stroke);
}
```

### Testing Pattern

```typescript
import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';

// Mock documentStore
vi.mock('../../stores/documentStore', () => ({
  documentStore: {
    document: mockDocument
  }
}));

describe('Canvas', () => {
  it('renders empty state when no document', () => {
    render(() => <Canvas />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
```

## Design Tokens to Add

Add to `src/styles/tokens.css`:

```css
/* Category colors */
--color-category-container-fill: rgba(59, 130, 246, 0.1);
--color-category-container-stroke: #3b82f6;
--color-category-control-fill: rgba(34, 197, 94, 0.1);
--color-category-control-stroke: #22c55e;
--color-category-display-fill: rgba(168, 85, 247, 0.1);
--color-category-display-stroke: #a855f7;
--color-category-custom-fill: rgba(107, 114, 128, 0.1);
--color-category-custom-stroke: #6b7280;

/* Template bounds */
--color-template-bounds: #374151;

/* Canvas background */
--color-canvas-background: #f9fafb;
```

## Verification Checklist

After implementation:

- [ ] All domain functions have 100% test coverage
- [ ] All components render correctly with mock data
- [ ] Category colors are visually distinct
- [ ] Template bounds are clearly visible
- [ ] Empty state displays when no document
- [ ] Labels show [Custom] for unknown classes
- [ ] Nested views have correct absolute positions
- [ ] Z-ordering matches hierarchy (children on top)
- [ ] `npm test` passes
- [ ] `npx biome check --write .` passes
- [ ] `npx tsc --noEmit` passes
