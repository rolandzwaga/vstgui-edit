# Component Contracts: Canvas Rulers

**Feature**: 032-rulers | **Date**: 2026-01-10

## RulerContainer

**Purpose**: Layout container that positions rulers around the canvas viewport using CSS Grid.

### Props

```typescript
interface RulerContainerProps {
  children: JSX.Element; // Canvas content to render in viewport area
}
```

### Behavior

- Renders a CSS Grid layout with:
  - Top-left: RulerOrigin (20x20 pixels)
  - Top: HorizontalRuler (full remaining width)
  - Left: VerticalRuler (full remaining height)
  - Center: Canvas viewport (children)
- Only renders rulers when template is loaded
- Passes cursor position and template bounds to child rulers

### Events

- `onMouseMove`: Captures mouse position, updates rulerStore
- `onMouseLeave`: Clears cursor position in rulerStore

### CSS Classes

```css
.container {
  display: grid;
  grid-template-columns: var(--ruler-thickness) 1fr;
  grid-template-rows: var(--ruler-thickness) 1fr;
  width: 100%;
  height: 100%;
}

.origin { grid-area: 1 / 1; }
.horizontalRuler { grid-area: 1 / 2; }
.verticalRuler { grid-area: 2 / 1; }
.viewport { grid-area: 2 / 2; position: relative; overflow: hidden; }
```

---

## HorizontalRuler

**Purpose**: Renders horizontal ruler with tick marks, labels, cursor indicator, and template bounds.

### Props

```typescript
interface HorizontalRulerProps {
  width: number;              // Viewport width in screen pixels
  cursorPosition: Point | null; // Canvas coordinates of cursor
  templateWidth: number;      // Template width for bounds indicator
}
```

### Behavior

- Computes visible range from canvasStore (panOffset.x, zoomLevel)
- Calculates tick intervals based on zoom level
- Generates tick marks for visible range
- Renders major ticks with labels, minor ticks without
- Shows template bounds as shaded background region
- Shows cursor indicator when cursorPosition is not null

### Rendering

```
[===TEMPLATE BOUNDS REGION===]
|    |    |    100   |    |    200   |    |    300   |
|    |    |    |     |    |    |     |    |    |     |
     ↑ cursor indicator (accent line)
```

### CSS Classes

```css
.ruler {
  height: var(--ruler-thickness);
  background: var(--ruler-background);
  border-bottom: 1px solid var(--ruler-border-color);
  position: relative;
  overflow: hidden;
}

.templateBounds {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--ruler-template-bounds-color);
}

.tickContainer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.tick {
  position: absolute;
  top: 0;
  width: 1px;
  background: var(--ruler-tick-color);
}

.tickMajor {
  height: 12px;
  background: var(--ruler-tick-major-color);
}

.tickMinor {
  height: 6px;
}

.label {
  position: absolute;
  top: 12px;
  font-size: var(--ruler-font-size);
  color: var(--ruler-label-color);
  transform: translateX(-50%);
  white-space: nowrap;
}
```

---

## VerticalRuler

**Purpose**: Renders vertical ruler with tick marks, labels, cursor indicator, and template bounds.

### Props

```typescript
interface VerticalRulerProps {
  height: number;              // Viewport height in screen pixels
  cursorPosition: Point | null; // Canvas coordinates of cursor
  templateHeight: number;      // Template height for bounds indicator
}
```

### Behavior

- Same as HorizontalRuler but for Y axis
- Labels rotated or positioned to the right of ticks
- Template bounds region extends from top to template extent

### CSS Classes

```css
.ruler {
  width: var(--ruler-thickness);
  background: var(--ruler-background);
  border-right: 1px solid var(--ruler-border-color);
  position: relative;
  overflow: hidden;
}

.tick {
  position: absolute;
  left: 0;
  height: 1px;
  background: var(--ruler-tick-color);
}

.tickMajor {
  width: 12px;
}

.tickMinor {
  width: 6px;
}

.label {
  position: absolute;
  left: 12px;
  font-size: var(--ruler-font-size);
  color: var(--ruler-label-color);
  transform: translateY(-50%);
  white-space: nowrap;
}
```

---

## RulerOrigin

**Purpose**: Renders the origin indicator at ruler intersection showing pan offset in compact format with tooltip.

