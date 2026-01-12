/**
 * App Container Store
 *
 * Holds a reference to the main app container element.
 * Used by FloatingDropdown to scope click-outside detection
 * to the app container, avoiding interference with Portal content.
 */

import { createSignal } from 'solid-js';

const [appContainer, setAppContainer] = createSignal<HTMLElement | null>(null);

export { appContainer, setAppContainer };
