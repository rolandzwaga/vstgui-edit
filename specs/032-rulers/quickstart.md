# Quickstart: Canvas Rulers Implementation

**Feature**: 032-rulers | **Date**: 2026-01-10

## Implementation Order

Follow this order to ensure proper test-first development and dependency resolution:

### Phase 1: Types and Constants

1. **Create type definitions** (`src/types/ruler.ts`)
   - Define TickMark, TickType, TickIntervals, VisibleRange
   - Define component props interfaces
   - No tests needed (pure types)

2. **Add design tokens** (`src/styles/tokens.css`)
   - Add ruler-specific CSS custom properties
   - Follow existing token naming patterns

### Phase 2: Domain Utilities (Test-First)

3. **tickCalculation.ts**
   - Write tests first for `calculateTickIntervals`
   - Write tests for `alignIntervalToGrid`
   - Implement functions to pass tests
   - Pure math, no SolidJS dependencies

4. **tickGeneration.ts**
   - Write tests first for `generateTicks`
   - Write tests for `calculateVisibleRange`
   - Write tests for `formatTickLabel`
   - Implement functions to pass tests

5. **coordinateMapping.ts**
   - Write tests first for `screenToCanvasCoordinates`
   - Write tests for `canvasToScreenPosition`
   - Write tests for `calculateTemplateBoundsPosition`
   - Implement functions to pass tests

### Phase 3: Store (Test-First)

6. **rulerStore.ts**
   - Write tests first for setCursorPosition, clearCursorPosition, reset
   - Implement following canvasStore pattern
   - Use `testInRoot()` wrapper for signal tests

### Phase 4: Components (Test-First)

7. **CursorIndicator.tsx**
   - Write tests for visibility, positioning, tooltip
   - Simple presentational component
   - CSS module for styling

8. **HorizontalRuler.tsx**
   - Write tests for tick rendering, cursor indicator, template bounds
   - Uses domain utilities and rulerStore
   - CSS module for styling

9. **VerticalRuler.tsx**
   - Write tests (similar to HorizontalRuler)
   - Reuses most logic, different orientation
   - CSS module for styling

10. **RulerOrigin.tsx**
    - Write tests for origin display, pan offset display
    - Reads from canvasStore
    - CSS module for styling

11. **RulerContainer.tsx**
    - Write tests for layout, cursor tracking
    - CSS Grid layout
    - Integrates all ruler components

### Phase 5: Integration

12. **Update Canvas.tsx**
    - Wrap canvas content with RulerContainer
    - Wire up mouse events for cursor tracking
    - Verify existing functionality unchanged

13. **Integration tests**
    - Test rulers with zoom/pan interactions
    - Test cursor indicator real-time updates
    - Test template bounds across various scenarios

## Key Implementation Patterns

### Tick Generation with Memoization

```typescript
// In HorizontalRuler.tsx
const intervals = createMemo(() =>
  calculateTickIntervals(canvasStore.zoomLevel)
);

const visibleRange = createMemo(() =>
  calculateVisibleRange(props.width, canvasStore.panOffset.x, canvasStore.zoomLevel)
);

const ticks = createMemo(() =>
  generateTicks(visibleRange(), intervals())
);
```

### Cursor Position Updates

```typescript
// In RulerContainer.tsx or Canvas.tsx
const handleMouseMove = (e: MouseEvent) => {
  const rect = containerRef.getBoundingClientRect();
  const canvasPoint = screenToCanvasCoordinates(
    e.clientX - rect.left,
    e.clientY - rect.top,
    canvasStore.panOffset,
    canvasStore.zoomLevel
  );
  setCursorPosition(canvasPoint);
};
```

### Grid-Aligned Ticks

```typescript
// When calculating intervals
const intervals = createMemo(() => {
  const base = calculateTickIntervals(canvasStore.zoomLevel);
  return {
    major: alignIntervalToGrid(base.major, gridStore.size, gridStore.isVisible),
    minor: base.minor,
  };
});
```

## Testing Patterns

### Domain Utility Tests

```typescript
// src/domain/rulers/__tests__/tickCalculation.spec.ts
import { describe, it, expect } from 'vitest';
import { calculateTickIntervals } from '../tickCalculation';

describe('calculateTickIntervals', () => {
  it('returns base intervals at 100% zoom', () => {
    const result = calculateTickIntervals(1.0);
    expect(result).toEqual({ major: 100, minor: 10 });
  });

  it('doubles intervals at 25% zoom for readability', () => {
    const result = calculateTickIntervals(0.25);
    expect(result.major).toBeGreaterThanOrEqual(200);
    expect(result.major * 0.25).toBeGreaterThanOrEqual(30); // min screen spacing
  });
});
```

### Store Tests

```typescript
// src/stores/__tests__/rulerStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import { rulerStore, setCursorPosition, resetRulerStore } from '../rulerStore';

describe('rulerStore', () => {
  beforeEach(() => {
    resetRulerStore();
  });

  it('should set cursor position', () => {
    testInRoot(() => {
      setCursorPosition({ x: 100, y: 50 });
      expect(rulerStore.cursorPosition).toEqual({ x: 100, y: 50 });
    });
  });
});
```

### Component Tests

```typescript
// src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { HorizontalRuler } from '../HorizontalRuler';
import { resetRulerStore } from '../../../../stores/rulerStore';

describe('HorizontalRuler', () => {
  beforeEach(() => {
    resetRulerStore();
  });

  it('renders tick marks for visible range', () => {
    render(() => (
      <HorizontalRuler
        width={800}
        cursorPosition={null}
        templateWidth={1000}
      />
    ));
    // Major ticks should have labels
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

## CSS Module Structure

### tokens.css additions

```css
/* Ruler Design Tokens */
--ruler-thickness: 20px;
--ruler-font-size: 10px;
--ruler-background: var(--color-neutral-100);
--ruler-border-color: var(--color-neutral-300);
--ruler-tick-color: var(--color-neutral-500);
--ruler-tick-major-color: var(--color-neutral-700);
--ruler-label-color: var(--color-neutral-700);
--ruler-cursor-indicator-color: var(--color-primary-500);
--ruler-template-bounds-color: rgba(59, 130, 246, 0.08);
--ruler-origin-background: var(--color-neutral-200);
```

### Component CSS Modules

Each ruler component has its own `.module.css` file following existing patterns:
- Use design tokens exclusively (no hardcoded colors/sizes)
- Use existing spacing/radius tokens where applicable
- Keep selectors simple and scoped

## Verification Checklist

After each task, verify:
- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Linting passes (`npm run check`)
- [ ] CSS linting passes (`npm run lint:css`)

Before marking complete, verify all requirements:
- [ ] FR-001 through FR-016 implemented
- [ ] SC-001 through SC-007 verified
- [ ] Quality gates pass
- [ ] Documentation updated (CLAUDE.md)
