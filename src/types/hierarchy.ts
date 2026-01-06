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
