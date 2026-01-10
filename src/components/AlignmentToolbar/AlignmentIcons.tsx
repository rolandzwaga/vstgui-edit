/**
 * Alignment Icons
 *
 * SVG icons for alignment and distribution toolbar buttons.
 */

import type { Component } from 'solid-js';

const ICON_SIZE = 16;
const STROKE_WIDTH = 1.5;

/**
 * Align Left Icon - Aligns views to left edge
 */
export const AlignLeftIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Alignment reference line */}
    <line x1="2" y1="2" x2="2" y2="14" />
    {/* View rectangles */}
    <rect x="4" y="3" width="10" height="3" rx="0.5" />
    <rect x="4" y="9" width="6" height="3" rx="0.5" />
  </svg>
);

/**
 * Align Center Icon - Aligns views to horizontal center
 */
export const AlignCenterIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Center reference line */}
    <line x1="8" y1="2" x2="8" y2="14" stroke-dasharray="2 2" />
    {/* View rectangles */}
    <rect x="3" y="3" width="10" height="3" rx="0.5" />
    <rect x="5" y="9" width="6" height="3" rx="0.5" />
  </svg>
);

/**
 * Align Right Icon - Aligns views to right edge
 */
export const AlignRightIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Alignment reference line */}
    <line x1="14" y1="2" x2="14" y2="14" />
    {/* View rectangles */}
    <rect x="2" y="3" width="10" height="3" rx="0.5" />
    <rect x="6" y="9" width="6" height="3" rx="0.5" />
  </svg>
);

/**
 * Align Top Icon - Aligns views to top edge
 */
export const AlignTopIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Alignment reference line */}
    <line x1="2" y1="2" x2="14" y2="2" />
    {/* View rectangles */}
    <rect x="3" y="4" width="3" height="10" rx="0.5" />
    <rect x="9" y="4" width="3" height="6" rx="0.5" />
  </svg>
);

/**
 * Align Middle Icon - Aligns views to vertical center
 */
export const AlignMiddleIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Center reference line */}
    <line x1="2" y1="8" x2="14" y2="8" stroke-dasharray="2 2" />
    {/* View rectangles */}
    <rect x="3" y="3" width="3" height="10" rx="0.5" />
    <rect x="9" y="5" width="3" height="6" rx="0.5" />
  </svg>
);

/**
 * Align Bottom Icon - Aligns views to bottom edge
 */
export const AlignBottomIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* Alignment reference line */}
    <line x1="2" y1="14" x2="14" y2="14" />
    {/* View rectangles */}
    <rect x="3" y="2" width="3" height="10" rx="0.5" />
    <rect x="9" y="6" width="3" height="6" rx="0.5" />
  </svg>
);

/**
 * Distribute Horizontal Icon - Distributes views with equal horizontal spacing
 */
export const DistributeHorizontalIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* View rectangles with equal spacing */}
    <rect x="1" y="4" width="3" height="8" rx="0.5" />
    <rect x="6.5" y="4" width="3" height="8" rx="0.5" />
    <rect x="12" y="4" width="3" height="8" rx="0.5" />
    {/* Distribution indicator lines */}
    <line x1="4.5" y1="8" x2="6" y2="8" stroke-dasharray="1 1" />
    <line x1="10" y1="8" x2="11.5" y2="8" stroke-dasharray="1 1" />
  </svg>
);

/**
 * Distribute Vertical Icon - Distributes views with equal vertical spacing
 */
export const DistributeVerticalIcon: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width={STROKE_WIDTH}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {/* View rectangles with equal spacing */}
    <rect x="4" y="1" width="8" height="3" rx="0.5" />
    <rect x="4" y="6.5" width="8" height="3" rx="0.5" />
    <rect x="4" y="12" width="8" height="3" rx="0.5" />
    {/* Distribution indicator lines */}
    <line x1="8" y1="4.5" x2="8" y2="6" stroke-dasharray="1 1" />
    <line x1="8" y1="10" x2="8" y2="11.5" stroke-dasharray="1 1" />
  </svg>
);
