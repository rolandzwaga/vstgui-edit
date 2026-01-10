/**
 * LockIndicator Component
 *
 * Renders a small lock icon overlay in the top-right corner of locked views.
 * The icon is always visible regardless of zoom level.
 */
import type { Component } from 'solid-js';
import styles from './LockIndicator.module.css';

export interface LockIndicatorProps {
  /** X position (top-right corner of view) */
  x: number;
  /** Y position */
  y: number;
  /** Size of the indicator in pixels (default: 12) */
  size?: number;
}

/** Default size for the lock indicator */
const DEFAULT_INDICATOR_SIZE = 12;

/**
 * Renders a small lock icon SVG.
 */
export const LockIndicator: Component<LockIndicatorProps> = (props) => {
  const size = () => props.size ?? DEFAULT_INDICATOR_SIZE;
  const padding = 2;

  // Position the indicator at the top-right corner with a small offset
  const indicatorX = () => props.x - size() - padding;
  const indicatorY = () => props.y + padding;

  return (
    <g
      class={styles.lockIndicator}
      data-testid="lock-indicator"
      aria-label="Locked view"
    >
      {/* Background circle for visibility */}
      <circle
        cx={indicatorX() + size() / 2}
        cy={indicatorY() + size() / 2}
        r={size() / 2}
        class={styles.background}
      />
      {/* Lock icon (simplified padlock shape) */}
      <g transform={`translate(${indicatorX()}, ${indicatorY()})`}>
        <path
          d={getLockPath(size())}
          class={styles.lockPath}
        />
      </g>
    </g>
  );
};

/**
 * Generates a lock icon path scaled to the given size.
 * The path represents a simple padlock shape.
 */
function getLockPath(size: number): string {
  // Scale factor based on 12px default size
  const scale = size / 12;
  // Lock icon path designed for 12x12 viewBox
  // Shackle (top arc) + body (rounded rectangle)
  const path = `
    M ${6 * scale} ${1 * scale}
    C ${3 * scale} ${1 * scale} ${2 * scale} ${3 * scale} ${2 * scale} ${5 * scale}
    L ${2 * scale} ${6 * scale}
    L ${4 * scale} ${6 * scale}
    L ${4 * scale} ${5 * scale}
    C ${4 * scale} ${4 * scale} ${5 * scale} ${3 * scale} ${6 * scale} ${3 * scale}
    C ${7 * scale} ${3 * scale} ${8 * scale} ${4 * scale} ${8 * scale} ${5 * scale}
    L ${8 * scale} ${6 * scale}
    L ${10 * scale} ${6 * scale}
    L ${10 * scale} ${5 * scale}
    C ${10 * scale} ${3 * scale} ${9 * scale} ${1 * scale} ${6 * scale} ${1 * scale}
    Z
    M ${2 * scale} ${6 * scale}
    L ${10 * scale} ${6 * scale}
    L ${10 * scale} ${11 * scale}
    L ${2 * scale} ${11 * scale}
    Z
  `;
  return path.replace(/\s+/g, ' ').trim();
}
