import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { expandAll, isExpanded, resetHierarchy } from '../../../stores/hierarchyStore';
import { TreeNode } from '../TreeNode';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

describe('TreeNode expand/collapse', () => {
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

  describe('given a node with no children', () => {
    it('should not render expand/collapse toggle', () => {
      const node = createNode({ hasChildren: false });

      render(() => <TreeNode node={node} />);

      expect(screen.queryByTestId('toggle-test-node')).not.toBeInTheDocument();
    });
  });

  describe('given a node with children', () => {
    it('should render expand/collapse toggle', () => {
      testInRoot(() => {
        expandAll(['test-node']);
      });

      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', label: 'Child', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.getByTestId('toggle-test-node')).toBeInTheDocument();
    });

    it('should render children when expanded', () => {
      testInRoot(() => {
        expandAll(['test-node']);
      });

      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', label: 'ChildNode', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.getByText('ChildNode')).toBeInTheDocument();
    });

    it('should hide children when collapsed', () => {
      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', label: 'ChildNode', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.queryByText('ChildNode')).not.toBeInTheDocument();
    });

    it('should toggle expand state when clicking toggle button', () => {
      testInRoot(() => {
        expandAll(['test-node']);
      });

      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', label: 'ChildNode', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.getByText('ChildNode')).toBeInTheDocument();

      const toggle = screen.getByTestId('toggle-test-node');
      fireEvent.click(toggle);

      expect(screen.queryByText('ChildNode')).not.toBeInTheDocument();
    });

    it('should expand when clicking toggle on collapsed node', () => {
      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', label: 'ChildNode', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      expect(screen.queryByText('ChildNode')).not.toBeInTheDocument();

      const toggle = screen.getByTestId('toggle-test-node');
      fireEvent.click(toggle);

      expect(screen.getByText('ChildNode')).toBeInTheDocument();
    });
  });

  describe('given aria-expanded attribute', () => {
    it('should be "true" when expanded', () => {
      testInRoot(() => {
        expandAll(['test-node']);
      });

      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be "false" when collapsed', () => {
      const node = createNode({
        hasChildren: true,
        children: [createNode({ id: 'child-1', depth: 1 })],
      });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-test-node');
      expect(row).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
