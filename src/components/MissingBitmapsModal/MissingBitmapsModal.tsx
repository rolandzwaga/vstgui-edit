/**
 * MissingBitmapsModal - Modal for uploading missing bitmaps.
 *
 * Features:
 * - Bulk drag-and-drop upload area
 * - Individual upload buttons per bitmap
 * - Shows upload progress and completion state
 * - Files matched by exact filename from path
 * - Unmatched files can be added as new bitmaps or ignored
 */

import { type Component, For, Show, createSignal, createUniqueId } from 'solid-js';
import {
  missingBitmapsStore,
  closeMissingBitmapsModal,
  markBitmapUploaded,
  markBitmapsUploaded,
  getMissingCount,
  getTotalMissingCount,
  getRemainingMissingBitmaps,
} from '../../stores/missingBitmapsStore';
import { matchUploadedFiles } from '../../domain/bitmaps/missingBitmaps';
import { uploadBitmap } from '../../stores/documentStore';
import { BulkDropZone } from './BulkDropZone';
import { MissingBitmapItem } from './MissingBitmapItem';
import { UnmatchedFileItem } from './UnmatchedFileItem';
import styles from './MissingBitmapsModal.module.css';

export interface MissingBitmapsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
}

export const MissingBitmapsModal: Component<MissingBitmapsModalProps> = (props) => {
  const titleId = createUniqueId();

  // State for unmatched files (files dropped that don't match any missing bitmap path)
  const [unmatchedFiles, setUnmatchedFiles] = createSignal<File[]>([]);
  const [addingFile, setAddingFile] = createSignal<string | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMissingBitmapsModal();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMissingBitmapsModal();
    }
  };

  const handleBulkUpload = async (files: File[]) => {
    const remainingBitmaps = getRemainingMissingBitmaps();
    const matches = matchUploadedFiles(files, remainingBitmaps);

    // Find unmatched files
    const matchedFiles = new Set(matches.values());
    const newUnmatched = files.filter((f) => !matchedFiles.has(f));

    // Add new unmatched files to existing ones (avoid duplicates by filename)
    if (newUnmatched.length > 0) {
      setUnmatchedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const toAdd = newUnmatched.filter((f) => !existingNames.has(f.name));
        return [...prev, ...toAdd];
      });
    }

    // Handle matched files
    if (matches.size === 0) {
      return;
    }

    const uploadedNames: string[] = [];

    for (const [bitmapName, file] of matches) {
      try {
        const result = await uploadBitmap(file, { targetBitmapName: bitmapName });
        if (result.success) {
          uploadedNames.push(bitmapName);
        }
      } catch {
        // Individual upload failed, continue with others
      }
    }

    if (uploadedNames.length > 0) {
      markBitmapsUploaded(uploadedNames);
    }
  };

  const handleSingleUpload = async (bitmapName: string, file: File) => {
    try {
      const result = await uploadBitmap(file, { targetBitmapName: bitmapName });
      if (result.success) {
        markBitmapUploaded(bitmapName);
      }
    } catch {
      // Upload failed
    }
  };

  const handleClose = () => {
    // Clear unmatched files when closing
    setUnmatchedFiles([]);
    closeMissingBitmapsModal();
  };

  const handleAddUnmatchedFile = async (file: File, bitmapName: string) => {
    setAddingFile(file.name);
    try {
      // Upload as new bitmap (no targetBitmapName means create new)
      const result = await uploadBitmap(file);
      if (result.success) {
        // Remove from unmatched list
        setUnmatchedFiles((prev) => prev.filter((f) => f.name !== file.name));
      }
    } catch {
      // Upload failed
    } finally {
      setAddingFile(null);
    }
  };

  const handleIgnoreUnmatchedFile = (file: File) => {
    setUnmatchedFiles((prev) => prev.filter((f) => f.name !== file.name));
  };

  const handleIgnoreAllUnmatched = () => {
    setUnmatchedFiles([]);
  };

  const missingCount = () => getMissingCount();
  const totalCount = () => getTotalMissingCount();
  const allUploaded = () => missingCount() === 0;
  const hasUnmatchedFiles = () => unmatchedFiles().length > 0;

  return (
    <Show when={props.isOpen}>
      <div
        class={styles.backdrop}
        data-testid="missing-bitmaps-modal-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div class={styles.header}>
            <h2 id={titleId} class={styles.title}>
              Missing Bitmaps
              <Show when={totalCount() > 0}>
                <span class={styles.counter}>
                  ({missingCount()} of {totalCount()} remaining)
                </span>
              </Show>
            </h2>
            <button
              type="button"
              class={styles.closeButton}
              onClick={handleClose}
              aria-label="Close"
              data-testid="missing-bitmaps-close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div class={styles.content}>
            <BulkDropZone onFilesDropped={handleBulkUpload} disabled={allUploaded()} />

            <div class={styles.divider}>
              <span>Or upload individually:</span>
            </div>

            <div class={styles.bitmapList}>
              <For each={missingBitmapsStore.missingBitmaps}>
                {(bitmap) => (
                  <MissingBitmapItem
                    name={bitmap.name}
                    path={bitmap.path}
                    isUploaded={missingBitmapsStore.uploadedBitmaps.has(bitmap.name)}
                    onUpload={handleSingleUpload}
                  />
                )}
              </For>
            </div>

            <Show when={hasUnmatchedFiles()}>
              <div class={styles.divider}>
                <span>Unmatched files ({unmatchedFiles().length}):</span>
                <button
                  type="button"
                  class={styles.ignoreAllButton}
                  onClick={handleIgnoreAllUnmatched}
                  data-testid="ignore-all-unmatched"
                >
                  Ignore All
                </button>
              </div>

              <div class={styles.unmatchedList} data-testid="unmatched-files-section">
                <For each={unmatchedFiles()}>
                  {(file) => (
                    <UnmatchedFileItem
                      file={file}
                      onAdd={handleAddUnmatchedFile}
                      onIgnore={handleIgnoreUnmatchedFile}
                      isAdding={addingFile() === file.name}
                    />
                  )}
                </For>
              </div>
            </Show>
          </div>

          <div class={styles.footer}>
            <button
              type="button"
              class={styles.secondaryButton}
              onClick={handleClose}
              data-testid="missing-bitmaps-upload-later"
            >
              Upload Later
            </button>
            <button
              type="button"
              class={styles.primaryButton}
              onClick={handleClose}
              data-testid="missing-bitmaps-done"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
