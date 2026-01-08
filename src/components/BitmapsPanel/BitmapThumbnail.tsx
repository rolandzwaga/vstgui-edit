import { type Component, createMemo, createSignal, Show } from 'solid-js';
import type { BitmapDefinition } from '../../types/uidesc';
import { getThumbnailUrl } from '../../domain/bitmaps/thumbnail';
import styles from './BitmapThumbnail.module.css';

export interface BitmapThumbnailProps {
  bitmap: string | BitmapDefinition;
}

export const BitmapThumbnail: Component<BitmapThumbnailProps> = (props) => {
  const [state, setState] = createSignal<'loading' | 'loaded' | 'error'>('loading');

  const url = createMemo(() => getThumbnailUrl(props.bitmap));

  const handleLoad = () => {
    setState('loaded');
  };

  const handleError = () => {
    setState('error');
  };

  return (
    <div class={styles.container} data-testid="bitmap-thumbnail">
      <Show
        when={url()}
        fallback={
          <div class={styles.placeholder} data-testid="thumbnail-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M3 16l5-5 3 3 5-5 5 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>
        }
      >
        <Show when={state() !== 'error'} fallback={
          <div class={styles.placeholder} data-testid="thumbnail-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
        }>
          <img
            src={url()!}
            class={`${styles.image} ${state() === 'loading' ? styles.loading : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            alt=""
            data-testid="thumbnail-image"
          />
        </Show>
      </Show>
    </div>
  );
};
