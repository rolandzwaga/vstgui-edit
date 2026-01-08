import { type Component, createMemo, createSignal, For, onMount, Show } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import {
  addGradient,
  deleteGradient,
  documentStore,
  getGradients,
  updateGradientName,
  updateGradientStops,
  updateViewAttribute,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddGradientOperation,
  createDeleteGradientOperation,
  createEditGradientNameOperation,
  createEditGradientStopsOperation,
  initGradientHistoryOperations,
} from '../../domain/gradients/historyOperations';
import { findGradientUsages, type GradientUsage } from '../../domain/gradients/usage';
import { CollapsibleSection } from '../CollapsibleSection';
import { GradientItem } from './GradientItem';
import { AddGradientButton } from './AddGradientButton';
import { EmptyState } from './EmptyState';
import styles from './GradientsPanel.module.css';

function generateUniqueGradientName(
  existingGradients: Record<string, GradientColorStop[]>
): string {
  const baseName = 'New Gradient';
  if (!(baseName in existingGradients)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingGradients) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

const DEFAULT_GRADIENT_STOPS: GradientColorStop[] = [
  { rgba: '#000000FF', start: '0.00' },
  { rgba: '#FFFFFFFF', start: '1.00' },
];

export const GradientsPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    stops: GradientColorStop[];
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: GradientUsage[];
  } | null>(null);

  onMount(() => {
    initGradientHistoryOperations(
      addGradient,
      deleteGradient,
      updateGradientName,
      updateGradientStops,
      updateViewAttribute
    );
  });

  const gradients = createMemo(() => {
    const gradientMap = getGradients();
    if (!gradientMap) return [];

    return Object.entries(gradientMap).map(([name, stops]) => ({
      name,
      stops,
    }));
  });

  const hasGradients = createMemo(() => gradients().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const existingNames = createMemo(() => gradients().map((g) => g.name));

  const handleAddGradient = () => {
    const existingGradients = getGradients() ?? {};
    const newName = generateUniqueGradientName(existingGradients);

    addGradient(newName, DEFAULT_GRADIENT_STOPS);
    pushOperation(createAddGradientOperation(newName, DEFAULT_GRADIENT_STOPS));
  };

  const handleRename = (oldName: string, newName: string) => {
    const success = updateGradientName(oldName, newName);
    if (success) {
      pushOperation(createEditGradientNameOperation(oldName, newName));
    }
  };

  const handleStopsChange = (name: string, newStops: GradientColorStop[]) => {
    const oldStops = updateGradientStops(name, newStops);
    if (oldStops) {
      pushOperation(createEditGradientStopsOperation(name, oldStops, newStops));
    }
  };

  const handleDeleteRequest = (name: string) => {
    const existingGradients = getGradients() ?? {};
    const stops = existingGradients[name];
    if (!stops) return;

    const usages = findGradientUsages(name, documentStore.document);

    if (usages.length > 0) {
      setPendingDelete({ name, stops, usageCount: usages.length });
    } else {
      performDelete(name, stops);
    }
  };

  const performDelete = (name: string, stops: GradientColorStop[]) => {
    const result = deleteGradient(name);
    if (result) {
      pushOperation(createDeleteGradientOperation(name, stops, result.removedReferences));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findGradientUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findGradientUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="gradients-panel">
      <CollapsibleSection
        title="Gradients"
        defaultExpanded={false}
        headerActions={<AddGradientButton onClick={handleAddGradient} disabled={!hasDocument()} />}
      >
        <Show when={hasGradients()} fallback={<EmptyState />}>
          <div role="list" aria-label="Gradient definitions" class={styles.list}>
            <For each={gradients()}>
              {(item) => (
                <GradientItem
                  name={item.name}
                  stops={item.stops}
                  existingNames={existingNames()}
                  onRename={handleRename}
                  onStopsChange={handleStopsChange}
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
                  {pending().usageCount > 1 ? 's' : ''}. Deleting will remove this gradient from{' '}
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
                    onClick={() => performDelete(pending().name, pending().stops)}
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
