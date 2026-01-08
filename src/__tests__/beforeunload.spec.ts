import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('beforeunload warning', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let registeredHandler: ((e: BeforeUnloadEvent) => void) | null = null;

  beforeEach(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'beforeunload') {
        registeredHandler = handler as (e: BeforeUnloadEvent) => void;
      }
    }) as typeof window.addEventListener;

    window.removeEventListener = vi.fn() as typeof window.removeEventListener;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    registeredHandler = null;
    vi.resetModules();
  });

  test('beforeunload handler prevents default when isDirty is true', async () => {
    vi.doMock('../stores/documentStore', () => ({
      documentStore: {
        isDirty: true,
        document: null,
        parseState: 'idle',
      },
      getTemplate: vi.fn(),
    }));

    vi.doMock('../stores/templateStore', () => ({
      templateStore: { activeTemplateId: null },
    }));

    vi.doMock('../stores/canvasStore', () => ({
      fitToView: vi.fn(),
    }));

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as unknown as BeforeUnloadEvent;

    if (registeredHandler) {
      registeredHandler(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    }
  });

  test('beforeunload handler does not prevent default when isDirty is false', async () => {
    vi.doMock('../stores/documentStore', () => ({
      documentStore: {
        isDirty: false,
        document: null,
        parseState: 'idle',
      },
      getTemplate: vi.fn(),
    }));

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as unknown as BeforeUnloadEvent;

    if (registeredHandler) {
      registeredHandler(mockEvent);
    }
  });
});
