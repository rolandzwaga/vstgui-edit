import { type Component, createEffect, createMemo, Show } from 'solid-js';
import type { TemplateDefinition } from '../../types/uidesc';
import { documentStore } from '../../stores/documentStore';
import { buildTree, getContainerIds, getTreeAncestorIds } from '../../domain/hierarchy';
import { expandAll, expandNode } from '../../stores/hierarchyStore';
import { selectionStore } from '../../stores/selectionStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { TreeNode } from './TreeNode';
import { EmptyState } from './EmptyState';
import { HierarchyDragProvider } from './HierarchyDragContext';
import styles from './HierarchyPanel.module.css';

export const HierarchyPanel: Component = () => {
  const firstTemplate = createMemo((): [string, TemplateDefinition] | null => {
    const doc = documentStore.document;
    if (!doc) return null;

    const vstgui = doc['vstgui-ui-description'];
    if (!vstgui?.templates) return null;

    const entries = Object.entries(vstgui.templates) as [string, TemplateDefinition][];
    if (entries.length === 0) return null;

    return entries[0];
  });

  const tree = createMemo(() => {
    const template = firstTemplate();
    if (!template) return null;

    const [name, view] = template;
    const treeNode = buildTree(view, name);

    const containerIds = getContainerIds(treeNode);
    expandAll(containerIds);

    return treeNode;
  });

  createEffect(() => {
    const selectedIds = selectionStore.selectedIds;
    const treeRoot = tree();

    if (!treeRoot || selectedIds.size === 0) return;

    for (const selectedId of selectedIds) {
      const ancestors = getTreeAncestorIds(selectedId, treeRoot);
      for (const ancestorId of ancestors) {
        expandNode(ancestorId);
      }
    }
  });

  return (
    <HierarchyDragProvider>
      <div class={styles.panel} data-testid="hierarchy-panel">
        <CollapsibleSection title="Hierarchy">
          <Show when={tree()} fallback={<EmptyState />}>
            {(treeNode) => (
              <div role="tree" aria-label="View hierarchy" class={styles.tree}>
                <TreeNode node={treeNode()} />
              </div>
            )}
          </Show>
        </CollapsibleSection>
      </div>
    </HierarchyDragProvider>
  );
};
