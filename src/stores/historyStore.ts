import { createSignal } from 'solid-js';
import type { HistoryOperation } from '../types/history';
import { HISTORY_STACK_LIMIT } from '../types/history';

const [undoStack, setUndoStack] = createSignal<HistoryOperation[]>([]);
const [redoStack, setRedoStack] = createSignal<HistoryOperation[]>([]);

export const historyStore = {
  get canUndo() {
    return undoStack().length > 0;
  },
  get canRedo() {
    return redoStack().length > 0;
  },
  get undoDescription(): string | null {
    const stack = undoStack();
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
  get redoDescription(): string | null {
    const stack = redoStack();
    return stack.length > 0 ? stack[stack.length - 1].description : null;
  },
};

export function pushOperation(op: HistoryOperation): void {
  setUndoStack(stack => {
    const newStack = [...stack, op];
    if (newStack.length > HISTORY_STACK_LIMIT) {
      return newStack.slice(newStack.length - HISTORY_STACK_LIMIT);
    }
    return newStack;
  });
  setRedoStack([]);
}

export function undo(): void {
  const stack = undoStack();
  if (stack.length === 0) {
    return;
  }

  const op = stack[stack.length - 1];
  setUndoStack(stack.slice(0, -1));
  setRedoStack(redo => [...redo, op]);
  op.undo();
}

export function redo(): void {
  const stack = redoStack();
  if (stack.length === 0) {
    return;
  }

  const op = stack[stack.length - 1];
  setRedoStack(stack.slice(0, -1));
  setUndoStack(undo => [...undo, op]);
  op.redo();
}

export function clearHistory(): void {
  setUndoStack([]);
  setRedoStack([]);
}

export function resetHistory(): void {
  clearHistory();
}