### Props

```typescript
interface RulerOriginProps {
  panOffset: Point; // Current pan offset from canvasStore
}
```

### Behavior

- Shows crosshair "+" icon when pan offset is (0, 0)
- Shows abbreviated offset indicator when panned (small dot or abbreviated numbers)
- Full coordinates displayed in tooltip on hover: "Pan: X: -50, Y: 120"
- Updates reactively when pan changes
- Constrained to 20x20px space

### Display Format

- At origin (0,0): Crosshair "+" icon centered
- When panned: Small indicator with tooltip
  - Visual: Subtle offset indicator (dot shifted from center)
  - Tooltip (on hover): "Pan: X: -50, Y: 120"

### CSS Classes

```css
.origin {
  width: var(--ruler-thickness);
  height: var(--ruler-thickness);
  background: var(--ruler-origin-background);
  border-right: 1px solid var(--ruler-border-color);
  border-bottom: 1px solid var(--ruler-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  position: relative;
}

.crosshair {
  width: 12px;
  height: 12px;
  color: var(--ruler-label-color);
}

.offsetIndicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ruler-cursor-indicator-color);
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 100%;
  background: var(--color-tooltip-background);
  color: var(--color-tooltip-text);
  font-size: var(--font-size-xs);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: var(--z-tooltip);
}

.origin:hover .tooltip {
  opacity: 1;
}
```

---

## CursorIndicator

**Purpose**: Renders cursor position indicator on rulers with tooltip.

### Props

```typescript
interface CursorIndicatorProps {
  screenPosition: number;        // Position along ruler in screen pixels
  canvasValue: number;           // Canvas coordinate for tooltip
  orientation: RulerOrientation; // 'horizontal' | 'vertical'
  visible: boolean;              // Whether to show
}
```

### Behavior

- Renders 1px accent-colored line spanning full ruler width/height
- Shows tooltip with formatted coordinate (e.g., "X: 247" or "Y: 180")
- Uses CSS transform for smooth positioning
- Hidden via opacity when not visible

### CSS Classes

```css
.indicator {
  position: absolute;
  background: var(--ruler-cursor-indicator-color);
  pointer-events: none;
  transition: opacity 0.1s ease;
}

.indicatorHorizontal {
  width: 1px;
  top: 0;
  bottom: 0;
}

.indicatorVertical {
  height: 1px;
  left: 0;
  right: 0;
}

.tooltip {
  position: absolute;
  background: var(--color-tooltip-background);
  color: var(--color-tooltip-text);
  font-size: var(--font-size-xs);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
}

.tooltipHorizontal {
  top: 100%;
  transform: translateX(-50%);
}

.tooltipVertical {
  left: 100%;
  transform: translateY(-50%);
}

.hidden {
  opacity: 0;
}
```

---

## Integration with Canvas.tsx

The current Canvas component structure will be wrapped:

### Before

```tsx
<Show when={!isEmpty()} fallback={<EmptyState />}>
  <div>
    <div ref={wrapperRef} class={styles.canvasWrapper}>
      {/* ... canvas content ... */}
    </div>
  </div>
</Show>
```

### After

```tsx
<Show when={!isEmpty()} fallback={<EmptyState />}>
  <RulerContainer>
    <div ref={wrapperRef} class={styles.canvasWrapper}>
      {/* ... canvas content ... */}
    </div>
  </RulerContainer>
</Show>
```

The RulerContainer handles the grid layout and ruler rendering, while the existing canvas wrapper remains unchanged inside the viewport area.

---

## Barrel Exports

### src/components/Canvas/Rulers/index.ts

```typescript
// Component exports
export { RulerContainer } from './RulerContainer';
export { HorizontalRuler } from './HorizontalRuler';
export { VerticalRuler } from './VerticalRuler';
export { RulerOrigin } from './RulerOrigin';
export { CursorIndicator } from './CursorIndicator';

// Type re-exports for convenience
export type {
  RulerContainerProps,
  HorizontalRulerProps,
  VerticalRulerProps,
  RulerOriginProps,
  CursorIndicatorProps,
} from '../../../types/ruler';
```

**Usage**: Import components from this barrel for cleaner imports:
```typescript
import { RulerContainer, HorizontalRuler } from './components/Canvas/Rulers';
```
