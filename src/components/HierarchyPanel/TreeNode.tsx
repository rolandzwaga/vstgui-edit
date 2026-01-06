import { type Component, For, Show } from 'solid-js';
import type { TreeNode as TreeNodeType } from '../../types/hierarchy';
import { isExpanded, toggleExpanded } from '../../stores/hierarchyStore';
import styles from './TreeNode.module.css';

const INDENT_SIZE = 16;

export interface TreeNodeProps {
  node: TreeNodeType;
}

export const TreeNode: Component<TreeNodeProps> = (props) => {
  const indentPx = () => props.node.depth * INDENT_SIZE;
  const expanded = () => isExpanded(props.node.id);

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(props.node.id);
  };

  return (
    <>
      <div
        class={styles.row}
        data-testid={`tree-node-${props.node.id}`}
        role="treeitem"
        aria-expanded={props.node.hasChildren ? (expanded() ? 'true' : 'false') : undefined}
        style={{ 'padding-left': `${indentPx()}px` }}
      >
        <Show when={props.node.hasChildren}>
          <button
            type="button"
            class={styles.toggle}
            data-testid={`toggle-${props.node.id}`}
            onClick={handleToggle}
            aria-label={expanded() ? 'Collapse' : 'Expand'}
          >
            <span class={expanded() ? styles.chevronDown : styles.chevronRight}>▶</span>
          </button>
        </Show>
        <span class={styles.label}>{props.node.label}</span>
      </div>
      <Show when={props.node.hasChildren && expanded()}>
        <For each={props.node.children}>
          {(child) => <TreeNode node={child} />}
        </For>
      </Show>
    </>
  );
};
