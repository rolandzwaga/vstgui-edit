// Vitest setup file
// Add global test utilities and mocks here

import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Import store reset functions for automatic cleanup
import { resetCanvas } from '../stores/canvasStore';

// Ensure cleanup after each test
afterEach(() => {
  cleanup();

  // Reset global store state to prevent test pollution
  // This ensures each test starts with a clean slate
  resetCanvas();
});
