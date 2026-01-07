# Research: Snap to Grid

**Feature**: 014-snap-to-grid
**Date**: 2026-01-07

## Research Tasks Completed

### 1. Snap Calculation Algorithm

**Decision**: Use nearest-grid-line snapping with configurable threshold

**Rationale**: 
- Simple formula: `snappedValue = Math.round(value / gridSize) * gridSize`
- Check distance: `Math.abs(value - snappedValue) <= threshold`
- Only snap if within threshold to avoid "jumpy" behavior

**Alternatives Considered**:
- Always snap (rejected: too restrictive, users need free positioning)
- Snap on release only (rejected: no real-time feedback)

### 2. Integration Points with Existing Code

**Decision**: Integrate snap at the delta calculation level, after drag/resize delta is computed but before applying to view positions

**Rationale**:
- `useCanvasInteractions.ts` already calls `updateDrag()` and `updateResize()` with canvas points
- Snap should be applied to the computed delta/position, not raw mouse coordinates
- Keeps snap logic separate from input handling

**Integration Strategy**:
1. **Move operations**: Apply snap to final position in `handleDragUp` before committing
2. **Resize operations**: Apply snap to edge positions in `updateResize` during drag

### 3. Alt Key Modifier Behavior

**Decision**: Alt key disables snap during both move and resize, coexisting with Alt's center-resize behavior

**Rationale**:
- During move: Alt simply disables snap (no conflict)
- During resize: Alt triggers both center-resize AND disables snap
- This is intuitive: Alt = "fine control mode"

**Implementation**:
- Check `e.altKey` in drag/resize handlers
- Pass `skipSnap: boolean` to snap functions
- When Alt held, skip snap calculation entirely

### 4. Multi-View Move Snapping Strategy

**Decision**: Snap based on the "anchor" view (the view directly under cursor when drag started)

**Rationale**:
- Snapping all views independently would break relative positioning
- Using bounding box of selection is complex and less intuitive
- Anchor-based approach matches user's mental model (dragging "this" view)

**Implementation**:
- Track which view was clicked to start the drag
- Apply snap to that view's position
- Other selected views maintain their relative offset

### 5. Visual Feedback Approach

**Decision**: Highlight snapped edges with brief colored lines at snap points

**Rationale**:
- Subtle but visible indication
- Consistent with professional design tools (Figma, Sketch)
- Uses existing color tokens for theming

**Implementation**:
- New `SnapIndicator` component renders lines at snap coordinates
- Lines appear when snap engages, disappear when view moves away
- Duration: instant on (no delay), instant off when leaving snap zone

### 6. State Management Location

**Decision**: Extend `gridStore.ts` with snap-related signals

**Rationale**:
- Snap is conceptually related to grid (snaps to grid lines)
- Keeps related state together
- Avoids creating yet another store for a simple boolean + threshold

**New Signals in gridStore**:
```typescript
const [isSnapEnabled, setIsSnapEnabled] = createSignal<boolean>(true);
const [snapThreshold, setSnapThreshold] = createSignal<number>(DEFAULT_SNAP_THRESHOLD);
```

### 7. Snap Threshold Clamping

**Decision**: Clamp threshold to `gridSize / 2` to prevent overlapping snap zones

**Rationale**:
- If threshold > gridSize/2, a position could be "within threshold" of two grid lines simultaneously
- This would cause unpredictable snapping behavior
- Clamping ensures each position snaps to exactly one grid line

**Formula**: `effectiveThreshold = Math.min(threshold, gridSize / 2)`

## Technical Decisions Summary

| Topic | Decision |
|-------|----------|
| Snap algorithm | Nearest grid line within threshold |
| Integration point | Delta calculation in drag/resize handlers |
| Alt key behavior | Disables snap, coexists with center-resize |
| Multi-view snap | Anchor-based (snaps view under cursor) |
| Visual feedback | Edge highlight lines at snap points |
| State location | Extend gridStore |
| Threshold clamping | Max = gridSize / 2 |

## Dependencies

**Existing code to extend**:
- `src/stores/gridStore.ts` - Add snap signals
- `src/hooks/canvas/useCanvasInteractions.ts` - Apply snap in handlers
- `src/hooks/canvas/useCanvasKeyboard.ts` - Add Shift+G shortcut

**New code to create**:
- `src/domain/canvas/snap.ts` - Snap calculation utilities
- `src/types/snap.ts` - Type definitions
- `src/components/SnapIndicator/` - Visual feedback component

**No new npm dependencies required**.
