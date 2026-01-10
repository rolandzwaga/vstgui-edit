/**
 * AlignmentToolbar Component
 *
 * Toolbar with buttons for aligning and distributing views.
 * Supports docked (in MainToolbar) and floating (draggable panel) modes.
 */

import { type Component, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  alignViews,
  createAlignmentOperation,
  distributeViews,
  getAlignmentDescription,
  getDistributionDescription,
} from '../../domain/alignment';
import type { AlignmentType, DistributionDirection } from '../../types/alignment';
import type { Point, RenderableView } from '../../types/canvas';
import { getParentId, updateViewOrigin } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { selectionStore } from '../../stores/selectionStore';
import {
  alignmentToolbarStore,
  dock,
  saveAlignmentToolbarState,
  undock,
  updateFloatingPosition,
} from '../../stores/alignmentToolbarStore';
import { useCanvasData } from '../../hooks/canvas/useCanvasData';
import { AlignmentButton } from './AlignmentButton';
import { DragHandle } from './DragHandle';
import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignMiddleIcon,
  AlignRightIcon,
  AlignTopIcon,
  DistributeHorizontalIcon,
  DistributeVerticalIcon,
} from './AlignmentIcons';
import styles from './AlignmentToolbar.module.css';

export interface AlignmentToolbarProps {
  /** Called when undock is triggered */
  onUndock?: (position: Point) => void;
  /** Called when redock is triggered */
  onRedock?: () => void;
}

/**
 * AlignmentToolbar - Toolbar for view alignment and distribution.
 *
 * Provides buttons for:
 * - Horizontal alignment: Left, Center, Right
 * - Vertical alignment: Top, Middle, Bottom
 * - Distribution: Horizontal, Vertical
 *
 * Supports docked (in MainToolbar) and floating (draggable panel) modes.
 */
