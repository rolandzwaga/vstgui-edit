import { type Component, createResource, createSignal, onCleanup, Show } from 'solid-js';
import { isMultiframeBitmap, type BitmapDefinition } from '../../types/uidesc';
import { getThumbnailUrlAsync, revokeThumbnailUrl } from '../../domain/bitmaps/thumbnail';
import styles from './BitmapThumbnail.module.css';

export interface BitmapThumbnailProps {
  /** The bitmap definition from the uidesc document */
  bitmap: string | BitmapDefinition;
  /** The bitmap name (for IndexedDB lookup) */
  bitmapName: string;
  /** The project ID (for IndexedDB lookup, null disables lookup) */
  projectId: string | null;
}

/**
 * Displays a thumbnail preview of a bitmap.
 *
 * Resolution order:
 * 1. Embedded base64 data → data URL
 * 2. IndexedDB blob (if projectId provided) → object URL
 * 3. Path string (external file reference)
 */
export const BitmapThumbnail: Component<BitmapThumbnailProps> = (props) => {
  const [imageState, setImageState] = createSignal<'loading' | 'loaded' | 'error'>('loading');

  // Fetch thumbnail URL asynchronously
  const [url] = createResource(
    () => ({
      bitmap: props.bitmap,
      bitmapName: props.bitmapName,
      projectId: props.projectId,
    }),
    async (params) => {
      setImageState('loading');
      return getThumbnailUrlAsync(params.bitmapName, params.bitmap, params.projectId);
    }
  );

  // Clean up object URLs when component unmounts or URL changes
  onCleanup(() => {
    const currentUrl = url();
    if (currentUrl) {
      revokeThumbnailUrl(currentUrl);
    }
  });

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = () => {
    setImageState('error');
  };

  // Placeholder SVG for no image or loading state
  const PlaceholderIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M3 16l5-5 3 3 5-5 5 5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );

  // Error SVG for failed loads
  const ErrorIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  );

  return (
    <div class={styles.container} data-testid="bitmap-thumbnail">
      <Show
        when={!url.loading && url()}
        fallback={
          <div class={styles.placeholder} data-testid="thumbnail-placeholder">
            <PlaceholderIcon />
          </div>
        }
      >
        <Show
          when={imageState() !== 'error'}
          fallback={
            <div class={styles.placeholder} data-testid="thumbnail-error">
              <ErrorIcon />
            </div>
          }
        >
          <img
            src={url()!}
            class={`${styles.image} ${imageState() === 'loading' ? styles.loading : ''} ${isMultiframeBitmap(props.bitmap) ? styles.multiframe : ''}`}
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
