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
  uploadBitmap,
  type UploadBitmapResult,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { projectStore } from '../../stores/projectStore';
import {
  missingBitmapsStore,
  hasMissingBitmaps,
  isBitmapMissing,
  openMissingBitmapsModal,
} from '../../stores/missingBitmapsStore';
import {
  createAddBitmapOperation,
  createDeleteBitmapOperation,
  initBitmapHistoryOperations,
} from '../../domain/bitmaps/historyOperations';
import { findBitmapUsages, type BitmapUsage } from '../../domain/bitmaps/usage';
import { normalizeBitmap } from '../../domain/bitmaps/thumbnail';
import { bitmapService } from '../../services/indexedDB/bitmapService';
import { CollapsibleSection } from '../CollapsibleSection';
import { AddBitmapButton } from './AddBitmapButton';
import { BitmapConflictDialog } from './BitmapConflictDialog';
import { BitmapItem } from './BitmapItem';
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
  let listRef: HTMLDivElement | undefined;
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    bitmap: string | BitmapDefinition;
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: BitmapUsage[];
  } | null>(null);
  const [uploadConflict, setUploadConflict] = createSignal<{
    file: File;
    originalFilename: string;
    suggestedName: string;
  } | null>(null);
  const [uploadError, setUploadError] = createSignal<string | null>(null);

  onMount(() => {
    initBitmapHistoryOperations(
      addBitmap,
      deleteBitmap,
      updateBitmapName,
      updateBitmapProperty,
      updateViewAttribute
    );
  });

  const projectId = () => projectStore.currentProject?.id ?? null;

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

    // Scroll the new item into view after DOM updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const lastItem = listRef?.lastElementChild;
        lastItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
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

  const performDelete = async (name: string, bitmap: string | BitmapDefinition) => {
    const currentProjectId = projectId();

    // Look up IndexedDB blob before deleting (if it exists)
    let indexedDBBitmap = undefined;
    if (currentProjectId) {
      const blobs = await bitmapService.getByProject(currentProjectId);
      indexedDBBitmap = blobs.find((b) => b.name === name);

      // Delete from IndexedDB if it exists
      if (indexedDBBitmap) {
        await bitmapService.delete(indexedDBBitmap.id);
      }
    }

    // Delete from uidesc document
    const result = deleteBitmap(name);
    if (result !== null) {
      const normalized = normalizeBitmap(bitmap);
      pushOperation(
        createDeleteBitmapOperation(name, normalized, result.removedReferences, indexedDBBitmap)
      );
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

  const handleUpload = async (bitmapName: string, file: File) => {
    setUploadError(null);

    const currentProjectId = projectStore.currentProject?.id;
    if (!currentProjectId) {
      setUploadError('No project open. Save the project first.');
      return;
    }

    // Upload to the existing bitmap (update its path and blob)
    const result: UploadBitmapResult = await uploadBitmap(file, currentProjectId, { targetBitmapName: bitmapName });

    if (result.success) {
      // Upload successful - nothing more to do
      return;
    }

    // Show error
    setUploadError(result.error ?? 'Upload failed');
  };

  const handleConflictReplace = async () => {
    const conflict = uploadConflict();
    if (!conflict) return;

    const currentProjectId = projectStore.currentProject?.id;
    if (!currentProjectId) {
      setUploadError('No project open. Save the project first.');
      return;
    }

    setUploadConflict(null);
    const result = await uploadBitmap(conflict.file, currentProjectId, { conflictResolution: 'replace' });

    if (!result.success && result.error) {
      setUploadError(result.error);
    }
  };

  const handleConflictAddNew = async () => {
    const conflict = uploadConflict();
    if (!conflict) return;

    const currentProjectId = projectStore.currentProject?.id;
    if (!currentProjectId) {
      setUploadError('No project open. Save the project first.');
      return;
    }

    setUploadConflict(null);
    const result = await uploadBitmap(conflict.file, currentProjectId, { conflictResolution: 'rename' });

    if (!result.success && result.error) {
      setUploadError(result.error);
    }
  };

  const handleConflictCancel = () => {
    setUploadConflict(null);
  };

  const clearUploadError = () => {
    setUploadError(null);
  };

  const handleOpenMissingModal = () => {
    openMissingBitmapsModal();
  };

  return (
    <div class={styles.panel} data-testid="bitmaps-panel">
      <CollapsibleSection
        title="Bitmaps"
        defaultExpanded={false}
        headerActions={
          <div class={styles.headerActions}>
            <Show when={hasMissingBitmaps()}>
              <button
                type="button"
                class={styles.uploadMissingButton}
                onClick={handleOpenMissingModal}
                data-testid="upload-missing-button"
              >
                Upload Missing
              </button>
            </Show>
            <AddBitmapButton onClick={handleAddBitmap} disabled={!hasDocument()} />
          </div>
        }
      >
        <Show when={hasBitmaps()} fallback={<EmptyState />}>
          <div ref={listRef} role="list" aria-label="Bitmap definitions" class={styles.list}>
            <For each={bitmaps()}>
              {(item) => (
                <BitmapItem
                  name={item.name}
                  bitmap={item.bitmap}
                  projectId={projectId()}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(item.name)}
                  onUsageClick={handleUsageClick}
                  onUpload={handleUpload}
                  isMissing={isBitmapMissing(item.name)}
                />
              )}
            </For>
          </div>
        </Show>
        <Show when={uploadError()}>
          <div class={styles.errorBanner} data-testid="upload-error">
            <span>{uploadError()}</span>
            <button
              type="button"
              class={styles.closeButton}
              onClick={clearUploadError}
              aria-label="Dismiss error"
            >
              ×
            </button>
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
        <Show when={uploadConflict()}>
          {(conflict) => (
            <BitmapConflictDialog
              filename={conflict().originalFilename}
              suggestedName={conflict().suggestedName}
              onReplace={handleConflictReplace}
              onAddNew={handleConflictAddNew}
              onCancel={handleConflictCancel}
            />
          )}
        </Show>
      </CollapsibleSection>
    </div>
  );
};
