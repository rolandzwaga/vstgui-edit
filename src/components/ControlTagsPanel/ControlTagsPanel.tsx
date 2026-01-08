import { type Component, createMemo, createSignal, For, Show, onMount } from 'solid-js';
import {
  addControlTag,
  deleteControlTag,
  documentStore,
  getControlTags,
  restoreControlTagReference,
  updateControlTagId,
  updateControlTagName,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddControlTagOperation,
  createDeleteControlTagOperation,
  initControlTagHistoryOperations,
  type RemovedControlTagReference,
} from '../../domain/controlTags/historyOperations';
import {
  findControlTagUsages,
  type ControlTagUsage,
} from '../../domain/controlTags/usage';
import { generateUniqueTagName, getNextAvailableTagId } from '../../domain/controlTags/validation';
import { CollapsibleSection } from '../CollapsibleSection';
import { ControlTagItem } from './ControlTagItem';
import { AddControlTagButton } from './AddControlTagButton';
import { EmptyState } from './EmptyState';
import styles from './ControlTagsPanel.module.css';

export const ControlTagsPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    tagId: string;
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: ControlTagUsage[];
  } | null>(null);

  onMount(() => {
    initControlTagHistoryOperations({
      addControlTag,
      deleteControlTag,
      updateControlTagName,
      updateControlTagId,
      restoreControlTagReference,
    });
  });

  const controlTags = createMemo(() => {
    const tags = getControlTags();
    if (!tags) return [];

    return Object.entries(tags).map(([name, tagId]) => ({
      name,
      tagId,
    }));
  });

  const hasControlTags = createMemo(() => controlTags().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddControlTag = () => {
    const existingTags = getControlTags() ?? {};
    
    const newName = generateUniqueTagName(existingTags);
    const newTagId = getNextAvailableTagId(existingTags);

    addControlTag(newName, newTagId);
    pushOperation(createAddControlTagOperation(newName, newTagId));
  };

  const handleDeleteRequest = (name: string) => {
    const tags = getControlTags() ?? {};
    const tagId = tags[name];
    if (tagId === undefined) return;

    const usages = findControlTagUsages(name, documentStore.document);

    if (usages.length > 0) {
      setPendingDelete({ name, tagId, usageCount: usages.length });
    } else {
      performDelete(name);
    }
  };

  const performDelete = (name: string) => {
    const result = deleteControlTag(name);
    if (result !== null) {
      pushOperation(createDeleteControlTagOperation(name, result.tagId, result.removedReferences as RemovedControlTagReference[]));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findControlTagUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findControlTagUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="control-tags-panel">
      <CollapsibleSection
        title="Control Tags"
        headerActions={<AddControlTagButton onClick={handleAddControlTag} disabled={!hasDocument()} />}
      >
        <Show when={hasControlTags()} fallback={<EmptyState />}>
          <div role="list" aria-label="Control tag definitions" class={styles.list}>
            <For each={controlTags()}>
              {(tag) => (
                <ControlTagItem
                  name={tag.name}
                  tagId={tag.tagId}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(tag.name)}
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
                  {pending().usageCount > 1 ? 's' : ''}. Deleting will remove this control tag from{' '}
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
                    onClick={() => performDelete(pending().name)}
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
                        <span class={styles.usageId}>{usage.viewId}</span>
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
