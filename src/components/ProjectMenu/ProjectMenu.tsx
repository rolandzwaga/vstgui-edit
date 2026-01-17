import { createSignal, onCleanup, onMount, Show, type Component } from 'solid-js';
import { detectFormat } from '../../domain/parser';
import type { OrphanedBitmap } from '../../domain/project/types';
import {
  projectStore,
  saveCurrentProject,
  openProjectList,
  replaceUidesc,
} from '../../stores/projectStore';
import styles from './ProjectMenu.module.css';

export interface ProjectMenuProps {
  /** Callback to open the Create New dialog */
  onNewProject: () => void;
  /** Callback when orphaned bitmaps are detected after replace */
  onOrphanedBitmaps?: (orphans: OrphanedBitmap[]) => void;
}

/**
 * ProjectMenu - Dropdown menu for project operations.
 *
 * Provides options for:
 * - New Project: Opens the Create New dialog
 * - Load Project: Saves current project if dirty, then opens the project list
 */
export const ProjectMenu: Component<ProjectMenuProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;
  let buttonRef: HTMLButtonElement | undefined;
  let replaceInputRef: HTMLInputElement | undefined;

  // Disabled in session-only mode (IndexedDB unavailable)
  const isDisabled = () => projectStore.isSessionOnly;

  // Replace uidesc is only available when a project is open
  const hasOpenProject = () => !!projectStore.currentProject;

  const toggleDropdown = () => {
    if (!isDisabled()) {
      setIsOpen(!isOpen());
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleNewProject = () => {
    closeDropdown();
    props.onNewProject();
  };

  const handleLoadProject = async () => {
    closeDropdown();

    // Save current project if there is one with unsaved changes
    if (projectStore.currentProject && projectStore.isDirty) {
      await saveCurrentProject();
    }

    openProjectList();
  };

  const handleReplaceUidesc = () => {
    closeDropdown();
    replaceInputRef?.click();
  };

  const handleReplaceFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      const content = await file.text();
      const format = detectFormat(content);

      if (format === 'unknown') {
        console.error('Unknown file format');
        return;
      }

      const result = await replaceUidesc(content, format);

      if (result.success && result.orphanedBitmaps && result.orphanedBitmaps.length > 0) {
        props.onOrphanedBitmaps?.(result.orphanedBitmaps);
      }
    } catch (error) {
      console.error('Failed to replace uidesc:', error);
    }

    // Reset input so same file can be selected again
    target.value = '';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      menuRef &&
      !menuRef.contains(e.target as Node) &&
      buttonRef &&
      !buttonRef.contains(e.target as Node)
    ) {
      closeDropdown();
    }
  };

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.container}>
      <button
        ref={buttonRef}
        type="button"
        class={styles.button}
        onClick={toggleDropdown}
        disabled={isDisabled()}
        aria-haspopup="true"
        aria-expanded={isOpen()}
        aria-label="Project menu"
        title="Project options"
      >
        Project
        <svg
          class={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <Show when={isOpen()}>
        <div
          ref={menuRef}
          class={styles.dropdown}
          role="menu"
          aria-label="Project options"
        >
          <button
            type="button"
            class={styles.menuItem}
            role="menuitem"
            onClick={handleNewProject}
          >
            New Project...
          </button>
          <button
            type="button"
            class={styles.menuItem}
            role="menuitem"
            onClick={handleLoadProject}
          >
            Load Project...
          </button>
          <Show when={hasOpenProject()}>
            <div class={styles.divider} />
            <button
              type="button"
              class={styles.menuItem}
              role="menuitem"
              onClick={handleReplaceUidesc}
            >
              Replace uidesc...
            </button>
          </Show>
        </div>
      </Show>

      {/* Hidden file input for Replace uidesc */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".uidesc"
        style={{ display: 'none' }}
        onChange={handleReplaceFileSelect}
      />
    </div>
  );
};
