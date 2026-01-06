/**
 * Hierarchy Panel - Internal Component Contracts
 * Feature: 010-hierarchy-panel
 * 
 * This file defines the interfaces and contracts for the hierarchy panel components.
 * Used for planning and reference - not imported into production code.
 */

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { ViewCategory } from '../../../src/types/canvas';
import type { ViewNode } from '../../../src/types/uidesc';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// STORE: hierarchyStore
// ============================================================================

/**
 * Hierarchy Store Contract
 * Manages expand/collapse state for tree nodes.
 */
export interface HierarchyStoreContract {
  /** Set of expanded node IDs (reactive getter) */
  readonly expandedIds: Set<string>;
}

/** Toggle a node's expanded state */
export type ToggleExpanded = (nodeId: string) => void;

/** Expand a specific node (no-op if already expanded) */
export type ExpandNode = (nodeId: string) => void;

/** Collapse a specific node (no-op if already collapsed) */
export type CollapseNode = (nodeId: string) => void;

/** Expand all nodes with given IDs (replaces current state) */
export type ExpandAll = (nodeIds: string[]) => void;

/** Check if a node is expanded */
export type IsExpanded = (nodeId: string) => boolean;

/** Reset hierarchy state (collapse all) */
export type ResetHierarchy = () => void;

// ============================================================================
// DOMAIN: buildTree
// ============================================================================

/**
 * Build tree from ViewNode hierarchy.
 * 
 * @param root - Root ViewNode from template
 * @param rootId - ID for the root node
 * @returns TreeNode representing the hierarchy
 */
export type BuildTree = (root: ViewNode, rootId: string) => TreeNode;

/**
 * Get all node IDs that have children (for default expand state).
 * 
 * @param tree - Root TreeNode
 * @returns Array of node IDs that have children
 */
export type GetContainerIds = (tree: TreeNode) => string[];

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * HierarchyPanel Props
 * Main container component for the hierarchy tree.
 */
export interface HierarchyPanelProps {
  // No props - reads from documentStore, selectionStore
}

/**
 * TreeNodeComponent Props
 * Individual tree node with label, icon, and children.
 */
export interface TreeNodeProps {
  /** The tree node data to render */
  node: TreeNode;
}

/**
 * EmptyState Props
 * Shown when no template is loaded.
 */
export interface EmptyStateProps {
  // No props needed
}

// ============================================================================
// ICON MAPPING
// ============================================================================

/**
 * Category to icon mapping.
 * Uses FontAwesome icons from @fortawesome/free-solid-svg-icons.
 */
export type CategoryIconMap = Record<ViewCategory, IconDefinition>;

/**
 * Expected icon assignments:
 * - container: faFolder
 * - control: faSliders
 * - display: faFont
 * - custom: faPuzzlePiece
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Indentation per depth level in pixels */
export const INDENT_SIZE = 16;

/** Panel width in pixels */
export const PANEL_WIDTH = 250;

/** Scroll behavior for auto-scroll */
export const SCROLL_BEHAVIOR: ScrollIntoViewOptions = {
  block: 'nearest',
  behavior: 'smooth',
};
