# Research: Hierarchy Panel

**Feature**: 010-hierarchy-panel | **Date**: 2026-01-06

## Research Tasks

### 1. Existing View Hierarchy Handling

**Question**: How is the view hierarchy currently represented and processed?

**Decision**: Reuse existing types and utilities from the canvas domain.

**Findings**:
- `ViewNode` type in `src/types/uidesc.ts` represents uidesc view structure with `attributes`, `children?: Record<string, ViewNode>`
- `RenderableView` in `src/types/canvas.ts` includes `parentId: string | null` for hierarchy tracking
- `flattenHierarchy()` in `src/domain/canvas/flattenHierarchy.ts` converts `ViewDefinition` to `RenderableView[]`
- `getAncestorIds()` in `src/domain/canvas/ancestors.ts` traverses up the parent chain
- `getViewCategory()` in `src/domain/canvas/viewCategory.ts` classifies views by class name

**Rationale**: Existing utilities handle hierarchy traversal. Tree building can leverage `flattenHierarchy` output or process `ViewNode` directly.

**Alternatives Considered**:
- Create new hierarchy traversal from scratch → Rejected (duplication)
- Use only `RenderableView` → Rejected (need original tree structure for expand/collapse)

### 2. Selection Store Integration

**Question**: How should tree selection sync with canvas selection?

**Decision**: Direct integration with existing `selectionStore`.

**Findings**:
- `selectionStore` in `src/stores/selectionStore.ts` provides:
  - `selectedIds: Set<string>` - reactive getter
  - `select(viewId)` - single selection
  - `toggleSelect(viewId)` - Shift+click multi-select
  - `clearSelection()` - deselect all
  - `isSelected(viewId)` - check selection state
- Selection is based on view IDs (string)
- Canvas uses mouseup handler for selection, tree will use click

**Rationale**: Single source of truth. Tree clicks call same store functions, canvas reactively reflects changes.

**Alternatives Considered**:
- Separate tree selection state → Rejected (sync complexity, bugs)
- Event-based coupling → Rejected (unnecessary indirection)

### 3. Expand/Collapse State Management

**Question**: How should expand/collapse state be managed?

**Decision**: New `hierarchyStore` with signals for expanded node IDs.

**Findings**:
- Existing store patterns use `createSignal` for simple state (selectionStore, canvasStore)
- Expand/collapse is per-node boolean state
- Need: `Set<string>` of expanded node IDs
- Default: All expanded on template load (FR-013)
- Auto-expand ancestors on canvas selection (FR-009)

**Design**:
```typescript
// hierarchyStore.ts
const [expandedIds, setExpandedIds] = createSignal<Set<string>>(new Set());

export const hierarchyStore = {
  get expandedIds() { return expandedIds(); },
};

export function toggleExpanded(nodeId: string): void { ... }
export function expandNode(nodeId: string): void { ... }
export function collapseNode(nodeId: string): void { ... }
export function expandAll(nodeIds: string[]): void { ... }
export function isExpanded(nodeId: string): boolean { ... }
export function resetHierarchy(): void { ... }
```

**Rationale**: Consistent with existing store patterns. Signals provide fine-grained reactivity.

**Alternatives Considered**:
- Store in each TreeNode component → Rejected (no global access for auto-expand)
- Use createStore (nested object) → Rejected (overkill for flat Set)

### 4. Tree Node Structure

**Question**: What data structure for tree nodes?

**Decision**: New `TreeNode` type derived from `ViewNode` with computed properties.

**Design**:
```typescript
// types/hierarchy.ts
interface TreeNode {
  id: string;           // Unique ID matching RenderableView.id
  label: string;        // Class name (or "Unknown")
  category: ViewCategory;
  hasChildren: boolean; // For expand/collapse toggle visibility
  children: TreeNode[]; // Array for ordered rendering
  depth: number;        // For indentation calculation
}
```

**Rationale**: Pre-compute values needed for rendering. Array children (vs Record) for predictable render order.

