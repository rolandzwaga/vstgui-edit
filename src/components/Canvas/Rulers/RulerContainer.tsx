/**
 * RulerContainer Component
 *
 * CSS Grid layout container that positions rulers around the canvas viewport.
 * Renders rulers only when a template is loaded.
 */

import { type JSX, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { useCanvasData } from '../../../hooks/canvas';
import { rulerStore } from '../../../stores/rulerStore';
import { HorizontalRuler } from './HorizontalRuler';
import { RulerOrigin } from './RulerOrigin';
import { VerticalRuler } from './VerticalRuler';
import styles from './RulerContainer.module.css';

export interface RulerContainerProps {
  children: JSX.Element;
}

export function RulerContainer(props: RulerContainerProps) {
  const { templateBounds, isEmpty } = useCanvasData();
  const [viewportSize, setViewportSize] = createSignal({ width: 0, height: 0 });
  let viewportRef: HTMLDivElement | undefined;

  // Check if template is loaded
  const hasTemplate = createMemo(() => !isEmpty());

  // Update viewport size on resize
  const updateViewportSize = () => {
    if (viewportRef) {
      setViewportSize({
        width: viewportRef.clientWidth,
        height: viewportRef.clientHeight,
      });
    }
  };

  onMount(() => {
    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    if (viewportRef) {
      observer.observe(viewportRef);
    }

    onCleanup(() => observer.disconnect());
  });

  return (
    <div class={styles.container} data-testid="ruler-container">
      {/* Origin indicator (top-left corner) */}
      <Show when={hasTemplate()}>
        <div class={styles.origin}>
          <RulerOrigin />
        </div>
      </Show>

      {/* Horizontal ruler (top) */}
      <Show when={hasTemplate()}>
        <div class={styles.horizontalRuler}>
          <HorizontalRuler
            width={viewportSize().width}
            cursorPosition={rulerStore.cursorPosition}
            templateWidth={templateBounds()?.width ?? 0}
          />
        </div>
      </Show>

      {/* Vertical ruler (left) */}
      <Show when={hasTemplate()}>
        <div class={styles.verticalRuler}>
          <VerticalRuler
            height={viewportSize().height}
            cursorPosition={rulerStore.cursorPosition}
            templateHeight={templateBounds()?.height ?? 0}
          />
        </div>
      </Show>

      {/* Viewport containing canvas */}
      <div
        ref={viewportRef}
        class={styles.viewport}
        data-testid="ruler-viewport"
      >
        {props.children}
      </div>
    </div>
  );
}
