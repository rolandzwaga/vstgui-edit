import type { Component } from 'solid-js';
import styles from './FontPreview.module.css';

export interface FontPreviewProps {
  fontName: string;
  fontSize: string;
  bold?: boolean;
  italic?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FontPreview: Component<FontPreviewProps> = (props) => {
  const sizeClass = () => styles[props.size ?? 'sm'];

  return (
    <div
      class={`${styles.preview} ${sizeClass()}`}
      data-testid="font-preview"
      aria-label={`Font preview: ${props.fontName}`}
    >
      <span
        class={styles.text}
        style={{
          'font-family': props.fontName,
          'font-weight': props.bold ? 'bold' : 'normal',
          'font-style': props.italic ? 'italic' : 'normal',
        }}
      >
        Aa
      </span>
    </div>
  );
};
