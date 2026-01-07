import { type Component, createMemo, For, Show } from 'solid-js';
import { addColor, documentStore, getColors } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { createAddColorOperation } from '../../domain/colors/historyOperations';
import { ColorItem } from './ColorItem';
import { AddColorButton } from './AddColorButton';
import { EmptyState } from './EmptyState';
import styles from './ColorsPanel.module.css';

function generateUniqueColorName(existingColors: Record<string, string>): string {
  const baseName = 'New Color';
  if (!(baseName in existingColors)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingColors) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

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
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddColor = () => {
    const existingColors = getColors() ?? {};
    const newName = generateUniqueColorName(existingColors);
    const defaultValue = '#000000FF';

    addColor(newName, defaultValue);
    pushOperation(createAddColorOperation(newName, defaultValue));
  };

  return (
    <div class={styles.panel} data-testid="colors-panel">
      <div class={styles.header}>
        <span class={styles.title}>Colors</span>
        <AddColorButton onClick={handleAddColor} disabled={!hasDocument()} />
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
