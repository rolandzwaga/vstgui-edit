/**
 * MissingBitmapItem - Row component for a single missing bitmap.
 * Shows bitmap name, path, and upload/uploaded status.
 */

import { type Component, createSignal } from 'solid-js';
import styles from './MissingBitmapItem.module.css';

export interface MissingBitmapItemProps {
  /** Bitmap name */
  name: string;
  /** Original path from uidesc */
  path: string;
  /** Whether this bitmap has been uploaded */
  isUploaded: boolean;
  /** Called when user selects a file to upload */
  onUpload: (name: string, file: File) => void;
}

export const MissingBitmapItem: Component<MissingBitmapItemProps> = (props) => {
  const [isUploading, setIsUploading] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;

  const handleClick = () => {
    if (!props.isUploaded && !isUploading()) {
      inputRef?.click();
    }
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      setIsUploading(true);
      try {
        props.onUpload(props.name, file);
      } finally {
        setIsUploading(false);
      }
    }

    // Reset input so same file can be selected again
    target.value = '';
  };

  return (
    <div
      class={styles.item}
      classList={{ [styles.uploaded]: props.isUploaded }}
      data-testid={`missing-bitmap-item-${props.name}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        class={styles.hiddenInput}
        onChange={handleFileSelect}
        disabled={props.isUploaded || isUploading()}
        data-testid={`missing-bitmap-input-${props.name}`}
      />

      <div class={styles.info}>
        <div class={styles.nameRow}>
          {props.isUploaded ? (
            <svg
              class={styles.checkIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          ) : (
            <svg
              class={styles.warningIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          )}
          <span class={styles.name}>{props.name}</span>
        </div>
        <span class={styles.path} title={props.path}>
          Path: {props.path || '(no path)'}
        </span>
      </div>

      <div class={styles.action}>
        {props.isUploaded ? (
          <span class={styles.uploadedLabel}>Uploaded</span>
        ) : (
          <button
            type="button"
            class={styles.browseButton}
            onClick={handleClick}
            disabled={isUploading()}
            data-testid={`missing-bitmap-browse-${props.name}`}
          >
            {isUploading() ? 'Uploading...' : 'Browse...'}
          </button>
        )}
      </div>
    </div>
  );
};
