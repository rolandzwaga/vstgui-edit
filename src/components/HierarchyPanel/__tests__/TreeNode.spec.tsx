import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { expandAll, resetHierarchy } from '../../../stores/hierarchyStore';
import { TreeNode } from '../TreeNode';
import { HierarchyDragProvider } from '../HierarchyDragContext';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

const renderTreeNode = (node: TreeNodeType) =>
  render(() => (
    <HierarchyDragProvider>
      <TreeNode node={node} />
    </HierarchyDragProvider>
  ));

describe('TreeNode', () => {
  const createNode = (overrides: Partial<TreeNodeType> = {}): TreeNodeType => ({
    id: 'test-node',
    label: 'CViewContainer',
    category: 'container',
    hasChildren: false,
    children: [],
    depth: 0,
    ...overrides,
  });

  beforeEach(() => {
    testInRoot(() => {
      resetHierarchy();
    });
  });

  describe('given a node with label', () => {
    it('should render the label text', () => {
      const node = createNode({ label: 'CTextButton' });

      renderTreeNode(node);

      expect(screen.getByText('CTextButton')).toBeInTheDocument();
    });
  });

  describe('given a node with depth 0', () => {
    it('should have no indentation', () => {
      const node = createNode({ depth: 0 });

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveStyle({ paddingLeft: '0px' });
    });
  });

  describe('given a node with depth 2', () => {
    it('should have indentation based on depth', () => {
      const node = createNode({ depth: 2 });

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveStyle({ paddingLeft: '32px' });
    });
  });

  describe('given a node with children when expanded', () => {
    it('should render child nodes', () => {
      testInRoot(() => {
        expandAll(['test-node']);
      });

      const node = createNode({
        hasChildren: true,
        children: [
          createNode({ id: 'child-1', label: 'ChildOne', depth: 1 }),
          createNode({ id: 'child-2', label: 'ChildTwo', depth: 1 }),
        ],
      });

      renderTreeNode(node);

      expect(screen.getByText('ChildOne')).toBeInTheDocument();
      expect(screen.getByText('ChildTwo')).toBeInTheDocument();
    });
  });

  describe('given ARIA attributes (accessibility)', () => {
    it('should have role="treeitem"', () => {
      const node = createNode();

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveAttribute('role', 'treeitem');
    });

    it('should not have aria-expanded for leaf nodes', () => {
      const node = createNode({ hasChildren: false });

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).not.toHaveAttribute('aria-expanded');
    });
  });
});
