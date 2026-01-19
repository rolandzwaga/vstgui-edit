/**
 * AnimKnobPreview Component
 *
 * Renders a CAnimKnob filmstrip frame inside SVG using foreignObject.
 * Handles async bitmap loading and frame calculation internally.
 */

import { type Component, Show, createMemo, createResource } from 'solid-js';
import {
  buildAnimKnobBitmapInfo,
  calculateFrameIndex,
  calculateFrameOffset,
  getBitmapName,
  parseDefaultValue,
} from '../../domain/animknob';
import { getThumbnailUrlAsync } from '../../domain/bitmaps/thumbnail';
import type { Bitmap } from '../../domain/project/types';
import { bitmapService } from '../../services/indexedDB/bitmapService';
import { getBitmaps, getView } from '../../stores/documentStore';
import { getPreviewValueForView } from '../../stores/knobPreviewStore';
import { projectStore } from '../../stores/projectStore';
import type { AnimKnobBitmapInfo } from '../../types/animknob';
import styles from './AnimKnobPreview.module.css';

export interface AnimKnobPreviewProps {
  /** View ID */
  viewId: string;
  /** Absolute X position in canvas coordinates */
  x: number;
  /** Absolute Y position in canvas coordinates */
  y: number;
  /** View width in pixels */
  width: number;
  /** View height in pixels */
  height: number;
}

/**
 * Async function to load bitmap info for a CAnimKnob view.
 */
async function loadBitmapInfo(
  viewId: string,
  viewHeight: number
): Promise<AnimKnobBitmapInfo | null> {
  // Get the view node for attributes
  const viewNode = getView(viewId);
  if (!viewNode) {
    return null;
  }

  // Get the bitmap name
  const bitmapName = getBitmapName(viewNode.attributes);
  if (!bitmapName) {
    return null;
  }

  // Get project ID for IndexedDB lookup
  const projectId = projectStore.currentProject?.id ?? null;
  if (!projectId) {
    return null;
  }

  // Get bitmap definition from document
  const bitmaps = getBitmaps();
  const bitmapDef = bitmaps?.[bitmapName];

  // Get stored bitmap for dimensions
  let storedBitmap: Bitmap | null = null;
  try {
    const storedBitmaps = await bitmapService.getByProject(projectId);
    storedBitmap = storedBitmaps.find((b) => b.name === bitmapName) ?? null;
  } catch {
    // IndexedDB not available
    return null;
  }

  // If bitmap not in IndexedDB, can't show preview
  if (!storedBitmap) {
    return null;
  }

  // Get image URL
  const imageUrl = await getThumbnailUrlAsync(bitmapName, bitmapDef ?? bitmapName, projectId);
  if (!imageUrl) {
    return null;
  }

  // Build bitmap info
  return buildAnimKnobBitmapInfo(
    bitmapName,
    imageUrl,
    bitmapDef,
    storedBitmap,
    viewNode.attributes,
    viewHeight
  );
}

/**
 * Renders a filmstrip frame for a CAnimKnob view.
 *
 * Uses CSS background-position to show the correct frame from the filmstrip.
 * The foreignObject element allows HTML/CSS rendering inside SVG.
 */
export const AnimKnobPreview: Component<AnimKnobPreviewProps> = (props) => {
  // Load bitmap info asynchronously
  // Include bitmaps in the key so resource refetches when bitmap changes
  const [bitmapInfo] = createResource(
    () => ({
      viewId: props.viewId,
      viewHeight: props.height,
      // This ensures refetch when any bitmap definition changes
      bitmaps: getBitmaps(),
    }),
    (params) => loadBitmapInfo(params.viewId, params.viewHeight)
  );

  /**
   * Gets the current value for this view.
   * Uses preview value if active, otherwise the default value from attributes.
   */
  const currentValue = createMemo(() => {
    // Check if this view is being previewed
    const previewValue = getPreviewValueForView(props.viewId);
    if (previewValue !== null) {
      return previewValue;
    }

    // Get default value from view attributes
    const viewNode = getView(props.viewId);
    if (viewNode) {
      return parseDefaultValue(viewNode.attributes);
    }

    return 0;
  });

  /**
   * Calculates the current frame index based on value.
   */
  const frameIndex = createMemo(() => {
    const info = bitmapInfo();
    if (!info) return 0;
    return calculateFrameIndex(currentValue(), info.numFrames, info.inverse);
  });

  /**
   * Calculates the CSS background-position-y offset.
   */
  const backgroundPositionY = createMemo(() => {
    const info = bitmapInfo();
    if (!info) return 0;
    return calculateFrameOffset(frameIndex(), info.frameHeight);
  });

  // Note: We don't need to revoke URLs here because the thumbnail module
  // handles URL caching and cleanup centrally

  return (
    <Show when={!bitmapInfo.loading && bitmapInfo()}>
      {(info) => (
        <foreignObject
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          data-testid={`animknob-preview-${props.viewId}`}
        >
          <div
            class={styles.filmstripFrame}
            style={{
              width: `${props.width}px`,
              height: `${props.height}px`,
              'background-image': `url(${info().imageUrl})`,
              'background-position': `0 ${backgroundPositionY()}px`,
              'background-size': `${info().width}px auto`,
              'background-repeat': 'no-repeat',
            }}
          />
        </foreignObject>
      )}
    </Show>
  );
};
