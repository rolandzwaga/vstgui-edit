import { type Component, createMemo } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import { sortStops } from '../../domain/gradients/stopCalculations';
import styles from './GradientPreview.module.css';

export interface GradientPreviewProps {
  stops: GradientColorStop[];
  width?: number;
  height?: number;
}

function rgbaToCSS(rgba: string): string {
  if (!rgba || rgba.length !== 9 || !rgba.startsWith('#')) {
    return 'transparent';
  }
  const r = parseInt(rgba.slice(1, 3), 16);
  const g = parseInt(rgba.slice(3, 5), 16);
  const b = parseInt(rgba.slice(5, 7), 16);
  const a = parseInt(rgba.slice(7, 9), 16) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

export const GradientPreview: Component<GradientPreviewProps> = (props) => {
  const gradientCSS = createMemo(() => {
    const stops = props.stops;
    if (!stops || stops.length === 0) {
      return 'linear-gradient(to right, transparent, transparent)';
    }

    if (stops.length === 1) {
      const color = rgbaToCSS(stops[0].rgba);
      return `linear-gradient(to right, ${color}, ${color})`;
    }

    const sorted = sortStops(stops);
    const colorStops = sorted.map(
      (stop) => `${rgbaToCSS(stop.rgba)} ${parseFloat(stop.start) * 100}%`
    );
    return `linear-gradient(to right, ${colorStops.join(', ')})`;
  });

  const style = createMemo(() => ({
    background: gradientCSS(),
    width: props.width ? `${props.width}px` : undefined,
    height: props.height ? `${props.height}px` : undefined,
  }));

  return (
    <div
      class={styles.preview}
      style={style()}
      data-testid="gradient-preview"
    />
  );
};
