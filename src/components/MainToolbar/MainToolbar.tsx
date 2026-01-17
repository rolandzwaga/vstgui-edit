import type { Component } from 'solid-js';
import { AlignmentToolbar } from '../AlignmentToolbar';
import { ExportMenu } from '../ExportMenu';
import { GridToolbar } from '../GridToolbar';
import { SaveAsButton } from '../SaveAsButton';
import { SaveButton } from '../SaveButton';
import { ViewModeToolbar } from '../ViewModeToolbar';
import { ZoomToolbar } from '../ZoomToolbar';
import { PreferencesButton } from './PreferencesButton';
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
      <SaveAsButton />
      <ExportMenu />
      <ZoomToolbar onFitToView={props.onFitToView} />
      <GridToolbar />
      <ViewModeToolbar />
      <AlignmentToolbar />
      <PreferencesButton />
    </div>
  );
};
