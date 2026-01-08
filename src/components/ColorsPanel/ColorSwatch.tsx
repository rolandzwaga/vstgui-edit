import type { Component } from 'solid-js';
import { parseHexColor, formatAsRgba } from '../../domain/colors';
import styles from './ColorSwatch.module.css';

export type SwatchSize = 'sm' | 'md' | 'lg';

export interface ColorSwatchProps {
  color: string;
  size?: SwatchSize;
}

export const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  const sizeClass = () => {
    switch (props.size ?? 'md') {
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      default:
        return styles.md;
    }
  };

  const backgroundColor = () => {
    const parsed = parseHexColor(props.color);
    if (!parsed) return props.color;
    return formatAsRgba(parsed);
  };

  const hasTransparency = () => {
    const parsed = parseHexColor(props.color);
    return parsed ? parsed.a < 255 : false;
  };

  return (
    <div
      class={`${styles.swatch} ${sizeClass()}`}
      data-testid="color-swatch"
      data-transparent={hasTransparency() ? 'true' : undefined}
    >
      <div class={styles.color} style={{ 'background-color': backgroundColor() }} />
    </div>
  );
};
