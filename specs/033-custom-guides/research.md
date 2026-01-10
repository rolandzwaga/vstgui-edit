# Research: Custom Guides

**Feature**: 033-custom-guides
**Date**: 2026-01-10
**Status**: Complete

## Research Questions

### 1. How should guide snap integrate with existing grid snap?

**Decision**: Extend snap functions to accept optional guide positions

**Rationale**: The existing `snap.ts` module provides `snapToGrid`, `applySnapToMove`, and `applySnapToResize`. Rather than replacing these, we add a new `snapToGuides` function and a composite `snapToNearest` that considers both grid and guides, returning whichever is closer.

**Alternatives considered**:
- Replace snap.ts entirely: Rejected - breaks existing tests, unnecessary refactoring
- Add guide snapping directly in components: Rejected - violates separation of concerns
- Use smartGuides infrastructure: Rejected - smartGuides are ephemeral (calculated during drag), custom guides are persistent

**Implementation pattern**:
```typescript
// domain/guides/guideSnap.ts
export function snapToGuide(
  value: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number
): SnapResult { ... }

export function snapToNearest(
  value: number,
  gridSize: number,
  guides: CustomGuide[],
  orientation: GuideOrientation,
  threshold: number,
  gridEnabled: boolean,
  guidesEnabled: boolean
): SnapResult { ... }
```

### 2. How should drag-from-ruler be implemented?

**Decision**: Add mouseDown handler to ruler components, track drag state in guidesStore

**Rationale**: The existing HorizontalRuler and VerticalRuler components already render in the ruler area. Adding mousedown handlers to detect drag start, then tracking via a `guideCreationDrag` state in guidesStore, follows established patterns (see dragStore for view dragging).

**Alternatives considered**:
- Create separate drag zones overlaying rulers: Rejected - adds complexity, harder to maintain
- Use native HTML5 drag-and-drop: Rejected - not suitable for precise pixel positioning
- Track in component-local state: Rejected - need global state for cross-component coordination

**Implementation pattern**:
```typescript
// stores/guidesStore.ts
interface GuideCreationDrag {
  orientation: GuideOrientation;
  currentPosition: number;  // Canvas coordinate
  isOverCanvas: boolean;    // Valid drop target
}

const [creationDrag, setCreationDrag] = createSignal<GuideCreationDrag | null>(null);
```

### 3. How should guides render at constant screen-space thickness during zoom?

**Decision**: Use SVG stroke-width with inverse zoom scaling

**Rationale**: When zooming, the SVG viewBox scales content. To maintain 1px visual thickness, the stroke-width must be `1 / zoomLevel`. This matches the pattern used for selection overlays.

**Alternatives considered**:
- Use CSS transforms separate from SVG: Rejected - complicates coordinate mapping
- Use HTML div overlays: Rejected - must integrate with SVG canvas coordinate system
- Use fixed-size pattern: Rejected - breaks visual consistency at different zoom levels

**Implementation pattern**:
```typescript
// GuideLine.tsx
const strokeWidth = createMemo(() => 1 / canvasStore.zoomLevel);
const dashArray = createMemo(() => `${4 / canvasStore.zoomLevel} ${4 / canvasStore.zoomLevel}`);
```

### 4. How should undo/redo for guide operations work?

**Decision**: Create HistoryOperation factories in domain/guides/historyOperations.ts

**Rationale**: The existing historyStore and HistoryOperation pattern handles undo/redo. Guide operations (create, delete, reposition, clear all) each get a factory function that captures before/after state in closures.

**Alternatives considered**:
- Extend HistoryOperation type union: Required - add guide operation types
- Use command pattern with separate command classes: Rejected - overkill, existing closure pattern works
- Store guide state snapshots: Rejected - inefficient for simple operations

**Implementation pattern**:
```typescript
// types/history.ts - add to type union:
| 'guide-create'
| 'guide-delete'
| 'guide-reposition'
| 'guide-clear-all'

// domain/guides/historyOperations.ts
export function createGuideCreateOperation(guide: CustomGuide): HistoryOperation { ... }
export function createGuideDeleteOperation(guide: CustomGuide): HistoryOperation { ... }
export function createGuideRepositionOperation(
  id: string,
  oldPosition: number,
  newPosition: number
): HistoryOperation { ... }
export function createGuideClearAllOperation(guides: CustomGuide[]): HistoryOperation { ... }
```

### 5. How should guide visibility toggle work?

**Decision**: Add `isVisible` signal to guidesStore, hide guides and disable snapping when false

**Rationale**: Follows gridStore pattern which has `isVisible` for grid overlay visibility. Hidden guides should not participate in snapping (per spec FR-013).

