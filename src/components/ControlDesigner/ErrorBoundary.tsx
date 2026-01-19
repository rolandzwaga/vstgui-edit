/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child component tree and displays
 * a fallback UI instead of crashing the entire application.
 */

import { ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import type { JSX, ParentComponent } from 'solid-js';
import styles from './ErrorBoundary.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface ControlDesignerErrorBoundaryProps {
  /** Error message to display (optional) */
  message?: string;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback to retry/reset */
  onRetry?: () => void;
  /** Children to render */
  children: JSX.Element;
}

// ============================================================================
// Error Fallback Component
// ============================================================================

interface ErrorFallbackProps {
  error: Error;
  message?: string;
  onRetry?: () => void;
}

const ErrorFallback = (props: ErrorFallbackProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.icon}>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <h3 class={styles.title}>{props.message ?? 'Something went wrong'}</h3>
      <p class={styles.message}>{props.error.message}</p>
      {props.onRetry && (
        <button type="button" class={styles.retryButton} onClick={props.onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const ControlDesignerErrorBoundary: ParentComponent<ControlDesignerErrorBoundaryProps> = (
  props
) => {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => {
        // Call onError callback if provided
        if (props.onError && err instanceof Error) {
          props.onError(err);
        }

        const handleRetry = () => {
          props.onRetry?.();
          reset();
        };

        return (
          <ErrorFallback
            error={err instanceof Error ? err : new Error(String(err))}
            message={props.message}
            onRetry={handleRetry}
          />
        );
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
};
