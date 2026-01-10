import { createEffect, onCleanup, Show, type Component } from 'solid-js';
import { contextMenuStore, hideContextMenu } from '../../stores/contextMenuStore';
import { selectionStore } from '../../stores/selectionStore';
import { guidesStore, clearAllGuidesWithHistory } from '../../stores/guidesStore';
import styles from './ContextMenu.module.css';

export interface ContextMenuProps {
  onDelete: () => void;
}

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  let menuRef: HTMLDivElement | undefined;

  const hasSelection = () => selectionStore.selectedIds.size > 0;
  const hasGuides = () => guidesStore.guides.length > 0;

  const handleMenuMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleMenuMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = () => {
    if (!hasSelection()) {
      return;
    }
    props.onDelete();
    hideContextMenu();
  };

  const handleClearAllGuides = () => {
    if (!hasGuides()) {
      return;
    }
    clearAllGuidesWithHistory();
    hideContextMenu();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideContextMenu();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      hideContextMenu();
    }
  };

  createEffect(() => {
    if (contextMenuStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    });
  });

  return (
    <Show when={contextMenuStore.isOpen}>
      <div
        ref={menuRef}
        class={styles.menu}
        role="menu"
        data-testid="context-menu"
        onMouseDown={handleMenuMouseDown}
        onMouseUp={handleMenuMouseUp}
        style={{
          left: `${contextMenuStore.position.x}px`,
          top: `${contextMenuStore.position.y}px`,
        }}
      >
        <button
          type="button"
          class={styles.menuItem}
          role="menuitem"
          aria-disabled={!hasSelection()}
          onClick={handleDelete}
        >
          Delete
        </button>
        <div class={styles.divider} />
        <button
          type="button"
          class={styles.menuItem}
          role="menuitem"
          aria-disabled={!hasGuides()}
          data-testid="clear-all-guides"
          onClick={handleClearAllGuides}
        >
          Clear All Guides
        </button>
      </div>
    </Show>
  );
};
