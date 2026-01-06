import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { select, resetSelection } from '../../../stores/selectionStore';
import { resetHierarchy, expandAll } from '../../../stores/hierarchyStore';
import { TreeNode } from '../TreeNode';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

describe('TreeNode scroll behavior', () => {
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
    vi.restoreAllMocks();
  });

  describe('given a node becomes selected', () => {
    it('should call scrollIntoView on the node element', async () => {
      const scrollIntoViewMock = vi.fn();
      const node = createNode({ id: 'view-1' });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-view-1');
      row.scrollIntoView = scrollIntoViewMock;

      testInRoot(() => {
        select('view-1');
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  });

  describe('given a node is already selected', () => {
    it('should not call scrollIntoView again on re-render', async () => {
      const scrollIntoViewMock = vi.fn();
      const node = createNode({ id: 'view-1' });

      testInRoot(() => {
        select('view-1');
      });

      render(() => <TreeNode node={node} />);

      const row = screen.getByTestId('tree-node-view-1');
      row.scrollIntoView = scrollIntoViewMock;

      await Promise.resolve();
      await Promise.resolve();

      scrollIntoViewMock.mockClear();

      testInRoot(() => {
        select('view-1');
      });

      await Promise.resolve();

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });
});
