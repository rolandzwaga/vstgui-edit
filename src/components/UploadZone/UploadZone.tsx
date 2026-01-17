import { createSignal, For, Show } from 'solid-js';
import { documentStore, loadFile, setDragging, reset, createNewDocument } from '../../stores/documentStore';
import {
  projectStore,
  openNameDialog,
  closeNameDialog,
  setPendingFile,
  clearPendingFile,
  createProject,
} from '../../stores/projectStore';
import type { NewDocumentConfig } from '../../types/createNew';
import { CreateNewDialog } from '../CreateNewDialog';
import { ProjectNameDialog } from '../ProjectNameDialog';
import styles from './UploadZone.module.css';

const hasParseErrors = () =>
  documentStore.parseState === 'invalid' && documentStore.parseErrors && documentStore.parseErrors.length > 0;

export function UploadZone() {
  let fileInputRef: HTMLInputElement | undefined;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false);

  const handleCreateNew = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreate = (config: NewDocumentConfig) => {
    createNewDocument(config);
    setIsCreateDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };

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
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
    // Reset input so same file can be selected again
    target.value = '';
  };

  /**
   * Handle file upload - loads the file and shows project name dialog if not in session-only mode.
   */
  const handleFileUpload = async (file: File) => {
    await loadFile(file);

    // If parse was successful and we're not in session-only mode, show name dialog
    if (documentStore.parseState === 'valid' && !projectStore.isSessionOnly) {
      // Store the file info and open the name dialog
      setPendingFile({
        content: documentStore.content!,
        format: documentStore.detectedFormat === 'json' ? 'json' : 'xml',
        filename: file.name,
      });
      openNameDialog('create');
    }
  };

  /**
   * Handle project name confirmation from the dialog.
   */
  const handleNameConfirm = async (name: string) => {
    const pending = projectStore.pendingFile;
    if (!pending) {
      closeNameDialog();
      return;
    }

    // Create the project
    await createProject(name, pending.content, pending.format);

    // Clean up
    clearPendingFile();
    closeNameDialog();
  };

  /**
   * Handle name dialog cancel - clear pending file.
   */
  const handleNameCancel = () => {
    clearPendingFile();
    closeNameDialog();
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

      <Show when={documentStore.uploadState === 'success' && !hasParseErrors()}>
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

      <Show when={hasParseErrors()}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class={styles.title}>Parse failed</p>
        <p class={styles.filename}>{documentStore.metadata?.filename}</p>
        <div class={styles.parseErrors} role="alert">
          <For each={documentStore.parseErrors}>
            {(error) => (
              <div class={styles.parseError}>
                <div class={styles.errorHeader}>
                  <span class={styles.errorType}>[{error.type}]</span>
                  <span class={styles.errorMsg}>{error.message}</span>
                </div>
                <Show when={error.path}>
                  <div class={styles.errorPath}>Path: {error.path}</div>
                </Show>
                <Show when={error.data}>
                  <div class={styles.errorData}>Data: {error.data}</div>
                </Show>
              </div>
            )}
          </For>
        </div>
        <button class={styles.dismissButton} onClick={handleDismissError} type="button">
          Try again
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
        <p class={styles.subtitle}>or click the buttons below</p>
        <div class={styles.buttonGroup}>
          <button class={styles.button} onClick={handleButtonClick} type="button">
            Browse files
          </button>
          <button class={styles.buttonSecondary} onClick={handleCreateNew} type="button">
            Create New
          </button>
        </div>
      </Show>

      <input
        ref={fileInputRef}
        type="file"
        accept=".uidesc"
        class={styles.fileInput}
        onChange={handleFileSelect}
      />

      <CreateNewDialog
        isOpen={isCreateDialogOpen()}
        onClose={handleCloseDialog}
        onCreate={handleCreate}
      />

      <ProjectNameDialog
        isOpen={projectStore.isNameDialogOpen}
        mode={projectStore.nameDialogMode}
        initialName={projectStore.pendingFile?.filename?.replace(/\.uidesc$/i, '') ?? ''}
        onConfirm={handleNameConfirm}
        onCancel={handleNameCancel}
      />
    </div>
  );
}
