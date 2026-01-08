import type { Component } from 'solid-js';
import { SaveButton } from '../SaveButton';
import { ZoomToolbar } from '../ZoomToolbar';
import { GridToolbar } from '../GridToolbar';
import styles from './MainToolbar.module.css';

export interface MainToolbarProps {
  /** Callback when Fit button is clicked. Caller should invoke fitToView with viewport/template sizes. */
  onFitToView?: () => void;
}

/**
 * MainToolbar - Container for all canvas toolbar controls.
 *
 * Combines ZoomToolbar and GridToolbar into a unified toolbar container.
 * Renders both toolbars side by side with consistent spacing.
 */
export const MainToolbar: Component<MainToolbarProps> = (props) => {
  return (
    <div class={styles.container} role="toolbar" aria-label="Main toolbar">
      <SaveButton />
      <ZoomToolbar onFitToView={props.onFitToView} />
      <GridToolbar />
    </div>
  );
};
