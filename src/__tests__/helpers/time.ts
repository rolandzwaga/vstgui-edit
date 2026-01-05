import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Sets up Vitest fake timers with a specific date.
 * Automatically cleans up in afterEach.
 *
 * Must be called at describe block level (not inside a test).
 *
 * @example
 * ```ts
 * describe('Date calculations', () => {
 *   useMockDate('2025-01-15T12:00:00Z');
 *
 *   test('calculates days until due', () => {
 *     const dueDate = new Date('2025-01-18T12:00:00Z');
 *     expect(daysUntil(dueDate)).toBe(3);
 *   });
 * });
 * ```
 */
export function useMockDate(dateString: string): void {
  beforeEach(() => {
    vi.useFakeTimers({
      // Only fake timer functions, not queueMicrotask (breaks SolidJS reactivity)
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'],
    });
    vi.setSystemTime(new Date(dateString));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

/**
 * Helper to flush microtasks when using fake timers with SolidJS.
 * SolidJS uses queueMicrotask for effects, which fake timers don't control.
 *
 * @example
 * ```ts
 * await flushMicrotasks();
 * await vi.advanceTimersByTimeAsync(300);
 * await flushMicrotasks();
 * ```
 */
export async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}
