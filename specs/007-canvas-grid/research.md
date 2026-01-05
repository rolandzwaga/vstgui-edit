# Research: Canvas Grid System

**Feature**: 007-canvas-grid
**Date**: 2026-01-05

## Research Summary

Minimal research required - patterns are well-established in existing codebase.

## Decisions

### 1. Grid Rendering Technology

**Decision**: SVG `<pattern>` element with `<rect>` fill

**Rationale**:
- Project already uses SVG for canvas rendering (Canvas.tsx)
- Pattern element is GPU-accelerated, optimal for repeating graphics
- Single DOM element regardless of grid size (vs. hundreds of lines)
- Native support for transforms (inherits pan/zoom)

**Alternatives Considered**:
- HTML Canvas 2D API - requires manual redraw, more code complexity
- CSS background gradient - poor support for dots/crosshairs styles
- Individual SVG lines - performance degradation at high zoom

### 2. State Management Pattern

**Decision**: Separate `gridStore` using SolidJS `createSignal`

**Rationale**:
- Follows existing `canvasStore` pattern (pan/zoom state)
- Single responsibility - grid state separate from canvas navigation
- Simple signals sufficient (no nested state)
- Reactive updates without manual subscriptions

**Alternatives Considered**:
- Merge into canvasStore - violates single responsibility
- SolidJS createStore - overkill for flat state structure

### 3. Theme Color Strategy

**Decision**: CSS custom properties with semantic names

**Rationale**:
- Project already uses `tokens.css` for design tokens
- CSS custom properties support dark/light mode via media queries
- No JavaScript required for theme switching
- Consistent with existing styling approach

**Token Names**:
```css
--color-grid-minor: /* subtle grid lines */
--color-grid-major: /* prominent 5th lines */
```

### 4. Keyboard Shortcut Integration

**Decision**: Extend existing `handleKeyDown` in Canvas.tsx

**Rationale**:
- Existing pattern handles zoom shortcuts (+, -, 0, F)
- Same keyboard filter logic applies (ignore in text inputs)
- Same modifier key handling (ignore Ctrl/Cmd/Alt)
- Centralized keyboard handling

### 5. Toolbar Architecture

**Decision**: MainToolbar container with ZoomToolbar + GridToolbar children

**Rationale**:
- Per clarification: separate GridToolbar component
- MainToolbar provides consistent layout/spacing
- Each toolbar remains independently testable
- Clean separation of concerns

## Best Practices Applied

### SolidJS Patterns
- Use `createSignal` for simple reactive state
- Props accessed via `props.name` (no destructuring)
- Components run once, signals track automatically
- Use `createMemo` for derived values if needed

### Testing Patterns
- Follow TESTING-GUIDE.md for SolidJS-specific patterns
- Co-locate tests in `__tests__/` directories
- Mock stores for component isolation
- Test keyboard events with fireEvent.keyDown

### CSS Module Patterns
- Co-locate `.module.css` with component
- Use design tokens from `tokens.css`
- Follow existing button/toolbar styles from ZoomToolbar

## External References

- [SVG Pattern Element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern) - MDN documentation
- [SolidJS Signals](https://www.solidjs.com/docs/latest/api#createsignal) - Official docs
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - MDN

## Open Questions

None - all technical decisions resolved through existing patterns.
