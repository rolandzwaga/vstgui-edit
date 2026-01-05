# Data Model: Canvas Rendering

**Feature**: 003-canvas-rendering
**Date**: 2026-01-05

## Core Types

### ViewCategory

Classification of VSTGUI view classes for visual styling.

```typescript
type ViewCategory = 'container' | 'control' | 'display' | 'custom';
```

| Category | View Classes | Color Scheme |
|----------|--------------|--------------|
| container | CView, CViewContainer, CLayeredViewContainer, CRowColumnView, CScrollView, CSplitView, CShadowViewContainer, UIViewSwitchContainer | Blue tint |
| control | CControl, CTextEdit, CSearchTextEdit, CTextButton, COnOffButton, CCheckBox, CSegmentButton, CKickButton, CRockerSwitch, CVerticalSwitch, CHorizontalSwitch, CMovieButton, CKnob, CAnimKnob, CSlider, CXYPad, COptionMenu | Green tint |
| display | CTextLabel, CMultiLineTextLabel, CParamDisplay, CVuMeter, CGradientView, CMovieBitmap, CAutoAnimation, CAnimationSplashScreen, CStringListControl | Purple tint |
| custom | Any class not in above lists | Gray (neutral) |

### Point

Parsed coordinate value from uidesc "x, y" format.

```typescript
interface Point {
  x: number;
  y: number;
}
```

**Defaults**: `{ x: 0, y: 0 }` when origin attribute is missing.

### Size

Parsed dimension value from uidesc "width, height" format.

```typescript
interface Size {
  width: number;
  height: number;
}
```

**Defaults**: `{ width: 20, height: 20 }` when size attribute is missing.

### RenderableView

Pre-computed view data ready for rendering. This is the key abstraction that separates domain logic from rendering implementation.

```typescript
interface RenderableView {
  /** Unique identifier for the view (from uidesc key or generated) */
  id: string;

  /** Absolute X position in canvas coordinates (parent origin + child origin) */
  absoluteX: number;

  /** Absolute Y position in canvas coordinates */
  absoluteY: number;

  /** View width in pixels */
  width: number;

  /** View height in pixels */
  height: number;

  /** Display label: class name, or "ClassName [Custom]" for unknown classes */
  label: string;

  /** Category for styling purposes */
  category: ViewCategory;

  /** Render order (0 = bottom, higher = on top). Based on hierarchy traversal order. */
  zIndex: number;
}
```

### TemplateBounds

Dimensions of the template root view for rendering the bounds indicator.

```typescript
interface TemplateBounds {
  width: number;
  height: number;
}
```

## Input Data (from documentStore)

The canvas reads from `documentStore.document.templates` which contains:

```typescript
// From src/types/uidesc.d.ts
interface TemplatesDefinition {
  [templateName: string]: ViewDefinition;
}

interface ViewDefinition {
  attributes: ViewAttributes;
  children?: {
    [key: string]: ViewDefinition;
  };
}

interface ViewAttributes {
  class?: ViewClass;        // e.g., "CViewContainer"
  origin?: PointValue;      // e.g., "50, 100"
  size?: SizeValue;         // e.g., "200, 80"
  // ... other attributes not used for rendering
}
```

## Data Transformations

### 1. Template Selection

```
Input:  documentStore.document.templates (TemplatesDefinition)
Output: ViewDefinition (first template's root view)
Logic:  Object.values(templates)[0] ?? null
```

### 2. Hierarchy Flattening

```
Input:  ViewDefinition (root), parentX: number, parentY: number, startZIndex: number
Output: RenderableView[]
Logic:
  1. Parse root's origin → add to parentX, parentY for absoluteX, absoluteY
  2. Parse root's size → width, height (default 20x20)
  3. Classify root's class → category
  4. Format label (add [Custom] if custom category)
  5. Create RenderableView for root
  6. Recursively process children (incrementing zIndex)
  7. Return flat array in render order (parent before children, siblings in declaration order)
```

### 3. View Category Classification

```
Input:  className: string | undefined
Output: ViewCategory
Logic:
  - If className in CONTAINER_CLASSES → 'container'
  - If className in CONTROL_CLASSES → 'control'
  - If className in DISPLAY_CLASSES → 'display'
  - Otherwise → 'custom'
```

### 4. Coordinate Parsing

```
Input:  origin: string | undefined (e.g., "50, 100")
Output: Point { x: number, y: number }
Logic:
  - If undefined → { x: 0, y: 0 }
  - Split by comma, trim, parse as integers
  - Handle negative values
```

### 5. Size Parsing

```
Input:  size: string | undefined (e.g., "200, 80")
Output: Size { width: number, height: number }
Logic:
  - If undefined → { width: 20, height: 20 }
  - Split by comma, trim, parse as integers
  - Enforce minimum 1x1
```

### 6. Label Formatting

```
Input:  className: string | undefined, category: ViewCategory
Output: string
Logic:
  - If no className → "Unknown"
  - If category === 'custom' → `${className} [Custom]`
  - Otherwise → className
```

## State Dependencies

The canvas rendering is reactive to:

| Signal/Store | Triggers |
|--------------|----------|
| `documentStore.document` | Full re-render when document changes |
| `documentStore.document.templates` | Re-render when templates change |

## Validation Rules

| Field | Rule | Default |
|-------|------|---------|
| origin | Must parse as "x, y" integers | "0, 0" |
| size | Must parse as "w, h" positive integers | "20, 20" |
| class | Any string (unknown = custom category) | undefined |
