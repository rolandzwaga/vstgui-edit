import { createSignal } from 'solid-js';
import type { Point } from '../types/canvas';
import type { ClipboardData, SerializedView } from '../types/views';

const [clipboardData, setClipboardData] = createSignal<ClipboardData | null>(null);

export const clipboardStore = {
  get data() {
    return clipboardData();
  },
  get hasContent() {
    return clipboardData() !== null;
  },
};

export function copyToClipboard(
  views: SerializedView[],
  sourceOrigins: Record<string, Point>
): void {
  setClipboardData({
    views,
    sourceOrigins,
    copyTimestamp: Date.now(),
    pasteCount: 0,
  });
}

export function clearClipboard(): void {
  setClipboardData(null);
}

export function incrementPasteCount(): void {
  const current = clipboardData();
  if (current) {
    setClipboardData({
      ...current,
      pasteCount: current.pasteCount + 1,
    });
  }
}

export function getClipboardContent(): ClipboardData | null {
  return clipboardData();
}

export function resetClipboard(): void {
  setClipboardData(null);
}
