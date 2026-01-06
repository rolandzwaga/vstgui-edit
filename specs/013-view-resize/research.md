# Research: View Resize

**Feature**: 013-view-resize  
**Date**: 2026-01-06

## Research Summary

No external research required. All patterns are established in the codebase from 012-view-move.

## Decisions

### 1. Resize Store Pattern

**Decision**: Follow dragStore pattern - use SolidJS signals for transient resize state.

**Rationale**: Proven pattern from 012-view-move. Signals provide fine-grained reactivity for 60fps preview updates.

**Alternatives Considered**:
- createStore: Overkill for flat state structure
- Props drilling: Breaks encapsulation

### 2. Handle Event Binding

**Decision**: Add mousedown handlers to SelectionOverlay handle circles, bubble to Canvas for unified event handling.

**Rationale**: Consistent with existing Canvas event architecture. Canvas already handles mouseup/mousemove globally.

**Alternatives Considered**:
- Separate resize handler component: Unnecessary complexity
- Event delegation via data attributes: Less explicit

### 3. Resize Calculation Strategy

**Decision**: Calculate new bounds (origin + size) based on handle position and delta from drag start.

**Rationale**: Standard UI resize algorithm. Handle position determines which edges move.

| Handle | Affected Edges | Origin Changes | Size Changes |
|--------|---------------|----------------|--------------|
| nw | top, left | x, y | width, height |
| n | top | y | height |
| ne | top, right | y | width, height |
| e | right | - | width |
| se | bottom, right | - | width, height |
| s | bottom | - | height |
| sw | bottom, left | x | width, height |
| w | left | x | width |

### 4. Aspect Ratio Lock Algorithm

**Decision**: When Shift held, adjust the constrained dimension to maintain original aspect ratio.

**Rationale**: Standard behavior in design tools (Figma, Sketch, Adobe).

**Algorithm**:
```
originalRatio = originalWidth / originalHeight
if (corner handle):
  if (abs(deltaX) > abs(deltaY)):
    newHeight = newWidth / originalRatio
  else:
    newWidth = newHeight * originalRatio
```

### 5. Center Resize Algorithm

**Decision**: When Alt held, mirror delta to opposite corner/edge.

**Rationale**: Standard behavior in design tools.

**Algorithm**:
```
if (Alt held):
  origin.x -= deltaX
  origin.y -= deltaY
  size.width += deltaX * 2
  size.height += deltaY * 2
```

### 6. Minimum Size Enforcement

**Decision**: Clamp size to 10×10 minimum, adjust origin if needed to prevent negative dimensions.

**Rationale**: Prevents degenerate views, consistent with industry standard minimum sizes.

### 7. History Integration

**Decision**: Use existing historyStore.pushOperation with ResizeOperation type.

**Rationale**: Reuse existing infrastructure. Resize operation stores original and new origin/size for undo/redo.

### 8. Ghost Preview

**Decision**: Follow DragPreview pattern - SVG rect with 50% opacity and dashed stroke.

**Rationale**: Consistent visual language with move preview.

### 9. Dimension Indicator

**Decision**: Floating text element near cursor showing "width×height" during resize.

**Rationale**: User requested in spec (FR-013). Common in design tools.

## No External Dependencies Required

All functionality can be implemented using existing SolidJS primitives and project patterns.
