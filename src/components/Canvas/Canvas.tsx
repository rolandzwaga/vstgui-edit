import { type Component, createSignal, For, Show } from 'solid-js';
import {
  useCanvasData,
  useCanvasDrop,
  useCanvasPan,
  useCanvasZoom,
  useCanvasKeyboard,
  useCanvasInteractions,
  useGuideDrag,
} from '../../hooks/canvas';
import { mouseToCanvas } from '../../domain/canvas/mouseToCanvas';
import {
  createDeleteOperation,
  deleteSelectedViews,
} from '../../domain/canvas/viewOperations';
import { getAdaptiveOverlayStyle } from '../../domain/viewMode/luminance';
import { useTooltip } from '../../hooks/useTooltip';
import { canvasStore } from '../../stores/canvasStore';
import { pushOperation } from '../../stores/historyStore';
import { marqueeStore } from '../../stores/marqueeStore';
import { dragStore } from '../../stores/dragStore';
import { resizeStore } from '../../stores/resizeStore';
import { setCursorPosition, clearCursorPosition } from '../../stores/rulerStore';
import { viewModeStore } from '../../stores/viewModeStore';
import { ContextMenu } from '../ContextMenu';
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
import { GuidesOverlay } from './Guides';
import styles from './Canvas.module.css';

export const Canvas: Component = () => {
  const { renderableViews, visibleViews, templateBounds, selectedViews, hoveredView, isEmpty, styledViewPropsMap } = useCanvasData();
  const [canvasMousePosition, setCanvasMousePosition] = createSignal<{ x: number; y: number } | null>(null);

  const handleDelete = () => {
    const removed = deleteSelectedViews();
    if (removed.length > 0) {
      const operation = createDeleteOperation(removed);
      pushOperation(operation);
    }
  };

  const {
    showTooltip,
    tooltipPosition,
    handleMouseMove: handleTooltipMouseMove,
    handleMouseLeave: handleTooltipMouseLeave,
  } = useTooltip();

  const { handlePanMouseDown } = useCanvasPan();
  const { handleWheel } = useCanvasZoom();

  const { wrapperRef, handleSvgMouseDown, handleResizeStart, handleContextMenu, cancelCallbacks } =
    useCanvasInteractions({ renderableViews, visibleViews });

  const { handleKeyDown } = useCanvasKeyboard({
    renderableViews,
    templateBounds,
    cancelCallbacks,
    getMousePosition: () => canvasMousePosition(),
  });

  let wrapperElement: HTMLDivElement | undefined;

  // Initialize guide drag handling
  useGuideDrag({
    canvasWrapperRef: () => wrapperElement,
  });

  const getCanvasPoint = (clientX: number, clientY: number) => {
    if (!wrapperElement) {
      return { x: 0, y: 0 };
    }
    const rect = wrapperElement.getBoundingClientRect();
    return mouseToCanvas(clientX, clientY, rect, canvasStore.panOffset, canvasStore.zoomLevel);
  };

  const handleCanvasMouseMove = (e: MouseEvent) => {
    handleTooltipMouseMove(e);
    const point = getCanvasPoint(e.clientX, e.clientY);
    setCanvasMousePosition(point);
    setCursorPosition(point);
  };

  const handleCanvasMouseLeave = () => {
    handleTooltipMouseLeave();
    setCanvasMousePosition(null);
    clearCursorPosition();
  };

  const { isDraggingOver, handleDragOver, handleDragLeave, handleDrop } = useCanvasDrop({
    renderableViews,
    getCanvasPoint,
  });

  return (
    <Show when={!isEmpty()} fallback={<EmptyState />}>
      <div class={styles.canvasViewport} onWheel={handleWheel}>
        <div
          ref={(el) => {
            wrapperRef(el);
            wrapperElement = el;
          }}
          class={styles.canvasWrapper}
          classList={{
            [styles.grabbing]: canvasStore.isPanning,
            [styles.marqueeCursor]: marqueeStore.isActive,
            [styles.moveCursor]: dragStore.isDragging,
            [styles.dropTarget]: isDraggingOver(),
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
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            width: `${templateBounds()?.width ?? 100}px`,
            height: `${templateBounds()?.height ?? 100}px`,
            transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`,
          }}
        >
          {/* Grid only shown in wireframe mode - in styled mode, view backgrounds cover it anyway */}
          <Show when={viewModeStore.mode === 'wireframe' && templateBounds()}>
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
            <For each={visibleViews()}>
              {(view) => (
                <ViewRectangle
                  view={view}
                  allViews={renderableViews()}
                  styledProps={styledViewPropsMap().get(view.id)}
                />
              )}
            </For>
            <For each={selectedViews()}>
              {(view) => {
                const styledProps = styledViewPropsMap().get(view.id);
                const overlayStyle = styledProps?.backgroundColor
                  ? getAdaptiveOverlayStyle(styledProps.backgroundColor)
                  : undefined;
                return (
                  <SelectionOverlay
                    view={view}
                    onResizeStart={handleResizeStart}
                    overlayStyle={overlayStyle}
                  />
                );
              }}
            </For>
            <DragPreview views={selectedViews()} />
            <ResizePreview />
            <SmartGuideLines />
            <GuidesOverlay
              canvasWidth={templateBounds()?.width ?? 100}
              canvasHeight={templateBounds()?.height ?? 100}
            />
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
        <ContextMenu onDelete={handleDelete} />
      </div>
    </Show>
  );
};
