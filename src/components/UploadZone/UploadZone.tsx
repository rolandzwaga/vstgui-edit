import { Show } from 'solid-js';
import { documentStore, loadFile, setDragging, reset } from '../../stores/documentStore';
import styles from './UploadZone.module.css';

export function UploadZone() {
  let fileInputRef: HTMLInputElement | undefined;

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      setDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await loadFile(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      await loadFile(files[0]);
    }
    // Reset input so same file can be selected again
    target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef?.click();
  };

  const handleDismissError = () => {
    reset();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div
      class={styles.uploadZone}
      role="region"
      aria-label="File upload zone"
      data-state={documentStore.uploadState}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Show when={documentStore.uploadState === 'loading'}>
        <div class={styles.spinner} aria-hidden="true" />
        <p class={styles.title}>Loading...</p>
        <p class={styles.subtitle}>Reading file contents</p>
      </Show>

      <Show when={documentStore.uploadState === 'success'}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <p class={styles.title}>File loaded successfully</p>
        <p class={styles.filename}>{documentStore.metadata?.filename}</p>
        <button class={styles.button} onClick={handleButtonClick} type="button">
          Upload different file
        </button>
      </Show>

      <Show when={documentStore.uploadState === 'error'}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class={styles.title}>Upload failed</p>
        <div class={styles.errorMessage} role="alert">
          {documentStore.error?.message}
        </div>
        <button class={styles.dismissButton} onClick={handleDismissError} type="button">
          Try again
        </button>
      </Show>

      <Show when={documentStore.uploadState === 'idle' || documentStore.uploadState === 'dragging'}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class={styles.title}>
          {documentStore.uploadState === 'dragging' ? 'Drop file here' : 'Drag and drop a .uidesc file'}
        </p>
        <p class={styles.subtitle}>or click the button below</p>
        <button class={styles.button} onClick={handleButtonClick} type="button">
          Browse files
        </button>
      </Show>

      <input
        ref={fileInputRef}
        type="file"
        accept=".uidesc"
        class={styles.fileInput}
        onChange={handleFileSelect}
      />
    </div>
  );
}
