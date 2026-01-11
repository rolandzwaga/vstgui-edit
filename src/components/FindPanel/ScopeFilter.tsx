/**
 * ScopeFilter Component
 * Radio buttons for filtering search scope (all views or within selection).
 */

import type { SearchScope } from '../../types/search';
import styles from './FindPanel.module.css';

export interface ScopeFilterProps {
  /** Current search scope */
  scope: SearchScope;
  /** Selected container name for display */
  selectedContainerName?: string;
  /** Whether a container is selected */
  hasContainerSelection: boolean;
  /** Called when scope changes */
  onScopeChange: (scope: SearchScope) => void;
}

export function ScopeFilter(props: ScopeFilterProps) {
  const handleChange = (newScope: SearchScope) => {
    // Don't change if clicking the same scope
    if (props.scope === newScope) {
      return;
    }
    // Don't change to selection if no container is selected
    if (newScope === 'selection' && !props.hasContainerSelection) {
      return;
    }
    props.onScopeChange(newScope);
  };

  const isWithinSelectionDisabled = () => !props.hasContainerSelection;

  return (
    <div class={styles.scopeFilter}>
      <label
        class={styles.scopeOption}
      >
        <input
          type="radio"
          name="searchScope"
          value="all"
          checked={props.scope === 'all'}
          onChange={() => handleChange('all')}
        />
        All views
      </label>
      <label
        class={`${styles.scopeOption} ${isWithinSelectionDisabled() ? styles.scopeOptionDisabled : ''}`}
      >
        <input
          type="radio"
          name="searchScope"
          value="selection"
          checked={props.scope === 'selection'}
          onChange={() => handleChange('selection')}
          disabled={isWithinSelectionDisabled()}
        />
        {props.hasContainerSelection && props.selectedContainerName
          ? `Within ${props.selectedContainerName}`
          : 'Within selection'}
      </label>
    </div>
  );
}
