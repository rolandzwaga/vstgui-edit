import { type Component, createSignal, Show } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import { truncateGradientName, formatStopCount, validateGradientName } from '../../domain/gradients';
import { GradientPreview } from './GradientPreview';
import { GradientStopEditor } from './GradientStopEditor';
import styles from './GradientItem.module.css';

export interface GradientItemProps {
  name: string;
  stops: GradientColorStop[];
  onDelete?: (name: string) => void;
  onRename?: (oldName: string, newName: string) => void;
  onStopsChange?: (name: string, stops: GradientColorStop[]) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
  existingNames?: string[];
}

export const GradientItem: Component<GradientItemProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [isEditing, setIsEditing] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);

  const displayName = () => truncateGradientName(props.name);
  const stopSummary = () => formatStopCount(props.stops.length);
  const needsTooltip = () => props.name.length > 24;

  const handleItemClick = () => {
    if (isEditing()) return;
    setIsExpanded(!isExpanded());
  };

  const handleNameDblClick = (e: MouseEvent) => {
    e.stopPropagation();
    setNameInput(props.name);
    setNameError(null);
    setIsEditing(true);
  };

  const saveName = () => {
    const newName = nameInput().trim();

    if (newName === props.name) {
      setIsEditing(false);
      return;
    }

    const otherNames = (props.existingNames ?? []).filter((n) => n !== props.name);
    const validation = validateGradientName(newName, otherNames);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    props.onRename?.(props.name, newName);
    setIsEditing(false);
    setNameError(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNameError(null);
  };

  const handleNameKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props.name);
  };

  const handleStopsChange = (newStops: GradientColorStop[]) => {
    props.onStopsChange?.(props.name, newStops);
  };

  return (
    <div
      class={`${styles.item} ${isExpanded() ? styles.expanded : ''}`}
      data-testid="gradient-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
    >
      <div class={styles.header}>
        <GradientPreview stops={props.stops} />
        <div class={styles.info}>
          <Show
            when={isEditing()}
            fallback={
              <span
                class={styles.name}
                data-testid="gradient-name"
                onDblClick={handleNameDblClick}
              >
                {displayName()}
              </span>
            }
          >
            <div class={styles.editContainer} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                class={`${styles.input} ${nameError() ? styles.inputError : ''}`}
                data-testid="gradient-name-input"
                value={nameInput()}
                onInput={(e) => {
                  setNameInput(e.currentTarget.value);
                  setNameError(null);
                }}
                onKeyDown={handleNameKeyDown}
                onBlur={saveName}
                aria-invalid={!!nameError()}
                ref={(el) => setTimeout(() => el.focus(), 0)}
              />
              <Show when={nameError()}>
                <span class={styles.error} data-testid="gradient-name-error">
                  {nameError()}
                </span>
              </Show>
            </div>
          </Show>
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
        <span class={styles.expandIcon} data-testid="expand-icon">
          {isExpanded() ? '▲' : '▼'}
        </span>
      </div>

      <Show when={isExpanded()}>
        <div class={styles.editorContainer}>
          <GradientStopEditor
            stops={props.stops}
            onChange={handleStopsChange}
          />
        </div>
      </Show>
    </div>
  );
};
