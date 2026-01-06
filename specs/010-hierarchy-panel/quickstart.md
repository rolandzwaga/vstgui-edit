# Quickstart: Hierarchy Panel

**Feature**: 010-hierarchy-panel | **Date**: 2026-01-06

## Overview

Add a tree view sidebar showing all views from loaded uidesc templates with expand/collapse, bidirectional selection sync, and category icons.

## Key Files to Create

```
src/
├── components/HierarchyPanel/
│   ├── HierarchyPanel.tsx          # Main panel (P1)
│   ├── HierarchyPanel.module.css
│   ├── TreeNode.tsx                # Tree node (P1)
│   ├── TreeNode.module.css
│   ├── EmptyState.tsx              # Empty state (P1)
│   ├── EmptyState.module.css
│   ├── icons.ts                    # Icon mapping (P2)
│   └── __tests__/
├── stores/
│   └── hierarchyStore.ts           # Expand/collapse state (P1)
├── domain/hierarchy/
│   ├── index.ts
│   └── buildTree.ts                # ViewNode → TreeNode (P1)
└── types/
    └── hierarchy.ts                # TreeNode type (P1)
```

## Key Patterns

### Store Pattern (from selectionStore)

```typescript
import { createSignal } from 'solid-js';

const [expandedIds, setExpandedIds] = createSignal<Set<string>>(new Set());

export const hierarchyStore = {
  get expandedIds() { return expandedIds(); },
};

export function toggleExpanded(nodeId: string): void {
  const current = expandedIds();
  const newSet = new Set(current);
  if (newSet.has(nodeId)) {
    newSet.delete(nodeId);
  } else {
    newSet.add(nodeId);
  }
  setExpandedIds(newSet);
}
```

### Tree Building (recursive)

```typescript
function buildTree(view: ViewNode, id: string, depth: number): TreeNode {
  const children = view.children ?? {};
  const childEntries = Object.entries(children);
  
  return {
    id,
    label: view.attributes.class ?? 'Unknown',
    category: getViewCategory(view.attributes.class),
    hasChildren: childEntries.length > 0,
    depth,
    children: childEntries.map(([key, child]) => 
      buildTree(child, `${id}-${key}`, depth + 1)
    ),
  };
}
```

### Selection Integration (uses existing selectionStore)

```typescript
import { select, toggleSelect, isSelected } from '../../stores/selectionStore';

// In TreeNode click handler
const handleClick = (e: MouseEvent) => {
  if (e.shiftKey) {
    toggleSelect(props.node.id);
  } else {
    select(props.node.id);
  }
};
```

### Auto-Expand on Canvas Selection

```typescript
import { getAncestorIds } from '../../domain/canvas/ancestors';

createEffect(() => {
  const selected = selectionStore.selectedIds;
  for (const viewId of selected) {
    const ancestors = getAncestorIds(viewId, allViews());
    ancestors.forEach(expandNode);
  }
});
```

## Testing Approach

1. **Unit tests**: hierarchyStore, buildTree
2. **Component tests**: TreeNode, HierarchyPanel, EmptyState
3. **Integration tests**: Selection sync, expand/collapse

Follow `specs/TESTING-GUIDE.md`:
- Use `testInRoot()` for store tests
- Use `renderWithProviders()` for component tests
- Flush microtasks with `await Promise.resolve()`

## Existing Utilities to Reuse

| Utility | Location | Purpose |
|---------|----------|---------|
| `getViewCategory` | `src/domain/canvas/viewCategory.ts` | Classify view by class name |
| `getAncestorIds` | `src/domain/canvas/ancestors.ts` | Get parent chain for auto-expand |
| `select`, `toggleSelect` | `src/stores/selectionStore.ts` | Selection actions |
| `isSelected` | `src/stores/selectionStore.ts` | Check selection state |
| `documentStore` | `src/stores/documentStore.ts` | Access loaded template |

## Layout Integration

Update `App.tsx` to include flex layout:

```tsx
{documentStore.parseState === 'valid' ? (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <HierarchyPanel />
    <div style={{ flex: 1 }}>
      <MainToolbar onFitToView={handleFitToView} />
      <Canvas />
    </div>
  </div>
) : ( /* existing upload zone */ )}
```

## Implementation Priority

1. **P1 Core**: Types, store, buildTree, TreeNode, HierarchyPanel, selection sync
2. **P2 Enhancement**: Icons, scroll-to-selection, EmptyState styling
