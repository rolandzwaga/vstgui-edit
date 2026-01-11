/**
 * ShortcutItem Component
 *
 * Displays a single keyboard shortcut with key combination and description.
 * Shows warning indicator for shortcuts with key conflicts.
 */

import type { Component } from 'solid-js';
import { Show, createMemo } from 'solid-js';
import type { ShortcutDefinition } from '../../../../types/shortcuts';
import { formatKeysForPlatform, hasConflict, getConflictForShortcut } from '../../../../domain/shortcuts';
import styles from './ShortcutItem.module.css';

export interface ShortcutItemProps {
  shortcut: ShortcutDefinition;
}

export const ShortcutItem: Component<ShortcutItemProps> = (props) => {
  // Check for conflicts
  const isConflicting = createMemo(() => hasConflict(props.shortcut.id));
  const conflictInfo = createMemo(() => getConflictForShortcut(props.shortcut.id));

  // Build tooltip for conflict
  const conflictTooltip = createMemo(() => {
    const conflict = conflictInfo();
    if (!conflict) return '';
    const otherShortcuts = conflict.shortcuts
      .filter((s) => s.id !== props.shortcut.id)
      .map((s) => s.description)
      .join(', ');
    return `Conflict with: ${otherShortcuts}`;
  });

  return (
    <div
      class={styles.item}
      classList={{ [styles.conflicting]: isConflicting() }}
      tabIndex={0}
      role="listitem"
    >
      <kbd class={styles.keys}>{formatKeysForPlatform(props.shortcut.keys)}</kbd>
      <span class={styles.description}>
        {props.shortcut.description}
        <Show when={props.shortcut.context}>
          <span class={styles.context}> ({props.shortcut.context})</span>
        </Show>
      </span>
      <Show when={isConflicting()}>
        <span class={styles.conflictIcon} title={conflictTooltip()} aria-label="Conflict warning">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1L1 14h14L8 1zm0 3.5l4.5 8h-9L8 4.5zM7.25 7v3h1.5V7h-1.5zm0 4v1.5h1.5V11h-1.5z" />
          </svg>
        </span>
      </Show>
    </div>
  );
};
