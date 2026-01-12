import { type Component, type JSX, createSignal, Show } from 'solid-js';
import styles from './CollapsibleSection.module.css';

export interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  testId?: string;
  headerActions?: JSX.Element;
  children: JSX.Element;
}

export const CollapsibleSection: Component<CollapsibleSectionProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(props.defaultExpanded ?? true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded());
  };

  return (
    <div class={styles.section} data-testid={props.testId}>
      <div class={styles.headerRow}>
        <button
          type="button"
          class={styles.header}
          onClick={handleToggle}
          aria-expanded={isExpanded()}
        >
          <span class={styles.title}>{props.title}</span>
          <span class={styles.indicator} data-testid="collapse-indicator">
            {isExpanded() ? '▼' : '▶'}
          </span>
        </button>
        <Show when={props.headerActions}>
          <div
            class={styles.headerActions}
            onClick={(e) => {
              e.stopPropagation();
              // Expand section if closed when clicking header actions
              if (!isExpanded()) {
                setIsExpanded(true);
              }
            }}
          >
            {props.headerActions}
          </div>
        </Show>
      </div>
      <Show when={isExpanded()}>
        <div class={styles.content}>{props.children}</div>
      </Show>
    </div>
  );
};
