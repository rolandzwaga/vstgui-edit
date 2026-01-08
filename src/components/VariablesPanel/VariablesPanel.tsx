import { type Component, createMemo, createSignal, For, Show, onMount } from 'solid-js';
import {
  addVariable,
  deleteVariable,
  documentStore,
  getVariables,
  restoreVariableReference,
  updateVariableName,
  updateVariableValue,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddVariableOperation,
  createDeleteVariableOperation,
  initVariableHistoryOperations,
  type RemovedVariableReference,
} from '../../domain/variables/historyOperations';
import {
  findVariableUsages,
  type VariableUsage,
} from '../../domain/variables/usage';
import { generateUniqueVariableName } from '../../domain/variables/validation';
import { CollapsibleSection } from '../CollapsibleSection';
import { VariableItem } from './VariableItem';
import { AddVariableButton } from './AddVariableButton';
import { EmptyState } from './EmptyState';
import styles from './VariablesPanel.module.css';

export const VariablesPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    value: string;
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: VariableUsage[];
  } | null>(null);

  onMount(() => {
    initVariableHistoryOperations({
      addVariable,
      deleteVariable,
      updateVariableName,
      updateVariableValue,
      restoreVariableReference,
    });
  });

  const variables = createMemo(() => {
    const vars = getVariables();
    if (!vars) return [];

    return Object.entries(vars).map(([name, value]) => ({
      name,
      value,
    }));
  });

  const hasVariables = createMemo(() => variables().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddVariable = () => {
    const vars = getVariables() ?? {};
    const name = generateUniqueVariableName(vars);
    const value = '';

    addVariable(name, value);
    pushOperation(createAddVariableOperation(name, value));
  };

  const handleDeleteRequest = (name: string) => {
    const vars = getVariables() ?? {};
    const value = vars[name];
    if (value === undefined) return;

    const usages = findVariableUsages(name, documentStore.document);

    if (usages.length > 0) {
      setPendingDelete({ name, value, usageCount: usages.length });
    } else {
      performDelete(name);
    }
  };

  const performDelete = (name: string) => {
    const result = deleteVariable(name);
    if (result !== null) {
      pushOperation(createDeleteVariableOperation(name, result.value, result.removedReferences as RemovedVariableReference[]));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findVariableUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findVariableUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="variables-panel">
      <CollapsibleSection
        title="Variables"
        defaultExpanded={false}
        headerActions={<AddVariableButton onClick={handleAddVariable} disabled={!hasDocument()} />}
      >
        <Show when={hasVariables()} fallback={<EmptyState />}>
          <div role="list" aria-label="Variable definitions" class={styles.list}>
            <For each={variables()}>
              {(variable) => (
                <VariableItem
                  name={variable.name}
                  value={variable.value}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(variable.name)}
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
                  {pending().usageCount > 1 ? 's' : ''}. Deleting will remove references from{' '}
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
                        <span class={styles.usageAttr}>{usage.attribute}</span>
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
