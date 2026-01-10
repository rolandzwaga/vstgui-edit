import { type Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { documentStore, markClean, setFileHandle } from '../../stores/documentStore';
import {
  closeDropdown,
  initializeFormat,
  saveFormatStore,
} from '../../stores/saveFormatStore';
import { serializeToJson, serializeToXml } from '../../domain/serializer';
import {
  downloadDocument,
  hasFileSystemAccess,
  saveToFileHandle,
  showSaveFilePicker,
} from '../../services/fileService';
import styles from './SaveButton.module.css';

export interface SaveButtonProps {
  class?: string;
}

export const SaveButton: Component<SaveButtonProps> = (props) => {
  const [isSaving, setIsSaving] = createSignal(false);

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
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

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
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleChevronClick = () => {
    // Toggle dropdown - implementation will be added in US2
    if (saveFormatStore.isDropdownOpen) {
      closeDropdown();
    } else {
      // openDropdown will be called - for now just placeholder
    }
  };

  const isDisabled = () => !documentStore.isDirty || isSaving();

  const formatLabel = () => saveFormatStore.selectedFormat.toUpperCase();

  return (
    <div class={`${styles.container} ${props.class ?? ''}`} role="group" aria-label="Save options">
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
    </div>
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