**Alternatives Considered**:
- Use ViewNode directly → Rejected (need computed hasChildren, depth)
- Use RenderableView → Rejected (flat, no tree structure)

### 5. Category Icons

**Question**: What icons for each view category?

**Decision**: FontAwesome icons via existing solid-fontawesome integration.

**Findings**:
- Project already uses `@fortawesome/free-solid-svg-icons` and `solid-fontawesome`
- Categories from `getViewCategory()`: container, control, display, custom

**Icon Mapping**:
| Category | Icon | FontAwesome Name | Rationale |
|----------|------|------------------|-----------|
| container | Folder | `faFolder` | Containers hold children |
| control | Sliders | `faSliders` | Interactive controls |
| display | Text | `faFont` | Display text/static content |
| custom | Puzzle | `faPuzzlePiece` | Custom/unknown views |

**Rationale**: Reuse existing icon library. Semantic icons that match category purpose.

**Alternatives Considered**:
- SVG inline icons → Rejected (unnecessary complexity, FontAwesome available)
- No icons → Rejected (FR-010 requires icons)

### 6. Auto-Scroll Implementation

**Question**: How to scroll tree to selected node?

**Decision**: Use `scrollIntoView()` with `block: 'nearest'` behavior.

**Findings**:
- Native DOM API `element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })`
- Need ref to tree node DOM element
- SolidJS: Use `ref` attribute on element, call in effect when selection changes

**Implementation**:
```typescript
// In TreeNode component
let nodeRef: HTMLDivElement | undefined;

createEffect(() => {
  if (isSelected(props.node.id) && nodeRef) {
    nodeRef.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
```

**Rationale**: Native browser API, smooth UX, minimal code.

**Alternatives Considered**:
- Custom scroll calculation → Rejected (complex, browser does it well)
- Virtualized list with scroll position → Rejected (premature optimization)

### 7. Auto-Expand on Canvas Selection

**Question**: How to auto-expand ancestors when nested view selected on canvas?

**Decision**: Use `getAncestorIds()` utility + expand all ancestors.

**Implementation**:
```typescript
// Effect in HierarchyPanel or triggered by selectionStore change
createEffect(() => {
  const selected = selectionStore.selectedIds;
  if (selected.size === 0) return;
  
  for (const viewId of selected) {
    const ancestors = getAncestorIds(viewId, allViews);
    for (const ancestorId of ancestors) {
      expandNode(ancestorId);
    }
  }
});
```

**Rationale**: Existing `getAncestorIds()` utility handles traversal. Expand all ensures selected view is visible.

### 8. Layout Integration

**Question**: Where does hierarchy panel go in the app layout?

**Decision**: Left sidebar, conditional render when template loaded.

**Findings**:
- Current App.tsx shows Canvas when `parseState === 'valid'`
- Need flex layout: HierarchyPanel (left) | Canvas (center/fill)
- Panel width: Fixed (e.g., 250px) with potential resize in future

**Implementation**:
```tsx
// App.tsx update
{documentStore.parseState === 'valid' ? (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <HierarchyPanel />
    <div style={{ flex: 1 }}>
      <MainToolbar onFitToView={handleFitToView} />
      <Canvas />
    </div>
  </div>
) : ( /* upload zone */ )}
```

**Rationale**: Simple flex layout. Panel self-contained with fixed width.

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| View hierarchy | Reuse `ViewNode`, `RenderableView`, `getAncestorIds` |
| Selection | Direct integration with `selectionStore` |
| Expand/collapse | New `hierarchyStore` with `Set<string>` signal |
| Tree node type | New `TreeNode` with computed `hasChildren`, `depth` |
| Icons | FontAwesome via existing integration |
| Auto-scroll | Native `scrollIntoView()` API |
| Auto-expand | Effect watching selection + `getAncestorIds()` |
| Layout | Flex layout, fixed-width left sidebar |

## Dependencies

**No new dependencies required.** All functionality achievable with existing:
- solid-js, solid-js/store
- @fortawesome/free-solid-svg-icons, solid-fontawesome
- Existing domain utilities
