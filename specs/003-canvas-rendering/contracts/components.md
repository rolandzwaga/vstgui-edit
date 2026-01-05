# Component Contracts: Canvas Rendering

**Feature**: 003-canvas-rendering
**Date**: 2026-01-05

## Canvas Component

Main container that renders the template visualization.

### Props

```typescript
interface CanvasProps {
  // No props - reads directly from documentStore
}
```

### Behavior

| Condition | Rendered Output |
|-----------|-----------------|
| `documentStore.document === null` | EmptyState with "No template loaded" |
| `documentStore.document.templates` is empty | EmptyState with "No template loaded" |
| Valid document with templates | SVG with TemplateBounds + ViewRectangles |

### DOM Structure (SVG)

```xml
<svg class={styles.canvas} viewBox="0 0 {width} {height}" data-testid="canvas">
  <TemplateBounds />
  <For each={renderableViews}>
    <ViewRectangle />
  </For>
</svg>
```

---

## ViewRectangle Component

Renders a single view as an SVG group containing a rectangle and label.

### Props

```typescript
interface ViewRectangleProps {
  view: RenderableView;
}
```

### Behavior

| Condition | Label Display |
|-----------|---------------|
| View width >= 60px | Full label visible |
| View width < 60px | Label truncated or hidden |

### DOM Structure (SVG)

```xml
<g data-testid={`view-${view.id}`} data-view-id={view.id}>
  <rect
    class={styles[view.category]}
    x={view.absoluteX}
    y={view.absoluteY}
    width={view.width}
    height={view.height}
  />
  <text
    class={styles.label}
    x={view.absoluteX + view.width / 2}
    y={view.absoluteY + view.height / 2}
    text-anchor="middle"
    dominant-baseline="middle"
  >
    {view.label}
  </text>
</g>
```

### CSS Classes

| Class | Applied When | Styling |
|-------|--------------|---------|
| `styles.container` | `category === 'container'` | Blue fill/stroke |
| `styles.control` | `category === 'control'` | Green fill/stroke |
| `styles.display` | `category === 'display'` | Purple fill/stroke |
| `styles.custom` | `category === 'custom'` | Gray fill/stroke |
| `styles.label` | Always on text | Font styling |

---

## TemplateBounds Component

Renders a distinct border around the template root dimensions.

### Props

```typescript
interface TemplateBoundsProps {
  bounds: TemplateBounds;
}
```

### DOM Structure (SVG)

```xml
<rect
  class={styles.templateBounds}
  x={0}
  y={0}
  width={bounds.width}
  height={bounds.height}
  fill="none"
  data-testid="template-bounds"
/>
```

### Styling

- Thicker stroke than view rectangles
- Distinct color (e.g., dashed dark gray)
- No fill (transparent)

---

## EmptyState Component

Displays a centered message when no template is available.

### Props

```typescript
interface EmptyStateProps {
  message?: string;  // Default: "No template loaded"
}
```

### DOM Structure

```xml
<div class={styles.emptyState} data-testid="empty-state">
  <span class={styles.emptyMessage}>{message}</span>
</div>
```

---

## Domain Functions

### flattenHierarchy

Transforms a ViewDefinition tree into a flat array of RenderableViews.

```typescript
function flattenHierarchy(
  root: ViewDefinition,
  rootId?: string
): RenderableView[];
```

**Input**: Root ViewDefinition from template
**Output**: Flat array in render order (parents before children)

### getViewCategory

Classifies a view class name into a category.

```typescript
function getViewCategory(className: string | undefined): ViewCategory;
```

### parsePoint

Parses "x, y" string to Point object.

```typescript
function parsePoint(origin: string | undefined): Point;
```

**Edge cases**:
- `undefined` → `{ x: 0, y: 0 }`
- `"50, 100"` → `{ x: 50, y: 100 }`
- `"-10, 20"` → `{ x: -10, y: 20 }`

### parseSize

Parses "width, height" string to Size object.

```typescript
function parseSize(size: string | undefined): Size;
```

**Edge cases**:
- `undefined` → `{ width: 20, height: 20 }`
- `"200, 80"` → `{ width: 200, height: 80 }`
- `"0, 0"` → `{ width: 20, height: 20 }` (minimum size enforced)

### formatLabel

Formats the display label for a view.

```typescript
function formatLabel(
  className: string | undefined,
  category: ViewCategory
): string;
```

**Returns**:
- `undefined` → `"Unknown"`
- `("CTextButton", "control")` → `"CTextButton"`
- `("CMyKnob", "custom")` → `"CMyKnob [Custom]"`
