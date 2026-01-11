/**
 * TemplateScope Component
 * Radio buttons for toggling between searching current template or all templates.
 */

import type { TemplateScope as TemplateScopeType } from '../../types/search';
import styles from './FindPanel.module.css';

export interface TemplateScopeProps {
  /** Current template scope */
  scope: TemplateScopeType;
  /** Name of the current template for display */
  currentTemplateName: string;
  /** Total number of templates in the document */
  templateCount: number;
  /** Called when scope changes */
  onScopeChange: (scope: TemplateScopeType) => void;
}

export function TemplateScope(props: TemplateScopeProps) {
  const handleChange = (newScope: TemplateScopeType) => {
    // Don't change if clicking the same scope
    if (props.scope === newScope) {
      return;
    }
    // Don't change to all if only one template
    if (newScope === 'all' && props.templateCount <= 1) {
      return;
    }
    props.onScopeChange(newScope);
  };

  const isAllDisabled = () => props.templateCount <= 1;

  return (
    <div class={styles.scopeFilter}>
      <label class={styles.scopeOption}>
        <input
          type="radio"
          name="templateScope"
          value="current"
          checked={props.scope === 'current'}
          onChange={() => handleChange('current')}
        />
        Current template ({props.currentTemplateName})
      </label>
      <label
        class={`${styles.scopeOption} ${isAllDisabled() ? styles.scopeOptionDisabled : ''}`}
      >
        <input
          type="radio"
          name="templateScope"
          value="all"
          checked={props.scope === 'all'}
          onChange={() => handleChange('all')}
          disabled={isAllDisabled()}
        />
        All templates ({props.templateCount})
      </label>
    </div>
  );
}
