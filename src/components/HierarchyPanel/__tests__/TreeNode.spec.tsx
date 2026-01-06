import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { TreeNode } from '../TreeNode';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

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

  describe('given a node with label', () => {
    it('should render the label text', () => {
      const node = createNode({ label: 'CTextButton' });

      render(() => <TreeNode node={node} />);

      expect(screen.getByText('CTextButton')).toBeInTheDocument();
    });
  });

  describe('given a node with depth 0', () => {
    it('should have no indentation', () => {
      const node = createNode({ depth: 0 });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveStyle({ paddingLeft: '0px' });
    });
  });

  describe('given a node with depth 2', () => {
    it('should have indentation based on depth', () => {
      const node = createNode({ depth: 2 });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveStyle({ paddingLeft: '32px' });
    });
  });

  describe('given a node with children', () => {
    it('should render child nodes', () => {
      const node = createNode({
        hasChildren: true,
        children: [
          createNode({ id: 'child-1', label: 'ChildOne', depth: 1 }),
          createNode({ id: 'child-2', label: 'ChildTwo', depth: 1 }),
        ],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.getByText('ChildOne')).toBeInTheDocument();
      expect(screen.getByText('ChildTwo')).toBeInTheDocument();
    });
  });

  describe('given ARIA attributes (accessibility)', () => {
    it('should have role="treeitem"', () => {
      const node = createNode();

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveAttribute('role', 'treeitem');
    });

    it('should have aria-expanded="true" for container with children', () => {
      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not have aria-expanded for leaf nodes', () => {
      const node = createNode({ hasChildren: false });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).not.toHaveAttribute('aria-expanded');
    });
  });
});
