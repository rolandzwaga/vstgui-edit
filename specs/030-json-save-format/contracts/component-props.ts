/**
 * Component Props Contract
 *
 * This file defines the TypeScript interfaces for component props.
 */

import type { SaveFormat } from '../../../src/domain/serializer/types';

/**
 * Props for the FormatChangeDialog component.
 * Displays a confirmation modal when user switches save format.
 *
 * Implementation: src/components/SaveButton/FormatChangeDialog.tsx
 */
export interface FormatChangeDialogProps {
  /**
   * Whether the dialog is visible.
   * When true, dialog renders with backdrop and receives focus.
   */
  isOpen: boolean;

  /**
   * The original format of the loaded file.
   * Displayed in the warning message.
   */
  originalFormat: SaveFormat;

  /**
   * The new format the user wants to switch to.
   * Displayed in the warning message.
   */
  newFormat: SaveFormat;

  /**
   * Called when user confirms the format change.
   * Dialog should close after this is called.
   */
  onConfirm: () => void;

  /**
   * Called when user cancels the format change.
   * Dialog should close after this is called.
   * Also triggered by Escape key.
   */
  onCancel: () => void;
}

/**
 * Props for the SaveButton component (existing, unchanged).
 *
 * Implementation: src/components/SaveButton/SaveButton.tsx
 */
export interface SaveButtonProps {
  /**
   * Additional CSS class name(s) to apply to the container.
   */
  class?: string;
}
