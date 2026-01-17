import type { Component } from 'solid-js';
import type { OrphanedBitmap } from '../../domain/project/types';
import { AlignmentToolbar } from '../AlignmentToolbar';
import { ExportMenu } from '../ExportMenu';
import { GridToolbar } from '../GridToolbar';
import { ProjectMenu } from '../ProjectMenu';
import { SaveAsButton } from '../SaveAsButton';
import { SaveIndicator } from '../SaveIndicator/SaveIndicator';
import { ViewModeToolbar } from '../ViewModeToolbar';
import { ZoomToolbar } from '../ZoomToolbar';
import { PreferencesButton } from './PreferencesButton';
import styles from './MainToolbar.module.css';

export interface MainToolbarProps {
  /** Callback when Fit button is clicked. Caller should invoke fitToView with viewport/template sizes. */
  onFitToView?: () => void;
  /** Callback when New Project is clicked in the Project menu. */
  onNewProject?: () => void;
  /** Callback when orphaned bitmaps are detected after replace uidesc. */
  onOrphanedBitmaps?: (orphans: OrphanedBitmap[]) => void;
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
      <ProjectMenu
        onNewProject={props.onNewProject ?? (() => {})}
        onOrphanedBitmaps={props.onOrphanedBitmaps}
      />
      <SaveAsButton />
      <ExportMenu />
      <SaveIndicator />
      <ZoomToolbar onFitToView={props.onFitToView} />
      <GridToolbar />
      <ViewModeToolbar />
      <AlignmentToolbar />
      <PreferencesButton />
    </div>
  );
};
