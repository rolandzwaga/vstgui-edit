import { render } from '@solidjs/testing-library';
import { Router } from '@solidjs/router';
import type { Component, JSX } from 'solid-js';

/**
 * Options for renderWithProviders
 */
export interface RenderWithProvidersOptions {
  /** Whether to wrap with Router (default: true) */
  withRouter?: boolean;
  /** Initial route path (default: '/') */
  initialRoute?: string;
  /** Custom wrapper component */
  wrapper?: Component<{ children: JSX.Element }>;
}

/**
 * Renders a component with configurable provider stack.
 * By default wraps with Router for isolated router context.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { getByText } = renderWithProviders(() => <MyComponent />);
 *
 * // With specific route
 * renderWithProviders(() => <Editor />, { initialRoute: '/editor' });
 *
 * // Without router
 * renderWithProviders(() => <Button />, { withRouter: false });
 *
 * // With custom wrapper
 * renderWithProviders(() => <Consumer />, {
 *   wrapper: (props) => <MyContext.Provider value="test">{props.children}</MyContext.Provider>
 * });
 * ```
 */
export function renderWithProviders(
  ui: () => JSX.Element,
  options: RenderWithProvidersOptions = {}
) {
  const { withRouter = true, initialRoute = '/', wrapper } = options;

  let wrapped = ui;

  // Apply custom wrapper if provided
  if (wrapper) {
    const Wrapper = wrapper;
    const prevWrapped = wrapped;
    wrapped = () => <Wrapper>{prevWrapped()}</Wrapper>;
  }

  // Wrap with Router if requested (uses memory-based URL for test isolation)
  if (withRouter) {
    const prevWrapped = wrapped;
    wrapped = () => (
      <Router root={(props) => <>{props.children}</>} url={initialRoute}>
        {prevWrapped()}
      </Router>
    );
  }

  return render(wrapped);
}
