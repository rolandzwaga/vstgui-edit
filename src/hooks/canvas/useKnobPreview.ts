/**
 * useKnobPreview Hook
 *
 * Handles CAnimKnob filmstrip preview interaction.
 * Manages mouse events, bitmap loading, and preview state.
 */

import { onCleanup } from 'solid-js';
import {
  buildAnimKnobBitmapInfo,
  getBitmapName,
  isAnimKnobWithBitmap,
  parseDefaultValue,
} from '../../domain/animknob';
import { getThumbnailUrlAsync } from '../../domain/bitmaps/thumbnail';
import { bitmapService } from '../../services/indexedDB/bitmapService';
import { getBitmaps, getView } from '../../stores/documentStore';
import {
  cancelKnobPreview,
  endKnobPreview,
  knobPreviewStore,
  startKnobPreview,
  updateKnobPreviewByDelta,
} from '../../stores/knobPreviewStore';
import { projectStore } from '../../stores/projectStore';
import { viewModeStore } from '../../stores/viewModeStore';
import type { RenderableView } from '../../types/canvas';

export interface UseKnobPreviewOptions {
  /**
   * Function to find a renderable view by ID.
   */
  findView: (viewId: string) => RenderableView | undefined;
}

export interface UseKnobPreviewResult {
  /**
   * Checks synchronously if a view should have knob preview.
   * Returns true if view is CAnimKnob in styled mode with bitmap attribute.
   * Use this for immediate decision-making without async operations.
   */
  shouldHaveKnobPreview: (viewId: string | null) => boolean;

  /**
   * Starts knob preview interaction asynchronously.
   * Call this after shouldHaveKnobPreview returns true.
   * Loads bitmap data and initializes preview state.
   *
   * @param e - Mouse event
   * @param viewId - Target view ID
   */
  startPreviewAsync: (e: MouseEvent, viewId: string) => void;
}

/**
 * Hook for managing CAnimKnob filmstrip preview interactions.
 *
 * Usage:
 * 1. Call shouldHaveKnobPreview on mousedown (synchronous check)
 * 2. If true, call startPreviewAsync and prevent default selection
 * 3. The hook manages mousemove/mouseup automatically
 */
export function useKnobPreview(options: UseKnobPreviewOptions): UseKnobPreviewResult {
  const { findView } = options;

  // Track cleanup for document event listeners
  let cleanupListeners: (() => void) | null = null;

  /**
   * Handles document-level mouse move during preview.
   * Uses movementY (delta) for Pointer Lock compatibility.
   */
  const handleMouseMove = (e: MouseEvent): void => {
    if (!knobPreviewStore.isActive) {
      return;
    }
    // Use movementY for delta-based tracking (works with Pointer Lock)
    updateKnobPreviewByDelta(e.movementY);
  };

  /**
   * Handles document-level mouse up to end preview.
   */
  const handleMouseUp = (): void => {
    if (!knobPreviewStore.isActive) {
      return;
    }
    // Exit pointer lock - cursor will return to original position
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    endKnobPreview();
    removeDocumentListeners();
  };

  /**
   * Handles Escape key to cancel preview.
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && knobPreviewStore.isActive) {
      // Exit pointer lock on cancel
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      cancelKnobPreview();
      removeDocumentListeners();
    }
  };

  /**
   * Handles pointer lock change (e.g., user pressed Escape while locked).
   */
  const handlePointerLockChange = (): void => {
    // If pointer lock was released but we're still active, end the preview
    if (!document.pointerLockElement && knobPreviewStore.isActive) {
      endKnobPreview();
      removeDocumentListeners();
    }
  };

  /**
   * Adds document-level event listeners for tracking.
   */
  const addDocumentListeners = (): void => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    cleanupListeners = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  };

  /**
   * Removes document-level event listeners.
   */
  const removeDocumentListeners = (): void => {
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    removeDocumentListeners();
    if (knobPreviewStore.isActive) {
      cancelKnobPreview();
    }
  });

  /**
   * Synchronous check if a view should have knob preview.
   */
  const shouldHaveKnobPreview = (viewId: string | null): boolean => {
    // Must have a view ID
    if (!viewId) {
      return false;
    }

    // Must be in styled mode
    if (viewModeStore.mode !== 'styled') {
      return false;
    }

    // Get the view node for attributes
    const viewNode = getView(viewId);
    if (!viewNode) {
      return false;
    }

    // Must be a CAnimKnob with bitmap
    if (!isAnimKnobWithBitmap(viewNode.attributes.class, viewNode.attributes)) {
      return false;
    }

    // Must have a project to look up bitmaps
    const projectId = projectStore.currentProject?.id ?? null;
    if (!projectId) {
      return false;
    }

    return true;
  };

  /**
   * Starts knob preview asynchronously.
   * Loads bitmap data and initializes preview state.
   */
  const startPreviewAsync = (e: MouseEvent, viewId: string): void => {
    // Fire and forget - async loading happens in background
    loadAndStartPreview(e, viewId);
  };

  /**
   * Internal async function to load bitmap and start preview.
   */
  const loadAndStartPreview = async (e: MouseEvent, viewId: string): Promise<void> => {
    // Get the view node for attributes
    const viewNode = getView(viewId);
    if (!viewNode) {
      return;
    }

    // Get the bitmap name
    const bitmapName = getBitmapName(viewNode.attributes);
    if (!bitmapName) {
      return;
    }

    // Get project ID for IndexedDB lookup
    const projectId = projectStore.currentProject?.id ?? null;
    if (!projectId) {
      return;
    }

    // Get bitmap definition from document
    const bitmaps = getBitmaps();
    const bitmapDef = bitmaps?.[bitmapName];

    // Get stored bitmap for dimensions
    let storedBitmaps: Awaited<ReturnType<typeof bitmapService.getByProject>>;
    try {
      storedBitmaps = await bitmapService.getByProject(projectId);
    } catch {
      return;
    }
    const storedBitmap = storedBitmaps.find((b) => b.name === bitmapName) ?? null;

    // If bitmap not in IndexedDB, can't preview
    if (!storedBitmap) {
      return;
    }

    // Get image URL
    const imageUrl = await getThumbnailUrlAsync(bitmapName, bitmapDef ?? bitmapName, projectId);
    if (!imageUrl) {
      return;
    }

    // Get the renderable view for dimensions
    const renderableView = findView(viewId);
    if (!renderableView) {
      return;
    }

    // Build bitmap info
    const bitmapInfo = buildAnimKnobBitmapInfo(
      bitmapName,
      imageUrl,
      bitmapDef,
      storedBitmap,
      viewNode.attributes,
      renderableView.height
    );

    if (!bitmapInfo) {
      return;
    }

    // Get default value
    const defaultValue = parseDefaultValue(viewNode.attributes);

    // Start the preview
    startKnobPreview(viewId, defaultValue, bitmapInfo);

    // Add document listeners for tracking
    addDocumentListeners();

    // Request pointer lock to hide cursor during drag
    // The cursor will return to original position when pointer lock is released
    const target = e.target as Element | null;
    if (target && 'requestPointerLock' in target) {
      (target as HTMLElement).requestPointerLock();
    }
  };

  return {
    shouldHaveKnobPreview,
    startPreviewAsync,
  };
}
