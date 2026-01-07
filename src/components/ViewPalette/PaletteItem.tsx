import type { Component } from 'solid-js';
import styles from './PaletteItem.module.css';

export interface PaletteItemProps {
  className: string;
}

export const PaletteItem: Component<PaletteItemProps> = (props) => {
  const handleDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('application/vstgui-view-class', props.className);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div
      class={styles.item}
      data-testid={`palette-item-${props.className}`}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <span class={styles.label}>{props.className}</span>
    </div>
  );
};
