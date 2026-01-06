# Data Model: Hierarchy Panel

**Feature**: 010-hierarchy-panel | **Date**: 2026-01-06

## Entities

### TreeNode

Represents a view in the hierarchy tree, derived from `ViewNode` with computed display properties.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | `string` | Unique identifier matching RenderableView.id | Generated from hierarchy path |
| label | `string` | Display label (class name or "Unknown") | `ViewNode.attributes.class` |
| category | `ViewCategory` | View classification for icon | `getViewCategory(className)` |
| hasChildren | `boolean` | Whether node has child views | `Object.keys(children).length > 0` |
| children | `TreeNode[]` | Child nodes in render order | Recursive build |
| depth | `number` | Nesting depth (0 = root) | Incremented during traversal |

**Validation Rules**:
- `id` must be non-empty string
- `label` defaults to "Unknown" if class attribute missing
- `depth` must be >= 0
- `children` array may be empty but never undefined

### HierarchyState

Expand/collapse state for the hierarchy panel (managed by `hierarchyStore`).

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| expandedIds | `Set<string>` | IDs of expanded nodes | All nodes expanded |

**State Transitions**:
- `toggleExpanded(id)`: Add if not present, remove if present
- `expandNode(id)`: Add to set (no-op if already present)
- `collapseNode(id)`: Remove from set (no-op if not present)
- `expandAll(ids)`: Replace with new Set containing all ids
- `resetHierarchy()`: Clear to empty Set

## Relationships

```
documentStore.document
    └── templates (Record<string, TemplateDefinition>)
            └── ViewNode (recursive tree)
                    │
                    ▼ buildTree()
                TreeNode[] (computed on template load)
                    │
                    ├── hierarchyStore.expandedIds (visibility)
                    │
                    └── selectionStore.selectedIds (selection state)
```

## Data Flow

### Template Load → Tree Build

1. `documentStore.document` updates with parsed uidesc
2. `buildTree()` transforms first template's `ViewNode` to `TreeNode[]`
3. `hierarchyStore.expandAll()` sets all container IDs as expanded
4. Tree renders with all nodes visible

### Tree Click → Canvas Selection

1. User clicks TreeNode
2. TreeNode calls `select(nodeId)` or `toggleSelect(nodeId)`
3. `selectionStore.selectedIds` updates
4. Canvas reactively shows selection overlay
5. Tree reactively shows selection highlighting

### Canvas Selection → Tree Expansion

1. User selects view on canvas (click/marquee)
2. `selectionStore.selectedIds` updates
3. Effect in HierarchyPanel detects change
4. For each selected ID, calls `getAncestorIds()` and `expandNode()`
5. Tree reactively re-renders to show selected nodes
6. `scrollIntoView()` brings first selected into view

### Expand/Collapse Toggle

1. User clicks expand/collapse button on container node
2. `toggleExpanded(nodeId)` called
3. `hierarchyStore.expandedIds` updates
4. Children nodes reactively show/hide based on parent's expanded state

## Type Definitions

```typescript
// src/types/hierarchy.ts
import type { ViewCategory } from './canvas';

/**
 * Represents a node in the hierarchy tree view.
 * Pre-computed from ViewNode for efficient rendering.
 */
export interface TreeNode {
  /** Unique identifier matching RenderableView.id format */
  id: string;
  
  /** Display label (class name or "Unknown") */
  label: string;
  
  /** View category for icon selection */
  category: ViewCategory;
  
  /** Whether this node has child views (determines toggle visibility) */
  hasChildren: boolean;
  
  /** Child nodes in traversal order */
  children: TreeNode[];
  
  /** Nesting depth for indentation (0 = root) */
  depth: number;
}
```

## Computed Properties

### Indentation

```typescript
// Indentation pixels = depth * INDENT_SIZE
const INDENT_SIZE = 16; // px
const indentPx = node.depth * INDENT_SIZE;
```

### Icon Selection

```typescript
// Category to icon mapping
const CATEGORY_ICONS: Record<ViewCategory, IconDefinition> = {
  container: faFolder,
  control: faSliders,
  display: faFont,
  custom: faPuzzlePiece,
};
```

### Node Visibility

```typescript
// A node is visible if all its ancestors are expanded
function isNodeVisible(nodeId: string, ancestors: string[], expandedIds: Set<string>): boolean {
  return ancestors.every(ancestorId => expandedIds.has(ancestorId));
}
```

## Existing Types Used

- `ViewNode` from `src/types/uidesc.ts` - Source data structure
- `ViewCategory` from `src/types/canvas.ts` - Category classification
- `RenderableView` from `src/types/canvas.ts` - For ancestor lookup
- `ViewDefinition` from `src/types/uidesc.ts` - Template root type
