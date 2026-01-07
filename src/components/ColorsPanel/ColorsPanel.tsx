import { type Component, createMemo, For, Show } from 'solid-js';
import { getColors } from '../../stores/documentStore';
import { ColorItem } from './ColorItem';
import { EmptyState } from './EmptyState';
import styles from './ColorsPanel.module.css';

export const ColorsPanel: Component = () => {
  const colors = createMemo(() => {
    const colorMap = getColors();
    if (!colorMap) return [];

    return Object.entries(colorMap).map(([name, value]) => ({
      name,
      value,
    }));
  });

  const hasColors = createMemo(() => colors().length > 0);

  return (
    <div class={styles.panel} data-testid="colors-panel">
      <div class={styles.header}>
        <span class={styles.title}>Colors</span>
      </div>
      <Show when={hasColors()} fallback={<EmptyState />}>
        <div role="list" aria-label="Color definitions" class={styles.list}>
          <For each={colors()}>
            {(color) => <ColorItem name={color.name} value={color.value} />}
          </For>
        </div>
      </Show>
    </div>
  );
};
