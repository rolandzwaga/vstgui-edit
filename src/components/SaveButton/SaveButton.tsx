import { type Component, createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { documentStore, markClean, setFileHandle } from '../../stores/documentStore';
import {
  cancelFormatChange,
  closeDropdown,
  confirmFormatChange,
  initializeFormat,
  openDropdown,
  saveFormatStore,
  selectFormat,
} from '../../stores/saveFormatStore';
import { serializeToJson, serializeToXml } from '../../domain/serializer';
import type { SaveFormat } from '../../domain/serializer/types';
import {
  downloadDocument,
  hasFileSystemAccess,
  saveToFileHandle,
  showSaveFilePicker,
} from '../../services/fileService';
import { FormatChangeDialog } from './FormatChangeDialog';
import styles from './SaveButton.module.css';

export interface SaveButtonProps {
  class?: string;
}

interface FormatOption {
  value: SaveFormat;
  label: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
];

export const SaveButton: Component<SaveButtonProps> = (props) => {
  const [isSaving, setIsSaving] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;
  let chevronRef: HTMLButtonElement | undefined;

  // Initialize format when document changes
  const initFormat = () => {
    if (documentStore.document) {
      initializeFormat(documentStore.originalFormat);
    }
  };

  // Initialize on mount if document already loaded
  onMount(() => {
    initFormat();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleClickOutside);
  });

  // Position dropdown when it opens
  createEffect(() => {
    if (saveFormatStore.isDropdownOpen && containerRef && dropdownRef) {
      computePosition(containerRef, dropdownRef, {
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        if (dropdownRef) {
          dropdownRef.style.left = `${x}px`;
          dropdownRef.style.top = `${y}px`;
        }
      });
    }
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (
      saveFormatStore.isDropdownOpen &&
      containerRef &&
      !containerRef.contains(e.target as Node) &&
      dropdownRef &&
      !dropdownRef.contains(e.target as Node)
    ) {
      closeDropdown();
    }
  };

  const getSerializedContent = (): string => {
    const doc = documentStore.document;
    if (!doc) return '';

    const format = saveFormatStore.selectedFormat;
    return format === 'xml' ? serializeToXml(doc) : serializeToJson(doc);
  };

  const getFilename = (): string => {
    return documentStore.metadata?.filename ?? 'untitled.uidesc';
  };

  const handleSave = async () => {
    if (!documentStore.document || isSaving()) return;

    // Close dropdown if open
    if (saveFormatStore.isDropdownOpen) {
      closeDropdown();
    }

    setIsSaving(true);

    try {
      const content = getSerializedContent();
      const filename = getFilename();
      const format = saveFormatStore.selectedFormat;

      if (hasFileSystemAccess()) {
        if (documentStore.fileHandle) {
          const result = await saveToFileHandle(documentStore.fileHandle, content);
          if (result.success) {
            markClean();
          }
        } else {
          const handle = await showSaveFilePicker(filename);
          if (handle) {
            const result = await saveToFileHandle(handle, content);
            if (result.success) {
              setFileHandle(handle);
              markClean();
            }
          }
        }
      } else {
        downloadDocument(content, filename, format);
        markClean();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle keys when dialog is open
    if (saveFormatStore.isConfirmDialogOpen) {
      return;
    }

    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Escape to close dropdown
    if (e.key === 'Escape' && saveFormatStore.isDropdownOpen) {
      e.preventDefault();
      closeDropdown();
      chevronRef?.focus();
    }
  };

  const handleChevronClick = () => {
    if (saveFormatStore.isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleFormatSelect = (format: SaveFormat) => {
    selectFormat(format);
  };

  const handleConfirmFormatChange = () => {
    confirmFormatChange();
    chevronRef?.focus();
  };

  const handleCancelFormatChange = () => {
    cancelFormatChange();
    chevronRef?.focus();
  };

  const isDisabled = () => !documentStore.isDirty || isSaving();

  const formatLabel = () => saveFormatStore.selectedFormat.toUpperCase();

  // Get original format for dialog
  const originalFormat = () => documentStore.originalFormat ?? 'json';

  return (
    <>
      <div
        ref={containerRef}
        class={`${styles.container} ${props.class ?? ''}`}
        role="group"
        aria-label="Save options"
      >
        <button
          type="button"
          class={`${styles.mainButton} ${isSaving() ? styles.saving : ''}`}
          onClick={handleSave}
          disabled={isDisabled()}
          aria-label={isSaving() ? 'Saving...' : `Save (${formatLabel()}) (Ctrl+S)`}
          title="Save (Ctrl+S)"
        >
          <Show when={isSaving()} fallback={<SaveIcon />}>
            <span class={styles.spinner} />
          </Show>
          Save ({formatLabel()})
        </button>
        <div class={styles.separator} />
        <button
          ref={chevronRef}
          type="button"
          class={styles.chevronButton}
          onClick={handleChevronClick}
          disabled={isDisabled()}
          aria-haspopup="menu"
          aria-expanded={saveFormatStore.isDropdownOpen}
          aria-label="Select save format"
        >
          <ChevronIcon />
        </button>

        {/* Dropdown menu */}
        <Show when={saveFormatStore.isDropdownOpen}>
          <div
            ref={dropdownRef}
            class={styles.dropdown}
            role="menu"
            aria-label="Save format options"
          >
            <For each={FORMAT_OPTIONS}>
              {(option) => (
                <button
                  type="button"
                  class={`${styles.dropdownItem} ${
                    saveFormatStore.selectedFormat === option.value ? styles.dropdownItemActive : ''
                  }`}
                  role="menuitem"
                  onClick={() => handleFormatSelect(option.value)}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Format change confirmation dialog */}
      <FormatChangeDialog
        isOpen={saveFormatStore.isConfirmDialogOpen}
        originalFormat={originalFormat()}
        newFormat={saveFormatStore.pendingFormat ?? 'json'}
        onConfirm={handleConfirmFormatChange}
        onCancel={handleCancelFormatChange}
      />
    </>
  );
};

const SaveIcon: Component = () => (
  <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const ChevronIcon: Component = () => (
  <svg class={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
