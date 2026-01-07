import { type Component, For, Show } from 'solid-js';
import { FontAwesomeIcon } from 'solid-fontawesome';
import {
  createMultiReorderOperation,
  createMultiReparentOperation,
  getDropPosition,
} from '../../domain/hierarchy';
import { reparentView, reorderView } from '../../stores/documentStore';
import { isExpanded, toggleExpanded } from '../../stores/hierarchyStore';
import { pushOperation } from '../../stores/historyStore';
import { isSelected, select, selectionStore, toggleSelect } from '../../stores/selectionStore';
import type { TreeNode as TreeNodeType } from '../../types/hierarchy';
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
  const isDropBefore = () => isDropTarget() && dragState.dropPosition === 'before' && dragState.isValidDrop;
  const isDropAfter = () => isDropTarget() && dragState.dropPosition === 'after' && dragState.isValidDrop;
  const isDropInside = () => isDropTarget() && dragState.dropPosition === 'inside' && dragState.isValidDrop;

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

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = getDropPosition(offsetY, rect.height);

    dragActions.updateDropTarget(props.node.id, position);

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = dragState.isValidDrop ? 'move' : 'none';
    }
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
    const position = dragState.dropPosition;
    const draggedIds = [...dragState.draggedIds];

    if (position === 'inside') {
      const multiOp = createMultiReparentOperation(draggedIds, targetId);
      if (multiOp) {
        const results: Array<{ viewId: string; oldParentId: string; oldIndex: number; oldOrigin: string; newOrigin: string }> = [];

        for (const op of multiOp.operations) {
          const result = reparentView(op.viewId, targetId, undefined, op.newOrigin);
          if (result) {
            results.push({
              viewId: op.viewId,
              oldParentId: op.oldParentId,
              oldIndex: op.oldIndex,
              oldOrigin: op.oldOrigin,
              newOrigin: op.newOrigin,
            });
          }
        }

        if (results.length > 0) {
          const capturedResults = [...results];
          const capturedTargetId = targetId;
          const count = results.length;

          pushOperation({
            type: 'reparent',
            description: count === 1 ? 'Reparent view' : `Reparent ${count} views`,
            timestamp: Date.now(),
            undo: () => {
              for (let i = capturedResults.length - 1; i >= 0; i--) {
                const r = capturedResults[i];
                reparentView(r.viewId, r.oldParentId, r.oldIndex, r.oldOrigin);
              }
            },
            redo: () => {
              for (const r of capturedResults) {
                reparentView(r.viewId, capturedTargetId, undefined, r.newOrigin);
              }
            },
          });
        }
      }
    } else if (position === 'before' || position === 'after') {
      const multiOp = createMultiReorderOperation(draggedIds, targetId, position);
      if (multiOp) {
        const results: Array<{ viewId: string; oldIndex: number; newIndex: number }> = [];

        for (const op of multiOp.operations) {
          const result = reorderView(op.viewId, op.newIndex);
          if (result) {
            results.push({
              viewId: op.viewId,
              oldIndex: op.oldIndex,
              newIndex: result.newIndex,
            });
          }
        }

        if (results.length > 0) {
          const capturedResults = [...results];
          const count = results.length;

          pushOperation({
            type: 'reorder',
            description: count === 1 ? 'Reorder view' : `Reorder ${count} views`,
            timestamp: Date.now(),
            undo: () => {
              for (let i = capturedResults.length - 1; i >= 0; i--) {
                const r = capturedResults[i];
                reorderView(r.viewId, r.oldIndex);
              }
            },
            redo: () => {
              for (const r of capturedResults) {
                reorderView(r.viewId, r.newIndex);
              }
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
    if (isDropInside()) classes.push(styles.dropTarget);
    if (isDropBefore()) classes.push(styles.dropBefore);
    if (isDropAfter()) classes.push(styles.dropAfter);
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
