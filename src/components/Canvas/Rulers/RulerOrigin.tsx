/**
 * RulerOrigin Component
 *
 * Origin indicator displayed at the top-left corner where
 * the horizontal and vertical rulers meet.
 */

import styles from './RulerOrigin.module.css';

export function RulerOrigin() {
  return (
    <div class={styles.origin} data-testid="ruler-origin">
      <div class={styles.crosshair} />
    </div>
  );
}
