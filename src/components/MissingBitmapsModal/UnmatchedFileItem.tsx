/**
 * UnmatchedFileItem - Displays an unmatched file with options to add as new bitmap or ignore.
 */

import { type Component, createSignal, Show } from 'solid-js';
import { getBaseName } from '../../domain/bitmaps/fileHandling';
import styles from './UnmatchedFileItem.module.css';

export interface UnmatchedFileItemProps {
  /** The unmatched file */
  file: File;
  /** Called when user wants to add the file as a new bitmap */
  onAdd: (file: File, bitmapName: string) => void;
  /** Called when user wants to ignore/dismiss the file */
  onIgnore: (file: File) => void;
  /** Whether adding is in progress */
  isAdding?: boolean;
}

export const UnmatchedFileItem: Component<UnmatchedFileItemProps> = (props) => {
  // Default name is filename without extension
  const defaultName = () => getBaseName(props.file.name);
  const [bitmapName, setBitmapName] = createSignal(defaultName());
  const [isEditing, setIsEditing] = createSignal(false);

  const handleAdd = () => {
    const name = bitmapName().trim();
    if (name) {
      props.onAdd(props.file, name);
    }
  };

  const handleIgnore = () => {
    props.onIgnore(props.file);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setBitmapName(defaultName());
      setIsEditing(false);
    }
  };

  return (
    <div class={styles.item} data-testid="unmatched-file-item">
      <div class={styles.fileInfo}>
        <span class={styles.filename} title={props.file.name}>
          {props.file.name}
        </span>
        <span class={styles.fileSize}>
          ({Math.round(props.file.size / 1024)} KB)
        </span>
      </div>

      <div class={styles.actions}>
        <Show
          when={isEditing()}
          fallback={
            <button
              type="button"
              class={styles.editButton}
              onClick={() => setIsEditing(true)}
              disabled={props.isAdding}
              title="Edit bitmap name"
            >
              {bitmapName()}
            </button>
          }
        >
          <input
            type="text"
            class={styles.nameInput}
            value={bitmapName()}
            onInput={(e) => setBitmapName(e.currentTarget.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            disabled={props.isAdding}
            autofocus
            data-testid="unmatched-name-input"
          />
        </Show>

        <button
          type="button"
          class={styles.addButton}
          onClick={handleAdd}
          disabled={props.isAdding || !bitmapName().trim()}
          title="Add as new bitmap"
          data-testid="unmatched-add-button"
        >
          {props.isAdding ? 'Adding...' : 'Add'}
        </button>

        <button
          type="button"
          class={styles.ignoreButton}
          onClick={handleIgnore}
          disabled={props.isAdding}
          title="Ignore this file"
          aria-label="Ignore"
          data-testid="unmatched-ignore-button"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class={styles.ignoreIcon}>
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
