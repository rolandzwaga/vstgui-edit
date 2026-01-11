/**
 * Component Props Contracts
 *
 * Defines props interfaces for all preferences panel components.
 */

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type {
  GridPreferences,
  KeyboardShortcut,
  PreferencesSection,
  ShortcutCategory,
  ThemePreferences,
} from './types';

// =============================================================================
// Main Panel Components
// =============================================================================

/**
 * Props for PreferencesPanel component.
 * The main modal dialog container.
 */
export interface PreferencesPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;

  /** Callback when panel should close */
  onClose: () => void;
}

/**
 * Props for PreferencesSidebar component.
 * Vertical navigation list for sections.
 */
export interface PreferencesSidebarProps {
  /** Currently active section */
  activeSection: PreferencesSection;

  /** Callback when section is selected */
  onSectionChange: (section: PreferencesSection) => void;
}

/**
 * Props for ResetConfirmDialog component.
 * Confirmation dialog for reset to defaults.
 */
export interface ResetConfirmDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback when reset is confirmed */
  onConfirm: () => void;

  /** Callback when reset is cancelled */
  onCancel: () => void;
}

// =============================================================================
// Section Components
// =============================================================================

/**
 * Props for GridSection component.
 */
export interface GridSectionProps {
  /** Current grid preferences */
  preferences: GridPreferences;

  /** Callback when grid size changes */
  onSizeChange: (size: GridPreferences['size']) => void;

  /** Callback when grid style changes */
  onStyleChange: (style: GridPreferences['style']) => void;

  /** Callback when visible by default changes */
  onVisibleByDefaultChange: (visible: boolean) => void;
}

/**
 * Props for SnapSection component.
 */
export interface SnapSectionProps {
  /** Whether snap is enabled by default */
  enabledByDefault: boolean;

  /** Current snap threshold (1-20) */
  threshold: number;

  /** Callback when enabled by default changes */
  onEnabledByDefaultChange: (enabled: boolean) => void;

  /** Callback when threshold changes */
  onThresholdChange: (threshold: number) => void;
}

/**
 * Props for SmartGuidesSection component.
 */
export interface SmartGuidesSectionProps {
  /** Whether smart guides are enabled by default */
  enabledByDefault: boolean;

  /** Callback when enabled by default changes */
  onEnabledByDefaultChange: (enabled: boolean) => void;
}

/**
 * Props for CustomGuidesSection component.
 */
export interface CustomGuidesSectionProps {
  /** Whether snap to guides is enabled by default */
  snapEnabledByDefault: boolean;

  /** Callback when snap enabled by default changes */
  onSnapEnabledByDefaultChange: (enabled: boolean) => void;
}

/**
 * Props for ThemeSection component.
 */
export interface ThemeSectionProps {
  /** Current theme mode */
  mode: ThemePreferences['mode'];

  /** Callback when theme mode changes */
  onModeChange: (mode: ThemePreferences['mode']) => void;
}

/**
 * Props for KeyboardShortcutsSection component.
 */
export interface KeyboardShortcutsSectionProps {
  /** Shortcut categories to display */
  categories: ShortcutCategory[];
}

// =============================================================================
// Reusable Control Components
// =============================================================================

/**
 * Props for SettingToggle component.
 * A labeled checkbox/toggle switch.
 */
export interface SettingToggleProps {
  /** Unique identifier for the control */
  id: string;

  /** Label text displayed next to toggle */
  label: string;

  /** Optional description text below label */
  description?: string;

  /** Current checked state */
  value: boolean;

  /** Callback when value changes */
  onChange: (value: boolean) => void;

  /** Whether control is disabled */
  disabled?: boolean;
}

/**
 * Props for SettingSelect component.
 * A labeled dropdown select.
 */
export interface SettingSelectProps<T extends string> {
  /** Unique identifier for the control */
  id: string;

  /** Label text displayed above select */
  label: string;

  /** Optional description text below label */
  description?: string;

  /** Currently selected value */
  value: T;

  /** Available options */
  options: readonly { value: T; label: string }[];

  /** Callback when selection changes */
  onChange: (value: T) => void;

  /** Whether control is disabled */
  disabled?: boolean;
}

/**
 * Props for SettingSlider component.
 * A labeled range slider with value display.
 */
export interface SettingSliderProps {
  /** Unique identifier for the control */
  id: string;

  /** Label text displayed above slider */
  label: string;

  /** Optional description text below label */
  description?: string;

  /** Current value */
  value: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Step increment (default: 1) */
  step?: number;

  /** Unit suffix to display after value (e.g., "px") */
  unit?: string;

  /** Callback when value changes */
  onChange: (value: number) => void;

  /** Whether control is disabled */
  disabled?: boolean;
}

// =============================================================================
// Section Navigation Item
// =============================================================================

/**
 * Props for individual sidebar navigation item.
 */
export interface SidebarItemProps {
  /** Section identifier */
  section: PreferencesSection;

  /** Display label */
  label: string;

  /** FontAwesome icon */
  icon: IconDefinition;

  /** Whether this section is currently active */
  isActive: boolean;

  /** Callback when item is clicked */
  onClick: () => void;
}

// =============================================================================
// Shortcut Display Components
// =============================================================================

/**
 * Props for ShortcutCategoryGroup component.
 */
export interface ShortcutCategoryGroupProps {
  /** Category to display */
  category: ShortcutCategory;
}

/**
 * Props for ShortcutItem component.
 */
export interface ShortcutItemProps {
  /** Shortcut to display */
  shortcut: KeyboardShortcut;
}