export const AlignmentToolbar: Component<AlignmentToolbarProps> = () => {
  const { renderableViews } = useCanvasData();
  const [isDraggingPanel, setIsDraggingPanel] = createSignal(false);
  let dragOffset: Point | null = null;

  // Create a map of view ID to RenderableView for fast lookup
  const viewMap = createMemo((): Map<string, RenderableView> => {
    const map = new Map<string, RenderableView>();
    for (const view of renderableViews()) {
      map.set(view.id, view);
    }
    return map;
  });

  // Get view by ID from the map
  const getView = (id: string): RenderableView | null => {
    return viewMap().get(id) ?? null;
  };

  // Alignment buttons enabled when 1+ non-root views selected
  const isAlignmentEnabled = createMemo((): boolean => {
    const selectedIds = selectionStore.selectedIds;
    if (selectedIds.size === 0) return false;
    if (selectedIds.size === 1) {
      const [viewId] = [...selectedIds];
      return getParentId(viewId) !== null;
    }
    return true;
  });

  // Distribution buttons enabled when 3+ views selected
  const isDistributionEnabled = createMemo((): boolean => {
    return selectionStore.selectedIds.size >= 3;
  });

  // Handle alignment button click
  const handleAlign = (type: AlignmentType): void => {
    const selectedIds = [...selectionStore.selectedIds];
    if (selectedIds.length === 0) return;

    const results = alignViews(selectedIds, type, getView, getParentId);

    if (results.length === 0) return;

    // Apply new positions
    for (const result of results) {
      updateViewOrigin(result.viewId, result.newOrigin);
    }

    // Create history operation
    const isParentAlign = selectedIds.length === 1;
    const description = getAlignmentDescription(results.length, type, isParentAlign);
    const operation = createAlignmentOperation(results, description, updateViewOrigin);
    pushOperation(operation);
  };

  // Handle distribution button click
  const handleDistribute = (direction: DistributionDirection): void => {
    const selectedIds = [...selectionStore.selectedIds];
    if (selectedIds.length < 3) return;

    const results = distributeViews(selectedIds, direction, getView);

    if (results.length === 0) return;

    // Apply new positions
    for (const result of results) {
      updateViewOrigin(result.viewId, result.newOrigin);
    }

    // Create history operation
    const description = getDistributionDescription(selectedIds.length, direction);
    const operation = createAlignmentOperation(results, description, updateViewOrigin);
    pushOperation(operation);
  };

  // Handle undock from docked toolbar
  const handleUndock = (position: Point): void => {
    undock(position);
    saveAlignmentToolbarState();
  };

  // Handle redock from floating panel
  const handleRedock = (): void => {
    dock();
    saveAlignmentToolbarState();
  };

  // Handle floating panel header drag
  const handlePanelMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    e.preventDefault();

    const pos = alignmentToolbarStore.floatingPosition;
    if (pos) {
      dragOffset = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    }
    setIsDraggingPanel(true);
    document.addEventListener('mousemove', handlePanelMouseMove);
    document.addEventListener('mouseup', handlePanelMouseUp);
  };

  const handlePanelMouseMove = (e: MouseEvent): void => {
    if (!isDraggingPanel() || !dragOffset) return;
    updateFloatingPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handlePanelMouseUp = (): void => {
    setIsDraggingPanel(false);
    dragOffset = null;
    saveAlignmentToolbarState();
    document.removeEventListener('mousemove', handlePanelMouseMove);
    document.removeEventListener('mouseup', handlePanelMouseUp);
  };

  onCleanup(() => {
    document.removeEventListener('mousemove', handlePanelMouseMove);
    document.removeEventListener('mouseup', handlePanelMouseUp);
  });

  // Shared button group content
  const ButtonGroups = () => (
    <>
      {/* Horizontal alignment group */}
      <div class={styles.buttonGroup} data-testid="button-group">
        <AlignmentButton
          type="left"
          icon={AlignLeftIcon}
          label="Align Left"
          shortcut="Ctrl+Shift+L"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('left')}
        />
        <AlignmentButton
          type="center"
          icon={AlignCenterIcon}
          label="Align Center"
          shortcut="Ctrl+Shift+C"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('center')}
        />
        <AlignmentButton
          type="right"
          icon={AlignRightIcon}
          label="Align Right"
          shortcut="Ctrl+Shift+R"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('right')}
        />
      </div>

      {/* Vertical alignment group */}
      <div class={styles.buttonGroup} data-testid="button-group">
        <AlignmentButton
          type="top"
          icon={AlignTopIcon}
          label="Align Top"
          shortcut="Ctrl+Shift+T"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('top')}
        />
        <AlignmentButton
          type="middle"
          icon={AlignMiddleIcon}
          label="Align Middle"
          shortcut="Ctrl+Shift+M"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('middle')}
        />
        <AlignmentButton
          type="bottom"
          icon={AlignBottomIcon}
          label="Align Bottom"
          shortcut="Ctrl+Shift+B"
          disabled={!isAlignmentEnabled()}
          onClick={() => handleAlign('bottom')}
        />
      </div>

      {/* Distribution group */}
      <div class={styles.buttonGroup} data-testid="button-group">
        <AlignmentButton
          type="horizontal"
          icon={DistributeHorizontalIcon}
          label="Distribute Horizontally"
          disabled={!isDistributionEnabled()}
          onClick={() => handleDistribute('horizontal')}
        />
        <AlignmentButton
          type="vertical"
          icon={DistributeVerticalIcon}
          label="Distribute Vertically"
          disabled={!isDistributionEnabled()}
          onClick={() => handleDistribute('vertical')}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Docked mode: toolbar with drag handle */}
      <Show when={alignmentToolbarStore.isDocked}>
        <div
          class={styles.toolbar}
          role="toolbar"
          aria-label="Alignment toolbar"
          data-testid="alignment-toolbar"
        >
          <DragHandle onUndock={handleUndock} />
          <ButtonGroups />
        </div>
      </Show>

      {/* Floating mode: portal to document body */}
      <Show when={!alignmentToolbarStore.isDocked && alignmentToolbarStore.floatingPosition}>
        <Portal>
          <div
            class={styles.floatingPanel}
            style={{
              left: `${alignmentToolbarStore.floatingPosition?.x ?? 0}px`,
              top: `${alignmentToolbarStore.floatingPosition?.y ?? 0}px`,
            }}
            role="toolbar"
            aria-label="Alignment toolbar (floating)"
            data-testid="alignment-toolbar"
          >
            <div
              class={styles.floatingHeader}
              onMouseDown={handlePanelMouseDown}
            >
              <span class={styles.floatingTitle}>Alignment</span>
              <button
                class={styles.dockButton}
                onClick={handleRedock}
                title="Dock to toolbar"
                aria-label="Dock to toolbar"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 3v6h8V4H2z" />
                </svg>
              </button>
            </div>
            <div class={styles.floatingContent}>
              <ButtonGroups />
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
};
