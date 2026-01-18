import { type Component, createSignal, createEffect, on } from 'solid-js';
import {
  validateFrameCount,
  validateMultiframeSize,
  validateFramesPerRow,
} from '../../../domain/bitmaps/validation';
import styles from './MultiframeEditor.module.css';

export interface MultiframeEditorProps {
  /** Number of frames (multiframe-num-frames) */
  numFrames: string;
  /** Frame size as "width, height" (multiframe-size) */
  frameSize: string;
  /** Frames per row (mulitframe-frames-per-row) - optional */
  framesPerRow: string;
  /** Called when frame count changes */
  onNumFramesChange: (value: string) => void;
  /** Called when frame size changes */
  onFrameSizeChange: (value: string) => void;
  /** Called when frames per row changes */
  onFramesPerRowChange: (value: string) => void;
  /** Called when any field is committed (blur/enter) */
  onCommit: () => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * Editor for multiframe bitmap properties.
 *
 * Provides three input fields:
 * - Frame Count (required) - total number of frames
 * - Frame Size (required) - dimensions as "width, height"
 * - Frames/Row (optional) - for grid layouts
 */
export const MultiframeEditor: Component<MultiframeEditorProps> = (props) => {
  // Local input state for controlled inputs
  const [numFramesInput, setNumFramesInput] = createSignal(props.numFrames);
  const [frameSizeInput, setFrameSizeInput] = createSignal(props.frameSize);
  const [framesPerRowInput, setFramesPerRowInput] = createSignal(props.framesPerRow);

  // Validation error state
  const [numFramesError, setNumFramesError] = createSignal<string | null>(null);
  const [frameSizeError, setFrameSizeError] = createSignal<string | null>(null);
  const [framesPerRowError, setFramesPerRowError] = createSignal<string | null>(null);

  // Sync props to local state when props change externally
  createEffect(
    on(
      () => props.numFrames,
      (value) => setNumFramesInput(value)
    )
  );
  createEffect(
    on(
      () => props.frameSize,
      (value) => setFrameSizeInput(value)
    )
  );
  createEffect(
    on(
      () => props.framesPerRow,
      (value) => setFramesPerRowInput(value)
    )
  );

  const handleNumFramesInput = (e: InputEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setNumFramesInput(value);

    const validation = validateFrameCount(value);
    setNumFramesError(validation.valid ? null : (validation.error ?? null));

    if (validation.valid) {
      props.onNumFramesChange(value);
    }
  };

  const handleFrameSizeInput = (e: InputEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setFrameSizeInput(value);

    const validation = validateMultiframeSize(value);
    setFrameSizeError(validation.valid ? null : (validation.error ?? null));

    if (validation.valid) {
      props.onFrameSizeChange(value);
    }
  };

  const handleFramesPerRowInput = (e: InputEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setFramesPerRowInput(value);

    const validation = validateFramesPerRow(value);
    setFramesPerRowError(validation.valid ? null : (validation.error ?? null));

    if (validation.valid) {
      props.onFramesPerRowChange(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      props.onCommit();
    }
  };

  return (
    <div class={styles.container} data-testid="multiframe-editor">
      <div class={styles.field}>
        <label class={styles.label}>Frames</label>
        <input
          type="number"
          class={styles.input}
          classList={{ [styles.inputError]: !!numFramesError() }}
          value={numFramesInput()}
          onInput={handleNumFramesInput}
          onBlur={props.onCommit}
          onKeyDown={handleKeyDown}
          min="1"
          step="1"
          placeholder="36"
          disabled={props.disabled}
          aria-label="Number of frames"
          aria-invalid={!!numFramesError()}
          data-testid="multiframe-num-frames"
        />
      </div>

      <div class={styles.field}>
        <label class={styles.label}>Size</label>
        <input
          type="text"
          class={styles.input}
          classList={{ [styles.inputError]: !!frameSizeError() }}
          value={frameSizeInput()}
          onInput={handleFrameSizeInput}
          onBlur={props.onCommit}
          onKeyDown={handleKeyDown}
          placeholder="20, 20"
          disabled={props.disabled}
          aria-label="Frame size (width, height)"
          aria-invalid={!!frameSizeError()}
          data-testid="multiframe-size"
        />
      </div>

      <div class={styles.field}>
        <label class={styles.label}>Per Row</label>
        <input
          type="number"
          class={styles.input}
          classList={{ [styles.inputError]: !!framesPerRowError() }}
          value={framesPerRowInput()}
          onInput={handleFramesPerRowInput}
          onBlur={props.onCommit}
          onKeyDown={handleKeyDown}
          min="1"
          step="1"
          placeholder="(auto)"
          disabled={props.disabled}
          aria-label="Frames per row"
          aria-invalid={!!framesPerRowError()}
          data-testid="multiframe-frames-per-row"
        />
      </div>
    </div>
  );
};
