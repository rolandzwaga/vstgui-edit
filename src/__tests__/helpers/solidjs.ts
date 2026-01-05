import { createRoot } from 'solid-js';

/**
 * Wraps a test function in a SolidJS reactive root with automatic disposal.
 * Required because SolidJS signals and stores must be created inside a reactive root.
 *
 * Supports both synchronous and asynchronous test functions.
 *
 * @example
 * ```ts
 * // Synchronous test
 * test('updates signal', () => {
 *   testInRoot(() => {
 *     const [count, setCount] = createSignal(0);
 *     setCount(1);
 *     expect(count()).toBe(1);
 *   });
 * });
 *
 * // Asynchronous test
 * test('async effect', async () => {
 *   await testInRoot(async () => {
 *     const [data, setData] = createSignal(null);
 *     // ... async operations
 *     await waitFor(() => expect(data()).not.toBeNull());
 *   });
 * });
 * ```
 */
export function testInRoot<T>(fn: () => T): T {
  let result: T;
  let error: unknown;

  createRoot((dispose) => {
    try {
      result = fn();

      // If result is a Promise, wait for it then dispose
      if (result instanceof Promise) {
        result = result.finally(dispose) as T;
      } else {
        dispose();
      }
    } catch (e) {
      error = e;
      dispose();
    }
  });

  if (error !== undefined) {
    throw error;
  }

  // biome-ignore lint/style/noNonNullAssertion: result is always assigned in createRoot
  return result!;
}
