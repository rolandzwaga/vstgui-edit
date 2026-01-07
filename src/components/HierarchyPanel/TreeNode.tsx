import { type Component, For, Show } from 'solid-js';
import { FontAwesomeIcon } from 'solid-fontawesome';
import type { TreeNode as TreeNodeType } from '../../types/hierarchy';
import { isExpanded, toggleExpanded } from '../../stores/hierarchyStore';
import { isSelected, select, toggleSelect, selectionStore } from '../../stores/selectionStore';
import { reparentView, getView } from '../../stores/documentStore';
import { createReparentOperation } from '../../domain/hierarchy/reparent';
import { pushOperation } from '../../stores/historyStore';
import { useHierarchyDragContext } from './HierarchyDragContext';
import { CATEGORY_ICON_NAMES } from './icons';
import styles from './TreeNode.module.css';

const INDENT_SIZE = 16;

export interface TreeNodeProps {
  node: TreeNodeType;
}

export const TreeNode: Component<TreeNodeProps> = (props) => {
  const { state: dragState, actions: dragActions } = useHierarchyDragContext();

  const indentPx = () => props.node.depth * INDENT_SIZE;
  const expanded = () => isExpanded(props.node.id);
  const selected = () => isSelected(props.node.id);
  const iconName = () => CATEGORY_ICON_NAMES[props.node.category];

  const isDragging = () => dragState.isDragging && dragState.draggedIds.includes(props.node.id);
  const isDropTarget = () => dragState.dropTargetId === props.node.id;
  const isValidDropTarget = () => isDropTarget() && dragState.isValidDrop;
  const isInvalidDropTarget = () => isDropTarget() && !dragState.isValidDrop;

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

  const handleDragStart = (e: DragEvent) => {
    const selectedIds = Array.from(selectionStore.selectedIds);
    const dragIds = selectedIds.includes(props.node.id) ? selectedIds : [props.node.id];

    dragActions.startDrag(dragIds);

    e.dataTransfer?.setData('text/plain', dragIds.join(','));
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnd = () => {
    dragActions.cancelDrag();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = dragState.isValidDrop ? 'move' : 'none';
    }
    dragActions.updateDropTarget(props.node.id, 'inside');
  };

  const handleDragLeave = () => {
    if (dragState.dropTargetId === props.node.id) {
      dragActions.updateDropTarget(null, null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.isValidDrop) {
      dragActions.endDrag();
      return;
    }

    const targetId = props.node.id;

    for (const draggedId of dragState.draggedIds) {
      const operation = createReparentOperation(draggedId, targetId);
      if (operation) {
        const result = reparentView(draggedId, targetId, undefined, operation.newOrigin);
        if (result) {
          const capturedOp = { ...operation };
          const capturedResult = { ...result };

          pushOperation({
            type: 'reparent',
            description: `Reparent view`,
            timestamp: Date.now(),
            undo: () => {
              reparentView(
                capturedResult.viewId,
                capturedOp.oldParentId,
                capturedOp.oldIndex,
                capturedOp.oldOrigin
              );
            },
            redo: () => {
              reparentView(
                capturedOp.viewId,
                capturedOp.newParentId,
                undefined,
                capturedOp.newOrigin
              );
            },
          });
        }
      }
    }

    dragActions.endDrag();
  };

  const rowClasses = () => {
    const classes = [styles.row];
    if (selected()) classes.push(styles.selected);
    if (isDragging()) classes.push(styles.dragging);
    if (isValidDropTarget()) classes.push(styles.dropTarget);
    if (isInvalidDropTarget()) classes.push(styles.dropInvalid);
    return classes.join(' ');
  };

  return (
    <>
      <div
        class={rowClasses()}
        data-testid={`tree-node-${props.node.id}`}
        role="treeitem"
        tabindex={0}
        aria-expanded={props.node.hasChildren ? (expanded() ? 'true' : 'false') : undefined}
        aria-selected={selected()}
        draggable={true}
        style={{ 'padding-left': `${indentPx()}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
