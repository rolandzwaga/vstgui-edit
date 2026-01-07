/**
 * Hierarchy Panel Types
 * Types for the tree view representation of uidesc views
 */

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

/**
 * Drop position relative to target element.
 * - 'before': Insert above this sibling
 * - 'inside': Reparent into this container
 * - 'after': Insert below this sibling
 */
export type DropPosition = 'before' | 'inside' | 'after';

/**
 * Transient state during drag operation in hierarchy panel.
 */
export interface HierarchyDragState {
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
  dropPosition: DropPosition | null;

  /** Whether current drop target is valid */
  isValidDrop: boolean;
}

/**
 * Result of analyzing a potential drop operation.
 */
export interface DropInfo {
  /** Target view ID */
  targetId: string;

  /** Where to drop relative to target */
  position: DropPosition;

  /** Validation result */
  isValid: boolean;

  /** If invalid, reason why */
  invalidReason?: 'self-drop' | 'circular' | 'non-container' | 'different-parents';
}

/**
 * Data needed to reparent a view.
 */
export interface ReparentOperation {
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

/**
 * Data needed to reorder a view among siblings.
 */
export interface ReorderOperation {
  /** View being reordered */
  viewId: string;

  /** Parent container ID */
  parentId: string;

  /** Original index */
  oldIndex: number;

  /** New index */
  newIndex: number;
}

/**
 * Data needed to group views into a new container.
 */
export interface GroupOperation {
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

/**
 * Data needed to ungroup a container.
 */
export interface UngroupOperation {
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
