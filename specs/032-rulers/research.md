# Research: Canvas Rulers

**Feature**: 032-rulers | **Date**: 2026-01-10

## Research Questions

### 1. Tick Interval Scaling Algorithm

**Decision**: Power-of-2 scaling with base 100px intervals

**Rationale**: The spec mandates base 100px major intervals at 100% zoom with minor ticks every 10px. As zoom changes, intervals should scale by powers of 2 to maintain readability (minimum 30px between numbered ticks per SC-002).

**Algorithm**:
```typescript
// Calculate the major tick interval based on zoom level
function calculateMajorInterval(zoomLevel: number): number {
  const BASE_INTERVAL = 100; // pixels at 100% zoom
  const MIN_SCREEN_SPACING = 30; // minimum pixels between major ticks on screen

  // Screen-space pixel size of base interval at current zoom
  const screenSpacing = BASE_INTERVAL * zoomLevel;

  // Find the power-of-2 multiplier that keeps spacing >= MIN_SCREEN_SPACING
  let interval = BASE_INTERVAL;

  while (interval * zoomLevel < MIN_SCREEN_SPACING) {
    interval *= 2; // Double interval when too crowded
  }

  while (interval * zoomLevel >= MIN_SCREEN_SPACING * 2 && interval > BASE_INTERVAL) {
    interval /= 2; // Halve interval when there's room for more detail
  }

  return interval;
}
```

**Zoom Level Examples**:
| Zoom | Screen Spacing | Major Interval | Minor Interval |
|------|---------------|----------------|----------------|
| 10%  | 10px (too small) | 400px | 40px |
| 25%  | 25px (too small) | 200px | 20px |
| 50%  | 50px | 100px | 10px |
| 100% | 100px | 100px | 10px |
| 200% | 200px | 100px | 10px |
| 400% | 400px | 50px | 5px (more detail) |
| 500% | 500px | 50px | 5px |

**Alternatives Considered**:
- Fixed intervals (rejected: becomes unreadable at extreme zoom)
- Continuous scaling (rejected: inconsistent tick positions, confusing)
- Decimal-based scaling (rejected: power-of-2 is more predictable)

### 2. Ruler Rendering Strategy

**Decision**: HTML-based rulers with CSS positioning (not SVG)

**Rationale**: Rulers occupy fixed screen space and should NOT zoom with the canvas. Using HTML divs with CSS allows:
- Fixed positioning independent of canvas transform
- Simpler text rendering (no SVG text baseline issues)
- CSS custom properties for easy theming
- Better text rendering quality at small font sizes

**Component Structure**:
```
RulerContainer (CSS Grid layout)
├── RulerOrigin (20x20 corner)
├── HorizontalRuler (full width, 20px height)
├── VerticalRuler (20px width, full height)
└── CanvasViewport (remaining space)
```

**Alternatives Considered**:
- SVG rulers (rejected: more complex text rendering, overkill for simple lines/text)
- Canvas 2D (rejected: not needed, harder to style consistently)
- Part of main SVG canvas (rejected: rulers must not scale with zoom)

### 3. Coordinate System Mapping

**Decision**: Screen-space to canvas-space conversion accounting for pan and zoom

**Rationale**: Rulers show canvas coordinates, but cursor position is in screen coordinates. Must convert:

```typescript
function screenToCanvas(
  screenX: number,
  screenY: number,
  panOffset: Point,
  zoomLevel: number,
  rulerOffset: number // 20px for ruler thickness
): Point {
  // Screen position relative to canvas viewport origin
  const relX = screenX - rulerOffset;
  const relY = screenY - rulerOffset;

  // Convert to canvas space
  const canvasX = (relX - panOffset.x) / zoomLevel;
  const canvasY = (relY - panOffset.y) / zoomLevel;

  return { x: canvasX, y: canvasY };
}
```

**Alternatives Considered**:
- Transform matrix approach (rejected: more complex, existing code uses simple math)

### 4. Cursor Indicator Implementation

**Decision**: Accent-colored 1px line spanning ruler with position tooltip

**Rationale**: Per spec clarification, cursor indicator shows:
- 1px accent-colored line spanning full ruler height/width
- Small tooltip showing exact coordinate (e.g., "X: 247")
- Updates in real-time (within 16ms per SC-003)

**Implementation**:
- Use `createSignal` for cursor position in rulerStore
- Update on canvas `mousemove` event
- Use CSS `transform: translateX()` for smooth animation
- Hide via CSS opacity when cursor leaves canvas

**Alternatives Considered**:
- SVG indicator (rejected: HTML div is simpler)
- Repainting ruler on each move (rejected: transform is more performant)

### 5. Template Bounds Indicator

**Decision**: Subtle background shading from 0 to template dimension

**Rationale**: Per spec clarification, template bounds show as a slightly different background color region. This provides visual context for where the template extent is without being distracting.

