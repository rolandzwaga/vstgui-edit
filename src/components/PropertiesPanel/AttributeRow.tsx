import type { Component } from 'solid-js';
import { createSignal, createMemo, Show, Switch, Match } from 'solid-js';
import type { AttributeEntry } from '../../types/properties';
import { getAttributeConfig } from '../../domain/properties/attributeTypes';
import { validatePoint, validateSize, validateNumber } from '../../domain/properties/validation';
import { TextEditor } from '../editors/TextEditor';
import { PointEditor } from '../editors/PointEditor';
import { BooleanEditor } from '../editors/BooleanEditor';
import { NumberEditor } from '../editors/NumberEditor';
import { EnumEditor } from '../editors/EnumEditor';
import { ColorPicker } from '../editors/ColorPicker/';
import { FontPicker } from '../editors/FontPicker';
import { BitmapPicker } from '../editors/BitmapPicker';
import styles from './AttributeRow.module.css';

export interface AttributeRowProps {
  entry: AttributeEntry;
  onCopy?: (value: string) => void;
  onValueChange?: (name: string, newValue: string) => void;
  onValueCommit?: (name: string, newValue: string, originalValue: string) => void;
  editable?: boolean;
  documentColors?: string[];
  documentColorValues?: Record<string, string>;
  documentFonts?: string[];
  documentBitmaps?: string[];
  /** Get per-view original values for batch edit undo (used when isMixed=true) */
  getOriginalValues?: (name: string) => Record<string, string | undefined>;
}

