import { type Component, createMemo, For, onMount, Show } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import {
  addGradient,
  deleteGradient,
  documentStore,
  getGradients,
  updateGradientName,
  updateGradientStops,
  updateViewAttribute,
} from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createAddGradientOperation,
  initGradientHistoryOperations,
} from '../../domain/gradients/historyOperations';
import { CollapsibleSection } from '../CollapsibleSection';
import { GradientItem } from './GradientItem';
import { AddGradientButton } from './AddGradientButton';
import { EmptyState } from './EmptyState';
import styles from './GradientsPanel.module.css';

function generateUniqueGradientName(
  existingGradients: Record<string, GradientColorStop[]>
): string {
  const baseName = 'New Gradient';
  if (!(baseName in existingGradients)) {
    return baseName;
  }

  let counter = 2;
  while (`${baseName} ${counter}` in existingGradients) {
    counter++;
  }
  return `${baseName} ${counter}`;
}

const DEFAULT_GRADIENT_STOPS: GradientColorStop[] = [
  { rgba: '#000000FF', start: '0.00' },
  { rgba: '#FFFFFFFF', start: '1.00' },
];

export const GradientsPanel: Component = () => {
  onMount(() => {
    initGradientHistoryOperations(
      addGradient,
      deleteGradient,
      updateGradientName,
      updateGradientStops,
      updateViewAttribute
    );
  });

  const gradients = createMemo(() => {
    const gradientMap = getGradients();
    if (!gradientMap) return [];

    return Object.entries(gradientMap).map(([name, stops]) => ({
      name,
      stops,
    }));
  });

  const hasGradients = createMemo(() => gradients().length > 0);
  const hasDocument = createMemo(() => documentStore.document !== null);

  const handleAddGradient = () => {
    const existingGradients = getGradients() ?? {};
    const newName = generateUniqueGradientName(existingGradients);

    addGradient(newName, DEFAULT_GRADIENT_STOPS);
    pushOperation(createAddGradientOperation(newName, DEFAULT_GRADIENT_STOPS));
  };

  return (
    <div class={styles.panel} data-testid="gradients-panel">
      <CollapsibleSection
        title="Gradients"
        headerActions={<AddGradientButton onClick={handleAddGradient} disabled={!hasDocument()} />}
      >
        <Show when={hasGradients()} fallback={<EmptyState />}>
          <div role="list" aria-label="Gradient definitions" class={styles.list}>
            <For each={gradients()}>
              {(item) => <GradientItem name={item.name} stops={item.stops} />}
            </For>
          </div>
        </Show>
      </CollapsibleSection>
    </div>
  );
};
