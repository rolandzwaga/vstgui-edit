/**
 * EyeDropperButton Component
 *
 * Provides screen color picking functionality using the EyeDropper API.
 * Only renders when the API is available (Chromium browsers).
 */

import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import styles from './ColorPicker.module.css';

// Type for EyeDropper API (not yet in standard TypeScript definitions)
interface ColorSelectionResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open(): Promise<ColorSelectionResult>;
}

interface EyeDropperConstructor {
  new(): EyeDropperInstance;
}

export interface EyeDropperButtonProps {
  /** Called when a color is picked from screen */
  onColorPick: (hex: string) => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Check if EyeDropper API is available
 */
function isEyeDropperSupported(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
}

/**
 * Get EyeDropper constructor from window
 */
function getEyeDropper(): EyeDropperConstructor | null {
  if (!isEyeDropperSupported()) return null;
  return (window as unknown as { EyeDropper: EyeDropperConstructor }).EyeDropper;
}

/**
 * Convert 6-digit hex to 8-digit with FF alpha, uppercase
 */
function normalizeHex(hex: string): string {
  // Remove # prefix
  const h = hex.startsWith('#') ? hex.slice(1) : hex;

  // Ensure uppercase
  const upper = h.toUpperCase();

  // Add FF alpha if 6 digits
  if (upper.length === 6) {
    return `#${upper}FF`;
  }

  return `#${upper}`;
}

export const EyeDropperButton: Component<EyeDropperButtonProps> = (props) => {
  const [isPicking, setIsPicking] = createSignal(false);
  // Check support at render time so tests can mock window.EyeDropper
  const isSupported = () => isEyeDropperSupported();

  const handleClick = async () => {
    if (props.disabled || isPicking()) return;

    const EyeDropperClass = getEyeDropper();
    if (!EyeDropperClass) return;

    try {
      setIsPicking(true);
      const eyeDropper = new EyeDropperClass();
      const result = await eyeDropper.open();

      // Convert to 8-digit uppercase hex
      const normalizedHex = normalizeHex(result.sRGBHex);
      props.onColorPick(normalizedHex);
    } catch (error) {
      // User cancelled (AbortError) or other error - silently ignore
      // Only log non-cancel errors in development
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User pressed Escape - ignore
      }
      // Other errors are also silently ignored
    } finally {
      setIsPicking(false);
    }
  };

  // Don't render if API not supported
  if (!isSupported()) {
    return null;
  }

  return (
    <button
      type="button"
      class={styles.eyedropperButton}
      onClick={handleClick}
      disabled={props.disabled}
      aria-label="Pick color from screen (eyedropper)"
    >
      <svg
        class={styles.eyedropperIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {/* Eyedropper icon */}
        <path d="M12 4.5C12 2.84 13.34 1.5 15 1.5c1.66 0 3 1.34 3 3 0 .95-.45 1.79-1.14 2.33l-1.36 1.36-6.36 6.36" />
        <path d="M3.5 18.5l6-6" />
        <path d="M14.64 8.21L9.5 13.36 8.5 17.5l4.14-1 5.15-5.15" />
        <path d="M17.79 6.21L15.64 4.07" />
        <path d="M3 21l3-3" />
      </svg>
    </button>
  );
};
