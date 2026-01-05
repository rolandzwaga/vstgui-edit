# Research: Canvas Rendering Approach

**Feature**: 003-canvas-rendering
**Date**: 2026-01-05
**Status**: Complete

## Decision

**Selected**: SVG with SolidJS reactive rendering (Option B)

## Rationale

SVG provides the best balance of SolidJS integration, testability, and simplicity for our requirements:

| Criterion | SVG | HTML5 Canvas | Canvas Library | DOM Divs |
|-----------|-----|--------------|----------------|----------|
| SolidJS Reactivity | Native | Manual redraw | Manual sync | Native |
| Bundle Size | 0 KB | 0 KB | 50-100 KB | 0 KB |
| CSS Modules | Direct | N/A | Limited | Direct |
| Testing | DOM queries | Difficult | Complex | DOM queries |
| Text Rendering | Native `<text>` | Manual | Library API | Native |
| Z-ordering | DOM order | Manual | API | z-index |
| Pixel-perfect | Yes (x, y attrs) | Yes | Yes | Requires transforms |

### Why SVG

1. **Native SolidJS Integration**: SVG elements are JSX-native. Fine-grained reactivity works automatically - when a signal changes, only the affected attribute updates.

2. **Zero Dependencies**: No external library needed (constitution XI compliance). SVG is a browser standard.

3. **CSS Modules Work Directly**: Apply `class={styles.viewRectangle}` to SVG elements. Use `fill`, `stroke`, `font-size` CSS properties.

4. **Easy Testing**: SVG elements are DOM nodes queryable with `@solidjs/testing-library`. Use `data-testid` attributes.

5. **Performance**: SolidJS handles 100+ SVG elements efficiently with fine-grained updates. Use `<For>` component for dynamic lists.

6. **Text Rendering**: `<text>` element with `text-anchor="middle"` and `dominant-baseline="middle"` for centered labels.

## Alternatives Considered

### Option A: HTML5 Canvas API

**Rejected because**:
- Imperative drawing model conflicts with SolidJS reactive paradigm
- Requires manual redraw on every state change via `createEffect`
- No DOM elements = difficult to test with testing-library
- Text positioning is manual (no CSS styling)

### Option C: Canvas Libraries (Konva, Fabric.js, PixiJS)

**Rejected because**:
- No mature SolidJS bindings (`solid-konva` abandoned, `solid-pixi` is niche)
- Adds 50-100KB bundle size for simple rectangles + text
- Violates constitution principle XI (unauthorized dependencies)
- Overkill for our use case (no complex interactions, animations, or WebGL needed)

### Option D: Pure DOM Elements

**Rejected because**:
- Less semantic for coordinate-based graphics
- Requires CSS transforms for precise positioning
- Not canvas-like (spec says "canvas component")

## Implementation Details

### SVG Structure

```xml
<svg class={styles.canvas} viewBox="0 0 {width} {height}">
  <!-- Template bounds -->
  <rect class={styles.templateBounds} x="0" y="0" width={w} height={h} />

  <!-- View hierarchy (z-order = DOM order) -->
  <For each={flattenedViews()}>
    {(view) => (
      <g transform={`translate(${view.absoluteX}, ${view.absoluteY})`}>
        <rect class={styles[view.category]} width={view.width} height={view.height} />
        <text text-anchor="middle" dominant-baseline="middle"
              x={view.width / 2} y={view.height / 2}>
          {view.label}
        </text>
      </g>
    )}
  </For>
</svg>
```

### Category Styling (CSS Module)

```css
.container { fill: rgba(59, 130, 246, 0.1); stroke: #3b82f6; }
.control { fill: rgba(34, 197, 94, 0.1); stroke: #22c55e; }
.display { fill: rgba(168, 85, 247, 0.1); stroke: #a855f7; }
.custom { fill: rgba(107, 114, 128, 0.1); stroke: #6b7280; }
```

### Z-Ordering Strategy

SVG renders elements in DOM order (painters model). Flatten view hierarchy into array maintaining render order:
1. Parent first
2. Children after parent
3. Later siblings on top of earlier siblings

### Testing Approach

```typescript
// Query by data-testid
const rect = screen.getByTestId('view-myButton');
expect(rect.getAttribute('width')).toBe('100');

// Verify DOM order for z-ordering
const children = container.querySelectorAll('[data-view-id]');
expect(children[0].dataset.viewId).toBe('parent');
expect(children[1].dataset.viewId).toBe('child');
```

## Performance Considerations

- Use `<For>` component (not `.map()`) for dynamic view lists
- SolidJS updates only changed attributes, not entire elements
- 100+ elements is well within performance envelope
- Consider virtualization only if views exceed 500+

## Sources

- SolidJS SVG JSX handling: https://www.solidjs.com/tutorial/introduction_jsx
- SVG CSS Modules: https://docs.solidjs.com/guides/styling-components/css-modules
- SolidJS Testing: https://docs.solidjs.com/guides/testing
- SVG z-ordering: https://www.w3.org/TR/2015/WD-SVG2-20150915/render.html
- SVG text positioning: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text
