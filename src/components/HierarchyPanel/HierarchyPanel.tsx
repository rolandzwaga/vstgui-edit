import { type Component, createMemo, Show } from 'solid-js';
import type { TemplateDefinition } from '../../types/uidesc';
import { documentStore } from '../../stores/documentStore';
import { buildTree, getContainerIds } from '../../domain/hierarchy';
import { expandAll } from '../../stores/hierarchyStore';
import { TreeNode } from './TreeNode';
import { EmptyState } from './EmptyState';
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

  return (
    <div class={styles.panel} data-testid="hierarchy-panel">
      <Show when={tree()} fallback={<EmptyState />}>
        {(treeNode) => (
          <div role="tree" aria-label="View hierarchy" class={styles.tree}>
            <TreeNode node={treeNode()} />
          </div>
        )}
      </Show>
    </div>
  );
};
