/**
 * AlignmentToolbar Component
 *
 * Toolbar with buttons for aligning and distributing views.
 */

import { type Component, createMemo } from 'solid-js';
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
import { useCanvasData } from '../../hooks/canvas/useCanvasData';
import { AlignmentButton } from './AlignmentButton';
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
 */
export const AlignmentToolbar: Component<AlignmentToolbarProps> = () => {
  const { renderableViews } = useCanvasData();

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

  // Determine if any selected view is a root (has no parent)
  const hasRootSelected = createMemo((): boolean => {
    const selectedIds = selectionStore.selectedIds;
    for (const id of selectedIds) {
      if (getParentId(id) === null) {
        return true;
      }
    }
    return false;
  });

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

  return (
    <div
      class={styles.toolbar}
      role="toolbar"
      aria-label="Alignment toolbar"
    >
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
    </div>
  );
};
