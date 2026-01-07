import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { resetHierarchy } from '../../../stores/hierarchyStore';
import { resetSelection } from '../../../stores/selectionStore';
import { TreeNode } from '../TreeNode';
import { HierarchyDragProvider } from '../HierarchyDragContext';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

const renderTreeNode = (node: TreeNodeType) =>
  render(() => (
    <HierarchyDragProvider>
      <TreeNode node={node} />
    </HierarchyDragProvider>
  ));

describe('TreeNode icons', () => {
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
      resetSelection();
      resetHierarchy();
    });
  });

  describe('given a container view', () => {
    it('should render folder icon', () => {
      const node = createNode({ category: 'container' });

      renderTreeNode(node);

      const icon = screen.getByTestId('icon-test-node');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'folder');
    });
  });

  describe('given a control view', () => {
    it('should render sliders icon', () => {
      const node = createNode({ category: 'control', label: 'CSlider' });

      renderTreeNode(node);

      const icon = screen.getByTestId('icon-test-node');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'sliders');
    });
  });

  describe('given a display view', () => {
    it('should render font icon', () => {
      const node = createNode({ category: 'display', label: 'CTextLabel' });

      renderTreeNode(node);

      const icon = screen.getByTestId('icon-test-node');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'font');
    });
  });

  describe('given a custom view', () => {
    it('should render puzzle-piece icon', () => {
      const node = createNode({ category: 'custom', label: 'MyCustomView' });

      renderTreeNode(node);

      const icon = screen.getByTestId('icon-test-node');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'puzzle-piece');
    });
  });
});
