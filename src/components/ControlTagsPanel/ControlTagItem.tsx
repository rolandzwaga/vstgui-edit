import { type Component, createSignal, Show } from 'solid-js';
import styles from './ControlTagItem.module.css';

export interface ControlTagItemProps {
  name: string;
  tagId: string;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const ControlTagItem: Component<ControlTagItemProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props.name);
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="control-tag-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class={styles.content}>
        <span class={styles.name} data-testid="control-tag-name">
          {props.name}
        </span>
        <span class={styles.tagId} data-testid="control-tag-id">
          {props.tagId}
        </span>
      </div>
      <Show when={props.usageCount && props.usageCount > 0}>
        <button
          type="button"
          class={styles.usageBadge}
          data-testid="usage-badge"
          aria-label={`${props.usageCount} ${props.usageCount === 1 ? 'usage' : 'usages'}`}
          onClick={(e) => {
            e.stopPropagation();
            props.onUsageClick?.(props.name);
          }}
        >
          {props.usageCount}
        </button>
      </Show>
      <Show when={isHovered() && !props.isReadOnly && props.onDelete}>
        <button
          type="button"
          class={styles.deleteButton}
          data-testid="delete-control-tag-button"
          aria-label={`Delete control tag ${props.name}`}
          onClick={handleDelete}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </Show>
    </div>
  );
};
