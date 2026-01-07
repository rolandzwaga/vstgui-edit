import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import type { AttributeGroup as AttributeGroupType } from '../../types/properties';
import { AttributeRow } from './AttributeRow';
import styles from './AttributeGroup.module.css';

export interface AttributeGroupProps {
  group: AttributeGroupType;
  isExpanded: boolean;
  onToggle?: () => void;
  onCopy?: (value: string) => void;
  onValueChange?: (name: string, newValue: string) => void;
  onValueCommit?: (name: string, newValue: string, originalValue: string) => void;
  editable?: boolean;
}

export const AttributeGroup: Component<AttributeGroupProps> = (props) => {
  const isIdentity = () => props.group.id === 'identity';
  const isCollapsible = () => !isIdentity();
  const showContent = () => isIdentity() || props.isExpanded;

  const handleHeaderClick = () => {
    if (isCollapsible() && props.onToggle) {
      props.onToggle();
    }
  };

  return (
    <div class={styles.group} data-testid="attribute-group" role="region" aria-label={props.group.label}>
      <div
        class={`${styles.header} ${isCollapsible() ? styles.clickable : ''}`}
        data-testid="group-header"
        onClick={handleHeaderClick}
        role={isCollapsible() ? 'button' : undefined}
        aria-expanded={isCollapsible() ? props.isExpanded : undefined}
        tabIndex={isCollapsible() ? 0 : undefined}
        onKeyDown={(e) => {
          if (isCollapsible() && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        <Show when={isCollapsible()}>
          <span class={styles.chevron} data-testid="collapse-indicator" aria-hidden="true">
            {props.isExpanded ? '▼' : '▶'}
          </span>
        </Show>
        <span class={styles.label}>{props.group.label}</span>
      </div>
      <Show when={showContent()}>
        <div class={styles.content}>
          <For each={props.group.attributes}>
            {(entry) => (
              <AttributeRow
                entry={entry}
                onCopy={props.onCopy}
                onValueChange={props.onValueChange}
                onValueCommit={props.onValueCommit}
                editable={props.editable}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
