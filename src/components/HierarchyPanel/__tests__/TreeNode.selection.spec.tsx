import { beforeEach, describe, expect, it } from 'vitest';
import { For } from 'solid-js';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { isSelected, resetSelection, selectionStore } from '../../../stores/selectionStore';
import { resetHierarchy } from '../../../stores/hierarchyStore';
import { TreeNode } from '../TreeNode';
import { HierarchyDragProvider } from '../HierarchyDragContext';
import type { TreeNode as TreeNodeType } from '../../../types/hierarchy';

const renderTreeNode = (node: TreeNodeType) =>
  render(() => (
    <HierarchyDragProvider>
      <TreeNode node={node} />
    </HierarchyDragProvider>
  ));

const renderMultipleTreeNodes = (nodes: TreeNodeType[]) =>
  render(() => (
    <HierarchyDragProvider>
      <For each={nodes}>{node => <TreeNode node={node} />}</For>
    </HierarchyDragProvider>
  ));

describe('TreeNode selection', () => {
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

  describe('given click on tree node', () => {
    it('should select the node', () => {
      const node = createNode({ id: 'view-1' });

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-view-1');
      fireEvent.click(row);

      testInRoot(() => {
        expect(isSelected('view-1')).toBe(true);
      });
    });

    it('should clear previous selection', () => {
      const node1 = createNode({ id: 'view-1', label: 'View1' });
      const node2 = createNode({ id: 'view-2', label: 'View2' });

      renderMultipleTreeNodes([node1, node2]);

      fireEvent.click(screen.getByTestId('tree-node-view-1'));
      fireEvent.click(screen.getByTestId('tree-node-view-2'));

      testInRoot(() => {
        expect(isSelected('view-1')).toBe(false);
        expect(isSelected('view-2')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });
  });

  describe('given Shift+click on tree node', () => {
    it('should toggle selection (add to multi-selection)', () => {
      const node1 = createNode({ id: 'view-1', label: 'View1' });
      const node2 = createNode({ id: 'view-2', label: 'View2' });

      renderMultipleTreeNodes([node1, node2]);

      fireEvent.click(screen.getByTestId('tree-node-view-1'));
      fireEvent.click(screen.getByTestId('tree-node-view-2'), { shiftKey: true });

      testInRoot(() => {
        expect(isSelected('view-1')).toBe(true);
        expect(isSelected('view-2')).toBe(true);
        expect(selectionStore.selectedIds.size).toBe(2);
      });
    });

    it('should remove from selection if already selected', () => {
      const node1 = createNode({ id: 'view-1', label: 'View1' });
      const node2 = createNode({ id: 'view-2', label: 'View2' });

      renderMultipleTreeNodes([node1, node2]);

      fireEvent.click(screen.getByTestId('tree-node-view-1'));
      fireEvent.click(screen.getByTestId('tree-node-view-2'), { shiftKey: true });
      fireEvent.click(screen.getByTestId('tree-node-view-2'), { shiftKey: true });

      testInRoot(() => {
        expect(isSelected('view-1')).toBe(true);
        expect(isSelected('view-2')).toBe(false);
        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });
  });

  describe('given selected state styling', () => {
    it('should apply selected class when node is selected', () => {
      const node = createNode({ id: 'view-1' });

      renderTreeNode(node);

      fireEvent.click(screen.getByTestId('tree-node-view-1'));

      const row = screen.getByTestId('tree-node-view-1');
      expect(row.className).toContain('selected');
    });

    it('should not have selected class when not selected', () => {
      const node = createNode({ id: 'view-1' });

      renderTreeNode(node);

      const row = screen.getByTestId('tree-node-view-1');
      expect(row.className).not.toContain('selected');
    });
  });
});
