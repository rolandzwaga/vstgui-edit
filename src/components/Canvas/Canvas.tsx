import { type Component, For, Show } from 'solid-js';
import {
  useCanvasData,
  useCanvasPan,
  useCanvasZoom,
  useCanvasKeyboard,
  useCanvasInteractions,
} from '../../hooks/canvas';
import { useTooltip } from '../../hooks/useTooltip';
import { canvasStore } from '../../stores/canvasStore';
import { marqueeStore } from '../../stores/marqueeStore';
import { dragStore } from '../../stores/dragStore';
import { resizeStore } from '../../stores/resizeStore';
import { EmptyState } from './EmptyState';
import { Grid } from './Grid';
import { HoverTooltip } from './HoverTooltip';

import { MarqueeRectangle } from './MarqueeRectangle';
import { SelectionOverlay } from './SelectionOverlay';
import { TemplateBounds } from './TemplateBounds';
import { ViewRectangle } from './ViewRectangle';
import { DragPreview } from './DragPreview';
import { ResizePreview } from './ResizePreview';
import { DimensionIndicator } from './DimensionIndicator';
import { SmartGuideLines } from './SmartGuideLines';
import styles from './Canvas.module.css';

export const Canvas: Component = () => {
  const { renderableViews, templateBounds, selectedViews, hoveredView, isEmpty } = useCanvasData();

  const {
    showTooltip,
    tooltipPosition,
    handleMouseMove: handleTooltipMouseMove,
    handleMouseLeave: handleTooltipMouseLeave,
  } = useTooltip();

  const { handlePanMouseDown } = useCanvasPan();
  const { handleWheel } = useCanvasZoom();

  const { wrapperRef, handleSvgMouseDown, handleResizeStart, handleContextMenu, cancelCallbacks } =
    useCanvasInteractions({ renderableViews });

  const { handleKeyDown } = useCanvasKeyboard({
    renderableViews,
    templateBounds,
    cancelCallbacks,
  });

  return (
    <Show when={!isEmpty()} fallback={<EmptyState />}>
      <div>
        <div
          ref={wrapperRef}
          class={styles.canvasWrapper}
          classList={{
            [styles.grabbing]: canvasStore.isPanning,
            [styles.marqueeCursor]: marqueeStore.isActive,
            [styles.moveCursor]: dragStore.isDragging,
            [styles.resizeNwse]:
              resizeStore.isResizing &&
              (resizeStore.activeHandle === 'nw' || resizeStore.activeHandle === 'se'),
            [styles.resizeNesw]:
              resizeStore.isResizing &&
              (resizeStore.activeHandle === 'ne' || resizeStore.activeHandle === 'sw'),
            [styles.resizeNs]:
              resizeStore.isResizing &&
              (resizeStore.activeHandle === 'n' || resizeStore.activeHandle === 's'),
            [styles.resizeEw]:
              resizeStore.isResizing &&
              (resizeStore.activeHandle === 'e' || resizeStore.activeHandle === 'w'),
            [styles.noSelect]:
              marqueeStore.isPending ||
              marqueeStore.isActive ||
              canvasStore.isPanning ||
              dragStore.isDragging ||
              resizeStore.isResizing,
          }}
          data-testid="canvas-wrapper"
          tabIndex={0}
          onMouseDown={handlePanMouseDown}
          onMouseMove={handleTooltipMouseMove}
          onMouseLeave={handleTooltipMouseLeave}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          style={{
            width: `${templateBounds()?.width ?? 100}px`,
            height: `${templateBounds()?.height ?? 100}px`,
            transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`,
          }}
        >
          <Show when={templateBounds()}>
            {(bounds) => <Grid width={bounds().width} height={bounds().height} />}
          </Show>
          <svg
            class={styles.canvas}
            width={templateBounds()?.width ?? 100}
            height={templateBounds()?.height ?? 100}
            viewBox={`0 0 ${templateBounds()?.width ?? 100} ${templateBounds()?.height ?? 100}`}
            data-testid="canvas"
            onMouseDown={handleSvgMouseDown}
          >
            <Show when={templateBounds()}>
              {(bounds) => <TemplateBounds bounds={bounds()} />}
            </Show>
            <For each={renderableViews()}>
              {(view) => <ViewRectangle view={view} allViews={renderableViews()} />}
            </For>
            <For each={selectedViews()}>
              {(view) => <SelectionOverlay view={view} onResizeStart={handleResizeStart} />}
            </For>
            <DragPreview views={selectedViews()} />
            <ResizePreview />
            <SmartGuideLines />
            <Show when={marqueeStore.isActive}>
              <MarqueeRectangle />
            </Show>
          </svg>
        </div>
        <DimensionIndicator />
        <Show when={showTooltip() && hoveredView()}>
          {(view) => (
            <HoverTooltip view={view()} x={tooltipPosition().x} y={tooltipPosition().y} />
          )}
        </Show>
      </div>
    </Show>
  );
};
