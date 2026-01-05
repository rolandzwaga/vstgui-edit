import { type Component, createMemo, For, Show } from 'solid-js';
import { documentStore } from '../../stores/documentStore';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { parseSize } from '../../domain/canvas/coordinates';
import type { RenderableView, TemplateBounds } from '../../types/canvas';
import { EmptyState } from './EmptyState';
import { ViewRectangle } from './ViewRectangle';
import styles from './Canvas.module.css';

/**
 * Main canvas component that renders the uidesc template visualization.
 * Reads view hierarchy from documentStore and renders as SVG.
 */
export const Canvas: Component = () => {
  /**
   * Gets the templates object from documentStore.
   */
  const templates = () => {
    const doc = documentStore.document;
    if (!doc) return null;

    // Access vstgui-ui-description.templates
    const vstgui = doc['vstgui-ui-description'];
    if (!vstgui) return null;

    return vstgui.templates ?? null;
  };

  /**
   * Gets the first template from the templates object.
   * Returns [templateName, templateView] tuple or null.
   */
  const firstTemplate = createMemo(() => {
    const t = templates();
    if (!t) return null;

    const entries = Object.entries(t);
    if (entries.length === 0) return null;

    return entries[0];
  });

  /**
   * Flattens the template hierarchy into renderable views.
   */
  const renderableViews = createMemo((): RenderableView[] => {
    const template = firstTemplate();
    if (!template) return [];

    const [name, view] = template;
    return flattenHierarchy(view, name);
  });

  /**
   * Gets the template bounds from the root view.
   */
  const templateBounds = createMemo((): TemplateBounds | null => {
    const template = firstTemplate();
    if (!template) return null;

    const [, view] = template;
    const size = parseSize(view.attributes.size);

    return {
      width: size.width,
      height: size.height,
    };
  });

  /**
   * Whether to show the empty state.
   */
  const isEmpty = () => firstTemplate() === null;

  return (
    <Show
      when={!isEmpty()}
      fallback={<EmptyState />}
    >
      <svg
        class={styles.canvas}
        viewBox={`0 0 ${templateBounds()?.width ?? 100} ${templateBounds()?.height ?? 100}`}
        data-testid="canvas"
      >
        <For each={renderableViews()}>
          {(view) => <ViewRectangle view={view} />}
        </For>
      </svg>
    </Show>
  );
};
