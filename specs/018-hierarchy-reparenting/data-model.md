# Data Model: Hierarchy Reparenting

**Feature**: 018-hierarchy-reparenting
**Date**: 2026-01-07

## Entities

### DragState

Transient state during drag operation in hierarchy panel.

```typescript
interface HierarchyDragState {
  /** Whether a drag is currently active */
  isDragging: boolean;
  
  /**
   * ID(s) of view(s) being dragged.
   * Array type accommodates both single-view drag and multi-selection drag
   * from initialization - no need to convert between types mid-operation.
   */
  draggedIds: string[];
  
  /** Current drop target view ID (if any) */
  dropTargetId: string | null;
  
  /** Position within drop target */
  dropPosition: 'before' | 'inside' | 'after' | null;
  
  /** Whether current drop target is valid */
  isValidDrop: boolean;
}
```

### DropInfo

Result of analyzing a potential drop operation.

```typescript
interface DropInfo {
  /** Target view ID */
  targetId: string;
  
  /** Where to drop relative to target */
  position: 'before' | 'inside' | 'after';
  
  /** Validation result */
  isValid: boolean;
  
  /** If invalid, reason why */
  invalidReason?: 'self-drop' | 'circular' | 'non-container' | 'different-parents';
}
```

### ReparentOperation

Data needed to reparent a view.

```typescript
interface ReparentOperation {
  /** View being moved */
  viewId: string;
  
  /** Original parent ID */
  oldParentId: string;
  
  /** Original index among siblings */
  oldIndex: number;
  
  /** Original origin value */
  oldOrigin: string;
  
  /** New parent ID */
  newParentId: string;
  
  /** New index among siblings (optional, defaults to end) */
  newIndex?: number;
  
  /** New origin value (adjusted for position preservation) */
  newOrigin: string;
}
```

### ReorderOperation

Data needed to reorder a view among siblings.

```typescript
interface ReorderOperation {
  /** View being reordered */
  viewId: string;
  
  /** Parent container ID */
  parentId: string;
  
  /** Original index */
  oldIndex: number;
  
  /** New index */
  newIndex: number;
}
```

### GroupOperation

Data needed to group views into a new container.

```typescript
interface GroupOperation {
  /** IDs of views being grouped */
  viewIds: string[];
  
  /** Parent container ID (all views must share this parent) */
  parentId: string;
  
  /** Original indices of views */
  originalIndices: number[];
  
  /** Original origins of views */
  originalOrigins: string[];
  
  /** ID of new group container */
  newContainerId: string;
  
  /** Origin of new container */
  containerOrigin: string;
  
  /** Size of new container */
  containerSize: string;
  
  /** New origins of views (relative to container) */
  newOrigins: string[];
}
```

### UngroupOperation

Data needed to ungroup a container.

```typescript
interface UngroupOperation {
  /** ID of container being ungrouped */
  containerId: string;
  
  /** Parent of the container */
  parentId: string;
  
  /** Index of container among siblings */
  containerIndex: number;
  
  /** Container's origin */
  containerOrigin: string;
  
  /** Container's size */
  containerSize: string;
  
  /** Container's other attributes */
  containerAttributes: Record<string, string>;
  
  /** IDs of children being moved up */
  childIds: string[];
  
  /** Original origins of children (relative to container) */
  childOriginalOrigins: string[];
  
  /** New origins of children (relative to parent) */
  childNewOrigins: string[];
}
```

## State Transitions

### Drag Lifecycle

```
IDLE → DRAGGING → (HOVERING_VALID | HOVERING_INVALID) → DROP/CANCEL → IDLE
```

1. **IDLE**: No drag active
2. **DRAGGING**: User started drag, no valid target yet
3. **HOVERING_VALID**: Over valid drop target
4. **HOVERING_INVALID**: Over invalid drop target
5. **DROP**: User released, execute operation
6. **CANCEL**: User cancelled (Escape or drag out)

### Group/Ungroup

```
SELECTED → GROUP → GROUPED (single container selected)
GROUPED → UNGROUP → UNGROUPED (children selected)
```

## Validation Rules

### Reparent Validation

1. **Not self**: `targetId !== draggedId`
2. **Not descendant**: `!isDescendantOf(targetId, draggedId)`
3. **Target is container**: `isContainerClass(targetViewClass)`
4. **Not already child**: `currentParentId !== targetId` (unless reordering)

### Reorder Validation

1. **Same parent**: All selected views must share parent
2. **Valid index**: `0 <= newIndex < siblingCount`
3. **Actual change**: `newIndex !== oldIndex`

### Group Validation

1. **Multiple selected**: `selectedIds.length >= 2`
2. **Same parent**: All selected views must share parent
3. **Not root**: Parent is not the template root (would create nested root)

### Ungroup Validation

1. **Single selected**: `selectedIds.length === 1`
2. **Is container**: `isContainerClass(selectedViewClass)`
3. **Not root**: Selected view is not the template root
4. **Has parent**: Container has a parent to move children to

## Relationships

```
Template (root)
└── ViewNode (container)
    ├── ViewNode (leaf or container)
    │   └── ...
    └── ViewNode
        └── ...

Each ViewNode has:
- Exactly one parent (except root)
- Zero or more children (containers only)
- An index among siblings (determines z-order)
```

## Document Store Mutations

### reparentView

```typescript
function reparentView(
  viewId: string,
  newParentId: string,
  newIndex?: number,
  newOrigin?: string
): void
```

1. Remove view from current parent's children
2. Add view to new parent's children at index
3. Update view's origin if provided
4. Trigger reactivity

### reorderView

```typescript
function reorderView(viewId: string, newIndex: number): void
```

1. Find view's current parent
2. Remove view from children array
3. Insert at new index
4. Trigger reactivity

### createGroupContainer

```typescript
function createGroupContainer(
  viewIds: string[],
  containerId: string,
  containerAttrs: Record<string, string>
): void
```

1. Create new CViewContainer with given attributes
2. Add to parent at first view's index
3. Move all views into container
4. Adjust view origins to be relative to container

### ungroupContainer

```typescript
function ungroupContainer(containerId: string): void
```

1. Get container's children
2. Adjust children origins to parent-relative
3. Move children to container's parent at container's index
4. Delete container
