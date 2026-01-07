import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import type { AttributeEntry } from '../../types/properties';
import { getAttributeConfig } from '../../domain/properties/attributeTypes';
import { TextEditor } from '../editors/TextEditor';
import styles from './AttributeRow.module.css';

export interface AttributeRowProps {
  entry: AttributeEntry;
  onCopy?: (value: string) => void;
  onValueChange?: (name: string, newValue: string) => void;
  onValueCommit?: (name: string, newValue: string, originalValue: string) => void;
  editable?: boolean;
}

export const AttributeRow: Component<AttributeRowProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');
  const [originalValue, setOriginalValue] = createSignal('');

  const config = () => getAttributeConfig(props.entry.name);
  const isReadonly = () => config().editorType === 'readonly';
  const isTextType = () => config().editorType === 'text';
  const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;

  const handleClick = () => {
    if (props.entry.isCopyable && props.entry.value && props.onCopy) {
      props.onCopy(props.entry.value);
    }
  };

  const handleDoubleClick = () => {
    if (canEdit() && isTextType()) {
      const currentValue = props.entry.value ?? '';
      setOriginalValue(currentValue);
      setEditValue(currentValue);
      setIsEditing(true);
    }
  };

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    props.onValueChange?.(props.entry.name, newValue);
  };

  const handleCommit = () => {
    if (isEditing()) {
      props.onValueCommit?.(props.entry.name, editValue(), originalValue());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(originalValue());
    props.onValueChange?.(props.entry.name, originalValue());
    setIsEditing(false);
  };

  return (
    <div class={styles.row} data-testid="attribute-row">
      <span class={styles.name}>{props.entry.name}</span>
      <Show
        when={isEditing() && isTextType()}
        fallback={
          <span
            class={`${styles.value} ${props.entry.isCopyable ? styles.copyable : ''} ${canEdit() ? styles.editable : ''}`}
            data-testid="attribute-value"
            onClick={handleClick}
            onDblClick={handleDoubleClick}
          >
            <Show when={props.entry.isMixed}>
              <span class={styles.mixed}>Mixed</span>
            </Show>
            <Show when={!props.entry.isMixed && props.entry.value === ''}>
              <span class={styles.empty}>(empty)</span>
            </Show>
            <Show when={!props.entry.isMixed && props.entry.value !== ''}>
              {props.entry.value}
            </Show>
          </span>
        }
      >
        <div class={styles.editorContainer}>
          <TextEditor
            value={editValue()}
            onChange={handleChange}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        </div>
      </Show>
    </div>
  );
};