**Implementation pattern**:
```typescript
// stores/guidesStore.ts
const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [isSnapEnabled, setIsSnapEnabled] = createSignal<boolean>(true);

// Visibility determines both rendering and snap behavior
export const guidesStore = {
  get isVisible() { return isVisible(); },
  get isSnapEnabled() { return isSnapEnabled() && isVisible(); }, // Hidden = no snap
};
```

### 6. How should duplicate guides be prevented?

**Decision**: Check position before adding, return existing guide if at same position

**Rationale**: Per FR-020, duplicate guides at exact same position should not be created. The addGuide function checks existing guides and skips if position matches.

**Implementation pattern**:
```typescript
// stores/guidesStore.ts
export function addGuide(orientation: GuideOrientation, position: number): CustomGuide | null {
  const existing = guides().find(
    g => g.orientation === orientation && g.position === position
  );
  if (existing) return existing; // No duplicate

  const guide: CustomGuide = { id: generateId(), orientation, position };
  setGuides(prev => [...prev, guide]);
  return guide;
}
```

### 7. How should guide deletion by drag-to-ruler work?

**Decision**: Track reposition drag, detect when cursor returns to source ruler

**Rationale**: Per FR-015, dragging a guide back to its source ruler deletes it. During reposition drag, check if cursor Y (for horizontal guide) or X (for vertical guide) is within ruler bounds.

**Implementation pattern**:
```typescript
// In drag handler
const rulerBounds = {
  horizontal: { minY: 0, maxY: RULER_THICKNESS },
  vertical: { minX: 0, maxX: RULER_THICKNESS }
};

if (guide.orientation === 'horizontal' && screenY < RULER_THICKNESS) {
  // Dropped on horizontal ruler - delete
  deleteGuide(guide.id);
} else if (guide.orientation === 'vertical' && screenX < RULER_THICKNESS) {
  // Dropped on vertical ruler - delete
  deleteGuide(guide.id);
}
```

### 8. How should context menu for precise positioning work?

**Decision**: Use native browser context menu via onContextMenu handler

**Rationale**: Per assumption, native browser context menu styling is acceptable. Use window.prompt for numeric input (simple, no new UI component needed).

**Alternatives considered**:
- Custom floating menu component: Rejected - not in current component library, adds scope
- Floating-ui dropdown: Could work but adds complexity for simple use case
- Keyboard shortcut with modal: Rejected - changes expected UX pattern

**Implementation pattern**:
```typescript
// HorizontalRuler.tsx
function handleContextMenu(event: MouseEvent) {
  event.preventDefault();
  const canvasY = screenToCanvasCoordinates(...).y;
  const input = window.prompt('Enter guide position:', String(Math.round(canvasY)));
  if (input !== null) {
    const position = parseInt(input, 10);
    if (!isNaN(position)) {
      addGuideWithHistory('horizontal', position);
    }
  }
}
```

### 9. What CSS token should be used for guide color?

**Decision**: Add `--color-custom-guide: #00BFFF` to tokens.css

**Rationale**: Per clarification, guides use cyan (#00BFFF) with 1px dashed line. This distinguishes from smart guides (magenta #ff00ff) and grid (neutral grays).

**Implementation**:
```css
/* src/styles/tokens.css */
--color-custom-guide: #00bfff;
```

### 10. How should keyboard shortcut Ctrl+; be handled?

**Decision**: Add to existing keyboard handler in editor, toggle guidesStore.isVisible

**Rationale**: The editor already has keyboard shortcut handling. Add Ctrl+; to toggle guide visibility.

**Implementation pattern**:
```typescript
// In keyboard handler (likely Canvas or EditorPage)
if (event.ctrlKey && event.key === ';') {
  event.preventDefault();
  toggleGuidesVisibility();
}
```

## Dependencies

| Dependency | Purpose | Already Exists |
|------------|---------|---------------|
| SolidJS signals | State management | Yes |
| historyStore | Undo/redo | Yes |
| coordinateMapping.ts | Screen/canvas conversion | Yes |
| canvasStore | Pan/zoom state | Yes |
| gridStore pattern | Store structure reference | Yes (pattern only) |
| RULER_THICKNESS | Constant for ruler detection | Yes |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Snap performance with many guides | Low | Medium | Limit to 50 guides, O(n) iteration is acceptable |
| Coordinate mapping edge cases | Medium | Low | Comprehensive tests, reuse existing coordinateMapping.ts |
| Z-order issues with overlapping guides | Low | Low | Guides render above content, below selection |
| Drag-to-ruler detection accuracy | Medium | Low | Use generous threshold, visual feedback during drag |

## Conclusion

All research questions resolved. No blocking issues identified. Implementation can proceed with:
1. Types definition (types/guides.ts)
2. Store implementation (stores/guidesStore.ts)
3. Domain functions (domain/guides/)
4. Components (components/Canvas/Guides/)
5. Ruler modifications (add drag handlers)
6. Keyboard shortcut integration
