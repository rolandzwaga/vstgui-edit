# Research: Canvas Pan Navigation

**Feature**: 004-canvas-pan
**Date**: 2026-01-05

## Research Topics

### 1. Pan Gesture Implementation in SolidJS

**Decision**: Use mouse events on canvas wrapper with CSS transform for offset

**Rationale**:
- Mouse events (mousedown, mousemove, mouseup) are well-supported across browsers
- CSS `transform: translate(x, y)` is GPU-accelerated for smooth 60fps panning
- SolidJS signals provide fine-grained reactivity without virtual DOM overhead
- Transform approach doesn't affect SVG internal coordinate system

**Alternatives Considered**:
1. **SVG viewBox manipulation**: Rejected - changes coordinate system, complicates child element positioning
2. **Scroll container**: Rejected - requires fixed bounds, conflicts with "unlimited pan" requirement
3. **Canvas wrapper transform**: Selected - clean separation, performant, unlimited range

### 2. Middle-Mouse Button Detection

**Decision**: Use `event.button === 1` for middle-click detection

**Rationale**:
- `button` property: 0=left, 1=middle, 2=right (standard across browsers)
- `buttons` property for tracking held buttons during drag
- Works on all major browsers (Chrome, Firefox, Safari, Edge)

**Implementation Pattern**:
```typescript
onMouseDown={(e) => {
  if (e.button === 1) {
    e.preventDefault(); // Prevent auto-scroll
    startPan(e.clientX, e.clientY);
  }
}}
```

### 3. Space+Drag Detection

**Decision**: Track Space key state with keydown/keyup events, combine with left-click

**Rationale**:
- Need global keydown/keyup listeners (document level) for reliable Space detection
- Left-click (`e.button === 0`) combined with spaceHeld signal
- Must prevent default Space behavior (scroll) when over canvas

**Implementation Pattern**:
```typescript
const [spaceHeld, setSpaceHeld] = createSignal(false);

// Global listeners on mount
onMount(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setSpaceHeld(true);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  // cleanup in onCleanup
});
```

### 4. Cursor Feedback

**Decision**: Use CSS cursor property with grab/grabbing values via CSS Modules

**Rationale**:
- Native cursor values `grab` and `grabbing` are well-supported
- CSS Modules provide scoped class names
- Conditional class application in SolidJS: `class={styles.grabbing}` or `classList`

**CSS Pattern**:
```css
.canvasWrapper {
  cursor: default;
}

.canvasWrapper.spaceHeld {
  cursor: grab;
}

.canvasWrapper.panning {
  cursor: grabbing;
}
```

### 5. Pan State Structure

**Decision**: Create canvasStore with pan offset and gesture tracking

**Rationale**:
- Separate store allows testing in isolation
- Reusable for future zoom feature (same transform approach)
- Clean separation between UI events and state management

**State Shape**:
```typescript
interface CanvasState {
  panOffset: { x: number; y: number };
  isPanning: boolean;
  panStart: { x: number; y: number } | null;
}
```

### 6. Event Handling During Pan

**Decision**: Attach mousemove/mouseup to document during pan

**Rationale**:
- Mouse can leave canvas wrapper during drag
- Document-level listeners ensure pan continues outside component bounds
- Remove listeners on mouseup to prevent memory leaks

**Implementation Pattern**:
```typescript
const startPan = (clientX: number, clientY: number) => {
  setIsPanning(true);
  setPanStart({ x: clientX, y: clientY });

  document.addEventListener('mousemove', handlePanMove);
  document.addEventListener('mouseup', handlePanEnd);
};

const handlePanEnd = () => {
  setIsPanning(false);
  document.removeEventListener('mousemove', handlePanMove);
  document.removeEventListener('mouseup', handlePanEnd);
};
```

## Existing Code Analysis

### Canvas Component (src/components/Canvas/Canvas.tsx)

Current structure:
- Renders SVG inside `canvasWrapper` div
- Uses `createMemo` for computed values
- Template bounds set width/height on wrapper
- No existing pan/zoom functionality

**Integration Point**: Add pan handlers to `canvasWrapper` div, apply transform style

### Canvas Types (src/types/canvas.ts)

Current types: `ViewCategory`, `Point`, `Size`, `RenderableView`, `TemplateBounds`

**Addition**: `PanState` interface for type safety

## No External Dependencies Required

All functionality implemented with:
- Native browser APIs (mouse events, keyboard events)
- SolidJS primitives (createSignal, onMount, onCleanup)
- CSS (cursor, transform)

No new npm packages needed.
