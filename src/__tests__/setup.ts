// Vitest setup file
// Add global test utilities and mocks here

import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});
