import { type Component, For, Show } from 'solid-js';
import { FontAwesomeIcon } from 'solid-fontawesome';
import type { TreeNode as TreeNodeType } from '../../types/hierarchy';
import { isExpanded, toggleExpanded } from '../../stores/hierarchyStore';
import { isSelected, select, toggleSelect } from '../../stores/selectionStore';
import { CATEGORY_ICON_NAMES } from './icons';
import styles from './TreeNode.module.css';

const INDENT_SIZE = 16;

export interface TreeNodeProps {
  node: TreeNodeType;
}

export const TreeNode: Component<TreeNodeProps> = (props) => {
  const indentPx = () => props.node.depth * INDENT_SIZE;
  const expanded = () => isExpanded(props.node.id);
  const selected = () => isSelected(props.node.id);
  const iconName = () => CATEGORY_ICON_NAMES[props.node.category];

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(props.node.id);
  };

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) {
      toggleSelect(props.node.id);
    } else {
      select(props.node.id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(props.node.id);
        break;
      case 'ArrowRight':
        if (props.node.hasChildren && !expanded()) {
          e.preventDefault();
          toggleExpanded(props.node.id);
        }
        break;
      case 'ArrowLeft':
        if (props.node.hasChildren && expanded()) {
          e.preventDefault();
          toggleExpanded(props.node.id);
        }
        break;
    }
  };

  return (
    <>
      <div
        class={`${styles.row} ${selected() ? styles.selected : ''}`}
        data-testid={`tree-node-${props.node.id}`}
        role="treeitem"
        tabindex={0}
        aria-expanded={props.node.hasChildren ? (expanded() ? 'true' : 'false') : undefined}
        aria-selected={selected()}
        style={{ 'padding-left': `${indentPx()}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
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
        <span
          class={`${styles.icon} ${styles[`icon${props.node.category.charAt(0).toUpperCase()}${props.node.category.slice(1)}`]}`}
          data-testid={`icon-${props.node.id}`}
          data-icon={iconName()}
        >
          <FontAwesomeIcon icon={iconName()} />
        </span>
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
