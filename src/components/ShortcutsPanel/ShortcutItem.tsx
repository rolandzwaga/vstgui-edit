/**
 * ShortcutItem Component
 *
 * Displays a single keyboard shortcut with key combination and description.
 */

import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import type { ShortcutDefinition } from '../../types/shortcuts';
import { formatKeysForPlatform } from '../../domain/shortcuts';
import styles from './ShortcutItem.module.css';

export interface ShortcutItemProps {
  shortcut: ShortcutDefinition;
}

export const ShortcutItem: Component<ShortcutItemProps> = (props) => {
  return (
    <div class={styles.item} tabIndex={0} role="listitem">
      <kbd class={styles.keys}>{formatKeysForPlatform(props.shortcut.keys)}</kbd>
      <span class={styles.description}>
        {props.shortcut.description}
        <Show when={props.shortcut.context}>
          <span class={styles.context}> ({props.shortcut.context})</span>
        </Show>
      </span>
    </div>
  );
};
