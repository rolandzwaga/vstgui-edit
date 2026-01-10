/**
 * GuidesOverlay Component
 *
 * Container for all custom guides on the canvas.
 * Renders guides from guidesStore and includes GuidePreview during creation.
 */

import { For, Show } from 'solid-js';
import { guidesStore, startRepositionDrag, deleteGuideWithHistory } from '../../../stores/guidesStore';
import { GuideLine } from './GuideLine';
import { GuidePreview } from './GuidePreview';

export interface GuidesOverlayProps {
  /** Canvas width in canvas coordinates */
  canvasWidth: number;
  /** Canvas height in canvas coordinates */
  canvasHeight: number;
}

export function GuidesOverlay(props: GuidesOverlayProps) {
  const handleGuideMouseDown = (guideId: string, e: MouseEvent) => {
    const guide = guidesStore.getGuideById(guideId);
    if (guide) {
      startRepositionDrag(guideId, guide.position);
    }
  };

  const handleGuideDblClick = (guideId: string) => {
    deleteGuideWithHistory(guideId);
  };

  return (
    <g data-testid="guides-overlay">
      {/* Render all guides when visible */}
      <Show when={guidesStore.isVisible}>
        <For each={guidesStore.guides}>
          {(guide) => (
            <GuideLine
              guide={guide}
              canvasWidth={props.canvasWidth}
              canvasHeight={props.canvasHeight}
              onMouseDown={handleGuideMouseDown}
              onDblClick={handleGuideDblClick}
            />
          )}
        </For>
      </Show>

      {/* Guide preview during creation drag */}
      <GuidePreview
        canvasWidth={props.canvasWidth}
        canvasHeight={props.canvasHeight}
      />
    </g>
  );
}