**Implementation**:
- Calculate template extent in screen space: `extent * zoomLevel + panOffset`
- Render as a div with semi-transparent background
- Clip to visible ruler area (don't extend beyond ruler)

**Alternatives Considered**:
- Border markers (rejected: less visible, harder to see extent at a glance)
- Gradient fade (rejected: unclear boundary)

### 6. Grid Alignment for Ruler Ticks

**Decision**: When grid is enabled, align ticks to grid intervals (FR-015)

**Rationale**: When grid is visible and snap-to-grid is meaningful, ruler ticks should reinforce the grid by aligning to grid intervals.

**Implementation**:
```typescript
function calculateAlignedInterval(
  baseInterval: number,
  gridSize: number,
  gridEnabled: boolean
): number {
  if (!gridEnabled) return baseInterval;

  // Find the nearest grid-aligned interval that maintains readability
  const ratio = baseInterval / gridSize;
  const alignedRatio = Math.max(1, Math.round(ratio));
  return alignedRatio * gridSize;
}
```

**Grid Size Presets**: 5, 8, 10, 12, 16, 20 pixels (from gridStore)

**Alternatives Considered**:
- Always show grid intervals regardless of zoom (rejected: becomes unreadable)
- Show both grid and standard ticks (rejected: visual clutter)

### 7. Performance Considerations

**Decision**: Memoize tick calculations, limit DOM elements

**Rationale**: Performance requirements (60fps during pan/zoom, 16ms cursor updates) require optimization:

1. **Memoize tick arrays** with `createMemo`:
   - Depends on: viewport size, zoom level, pan offset, grid settings
   - Only recalculate when these change

2. **Virtual rendering for large ranges**:
   - Only render ticks visible in current viewport
   - Calculate visible range from pan offset and viewport size

3. **CSS transforms for smooth updates**:
   - Ruler background offset uses CSS transform (GPU accelerated)
   - Cursor indicator uses translateX/translateY

**Implementation**:
```typescript
// Memoized tick generation
const visibleTicks = createMemo(() => {
  const { panOffset, zoomLevel } = canvasStore;
  const viewportWidth = containerRef?.clientWidth ?? 0;

  const startCanvas = -panOffset.x / zoomLevel;
  const endCanvas = startCanvas + viewportWidth / zoomLevel;

  return generateTicksInRange(startCanvas, endCanvas, interval);
});
```

### 8. Design Token Integration

**Decision**: Add ruler-specific tokens to tokens.css

**Rationale**: Consistent with existing codebase pattern. Rulers need:
- Background color (neutral)
- Tick line color
- Major/minor tick distinction
- Cursor indicator accent color
- Template bounds shade color
- Font size (--font-size-xs for 10px)

**New Tokens**:
```css
/* Ruler Design Tokens */
--ruler-thickness: 20px;
--ruler-font-size: var(--font-size-xs); /* 0.75rem = 12px, close to 10px */
--ruler-background: var(--color-neutral-100);
--ruler-border-color: var(--color-neutral-300);
--ruler-tick-color: var(--color-neutral-600);
--ruler-tick-major-color: var(--color-neutral-800);
--ruler-label-color: var(--color-neutral-700);
--ruler-cursor-indicator-color: var(--color-primary-500);
--ruler-template-bounds-color: rgba(59, 130, 246, 0.08);
--ruler-origin-background: var(--color-neutral-200);
```

### 9. Accessibility Considerations

**Decision**: Rulers are visual aids, not interactive elements

**Rationale**: Rulers provide visual coordinate reference but are not essential for screen reader users. Key considerations:
- Do not add ARIA roles (not interactive)
- Cursor tooltip content is redundant with properties panel
- Color contrast for tick labels meets WCAG 4.5:1

**Future Enhancement**: A future feature (032-custom-guides) may add drag-from-ruler interaction, which would need ARIA support.

## Integration Points

### Existing Stores to Use

| Store | Data Needed | Purpose |
|-------|-------------|---------|
| canvasStore | panOffset, zoomLevel | Coordinate mapping, tick positioning |
| gridStore | size, isVisible | Grid-aligned ticks |
| documentStore | template via templateStore | Template bounds indicator |

### Components to Modify

| Component | Change |
|-----------|--------|
| Canvas.tsx | Wrap with RulerContainer or adjust layout |
| EditorPage | May need layout adjustments if rulers at page level |

### New Store: rulerStore

Simple store for cursor position tracking:
```typescript
interface RulerStoreState {
  cursorPosition: Point | null; // Canvas coordinates
  isVisible: boolean; // Whether cursor is over canvas
}
```

## Resolved Clarifications

| Item | Resolution | Source |
|------|------------|--------|
| Ruler thickness | 20px | Spec clarification |
| Font size | 10px | Spec clarification |
| Major tick base interval | 100px | Spec clarification |
| Minor tick interval | 10px | Spec clarification |
| Interval scaling | Power-of-2 | Spec clarification |
| Cursor indicator style | Accent line + tooltip | Spec clarification |
| Origin indicator | Pan offset coordinates | Spec clarification |
| Template bounds style | Subtle shaded region | Spec clarification |
