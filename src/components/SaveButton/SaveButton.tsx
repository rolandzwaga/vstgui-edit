import { type Component, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { documentStore, markClean, setFileHandle } from '../../stores/documentStore';
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

  const getSerializedContent = (): string => {
    const doc = documentStore.document;
    if (!doc) return '';

    const format = documentStore.originalFormat ?? 'json';
    return format === 'xml' ? serializeToXml(doc) : serializeToJson(doc);
  };

  const getFilename = (): string => {
    return documentStore.metadata?.filename ?? 'untitled.uidesc';
  };

  const handleSave = async () => {
    if (!documentStore.document || isSaving()) return;

    setIsSaving(true);

    try {
      const content = getSerializedContent();
      const filename = getFilename();
      const format = documentStore.originalFormat ?? 'json';

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

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const isDisabled = () => !documentStore.isDirty || isSaving();

  return (
    <div class={`${styles.container} ${props.class ?? ''}`}>
      <button
        type="button"
        class={`${styles.saveButton} ${isSaving() ? styles.saving : ''}`}
        onClick={handleSave}
        disabled={isDisabled()}
        aria-label={isSaving() ? 'Saving...' : 'Save (Ctrl+S)'}
        title="Save (Ctrl+S)"
      >
        <Show when={isSaving()} fallback={<SaveIcon />}>
          <span class={styles.spinner} />
        </Show>
        Save
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
