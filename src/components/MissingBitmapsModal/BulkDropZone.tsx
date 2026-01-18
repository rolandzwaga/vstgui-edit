/**
 * BulkDropZone - Drag and drop area for bulk bitmap uploads.
 * Files are matched to missing bitmaps by exact filename.
 */

import { type Component, createSignal } from 'solid-js';
import styles from './BulkDropZone.module.css';

export interface BulkDropZoneProps {
  /** Called when files are dropped. Returns matched files mapped to bitmap names. */
  onFilesDropped: (files: File[]) => void;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
}

export const BulkDropZone: Component<BulkDropZoneProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!props.disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (props.disabled) return;

    const files = Array.from(e.dataTransfer?.files ?? []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      props.onFilesDropped(imageFiles);
    }
  };

  const handleClick = () => {
    if (!props.disabled) {
      inputRef?.click();
    }
  };

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);

    if (files.length > 0) {
      props.onFilesDropped(files);
    }

    // Reset input so same file can be selected again
    target.value = '';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      class={styles.dropZone}
      classList={{
        [styles.dragging]: isDragging(),
        [styles.disabled]: props.disabled,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={props.disabled ? -1 : 0}
      aria-label="Drop image files here or click to browse"
      data-testid="bulk-drop-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        class={styles.hiddenInput}
        onChange={handleFileSelect}
        disabled={props.disabled}
        data-testid="bulk-drop-zone-input"
      />
      <div class={styles.content}>
        <svg
          class={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class={styles.text}>
          Drop image files here to upload multiple at once
        </p>
        <p class={styles.subtext}>
          Files are matched by exact filename
        </p>
      </div>
    </div>
  );
};
