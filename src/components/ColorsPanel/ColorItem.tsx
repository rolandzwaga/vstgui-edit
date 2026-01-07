import type { Component } from 'solid-js';
import { ColorSwatch } from './ColorSwatch';
import { truncateColorName, formatColorForDisplay } from '../../domain/colors';
import styles from './ColorItem.module.css';

export interface ColorItemProps {
  name: string;
  value: string;
  isReadOnly?: boolean;
}

export const ColorItem: Component<ColorItemProps> = (props) => {
  const displayName = () => truncateColorName(props.name);
  const displayValue = () => formatColorForDisplay(props.value);
  const needsTooltip = () => props.name.length > 30;

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="color-item"
      title={needsTooltip() ? props.name : undefined}
    >
      <ColorSwatch color={props.value} size="sm" />
      <div class={styles.info}>
        <span class={styles.name} data-testid="color-name">
          {displayName()}
        </span>
        <span class={styles.value} data-testid="color-value">
          {displayValue()}
        </span>
      </div>
    </div>
  );
};
