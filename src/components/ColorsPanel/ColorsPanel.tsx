import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { addColor, deleteColor, documentStore, getColors } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { createAddColorOperation, createDeleteColorOperation } from '../../domain/colors/historyOperations';
import { findColorUsages, type ColorUsage } from '../../domain/colors/usage';
import { CollapsibleSection } from '../CollapsibleSection';
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
  let listRef: HTMLDivElement | undefined;
  const [pendingDelete, setPendingDelete] = createSignal<{ name: string; value: string; usageCount: number } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{ name: string; usages: ColorUsage[] } | null>(null);

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

    // Scroll the new item into view after DOM updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const lastItem = listRef?.lastElementChild;
        lastItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
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
    const result = deleteColor(name);
    if (result !== null) {
      pushOperation(createDeleteColorOperation(name, value, result.removedReferences));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findColorUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findColorUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="colors-panel">
      <CollapsibleSection
        title="Colors"
        defaultExpanded={false}
        headerActions={<AddColorButton onClick={handleAddColor} disabled={!hasDocument()} />}
      >
        <Show when={hasColors()} fallback={<EmptyState />}>
          <div ref={listRef} role="list" aria-label="Color definitions" class={styles.list}>
            <For each={colors()}>
              {(color) => (
                <ColorItem
                  name={color.name}
                  value={color.value}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(color.name)}
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
                  "{pending().name}" is used in {pending().usageCount} view{pending().usageCount > 1 ? 's' : ''}.
                  Deleting will remove this color from {pending().usageCount === 1 ? 'that view' : 'those views'}.
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
        <Show when={usagePopover()}>
          {(popover) => (
            <div class={styles.usagePopover} data-testid="usage-popover">
              <div class={styles.popoverContent}>
                <div class={styles.popoverHeader}>
                  <span class={styles.popoverTitle}>
                    Uses of "{popover().name}"
                  </span>
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
