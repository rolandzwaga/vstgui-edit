/**
 * View Mode Toolbar Component Contract
 *
 * Toolbar component for toggling between wireframe and styled view modes.
 * Location: src/components/ViewModeToolbar/ViewModeToolbar.tsx
 */

import type { Component } from 'solid-js';
import type { ViewMode } from './viewMode.types';

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the ViewModeToolbar component.
 */
export interface ViewModeToolbarProps {
  // No external props required - uses viewModeStore internally
}

// =============================================================================
// Component Contract
// =============================================================================

/**
 * ViewModeToolbar - Toggle button for wireframe/styled view mode.
 *
 * Features:
 * - Single eye icon button
 * - Active state styling when in styled mode
 * - Tooltip with keyboard shortcut hint (P)
 * - aria-pressed for accessibility
 *
 * Behavior:
 * - Click toggles between wireframe and styled modes
 * - Styled mode shows highlighted/filled button state
 * - Wireframe mode shows default/outlined button state
 *
 * @example
 * ```tsx
 * <ViewModeToolbar />
 * ```
 */
export declare const ViewModeToolbar: Component<ViewModeToolbarProps>;

// =============================================================================
// Internal Helpers (for reference)
// =============================================================================

/**
 * Gets the button tooltip text based on current mode.
 *
 * @param mode - Current view mode
 * @returns Tooltip text including shortcut hint
 */
// Internal: getTooltipText(mode: ViewMode): string
// - 'wireframe' -> "Switch to Styled Mode (P)"
// - 'styled' -> "Switch to Wireframe Mode (P)"

/**
 * Gets the aria-label for accessibility.
 *
 * @param mode - Current view mode
 * @returns Descriptive label for screen readers
 */
// Internal: getAriaLabel(mode: ViewMode): string
// - 'wireframe' -> "Toggle styled view mode"
// - 'styled' -> "Toggle wireframe view mode"

// =============================================================================
// Expected CSS Classes (in ViewModeToolbar.module.css)
// =============================================================================

/**
 * CSS Module Classes:
 *
 * .toolbar - Container matching GridToolbar styling
 * .button - Base button styles (same as GridToolbar.button)
 * .buttonActive - Active state when styled mode is on
 * .icon - Eye icon sizing and positioning
 */

// =============================================================================
// Integration with MainToolbar
// =============================================================================

/**
 * MainToolbar Integration:
 *
 * Add ViewModeToolbar to MainToolbar.tsx:
 *
 * ```tsx
 * import { ViewModeToolbar } from '../ViewModeToolbar';
 *
 * export const MainToolbar: Component<MainToolbarProps> = (props) => {
 *   return (
 *     <div class={styles.container} role="toolbar" aria-label="Main toolbar">
 *       <SaveButton />
 *       <ZoomToolbar onFitToView={props.onFitToView} />
 *       <GridToolbar />
 *       <ViewModeToolbar />  {/* NEW */}
 *       <AlignmentToolbar />
 *       <PreferencesButton />
 *     </div>
 *   );
 * };
 * ```
 */
