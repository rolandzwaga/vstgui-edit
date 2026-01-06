# Data Model: View Selection

**Feature**: 008-view-selection
**Date**: 2026-01-06

## Type Definitions

### Selection Types (`src/types/selection.ts`)

```typescript
/**
 * Handle positions for selection resize handles
 * Visual only in this feature - no resize functionality
 */
export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/**
 * Cursor styles for resize handles
 */
export type HandleCursor =
  | 'nwse-resize'  // NW, SE corners
  | 'nesw-resize'  // NE, SW corners
  | 'ns-resize'    // N, S edges
  | 'ew-resize';   // E, W edges

/**
 * Map handle position to cursor style
 */
export const HANDLE_CURSORS: Record<HandlePosition, HandleCursor> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

/**
 * Dimensions for resize handles
 */
export const HANDLE_SIZE = 8; // pixels

/**
 * Selection state for a single view
 */
export interface ViewSelectionState {
  /** View is in the selected set */
  isSelected: boolean;
  /** View is currently hovered */
  isHovered: boolean;
  /** View is an ancestor of a selected view */
  isParentOfSelected: boolean;
}

/**
 * Point in canvas coordinate space
 */
export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Rectangle bounds in canvas space
 */
export interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tooltip content for hovered view
 */
export interface TooltipContent {
  /** VSTGUI class name (e.g., "CTextButton") */
  className: string;
  /** View dimensions */
  width: number;
  height: number;
}
```

### Extended RenderableView

The existing `RenderableView` type in `src/types/canvas.ts` will be extended:

```typescript
// Addition to existing RenderableView interface
export interface RenderableView {
  // ... existing fields ...

  /** Parent view ID for hierarchy tracking (null for root) */
  parentId: string | null;
}
```

## Store State

### SelectionStore State

```typescript
interface SelectionStoreState {
  /** Set of currently selected view IDs */
  selectedIds: Set<string>;

  /** ID of view currently under mouse cursor (null if none) */
  hoveredId: string | null;

  /** Timestamp when hover started (for tooltip delay) */
  hoverStartTime: number | null;

  /** Whether tooltip should be visible (after delay) */
  showTooltip: boolean;
}
```

### Store Actions

| Action | Parameters | Behavior |
|--------|------------|----------|
| `select(id)` | `viewId: string` | Clear selection, add single view |
| `toggleSelect(id)` | `viewId: string` | Add if not selected, remove if selected |
| `addToSelection(id)` | `viewId: string` | Add without clearing existing |
| `removeFromSelection(id)` | `viewId: string` | Remove single view |
| `selectAll(views)` | `views: RenderableView[]` | Select all provided views |
| `clearSelection()` | none | Remove all from selection |
| `setHovered(id)` | `viewId: string \| null` | Set hovered view, start timer |
| `showTooltipNow()` | none | Force tooltip visible |
| `hideTooltip()` | none | Hide tooltip |

## Utility Functions

### Hit Testing

```typescript
/**
 * Find the topmost view at the given canvas coordinates
 * @param point - Point in canvas coordinate space
 * @param views - Flattened view array (z-order: 0 = bottom)
 * @returns View ID of topmost view at point, or null if no hit
 */
function hitTest(point: CanvasPoint, views: RenderableView[]): string | null;
```

### Coordinate Transform

```typescript
/**
 * Convert mouse event coordinates to canvas space
 * @param mouseX - Mouse X in viewport coordinates
 * @param mouseY - Mouse Y in viewport coordinates
 * @param wrapperRect - Bounding rect of canvas wrapper element
 * @param panOffset - Current pan offset from canvasStore
 * @param zoomLevel - Current zoom level from canvasStore
 * @returns Point in canvas coordinate space
 */
function mouseToCanvas(
  mouseX: number,
  mouseY: number,
  wrapperRect: DOMRect,
  panOffset: { x: number; y: number },
  zoomLevel: number
): CanvasPoint;
```

### Ancestor Lookup

```typescript
/**
 * Get all ancestor view IDs for a given view
 * @param viewId - ID of the view to find ancestors for
 * @param views - Flattened view array with parentId populated
 * @returns Array of ancestor IDs (immediate parent first)
 */
function getAncestorIds(viewId: string, views: RenderableView[]): string[];

/**
 * Get all ancestor IDs for all selected views (deduplicated)
 * @param selectedIds - Set of selected view IDs
 * @param views - Flattened view array
 * @returns Set of all ancestor IDs
 */
function getSelectedAncestors(
  selectedIds: Set<string>,
  views: RenderableView[]
): Set<string>;
```

## Component Props

### SelectionOverlay

```typescript
interface SelectionOverlayProps {
  /** Bounds of the selected view in canvas space */
  bounds: CanvasBounds;
  /** Callback when handle is hovered (for cursor change) */
  onHandleHover?: (position: HandlePosition | null) => void;
}
```

### HoverTooltip

```typescript
interface HoverTooltipProps {
  /** Content to display */
  content: TooltipContent;
  /** Reference element to position relative to */
  referenceElement: HTMLElement | SVGElement;
  /** Whether tooltip is visible */
  isVisible: boolean;
}
```

## State Transitions

### Selection State Machine

```
┌─────────────────┐
│  No Selection   │
│ selectedIds: [] │
└────────┬────────┘
         │ click on view
         ▼
┌─────────────────┐
│ Single Selected │◄──── click on different view
│ selectedIds: [A]│      (replaces selection)
└────────┬────────┘
         │ Shift+click on B
         ▼
┌─────────────────┐
│ Multi Selected  │◄──── Shift+click on C (adds)
│selectedIds:[A,B]│───── Shift+click on A (removes A)
└────────┬────────┘
         │ click without Shift
         ▼
┌─────────────────┐
│ Single Selected │
│ selectedIds: [X]│
└────────┬────────┘
         │ Escape / click empty
         ▼
┌─────────────────┐
│  No Selection   │
└─────────────────┘
```

### Hover State Machine

```
┌─────────────────┐
│   Not Hovered   │
│  hoveredId: null│
└────────┬────────┘
         │ mouseenter view
         ▼
┌─────────────────┐
│    Hovering     │──── mouseleave ────► Not Hovered
│ hoveredId: "A"  │
│ showTooltip:false│
└────────┬────────┘
         │ 500ms delay
         ▼
┌─────────────────┐
│ Tooltip Visible │──── mouseleave ────► Not Hovered
│ showTooltip:true│
└─────────────────┘
```

## Validation Rules

| Rule | Validation |
|------|------------|
| View ID exists | Hit test only returns IDs from view array |
| Selection not empty on selectAll | No-op if views array empty |
| Tooltip delay | 500ms minimum before showing |
| Parent highlight | Only ancestors of selected, not selected views themselves |
