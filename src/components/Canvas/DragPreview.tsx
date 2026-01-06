import { type Component, For, Show } from 'solid-js';
import { dragStore } from '../../stores/dragStore';
import { applyDelta } from '../../domain/canvas/move';
import type { RenderableView } from '../../types/canvas';
import styles from './DragPreview.module.css';

export interface DragPreviewProps {
  views: RenderableView[];
}

export const DragPreview: Component<DragPreviewProps> = (props) => {
  return (
    <Show when={dragStore.isDragging}>
      <g data-testid="drag-preview-group" class={styles.previewGroup}>
        <For each={props.views}>
          {(view) => {
            const newPosition = () =>
              applyDelta({ x: view.absoluteX, y: view.absoluteY }, dragStore.delta);

            return (
              <rect
                data-testid={`drag-preview-${view.id}`}
                class={styles.preview}
                x={newPosition().x}
                y={newPosition().y}
                width={view.width}
                height={view.height}
              />
            );
          }}
        </For>
      </g>
    </Show>
  );
};
