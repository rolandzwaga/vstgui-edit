import { For, Show, type Component } from 'solid-js';
import { smartGuidesStore } from '../../stores/smartGuidesStore';
import { isSpacingGuide, type SpacingGuide } from '../../types/smartGuides';
import styles from './SmartGuideLines.module.css';

const LABEL_WIDTH = 32;
const LABEL_HEIGHT = 16;
const LABEL_PADDING = 4;

const SpacingLabel: Component<{ guide: SpacingGuide }> = (props) => {
  const labelX = () =>
    props.guide.orientation === 'horizontal'
      ? (props.guide.measureStart + props.guide.measureEnd) / 2
      : props.guide.position;

  const labelY = () =>
    props.guide.orientation === 'vertical'
      ? (props.guide.measureStart + props.guide.measureEnd) / 2
      : props.guide.position;

  const roundedDistance = () => Math.round(props.guide.distance);

  return (
    <g class={styles.spacingLabel}>
      <rect
        data-testid={`spacing-label-bg-${props.guide.id}`}
        x={labelX() - LABEL_WIDTH / 2}
        y={labelY() - LABEL_HEIGHT / 2}
        width={LABEL_WIDTH}
        height={LABEL_HEIGHT}
        rx={3}
        class={styles.spacingLabelBg}
      />
      <text
        data-testid={`spacing-label-${props.guide.id}`}
        x={labelX()}
        y={labelY()}
        dominant-baseline="central"
        text-anchor="middle"
        class={styles.spacingLabelText}
      >
        {roundedDistance()}px
      </text>
    </g>
  );
};

export const SmartGuideLines: Component = () => {
  return (
    <For each={smartGuidesStore.activeGuides}>
      {(guide) => (
        <>
          <line
            data-testid={`smart-guide-${guide.id}`}
            x1={guide.orientation === 'vertical' ? guide.position : 0}
            y1={guide.orientation === 'horizontal' ? guide.position : 0}
            x2={guide.orientation === 'vertical' ? guide.position : '100%'}
            y2={guide.orientation === 'horizontal' ? guide.position : '100%'}
            stroke="var(--color-smart-guide)"
            stroke-width="1"
          />
          <Show when={isSpacingGuide(guide)}>
            <SpacingLabel guide={guide as SpacingGuide} />
          </Show>
        </>
      )}
    </For>
  );
};
