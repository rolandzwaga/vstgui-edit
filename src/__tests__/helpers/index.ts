/**
 * Test helper library for VSTGUI-Edit
 *
 * Provides utilities for testing SolidJS components and stores.
 * See specs/TESTING-GUIDE.md for usage patterns.
 *
 * @example
 * ```ts
 * import {
 *   renderWithProviders,
 *   testInRoot,
 *   useMockDate,
 *   createMockView,
 *   createMockDocument,
 * } from '../helpers';
 * ```
 */


// Fixture factories
export {
  createMockContainer,
  createMockDocument,
  createMockRenderableView,
  createMockUidescFile,
  createMockUidescJson,
  createMockUidescXml,
  createMockView,
} from './fixtures';
// Rendering helpers
export { type RenderWithProvidersOptions, renderWithProviders } from './render';
// SolidJS testing utilities
export { testInRoot } from './solidjs';
// Time mocking utilities
export { flushMicrotasks, useMockDate } from './time';
