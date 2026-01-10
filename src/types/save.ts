/**
 * Save types for format selection
 *
 * Re-exports SaveFormat from serializer and adds UI state types.
 */

// Re-export SaveFormat from canonical location
export type { SaveFormat } from '../domain/serializer/types';

/**
 * State for the save format selection UI
 */
export interface SaveFormatState {
  /** Currently selected format for saving */
  selectedFormat: 'json' | 'xml';

  /** Whether the dropdown is open */
  isDropdownOpen: boolean;

  /** Whether format change confirmation dialog is open */
  isConfirmDialogOpen: boolean;

  /** Format pending confirmation (when dialog is open) */
  pendingFormat: 'json' | 'xml' | null;
}
