import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { addTemplate, deleteTemplate, documentStore, duplicateTemplate, getTemplate, getTemplateNames } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { setActiveTemplate, templateStore } from '../../stores/templateStore';
import { generateUniqueTemplateName, createAddTemplateOperation, createDuplicateTemplateOperation, createDeleteTemplateOperation } from '../../domain/templates';
import { CollapsibleSection } from '../CollapsibleSection';
import { TemplateItem } from './TemplateItem';
import { AddTemplateButton } from './AddTemplateButton';
import { EmptyState } from './EmptyState';
import styles from './TemplatesPanel.module.css';

export const TemplatesPanel: Component = () => {
  const [pendingDelete, setPendingDelete] = createSignal<string | null>(null);

  const templateNames = createMemo(() => getTemplateNames());
  const hasTemplates = createMemo(() => templateNames().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);
  const canDeleteTemplates = createMemo(() => templateNames().length > 1);

  const handleTemplateClick = (name: string) => {
    setActiveTemplate(name);
  };

  const handleAddTemplate = () => {
    const existingNames = getTemplateNames();
    const newName = generateUniqueTemplateName(existingNames);

    const success = addTemplate(newName);
    if (success) {
      pushOperation(createAddTemplateOperation(newName));
      setActiveTemplate(newName);
    }
  };

  const handleDuplicateTemplate = (name: string) => {
    const newName = duplicateTemplate(name);
    if (newName) {
      const templateData = getTemplate(newName);
      if (templateData) {
        pushOperation(createDuplicateTemplateOperation(newName, templateData));
        setActiveTemplate(newName);
      }
    }
  };

  const handleDeleteRequest = (name: string) => {
    setPendingDelete(name);
  };

  const confirmDelete = () => {
    const name = pendingDelete();
    if (!name) return;

    const templateData = getTemplate(name);
    if (!templateData) return;

    const deleted = deleteTemplate(name);
    if (deleted) {
      pushOperation(createDeleteTemplateOperation(name, templateData));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <div class={styles.panel} data-testid="templates-panel">
      <CollapsibleSection
        title="Templates"
        headerActions={<AddTemplateButton onClick={handleAddTemplate} disabled={!hasDocument()} />}
      >
        <Show when={hasTemplates()} fallback={<EmptyState />}>
          <div role="listbox" aria-label="Template list" class={styles.list}>
            <For each={templateNames()}>
              {(name) => (
                <TemplateItem
                  name={name}
                  isActive={templateStore.activeTemplateId === name}
                  onClick={() => handleTemplateClick(name)}
                  onDuplicate={() => handleDuplicateTemplate(name)}
                  onDelete={() => handleDeleteRequest(name)}
                  canDelete={canDeleteTemplates()}
                />
              )}
            </For>
          </div>
        </Show>
        <Show when={pendingDelete()}>
          {(templateName) => (
            <div class={styles.confirmDialog} data-testid="delete-confirm-dialog">
              <div class={styles.confirmContent}>
                <p class={styles.confirmMessage}>
                  Delete template "{templateName()}"?
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
                    onClick={confirmDelete}
                    data-testid="confirm-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>
      </CollapsibleSection>
    </div>
  );
};
