import { type Component, createSignal, Show } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import { truncateGradientName, formatStopCount } from '../../domain/gradients';
import { GradientPreview } from './GradientPreview';
import styles from './GradientItem.module.css';

export interface GradientItemProps {
  name: string;
  stops: GradientColorStop[];
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const GradientItem: Component<GradientItemProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const displayName = () => truncateGradientName(props.name);
  const stopSummary = () => formatStopCount(props.stops.length);
  const needsTooltip = () => props.name.length > 24;

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props.name);
  };

  return (
    <div
      class={styles.item}
      data-testid="gradient-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GradientPreview stops={props.stops} />
      <div class={styles.info}>
        <span class={styles.name} data-testid="gradient-name">
          {displayName()}
        </span>
        <span class={styles.summary} data-testid="gradient-summary">
          {stopSummary()}
        </span>
      </div>
      <Show when={props.usageCount !== undefined && props.usageCount > 0}>
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
      <Show when={isHovered() && props.onDelete}>
        <button
          type="button"
          class={styles.deleteButton}
          data-testid="delete-gradient-button"
          aria-label={`Delete gradient ${props.name}`}
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
