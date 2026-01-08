import { type Component, createEffect, createMemo, Show } from 'solid-js';
import type { TemplateDefinition } from '../../types/uidesc';
import { getTemplate } from '../../stores/documentStore';
import { templateStore } from '../../stores/templateStore';
import { buildTree, getContainerIds, getTreeAncestorIds } from '../../domain/hierarchy';
import { expandAll, expandNode } from '../../stores/hierarchyStore';
import { selectionStore } from '../../stores/selectionStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { TreeNode } from './TreeNode';
import { EmptyState } from './EmptyState';
import { HierarchyDragProvider } from './HierarchyDragContext';
import styles from './HierarchyPanel.module.css';

export const HierarchyPanel: Component = () => {
  const activeTemplate = createMemo((): [string, TemplateDefinition] | null => {
    const activeId = templateStore.activeTemplateId;
    if (!activeId) return null;

    const template = getTemplate(activeId);
    if (!template) return null;

    return [activeId, template];
  });

  const tree = createMemo(() => {
    const template = activeTemplate();
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
        <CollapsibleSection title="Hierarchy" defaultExpanded={false}>
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
