import { For, type Component } from 'solid-js';
import { smartGuidesStore } from '../../stores/smartGuidesStore';

export const SmartGuideLines: Component = () => {
  return (
    <For each={smartGuidesStore.activeGuides}>
      {(guide) => (
        <line
          data-testid={`smart-guide-${guide.id}`}
          x1={guide.orientation === 'vertical' ? guide.position : 0}
          y1={guide.orientation === 'horizontal' ? guide.position : 0}
          x2={guide.orientation === 'vertical' ? guide.position : '100%'}
          y2={guide.orientation === 'horizontal' ? guide.position : '100%'}
          stroke="var(--color-smart-guide)"
          stroke-width="1"
        />
      )}
    </For>
  );
};
