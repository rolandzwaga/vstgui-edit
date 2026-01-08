import { type Component, createMemo, For, Show } from 'solid-js';
import { getTemplateNames } from '../../stores/documentStore';
import { setActiveTemplate, templateStore } from '../../stores/templateStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { TemplateItem } from './TemplateItem';
import { EmptyState } from './EmptyState';
import styles from './TemplatesPanel.module.css';

export const TemplatesPanel: Component = () => {
  const templateNames = createMemo(() => getTemplateNames());
  const hasTemplates = createMemo(() => templateNames().length > 0);

  const handleTemplateClick = (name: string) => {
    setActiveTemplate(name);
  };

  return (
    <div class={styles.panel} data-testid="templates-panel">
      <CollapsibleSection title="Templates">
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
