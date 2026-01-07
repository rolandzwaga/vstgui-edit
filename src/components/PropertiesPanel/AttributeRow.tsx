import type { Component } from 'solid-js';
import { createSignal, createMemo, Show, Switch, Match } from 'solid-js';
import type { AttributeEntry } from '../../types/properties';
import { getAttributeConfig } from '../../domain/properties/attributeTypes';
import { validatePoint, validateSize } from '../../domain/properties/validation';
import { TextEditor } from '../editors/TextEditor';
import { PointEditor } from '../editors/PointEditor';
import { BooleanEditor } from '../editors/BooleanEditor';
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
  const editorType = () => config().editorType;
  const isReadonly = () => editorType() === 'readonly';
  const isTextType = () => editorType() === 'text';
  const isPointType = () => editorType() === 'point';
  const isBooleanType = () => editorType() === 'boolean';
  const canEdit = () => props.editable && !isReadonly() && !props.entry.isMixed;
  const canInlineEdit = () => isTextType() || isPointType();

  const validationError = createMemo(() => {
    if (!isEditing()) return null;
    if (isPointType()) {
      const isSizeAttr = props.entry.name === 'size' || props.entry.name === 'min-size' || props.entry.name === 'max-size';
      const result = isSizeAttr ? validateSize(editValue()) : validatePoint(editValue());
      return result.valid ? null : result.error ?? null;
    }
    return null;
  });

  const handleClick = () => {
    if (props.entry.isCopyable && props.entry.value && props.onCopy) {
      props.onCopy(props.entry.value);
    }
  };

  const handleDoubleClick = () => {
    if (canEdit() && canInlineEdit()) {
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
      if (validationError()) {
        handleCancel();
        return;
      }
      props.onValueCommit?.(props.entry.name, editValue(), originalValue());
      setIsEditing(false);
    }
  };

  const handleBooleanChange = (newValue: string) => {
    const currentValue = props.entry.value ?? 'false';
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, currentValue);
  };

  const handleCancel = () => {
    setEditValue(originalValue());
    props.onValueChange?.(props.entry.name, originalValue());
    setIsEditing(false);
  };

  const renderValueDisplay = () => (
    <span
      class={`${styles.value} ${props.entry.isCopyable ? styles.copyable : ''} ${canEdit() && canInlineEdit() ? styles.editable : ''}`}
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
  );

  return (
    <div class={styles.row} data-testid="attribute-row">
      <span class={styles.name}>{props.entry.name}</span>
      <Switch fallback={renderValueDisplay()}>
        <Match when={isBooleanType() && canEdit()}>
          <BooleanEditor
            value={props.entry.value ?? 'false'}
            onChange={handleBooleanChange}
            onCommit={() => {}}
            onCancel={() => {}}
            disabled={!props.editable}
          />
        </Match>
        <Match when={isEditing() && isTextType()}>
          <div class={styles.editorContainer}>
            <TextEditor
              value={editValue()}
              onChange={handleChange}
              onCommit={handleCommit}
              onCancel={handleCancel}
            />
          </div>
        </Match>
        <Match when={isEditing() && isPointType()}>
          <div class={styles.editorContainer}>
            <PointEditor
              value={editValue()}
              onChange={handleChange}
              onCommit={handleCommit}
              onCancel={handleCancel}
              error={validationError()}
            />
          </div>
        </Match>
      </Switch>
    </div>
  );
};
