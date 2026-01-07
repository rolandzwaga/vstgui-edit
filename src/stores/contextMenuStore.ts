import { createSignal } from 'solid-js';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

const [isOpen, setIsOpen] = createSignal<boolean>(false);
const [position, setPosition] = createSignal<ContextMenuPosition>({ x: 0, y: 0 });

export const contextMenuStore = {
  get isOpen() {
    return isOpen();
  },
  get position() {
    return position();
  },
};

export function showContextMenu(x: number, y: number): void {
  setPosition({ x, y });
  setIsOpen(true);
}

export function hideContextMenu(): void {
  setIsOpen(false);
}

export function resetContextMenu(): void {
  setIsOpen(false);
  setPosition({ x: 0, y: 0 });
}
