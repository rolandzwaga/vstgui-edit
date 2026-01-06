import type { Component } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import type { ViewNode } from '../../types/uidesc';
import { documentStore } from '../../stores/documentStore';
import { selectionStore } from '../../stores/selectionStore';
import { isGroupExpanded, toggleGroup } from '../../stores/propertiesStore';
import { mergeSelections } from '../../domain/properties';
import { EmptyState } from './EmptyState';
import { SelectionHeader } from './SelectionHeader';
import { AttributeGroup } from './AttributeGroup';
import styles from './PropertiesPanel.module.css';

function findViewById(root: ViewNode, compositeId: string, rootId: string): ViewNode | null {
  if (compositeId === rootId) {
    return root;
  }

  const prefix = `${rootId}-`;
  if (!compositeId.startsWith(prefix)) {
    return null;
  }

  const remainingPath = compositeId.slice(prefix.length);
  const pathParts = remainingPath.split('-');

  let current: ViewNode = root;
  let currentPath = rootId;

  for (const part of pathParts) {
    if (!current.children?.[part]) {
      return null;
    }
    current = current.children[part];
    currentPath = `${currentPath}-${part}`;
  }

  return current;
}

export const PropertiesPanel: Component = () => {
  const selectedViews = createMemo(() => {
    const doc = documentStore.document;
    if (!doc) return [];

    const vstgui = doc['vstgui-ui-description'];
    if (!vstgui?.templates) return [];

    const templates = vstgui.templates;
    const templateEntries = Object.entries(templates);
    if (templateEntries.length === 0) return [];

    const [templateId, templateView] = templateEntries[0];
    const selectedIds = selectionStore.selectedIds;

    const views: ViewNode[] = [];
    for (const viewId of selectedIds) {
      const view = findViewById(templateView, viewId, templateId);
      if (view) {
        views.push(view);
      }
    }

    return views;
  });

  const groupedAttributes = createMemo(() => {
    const views = selectedViews();
    if (views.length === 0) {
      return null;
    }

    const viewAttributes = views.map((v) => v.attributes as Record<string, unknown>);
    const classNames = views.map((v) => v.attributes.class);

    return mergeSelections(viewAttributes, classNames);
  });

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API failed - silently ignore per spec
    }
  };

  return (
    <div class={styles.panel} data-testid="properties-panel" role="complementary" aria-label="Properties">
      <Show when={groupedAttributes()} fallback={<EmptyState />}>
        {(attrs) => (
          <>
            <SelectionHeader
              className={attrs().className}
              selectionCount={attrs().selectionCount}
              sameClass={attrs().sameClass}
            />
            <div class={styles.content}>
              <For each={attrs().groups}>
                {(group) => (
                  <AttributeGroup
                    group={group}
                    isExpanded={isGroupExpanded(group.id)}
                    onToggle={() => toggleGroup(group.id)}
                    onCopy={handleCopy}
                  />
                )}
              </For>
            </div>
          </>
        )}
      </Show>
    </div>
  );
};
