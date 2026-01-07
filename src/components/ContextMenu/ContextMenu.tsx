import { createEffect, onCleanup, Show, type Component } from 'solid-js';
import { contextMenuStore, hideContextMenu } from '../../stores/contextMenuStore';
import { selectionStore } from '../../stores/selectionStore';
import styles from './ContextMenu.module.css';

export interface ContextMenuProps {
  onDelete: () => void;
}

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  let menuRef: HTMLDivElement | undefined;

  const hasSelection = () => selectionStore.selectedIds.size > 0;

  const handleDelete = () => {
    if (!hasSelection()) {
      return;
    }
    props.onDelete();
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
      </div>
    </Show>
  );
};
