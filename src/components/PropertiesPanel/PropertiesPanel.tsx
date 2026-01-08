import type { Component } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import type { ViewNode } from '../../types/uidesc';
import { documentStore, updateViewAttribute, getViewAttribute } from '../../stores/documentStore';
import { selectionStore } from '../../stores/selectionStore';
import { isGroupExpanded, toggleGroup } from '../../stores/propertiesStore';
import { pushOperation } from '../../stores/historyStore';
import { mergeSelections } from '../../domain/properties';
import { createPropertyEditOperation } from '../../domain/properties/historyOperations';
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
    const classNames = views.map((v) => (v.attributes.class as string) ?? 'CViewContainer');

    return mergeSelections(viewAttributes, classNames);
  });

  const documentColors = createMemo(() => {
    const doc = documentStore.document;
    if (!doc) return [];
    const colors = doc['vstgui-ui-description'].colors;
    return colors ? Object.keys(colors) : [];
  });

  const documentFonts = createMemo(() => {
    const doc = documentStore.document;
    if (!doc) return [];
    const fonts = doc['vstgui-ui-description'].fonts;
    return fonts ? Object.keys(fonts) : [];
  });

  const documentBitmaps = createMemo(() => {
    const doc = documentStore.document;
    if (!doc) return [];
    const bitmaps = doc['vstgui-ui-description'].bitmaps;
    return bitmaps ? Object.keys(bitmaps) : [];
  });

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API failed - silently ignore per spec
    }
  };

  const handleValueChange = (name: string, newValue: string) => {
    const selectedIds = Array.from(selectionStore.selectedIds);
    for (const viewId of selectedIds) {
      updateViewAttribute(viewId, name, newValue);
    }
  };

  const handleValueCommit = (name: string, newValue: string, originalValue: string) => {
    const selectedIds = Array.from(selectionStore.selectedIds);
    if (selectedIds.length === 0) return;

    const previousValues: Record<string, string | undefined> = {};
    for (const viewId of selectedIds) {
      previousValues[viewId] = originalValue;
    }

    const operation = createPropertyEditOperation(
      {
        viewIds: selectedIds,
        attributeName: name,
        previousValues,
        newValue,
      },
      name
    );

    pushOperation(operation);
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
                    onValueChange={handleValueChange}
                    onValueCommit={handleValueCommit}
                    editable={true}
                    documentColors={documentColors()}
                    documentFonts={documentFonts()}
                    documentBitmaps={documentBitmaps()}
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
