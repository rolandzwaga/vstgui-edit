import { createSignal } from 'solid-js';
import type { SmartGuide } from '../types/smartGuides';

export const DEFAULT_GUIDES_ENABLED = true;

const [isEnabled, setIsEnabled] = createSignal<boolean>(DEFAULT_GUIDES_ENABLED);
const [activeGuides, setActiveGuidesSignal] = createSignal<SmartGuide[]>([]);

export const smartGuidesStore = {
  get isEnabled() {
    return isEnabled();
  },
  get activeGuides() {
    return activeGuides();
  },
};

export function toggleSmartGuides(): void {
  setIsEnabled(current => !current);
}

export function setActiveGuides(guides: SmartGuide[]): void {
  setActiveGuidesSignal(guides);
}

export function clearActiveGuides(): void {
  setActiveGuidesSignal([]);
}

export function resetSmartGuides(): void {
  setIsEnabled(DEFAULT_GUIDES_ENABLED);
  setActiveGuidesSignal([]);
}
