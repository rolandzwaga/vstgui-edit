import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { resetCanvas } from '../stores/canvasStore';

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function () {};
}

// Mock ResizeObserver for tests
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(_target: Element): void {
      // Call the callback once with empty entries to simulate initial observation
      this.callback([], this);
    }

    unobserve(): void {}

    disconnect(): void {}
  };
}

afterEach(() => {
  cleanup();
  resetCanvas();
});
