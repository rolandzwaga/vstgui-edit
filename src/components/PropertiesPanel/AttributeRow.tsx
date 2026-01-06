import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import type { AttributeEntry } from '../../types/properties';
import styles from './AttributeRow.module.css';

export interface AttributeRowProps {
  entry: AttributeEntry;
  onCopy?: (value: string) => void;
}

export const AttributeRow: Component<AttributeRowProps> = (props) => {
  const handleClick = () => {
    if (props.entry.isCopyable && props.entry.value && props.onCopy) {
      props.onCopy(props.entry.value);
    }
  };

  return (
    <div class={styles.row} data-testid="attribute-row">
      <span class={styles.name}>{props.entry.name}</span>
      <span
        class={`${styles.value} ${props.entry.isCopyable ? styles.copyable : ''}`}
        data-testid="attribute-value"
        onClick={handleClick}
      >
        <Show when={props.entry.isMixed}>
          <span class={styles.mixed}>Mixed</span>
        </Show>
        <Show when={!props.entry.isMixed && props.entry.value === ''}>
          <span class={styles.empty}>(empty)</span>
        </Show>
        <Show when={!props.entry.isMixed && props.entry.value !== ''}>
          {props.entry.value}
        </Show>
      </span>
    </div>
  );
};
