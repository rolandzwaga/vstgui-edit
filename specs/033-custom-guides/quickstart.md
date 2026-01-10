# Quickstart: Custom Guides

**Feature**: 033-custom-guides
**Date**: 2026-01-10

## Overview

Custom guides are persistent alignment reference lines that users create by dragging from rulers. They provide visual reference and snap functionality during view move/resize operations.

## Key Concepts

### Guide Types
- **Horizontal guides**: Fixed Y position, span full canvas width, created from top ruler
- **Vertical guides**: Fixed X position, span full canvas height, created from left ruler

### Visual Style
- Color: Cyan (#00BFFF)
- Stroke: 1px dashed (4px dash pattern)
- Constant screen-space thickness regardless of zoom

### Keyboard Shortcuts
- `Ctrl+;` - Toggle guide visibility

## Usage Patterns

### Creating a Guide

```typescript
// From component (with history for undo/redo)
import { addGuideWithHistory } from '../stores/guidesStore';

// Create horizontal guide at Y=100
addGuideWithHistory('horizontal', 100);

// Create vertical guide at X=200
addGuideWithHistory('vertical', 200);
```

### Reading Guide State

```typescript
import { guidesStore } from '../stores/guidesStore';
import { createMemo } from 'solid-js';

// Access reactive state via getters
const isVisible = () => guidesStore.isVisible;
const allGuides = () => guidesStore.guides;

// Filtered access
const hGuides = () => guidesStore.horizontalGuides;
const vGuides = () => guidesStore.verticalGuides;

// Find specific guide
const guide = guidesStore.getGuideById('guide-123');
```

### Toggling Visibility

```typescript
import { toggleGuidesVisibility } from '../stores/guidesStore';

// Toggle on keyboard shortcut
function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === ';') {
    event.preventDefault();
    toggleGuidesVisibility();
  }
}
```

### Snapping to Guides

```typescript
import { applySnapToMoveWithGuides } from '../domain/guides';
import { guidesStore, gridStore } from '../stores';

// During move operation
const result = applySnapToMoveWithGuides(
  currentOrigins,
  anchorViewId,
  gridStore.size,
  guidesStore.guides,
  gridStore.snapThreshold,
  gridStore.isSnapEnabled,
  guidesStore.isSnapEnabled
);

// result contains:
// - snappedOrigins: New positions for all views
// - snapDelta: Amount of snap adjustment
// - didSnap: Whether snapping occurred
// - snappedGuideIds: IDs of guides that were snapped to
```

### Drag-to-Create Flow

```typescript
import {
  startCreationDrag,
  updateCreationDrag,
  completeCreationDrag,
  cancelCreationDrag
} from '../stores/guidesStore';

// In HorizontalRuler mousedown handler
function handleMouseDown(event: MouseEvent) {
  const canvasY = screenToCanvasCoordinates(...).y;
  startCreationDrag('horizontal', canvasY);
}

// In document mousemove handler
function handleMouseMove(event: MouseEvent) {
  const canvasY = screenToCanvasCoordinates(...).y;
  const isOverCanvas = isPointInCanvasViewport(event.clientX, event.clientY);
  updateCreationDrag(canvasY, isOverCanvas);
}

// In document mouseup handler
function handleMouseUp() {
  const guide = completeCreationDrag(); // Returns guide or null if cancelled
}

// On Escape key
function handleEscape() {
  cancelCreationDrag();
}
```

### Deleting Guides

```typescript
import { deleteGuideWithHistory, clearAllGuidesWithHistory } from '../stores/guidesStore';

// Delete single guide
deleteGuideWithHistory('guide-123');

// Clear all guides
clearAllGuidesWithHistory();

// Delete by double-click (in component)
function handleDoubleClick(guideId: string) {
  deleteGuideWithHistory(guideId);
}
```

### Repositioning Guides

```typescript
import {
  startRepositionDrag,
  updateRepositionDrag,
  completeRepositionDrag,
  cancelRepositionDrag
} from '../stores/guidesStore';

// Start drag on guide click
function handleGuideMouseDown(guideId: string, currentPosition: number) {
  startRepositionDrag(guideId, currentPosition);
}

// During drag
function handleMouseMove(newPosition: number, isOverRuler: boolean) {
  updateRepositionDrag(newPosition, isOverRuler);
}

// Complete drag
function handleMouseUp() {
  const result = completeRepositionDrag();
  // result: 'repositioned' | 'deleted' | 'cancelled'
}
```

## Component Integration

### GuidesOverlay

Add to Canvas component's SVG:

```tsx
import { GuidesOverlay } from './Guides/GuidesOverlay';

function Canvas() {
  return (
    <svg>
      {/* ... other canvas content ... */}
      <GuidesOverlay />
      {/* ... selection overlays ... */}
    </svg>
  );
}
```

### Ruler Modifications

HorizontalRuler and VerticalRuler need mousedown handlers:

```tsx
// HorizontalRuler.tsx
<div
  class={styles.ruler}
  onMouseDown={handleMouseDown}
  onContextMenu={handleContextMenu}
>
```

## Testing

### Store Tests

```typescript
// guidesStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { guidesStore, addGuide, resetGuidesStore } from '../guidesStore';

describe('guidesStore', () => {
  beforeEach(() => {
    resetGuidesStore();
  });

  it('should add a guide', () => {
    const guide = addGuide('horizontal', 100);
    expect(guide).toBeDefined();
    expect(guidesStore.guides).toHaveLength(1);
  });
});
```

### Component Tests

```typescript
// GuideLine.spec.tsx
import { render } from '@solidjs/testing-library';
import { GuideLine } from '../GuideLine';

describe('GuideLine', () => {
  it('should render horizontal guide', () => {
    const { getByTestId } = render(() => (
      <svg>
        <GuideLine
          guide={{ id: 'g1', orientation: 'horizontal', position: 100 }}
        />
      </svg>
    ));
    expect(getByTestId('guide-line-g1')).toBeInTheDocument();
  });
});
```

## File Structure

```
src/
├── types/guides.ts           # Type definitions
├── stores/guidesStore.ts     # State management
├── domain/guides/
│   ├── index.ts              # Barrel export
│   ├── guideOperations.ts    # CRUD logic
│   ├── guideSnap.ts          # Snap calculations
│   └── historyOperations.ts  # Undo/redo factories
└── components/Canvas/Guides/
    ├── GuideLine.tsx         # Single guide renderer
    ├── GuidesOverlay.tsx     # All guides container
    └── GuidePreview.tsx      # Preview during creation
```

## Common Patterns

### Check if Snapping to Guides is Active

```typescript
const canSnapToGuides = () =>
  guidesStore.isVisible && guidesStore.isSnapEnabled;
```

### Get Guides for Snap Calculation

```typescript
const guidesForSnap = () =>
  guidesStore.isSnapEnabled ? guidesStore.guides : [];
```

### Handle Guide-Related Keyboard Events

```typescript
function handleKeyDown(event: KeyboardEvent) {
  // Toggle visibility
  if (event.ctrlKey && event.key === ';') {
    event.preventDefault();
    toggleGuidesVisibility();
    return;
  }

  // Cancel guide operations on Escape
  if (event.key === 'Escape') {
    if (guidesStore.creationDrag) {
      cancelCreationDrag();
    }
    if (guidesStore.repositionDrag) {
      cancelRepositionDrag();
    }
  }
}
```
