import { type Component, Show } from 'solid-js';
import { gridStore, MAJOR_LINE_INTERVAL } from '../../stores/gridStore';
import type { GridProps } from '../../types/grid';
import styles from './Grid.module.css';

/**
 * Renders the minor line pattern content based on grid style.
 */
function MinorPatternContent(props: { size: number; style: string }) {
  return (
    <Show
      when={props.style === 'lines'}
      fallback={
        <Show
          when={props.style === 'dots'}
          fallback={
            // Crosshairs style - small cross at intersection
            <>
              <line
                x1={props.size / 2 - 2}
                y1={props.size / 2}
                x2={props.size / 2 + 2}
                y2={props.size / 2}
                class={styles.minorLine}
                stroke-width="1"
              />
              <line
                x1={props.size / 2}
                y1={props.size / 2 - 2}
                x2={props.size / 2}
                y2={props.size / 2 + 2}
                class={styles.minorLine}
                stroke-width="1"
              />
            </>
          }
        >
          {/* Dots style - circle at intersection */}
          <circle cx={props.size / 2} cy={props.size / 2} r="1" class={styles.dot} />
        </Show>
      }
    >
      {/* Lines style - horizontal and vertical lines */}
      <line x1="0" y1={props.size} x2={props.size} y2={props.size} class={styles.minorLine} stroke-width="1" />
      <line x1={props.size} y1="0" x2={props.size} y2={props.size} class={styles.minorLine} stroke-width="1" />
    </Show>
  );
}

/**
 * Renders the major line pattern content based on grid style.
 */
function MajorPatternContent(props: { majorSize: number; style: string }) {
  return (
    <Show
      when={props.style === 'lines'}
      fallback={
        <Show
          when={props.style === 'dots'}
          fallback={
            // Crosshairs style - larger cross at major intersection
            <>
              <line
                x1={props.majorSize / 2 - 3}
                y1={props.majorSize / 2}
                x2={props.majorSize / 2 + 3}
                y2={props.majorSize / 2}
                class={styles.majorLine}
                stroke-width="1"
              />
              <line
                x1={props.majorSize / 2}
                y1={props.majorSize / 2 - 3}
                x2={props.majorSize / 2}
                y2={props.majorSize / 2 + 3}
                class={styles.majorLine}
                stroke-width="1"
              />
            </>
          }
        >
          {/* Dots style - larger circle at major intersection */}
          <circle cx={props.majorSize / 2} cy={props.majorSize / 2} r="1.5" class={styles.majorDot} />
        </Show>
      }
    >
      {/* Lines style - major lines */}
      <line x1="0" y1={props.majorSize} x2={props.majorSize} y2={props.majorSize} class={styles.majorLine} stroke-width="1" />
      <line x1={props.majorSize} y1="0" x2={props.majorSize} y2={props.majorSize} class={styles.majorLine} stroke-width="1" />
    </Show>
  );
}

/**
 * Grid component - renders a configurable grid overlay on the canvas.
 *
 * Features:
 * - Reads visibility, size, and style from gridStore
 * - Uses SVG patterns for efficient rendering
 * - Supports lines, dots, and crosshairs styles
 * - Renders major lines every 5th line
 * - Theme-adaptive colors via CSS custom properties
 */
export const Grid: Component<GridProps> = (props) => {
  // Compute major grid size (every 5th line)
  const majorSize = () => gridStore.size * MAJOR_LINE_INTERVAL;

  // Pattern IDs for minor and major grids
  const minorPatternId = () => `grid-minor-${gridStore.style}-${gridStore.size}`;
  const majorPatternId = () => `grid-major-${gridStore.style}-${gridStore.size}`;

  return (
    <Show when={gridStore.isVisible}>
      <div class={styles.gridContainer} data-testid="grid-container">
        <svg
          class={styles.gridSvg}
          width={props.width}
          height={props.height}
          data-testid="grid-svg"
        >
          <defs>
            {/* Minor grid pattern */}
            <pattern
              id={minorPatternId()}
              width={gridStore.size}
              height={gridStore.size}
              patternUnits="userSpaceOnUse"
              data-testid="grid-pattern-minor"
            >
              <MinorPatternContent size={gridStore.size} style={gridStore.style} />
            </pattern>

            {/* Major grid pattern */}
            <pattern
              id={majorPatternId()}
              width={majorSize()}
              height={majorSize()}
              patternUnits="userSpaceOnUse"
              data-testid="grid-pattern-major"
            >
              <MajorPatternContent majorSize={majorSize()} style={gridStore.style} />
            </pattern>
          </defs>

          {/* Minor grid fill */}
          <rect
            width={props.width}
            height={props.height}
            fill={`url(#${minorPatternId()})`}
            data-testid="grid-rect-minor"
          />

          {/* Major grid fill (overlays minor) */}
          <rect
            width={props.width}
            height={props.height}
            fill={`url(#${majorPatternId()})`}
            data-testid="grid-rect-major"
          />
        </svg>
      </div>
    </Show>
  );
};
