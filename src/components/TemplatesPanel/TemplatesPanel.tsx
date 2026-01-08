import { type Component, createMemo, For, Show } from 'solid-js';
import { addTemplate, documentStore, getTemplateNames } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { setActiveTemplate, templateStore } from '../../stores/templateStore';
import { generateUniqueTemplateName, createAddTemplateOperation } from '../../domain/templates';
import { CollapsibleSection } from '../CollapsibleSection';
import { TemplateItem } from './TemplateItem';
import { AddTemplateButton } from './AddTemplateButton';
import { EmptyState } from './EmptyState';
import styles from './TemplatesPanel.module.css';

export const TemplatesPanel: Component = () => {
  const templateNames = createMemo(() => getTemplateNames());
  const hasTemplates = createMemo(() => templateNames().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

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
                />
              )}
            </For>
          </div>
        </Show>
      </CollapsibleSection>
    </div>
  );
};
