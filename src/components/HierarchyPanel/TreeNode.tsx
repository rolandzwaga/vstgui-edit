import { type Component, For, Show } from 'solid-js';
import type { TreeNode as TreeNodeType } from '../../types/hierarchy';
import styles from './TreeNode.module.css';

const INDENT_SIZE = 16;

export interface TreeNodeProps {
  node: TreeNodeType;
}

export const TreeNode: Component<TreeNodeProps> = (props) => {
  const indentPx = () => props.node.depth * INDENT_SIZE;

  return (
    <>
      <div
        class={styles.row}
        data-testid={`tree-node-${props.node.id}`}
        role="treeitem"
        aria-expanded={props.node.hasChildren ? 'true' : undefined}
        style={{ 'padding-left': `${indentPx()}px` }}
      >
        <span class={styles.label}>{props.node.label}</span>
      </div>
      <Show when={props.node.hasChildren}>
        <For each={props.node.children}>
          {(child) => <TreeNode node={child} />}
        </For>
      </Show>
    </>
  );
};
