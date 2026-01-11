/**
 * NavigationButtons Component
 * Previous/Next buttons for navigating search results with position indicator.
 */

import styles from './FindPanel.module.css';

export interface NavigationButtonsProps {
  /** Current result index (0-based) */
  currentIndex: number;
  /** Total number of results */
  totalCount: number;
  /** Called when Previous button is clicked */
  onPrevious: () => void;
  /** Called when Next button is clicked */
  onNext: () => void;
}

export function NavigationButtons(props: NavigationButtonsProps) {
  const hasResults = () => props.totalCount > 0;
  const displayPosition = () =>
    hasResults() ? `${props.currentIndex + 1} of ${props.totalCount}` : '0 of 0';

  return (
    <div class={styles.navigationButtons}>
      <span class={styles.positionIndicator} aria-live="polite">
        {displayPosition()}
      </span>
      <button
        type="button"
        class={styles.navButton}
        onClick={props.onPrevious}
        disabled={!hasResults()}
        aria-label="Previous result"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M7.5 10L3.5 6L7.5 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        class={styles.navButton}
        onClick={props.onNext}
        disabled={!hasResults()}
        aria-label="Next result"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  );
}
