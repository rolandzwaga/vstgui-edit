# Quickstart: Smart Guides

**Feature**: 015-smart-guides  
**Date**: 2026-01-07

## Overview

Smart guides show visual alignment lines when dragging views near sibling edges, centers, or parent centers. They provide visual feedback only - grid snap handles actual positioning.

## Key Files

| File | Purpose |
|------|---------|
| `src/types/smartGuides.ts` | Type definitions |
| `src/stores/smartGuidesStore.ts` | State management |
| `src/domain/canvas/smartGuides.ts` | Calculation utilities |
| `src/components/Canvas/SmartGuideLines.tsx` | SVG rendering |
| `src/hooks/canvas/useCanvasKeyboard.ts` | S key toggle |
| `src/hooks/canvas/useCanvasInteractions.ts` | Guide calculation trigger |
| `src/styles/tokens.css` | Guide color tokens |

## Usage

### Toggle Smart Guides

```typescript
import { smartGuidesStore, toggleSmartGuides } from './stores/smartGuidesStore';

// Check if enabled
if (smartGuidesStore.isEnabled) {
  // Smart guides will show during drag
}

// Toggle via keyboard: S key
// Toggle programmatically:
toggleSmartGuides();
```

### Calculate Guides During Drag

```typescript
import { calculateSmartGuides } from './domain/canvas/smartGuides';
import { setActiveGuides, clearActiveGuides } from './stores/smartGuidesStore';

// During drag move
const draggedBounds = getViewBounds(draggedViewId, currentOrigin);
const siblings = getSiblingViews(draggedViewId);
const parentBounds = getParentBounds(draggedViewId);

const guides = calculateSmartGuides(draggedBounds, siblings, parentBounds);
setActiveGuides(guides);

// On drag end
clearActiveGuides();
```

### Render Guides

```tsx
import { SmartGuideLines } from './components/Canvas/SmartGuideLines';

// In Canvas component
<svg>
  {/* ... other canvas elements ... */}
  <SmartGuideLines />
</svg>
```

## API Reference

### smartGuidesStore

```typescript
interface SmartGuidesState {
  isEnabled: boolean;        // Whether guides are enabled (default: true)
  activeGuides: SmartGuide[]; // Guides to render during drag
}
```

### Store Actions

| Action | Description |
|--------|-------------|
| `toggleSmartGuides()` | Toggle enabled state |
| `setSmartGuidesEnabled(enabled: boolean)` | Set enabled state |
| `setActiveGuides(guides: SmartGuide[])` | Set guides during drag |
| `clearActiveGuides()` | Clear all guides |
| `resetSmartGuides()` | Reset to defaults |

### Calculation Functions

| Function | Description |
|----------|-------------|
| `calculateSmartGuides(dragged, siblings, parent)` | Calculate all alignment guides |
| `findEdgeAlignments(dragged, siblings)` | Find edge-to-edge alignments |
| `findCenterAlignments(dragged, siblings)` | Find center-to-center alignments |
| `findParentCenterGuides(dragged, parent)` | Find parent center alignments |
| `findSpacingGuides(dragged, siblings)` | Find equal spacing guides |
| `getViewBounds(view)` | Convert RenderableView to ViewBounds |

## Keyboard Shortcut

| Key | Action |
|-----|--------|
| `S` | Toggle smart guides on/off |

## Visual Appearance

- **Color**: Magenta (`#ff00ff`) - distinct from grid, selection, and view borders
- **Style**: 1px solid line
- **Extent**: Full canvas viewport (not just between aligned views)
- **Spacing labels**: Distance in pixels shown on spacing guides

## Integration Points

1. **useCanvasInteractions.ts**: Calculate guides in `handleDragMove`
2. **useCanvasKeyboard.ts**: Handle S key for toggle
3. **Canvas.tsx**: Render `SmartGuideLines` component
4. **GridToolbar.tsx**: Optional UI toggle (if time permits)

## Testing

```bash
# Run smart guides tests
npm test -- --grep "smartGuides"

# Run all tests
npm test
```

## Common Patterns

### Check alignment within threshold

```typescript
const isAligned = Math.abs(edge1 - edge2) <= GUIDE_THRESHOLD;
```

### Get bounds from RenderableView

```typescript
function getViewBounds(view: RenderableView): ViewBounds {
  return {
    id: view.id,
    left: view.absoluteX,
    right: view.absoluteX + view.width,
    top: view.absoluteY,
    bottom: view.absoluteY + view.height,
    centerX: view.absoluteX + view.width / 2,
    centerY: view.absoluteY + view.height / 2,
  };
}
```
