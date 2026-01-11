import { createEffect, onCleanup, Show, type Component } from 'solid-js';
import { getHideMenuItem } from '../../domain/lockHide/hideOperations';
import { getLockMenuItem } from '../../domain/lockHide/lockOperations';
import { contextMenuStore, hideContextMenu } from '../../stores/contextMenuStore';
import { clearAllGuidesWithHistory, guidesStore } from '../../stores/guidesStore';
import {
  getHideStateInfo,
  getLockStateInfo,
  lockSelectedWithHistory,
  toggleHideSelectedWithHistory,
  unlockSelectedWithHistory,
} from '../../stores/lockHideStore';
import { selectionStore } from '../../stores/selectionStore';
import styles from './ContextMenu.module.css';

export interface ContextMenuProps {
  onDelete: () => void;
}

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  let menuRef: HTMLDivElement | undefined;

  const hasSelection = () => selectionStore.selectedIds.size > 0;
  const hasGuides = () => guidesStore.guides.length > 0;

  // Lock state
  const lockStateInfo = () => getLockStateInfo(selectionStore.selectedIds);
  const lockMenuItem = () => getLockMenuItem(lockStateInfo());

  // Hide state
  const hideStateInfo = () => getHideStateInfo(selectionStore.selectedIds);
  const hideMenuItem = () => getHideMenuItem(hideStateInfo());

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

  const handleLock = () => {
    if (!hasSelection()) {
      return;
    }
    const info = lockStateInfo();
    if (info.allLocked) {
      unlockSelectedWithHistory(selectionStore.selectedIds);
    } else {
      lockSelectedWithHistory(selectionStore.selectedIds);
    }
    hideContextMenu();
  };

  const handleHide = () => {
    if (!hasSelection()) {
      return;
    }
    toggleHideSelectedWithHistory(selectionStore.selectedIds);
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
          aria-disabled={!hasSelection()}
          data-testid="lock-menu-item"
          onClick={handleLock}
        >
          <span class={styles.menuLabel}>{lockMenuItem().label}</span>
          <span class={styles.menuShortcut}>{lockMenuItem().shortcut}</span>
        </button>
        <button
          type="button"
          class={styles.menuItem}
          role="menuitem"
          aria-disabled={!hasSelection()}
          data-testid="hide-menu-item"
          onClick={handleHide}
        >
          <span class={styles.menuLabel}>{hideMenuItem().label}</span>
          <span class={styles.menuShortcut}>{hideMenuItem().shortcut}</span>
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
