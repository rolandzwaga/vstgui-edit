import { type Component, createMemo, createSignal, For, Show, onMount } from 'solid-js';
import type { FontDefinition } from '../../types/uidesc';
import {
  addFont,
  deleteFont,
  documentStore,
  getFonts,
  updateFontName,
  updateFontProperty,
  updateViewAttribute,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddFontOperation,
  createDeleteFontOperation,
  initFontHistoryOperations,
} from '../../domain/fonts/historyOperations';
import { findFontUsages, type FontUsage } from '../../domain/fonts/usage';
import { CollapsibleSection } from '../CollapsibleSection';
import { FontItem } from './FontItem';
import { AddFontButton } from './AddFontButton';
import { EmptyState } from './EmptyState';
import styles from './FontsPanel.module.css';

function generateUniqueFontName(existingFonts: Record<string, FontDefinition>): string {
  const baseName = 'New Font';
  if (!(baseName in existingFonts)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingFonts) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

export const FontsPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<{
    name: string;
    fontDef: FontDefinition;
    usageCount: number;
  } | null>(null);
  const [usagePopover, setUsagePopover] = createSignal<{
    name: string;
    usages: FontUsage[];
  } | null>(null);

  onMount(() => {
    initFontHistoryOperations(
      addFont,
      deleteFont,
      updateFontName,
      updateFontProperty,
      updateViewAttribute
    );
  });

  const fonts = createMemo(() => {
    const fontMap = getFonts();
    if (!fontMap) return [];

    return Object.entries(fontMap).map(([name, fontDef]) => ({
      name,
      fontDef,
    }));
  });

  const hasFonts = createMemo(() => fonts().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddFont = () => {
    const existingFonts = getFonts() ?? {};
    const newName = generateUniqueFontName(existingFonts);
    const defaultFont: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
    };

    addFont(newName, defaultFont);
    pushOperation(createAddFontOperation(newName, defaultFont));
  };

  const handleDeleteRequest = (name: string) => {
    const fontMap = getFonts() ?? {};
    const fontDef = fontMap[name];
    if (!fontDef) return;

    const usages = findFontUsages(name, documentStore.document);

    if (usages.length > 0) {
      setPendingDelete({ name, fontDef, usageCount: usages.length });
    } else {
      performDelete(name, fontDef);
    }
  };

  const performDelete = (name: string, fontDef: FontDefinition) => {
    const result = deleteFont(name);
    if (result !== null) {
      pushOperation(createDeleteFontOperation(name, fontDef, result.removedReferences));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleUsageClick = (name: string) => {
    const usages = findFontUsages(name, documentStore.document);
    setUsagePopover({ name, usages });
  };

  const closeUsagePopover = () => {
    setUsagePopover(null);
  };

  const getUsageCount = (name: string) => {
    return findFontUsages(name, documentStore.document).length;
  };

  return (
    <div class={styles.panel} data-testid="fonts-panel">
      <CollapsibleSection
        title="Fonts"
        headerActions={<AddFontButton onClick={handleAddFont} disabled={!hasDocument()} />}
      >
        <Show when={hasFonts()} fallback={<EmptyState />}>
          <div role="list" aria-label="Font definitions" class={styles.list}>
            <For each={fonts()}>
              {(font) => (
                <FontItem
                  name={font.name}
                  fontDef={font.fontDef}
                  onDelete={handleDeleteRequest}
                  usageCount={getUsageCount(font.name)}
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
                  {pending().usageCount > 1 ? 's' : ''}. Deleting will remove this font from{' '}
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
                    onClick={() => performDelete(pending().name, pending().fontDef)}
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
