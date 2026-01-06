import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { resetCanvas } from '../stores/canvasStore';

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function () {};
}

afterEach(() => {
  cleanup();
  resetCanvas();
});
