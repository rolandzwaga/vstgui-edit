import type { Component } from 'solid-js';
import styles from './TemplateItem.module.css';

export interface TemplateItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const TemplateItem: Component<TemplateItemProps> = (props) => {
  return (
    <div
      class={`${styles.item} ${props.isActive ? styles.active : ''}`}
      onClick={props.onClick}
      data-testid={`template-item-${props.name}`}
      role="option"
      aria-selected={props.isActive}
    >
      <span class={styles.name}>{props.name}</span>
    </div>
  );
};
