import type { Component } from 'solid-js';
import styles from './Legend.module.css';

export const Legend: Component = () => {
  return (
    <div class={styles.legend} data-testid="canvas-legend">
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.container}`} />
        <span>Container</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.control}`} />
        <span>Control</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.display}`} />
        <span>Display</span>
      </div>
      <div class={styles.legendItem}>
        <div class={`${styles.legendSwatch} ${styles.custom}`} />
        <span>Custom</span>
      </div>
    </div>
  );
};
