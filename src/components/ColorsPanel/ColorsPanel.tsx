import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { addColor, deleteColor, documentStore, getColors } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { createAddColorOperation, createDeleteColorOperation } from '../../domain/colors/historyOperations';
import { findColorUsages } from '../../domain/colors/usage';
import { ColorItem } from './ColorItem';
import { AddColorButton } from './AddColorButton';
import { EmptyState } from './EmptyState';
import styles from './ColorsPanel.module.css';

function generateUniqueColorName(existingColors: Record<string, string>): string {
  const baseName = 'New Color';
  if (!(baseName in existingColors)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingColors) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

export const ColorsPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{ name: string; value: string; usageCount: number } | null>(null);

  const colors = createMemo(() => {
    const colorMap = getColors();
    if (!colorMap) return [];

    return Object.entries(colorMap).map(([name, value]) => ({
      name,
      value,
    }));
  });

  const hasColors = createMemo(() => colors().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddColor = () => {
    const existingColors = getColors() ?? {};
    const newName = generateUniqueColorName(existingColors);
    const defaultValue = '#000000FF';

    addColor(newName, defaultValue);
    pushOperation(createAddColorOperation(newName, defaultValue));
  };

  const handleDeleteRequest = (name: string) => {
    const colorMap = getColors() ?? {};
    const value = colorMap[name];
    if (!value) return;

    const usages = findColorUsages(name, documentStore.document);
    
    if (usages.length > 0) {
      setPendingDelete({ name, value, usageCount: usages.length });
    } else {
      performDelete(name, value);
    }
  };

  const performDelete = (name: string, value: string) => {
    const deleted = deleteColor(name);
    if (deleted !== null) {
      pushOperation(createDeleteColorOperation(name, value));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <div class={styles.panel} data-testid="colors-panel">
      <div class={styles.header}>
        <span class={styles.title}>Colors</span>
        <AddColorButton onClick={handleAddColor} disabled={!hasDocument()} />
      </div>
      <Show when={hasColors()} fallback={<EmptyState />}>
        <div role="list" aria-label="Color definitions" class={styles.list}>
          <For each={colors()}>
            {(color) => (
              <ColorItem
                name={color.name}
                value={color.value}
                onDelete={handleDeleteRequest}
              />
            )}
          </For>
        </div>
      </Show>
      <Show when={pendingDelete()}>
        {(pending) => (
          <div class={styles.confirmDialog} data-testid="delete-confirm-dialog">
            <div class={styles.confirmContent}>
              <p class={styles.confirmMessage}>
                "{pending().name}" is used in {pending().usageCount} view{pending().usageCount > 1 ? 's' : ''}.
                Delete anyway?
              </p>
              <div class={styles.confirmActions}>
                <button
                  type="button"
                  class={styles.cancelButton}
                  onClick={cancelDelete}
                  data-testid="cancel-delete"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class={styles.deleteConfirmButton}
                  onClick={() => performDelete(pending().name, pending().value)}
                  data-testid="confirm-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
