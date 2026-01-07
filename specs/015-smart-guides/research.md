# Research: Smart Guides

**Feature**: 015-smart-guides  
**Date**: 2026-01-07

## Summary

No external research required. This feature follows established patterns in the codebase.

## Decisions

### 1. Guide Calculation Pattern

**Decision**: Pure functions in `src/domain/canvas/smartGuides.ts`

**Rationale**: Follows existing patterns from `snap.ts`, `move.ts`, `resize.ts`. Pure calculation functions are easy to test and compose.

**Alternatives considered**:
- Class-based calculator: Rejected - inconsistent with codebase style
- Inline in hook: Rejected - harder to test, violates single responsibility

### 2. State Management Pattern

**Decision**: New `smartGuidesStore` using `createStore` from solid-js/store

**Rationale**: Matches `gridStore`, `dragStore`, `selectionStore` patterns. Store holds:
- `isEnabled: boolean` (default: true)
- `activeGuides: SmartGuide[]` (populated during drag)

**Alternatives considered**:
- Extend gridStore: Rejected - concerns are separate (grid snap vs visual guides)
- Local component state: Rejected - guides need to be accessed by multiple components

### 3. Rendering Approach

**Decision**: SVG `<line>` elements in dedicated `SmartGuideLines` component

**Rationale**: Consistent with existing canvas rendering (grid, marquee, drag preview). SVG provides crisp rendering at any zoom level.

**Alternatives considered**:
- Canvas 2D: Rejected - project uses SVG throughout
- CSS pseudo-elements: Rejected - cannot extend across full viewport

### 4. Guide Line Appearance

**Decision**: Magenta/pink color (`#FF00FF` or design token), 1px solid line, full viewport extent

**Rationale**: 
- Distinct from grid (gray), selection (blue), view borders (category colors)
- High contrast against typical UI colors
- Full viewport extent is standard in design tools (Figma, Sketch)

**Alternatives considered**:
- Blue guides: Rejected - conflicts with selection highlight
- Dashed lines: Rejected - harder to see during fast drag

### 5. Keyboard Shortcut

**Decision**: `S` key toggles smart guides (per spec clarification)

**Rationale**: 
- Mnemonic: "S" for Smart guides
- Unused in current codebase
- Follows single-key pattern (G for grid, F for fit)

**Alternatives considered**:
- Ctrl+G: Rejected - modifier key slower
- ; key: Rejected - less intuitive

### 6. Guide Calculation Algorithm

**Decision**: O(n) scan of sibling views during drag, compute all matching guides

**Rationale**:
- Simple and fast for typical uidesc files (10-100 views)
- Calculate on each mouse move during drag (already happening in dragStore updates)
- No caching needed - 100 views * 4 edges = 400 comparisons is <1ms

**Implementation approach**:
1. Get dragged view's current bounds (from delta + original position)
2. Get sibling views (same parent, excluding dragged view)
3. For each sibling, check alignment:
   - Left edge vs sibling left/right edges
   - Right edge vs sibling left/right edges  
   - Top edge vs sibling top/bottom edges
   - Bottom edge vs sibling top/bottom edges
   - Horizontal center vs sibling horizontal center
   - Vertical center vs sibling vertical center
4. For parent center guides, check against parent bounds
5. Return array of `SmartGuide` objects

### 7. Spacing Guides Algorithm (P3 - defer if needed)

**Decision**: Compare distances between consecutive views in same row/column

**Rationale**: Standard approach used by design tools.

**Implementation approach**:
1. Find views in same horizontal band (overlapping Y ranges)
2. Sort by X position
3. Calculate gaps between consecutive views
4. If dragged view's gap matches another gap (within threshold), show spacing guide
5. Repeat for vertical bands

### 8. Integration with Existing Drag Flow

**Decision**: Calculate guides in `useCanvasInteractions.handleDragMove`, store in `smartGuidesStore`, render in `SmartGuideLines`

**Rationale**: 
- Calculation happens where delta is already computed
- Store provides reactive updates to rendering component
- Follows existing pattern (drag preview, snap indicators)

**Workflow**:
1. `handleDragMove` calls `calculateSmartGuides(draggedBounds, siblings, parentBounds)`
2. Result stored via `setActiveGuides(guides)`
3. `SmartGuideLines` component reactively renders guides
4. `handleDragUp` clears guides via `clearActiveGuides()`

## Existing Patterns to Reuse

| Pattern | Source | Usage |
|---------|--------|-------|
| Store creation | `gridStore.ts` | `createStore` with actions |
| Keyboard toggle | `useCanvasKeyboard.ts` | Add S key handler |
| Canvas calculations | `snap.ts`, `move.ts` | Pure functions, Point/Size types |
| SVG rendering | `Grid.tsx`, `MarqueeRectangle.tsx` | SVG line elements |
| Design tokens | `tokens.css` | Add `--color-smart-guide` |
| Test patterns | `snap.spec.ts`, `gridStore.spec.ts` | Unit test structure |

## No External Research Needed

This feature:
- Uses only existing dependencies (SolidJS)
- Follows established codebase patterns
- Has clear requirements from spec
- No third-party libraries required
