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
  createDeleteGradientOperation,
  createEditGradientNameOperation,
  createEditGradientStopsOperation,
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

  const existingNames = createMemo(() => gradients().map((g) => g.name));

  const handleAddGradient = () => {
    const existingGradients = getGradients() ?? {};
    const newName = generateUniqueGradientName(existingGradients);

    addGradient(newName, DEFAULT_GRADIENT_STOPS);
    pushOperation(createAddGradientOperation(newName, DEFAULT_GRADIENT_STOPS));
  };

  const handleRename = (oldName: string, newName: string) => {
    const success = updateGradientName(oldName, newName);
    if (success) {
      pushOperation(createEditGradientNameOperation(oldName, newName));
    }
  };

  const handleStopsChange = (name: string, newStops: GradientColorStop[]) => {
    const oldStops = updateGradientStops(name, newStops);
    if (oldStops) {
      pushOperation(createEditGradientStopsOperation(name, oldStops, newStops));
    }
  };

  const handleDelete = (name: string) => {
    const existingGradients = getGradients() ?? {};
    const stops = existingGradients[name];
    if (!stops) return;

    const result = deleteGradient(name);
    if (result) {
      pushOperation(createDeleteGradientOperation(name, stops, result.removedReferences));
    }
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
              {(item) => (
                <GradientItem
                  name={item.name}
                  stops={item.stops}
                  existingNames={existingNames()}
                  onRename={handleRename}
                  onStopsChange={handleStopsChange}
                  onDelete={handleDelete}
                />
              )}
            </For>
          </div>
        </Show>
      </CollapsibleSection>
    </div>
  );
};
