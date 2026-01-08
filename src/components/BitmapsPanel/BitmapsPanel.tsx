import { type Component, createMemo, createSignal, For, Show, onMount } from 'solid-js';
import type { BitmapDefinition } from '../../types/uidesc';
import {
  addBitmap,
  deleteBitmap,
  documentStore,
  getBitmaps,
  updateBitmapName,
  updateBitmapProperty,
  updateViewAttribute,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddBitmapOperation,
  createDeleteBitmapOperation,
  initBitmapHistoryOperations,
} from '../../domain/bitmaps/historyOperations';
import { findBitmapUsages, type BitmapUsage } from '../../domain/bitmaps/usage';
import { normalizeBitmap } from '../../domain/bitmaps/thumbnail';
import { CollapsibleSection } from '../CollapsibleSection';
import { BitmapItem } from './BitmapItem';
import { AddBitmapButton } from './AddBitmapButton';
import { EmptyState } from './EmptyState';
import styles from './BitmapsPanel.module.css';

function generateUniqueBitmapName(existingBitmaps: Record<string, string | BitmapDefinition>): string {
  const baseName = 'New Bitmap';
  if (!(baseName in existingBitmaps)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingBitmaps) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

export const BitmapsPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    bitmap: string | BitmapDefinition;
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: BitmapUsage[];
  } | null>(null);

  onMount(() => {
    initBitmapHistoryOperations(
      addBitmap,
      deleteBitmap,
      updateBitmapName,
      updateBitmapProperty,
      updateViewAttribute
    );
  });

  const bitmaps = createMemo(() => {
    const bitmapMap = getBitmaps();
    if (!bitmapMap) return [];

    return Object.entries(bitmapMap).map(([name, bitmap]) => ({
      name,
      bitmap,
    }));
  });

  const hasBitmaps = createMemo(() => bitmaps().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddBitmap = () => {
    const existingBitmaps = getBitmaps() ?? {};
    const newName = generateUniqueBitmapName(existingBitmaps);
    const defaultBitmap: BitmapDefinition = {
      path: '',
    };

    addBitmap(newName, defaultBitmap);
    pushOperation(createAddBitmapOperation(newName, defaultBitmap));
  };

  const handleDeleteRequest = (name: string) => {
    const bitmapMap = getBitmaps() ?? {};
    const bitmap = bitmapMap[name];
    if (!bitmap) return;

    const usages = findBitmapUsages(name, documentStore.document);

    if (usages.length > 0) {
      setPendingDelete({ name, bitmap, usageCount: usages.length });
    } else {
      performDelete(name, bitmap);
    }
  };

  const performDelete = (name: string, bitmap: string | BitmapDefinition) => {
    const result = deleteBitmap(name);
    if (result !== null) {
      const normalized = normalizeBitmap(bitmap);
      pushOperation(createDeleteBitmapOperation(name, normalized, result.removedReferences));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findBitmapUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findBitmapUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="bitmaps-panel">
      <CollapsibleSection
        title="Bitmaps"
        defaultExpanded={false}
        headerActions={<AddBitmapButton onClick={handleAddBitmap} disabled={!hasDocument()} />}
      >
        <Show when={hasBitmaps()} fallback={<EmptyState />}>
          <div role="list" aria-label="Bitmap definitions" class={styles.list}>
            <For each={bitmaps()}>
              {(item) => (
                <BitmapItem
                  name={item.name}
                  bitmap={item.bitmap}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(item.name)}
                  onUsageClick={handleUsageClick}
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
                  "{pending().name}" is used in {pending().usageCount} view
                  {pending().usageCount > 1 ? 's' : ''}. Deleting will remove this bitmap from{' '}
                  {pending().usageCount === 1 ? 'that view' : 'those views'}.
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
                    onClick={() => performDelete(pending().name, pending().bitmap)}
                    data-testid="confirm-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>
        <Show when={usagePopover()}>
          {(popover) => (
            <div class={styles.usagePopover} data-testid="usage-popover">
              <div class={styles.popoverContent}>
                <div class={styles.popoverHeader}>
                  <span class={styles.popoverTitle}>Uses of "{popover().name}"</span>
                  <button
                    type="button"
                    class={styles.closeButton}
                    onClick={closeUsagePopover}
                    aria-label="Close"
                    data-testid="close-usage-popover"
                  >
                    ×
                  </button>
                </div>
                <ul class={styles.usageList}>
                  <For each={popover().usages}>
                    {(usage) => (
                      <li class={styles.usageItem}>
                        <span class={styles.usageView}>{usage.viewClass}</span>
                        <span class={styles.usageAttr}>{usage.attribute}</span>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>
          )}
        </Show>
      </CollapsibleSection>
    </div>
  );
};