export const AttributeRow: Component<AttributeRowProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');
  const [originalValue, setOriginalValue] = createSignal('');

  const config = () => getAttributeConfig(props.entry.name);
  const editorType = () => props.entry.editorType ?? config().editorType;
  const isReadonly = () => props.entry.name === 'class' || config().editorType === 'readonly';
  const isTextType = () => editorType() === 'text';
  const isPointType = () => editorType() === 'point';
  const isBooleanType = () => editorType() === 'boolean';
  const isNumberType = () => editorType() === 'number';
  const isEnumType = () => editorType() === 'enum';
  const isColorType = () => editorType() === 'color';
  const isFontType = () => editorType() === 'font';
  const isBitmapType = () => editorType() === 'bitmap';
  const isGradientType = () => editorType() === 'gradient';
  const canEdit = () => props.editable && !isReadonly();
  const canInlineEdit = () => isTextType() || isPointType() || isNumberType() || isGradientType();

  const validationError = createMemo(() => {
    if (!isEditing()) return null;
    if (isPointType()) {
      const isSizeAttr = props.entry.name === 'size' || props.entry.name === 'min-size' || props.entry.name === 'max-size';
      const result = isSizeAttr ? validateSize(editValue()) : validatePoint(editValue());
      return result.valid ? null : result.error ?? null;
    }
    if (isNumberType()) {
      const cfg = config();
      const result = validateNumber(editValue(), cfg.min, cfg.max);
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
      // For mixed values, start with empty field (placeholder shown)
      const currentValue = props.entry.isMixed ? '' : (props.entry.value ?? '');
      setOriginalValue(currentValue);
      setEditValue(currentValue);
      setIsEditing(true);
    }
  };

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    // Don't call onValueChange here - it triggers document update which
    // causes re-render and unmounts the editor. Only update on commit.
  };

  const handleCommit = () => {
    if (isEditing()) {
      if (validationError()) {
        handleCancel();
        return;
      }
      // For mixed values, pass '__MIXED__' marker so commit handler can fetch per-view originals
      const original = props.entry.isMixed ? '__MIXED__' : originalValue();
      // Update the document first, then record in history
      props.onValueChange?.(props.entry.name, editValue());
      props.onValueCommit?.(props.entry.name, editValue(), original);
      setIsEditing(false);
    }
  };

  const handleBooleanChange = (newValue: string) => {
    // For mixed values, pass '__MIXED__' marker so commit handler can fetch per-view originals
    const original = props.entry.isMixed ? '__MIXED__' : (props.entry.value ?? 'false');
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, original);
  };

  const handleEnumChange = (newValue: string) => {
    // For mixed values, pass '__MIXED__' marker so commit handler can fetch per-view originals
    const original = props.entry.isMixed ? '__MIXED__' : (props.entry.value ?? '');
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, original);
  };

  // Track color editing session: original value and pending (uncommitted) value
  const [colorOriginalValue, setColorOriginalValue] = createSignal<string | null>(null);
  const [colorPendingValue, setColorPendingValue] = createSignal<string | null>(null);

  const handleColorChange = (newValue: string) => {
    // Capture original value on first change in an editing session
    if (colorOriginalValue() === null) {
      setColorOriginalValue(props.entry.value ?? '');
    }
    // Track the pending value (what we'll commit)
    setColorPendingValue(newValue);
    // Live preview - just update the value, don't commit yet
    props.onValueChange?.(props.entry.name, newValue);
  };

  const handleColorCommit = () => {
    // Commit on explicit user action (OK, Enter, swatch selection)
    const original = props.entry.isMixed ? '__MIXED__' : (colorOriginalValue() ?? props.entry.value ?? '');
    const currentValue = colorPendingValue() ?? props.entry.value ?? '';
    props.onValueCommit?.(props.entry.name, currentValue, original);
    // Reset for next editing session
    setColorOriginalValue(null);
    setColorPendingValue(null);
  };

  const handleColorCancel = () => {
    // Revert to original value
    const original = colorOriginalValue();
    if (original !== null) {
      props.onValueChange?.(props.entry.name, original);
    }
    // Reset for next editing session
    setColorOriginalValue(null);
    setColorPendingValue(null);
  };

  const handleFontChange = (newValue: string) => {
    // For mixed values, pass '__MIXED__' marker so commit handler can fetch per-view originals
    const original = props.entry.isMixed ? '__MIXED__' : (props.entry.value ?? '');
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, original);
  };

  const handleBitmapChange = (newValue: string) => {
    // For mixed values, pass '__MIXED__' marker so commit handler can fetch per-view originals
    const original = props.entry.isMixed ? '__MIXED__' : (props.entry.value ?? '');
    props.onValueChange?.(props.entry.name, newValue);
    props.onValueCommit?.(props.entry.name, newValue, original);
  };

  const handleCancel = () => {
    setEditValue(originalValue());
    // No need to call onValueChange - we only propagate on commit now
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
      <Show when={!props.entry.isMixed && props.entry.isUnset}>
        <span class={styles.unset}>(not set)</span>
      </Show>
      <Show when={!props.entry.isMixed && !props.entry.isUnset && props.entry.value === ''}>
        <span class={styles.empty}>(empty)</span>
      </Show>
      <Show when={!props.entry.isMixed && !props.entry.isUnset && props.entry.value !== ''}>
        {props.entry.value}
      </Show>
    </span>
  );

  return (
    <div class={`${styles.row} ${props.entry.isUnset ? styles.unsetRow : ''}`} data-testid="attribute-row">
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
        <Match when={isEnumType() && canEdit()}>
          <div class={styles.editorContainer}>
            <EnumEditor
              value={props.entry.value ?? ''}
              options={props.entry.enumValues ?? config().options ?? []}
              onChange={handleEnumChange}
              onCommit={() => {}}
              onCancel={() => {}}
              disabled={!props.editable}
            />
          </div>
        </Match>
        <Match when={isColorType() && canEdit()}>
          <div class={styles.editorContainer}>
            <ColorPicker
              value={props.entry.value ?? ''}
              documentColors={props.documentColors ?? []}
              documentColorValues={props.documentColorValues}
              onChange={handleColorChange}
              onCommit={handleColorCommit}
              onCancel={handleColorCancel}
              disabled={!props.editable}
              attributeName={props.entry.name}
            />
          </div>
        </Match>
        <Match when={isFontType() && canEdit()}>
          <div class={styles.editorContainer}>
            <FontPicker
              value={props.entry.value ?? ''}
              documentFonts={props.documentFonts ?? []}
              onChange={handleFontChange}
              onCommit={() => {}}
              onCancel={() => {}}
              disabled={!props.editable}
            />
          </div>
        </Match>
        <Match when={isBitmapType() && canEdit()}>
          <div class={styles.editorContainer}>
            <BitmapPicker
              value={props.entry.value ?? ''}
              documentBitmaps={props.documentBitmaps ?? []}
              onChange={handleBitmapChange}
              onCommit={() => {}}
              onCancel={() => {}}
              disabled={!props.editable}
            />
          </div>
        </Match>
        <Match when={isEditing() && isTextType()}>
          <div class={styles.editorContainer}>
            <TextEditor
              value={editValue()}
              onChange={handleChange}
              onCommit={handleCommit}
              onCancel={handleCancel}
              placeholder={props.entry.isMixed ? 'Mixed' : undefined}
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
              placeholder={props.entry.isMixed ? 'Mixed' : undefined}
            />
          </div>
        </Match>
        <Match when={isEditing() && isNumberType()}>
          <div class={styles.editorContainer}>
            <NumberEditor
              value={editValue()}
              onChange={handleChange}
              onCommit={handleCommit}
              onCancel={handleCancel}
              error={validationError()}
              min={config().min}
              max={config().max}
              step={config().step}
              placeholder={props.entry.isMixed ? 'Mixed' : undefined}
            />
          </div>
        </Match>
      </Switch>
    </div>
  );
};
