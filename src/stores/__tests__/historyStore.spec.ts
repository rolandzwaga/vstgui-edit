import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { HistoryOperation } from '../../types/history';
import {
  clearHistory,
  historyStore,
  pushOperation,
  redo,
  resetHistory,
  undo,
} from '../historyStore';

function createMockOperation(description = 'Test operation'): HistoryOperation {
  return {
    type: 'move',
    description,
    undo: vi.fn(),
    redo: vi.fn(),
    timestamp: Date.now(),
  };
}

describe('historyStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetHistory();
    });
  });

  describe('initial state', () => {
    it('should have canUndo as false', () => {
      testInRoot(() => {
        expect(historyStore.canUndo).toBe(false);
      });
    });

    it('should have canRedo as false', () => {
      testInRoot(() => {
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should have undoDescription as null', () => {
      testInRoot(() => {
        expect(historyStore.undoDescription).toBeNull();
      });
    });

    it('should have redoDescription as null', () => {
      testInRoot(() => {
        expect(historyStore.redoDescription).toBeNull();
      });
    });
  });

  describe('pushOperation', () => {
    it('should enable canUndo after pushing', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        expect(historyStore.canUndo).toBe(true);
      });
    });

    it('should set undoDescription to operation description', () => {
      testInRoot(() => {
        pushOperation(createMockOperation('Move CTextButton'));
        expect(historyStore.undoDescription).toBe('Move CTextButton');
      });
    });

    it('should clear redo stack when pushing new operation', () => {
      testInRoot(() => {
        pushOperation(createMockOperation('First'));
        undo();
        expect(historyStore.canRedo).toBe(true);

        pushOperation(createMockOperation('Second'));
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should limit stack to 100 operations', () => {
      testInRoot(() => {
        for (let i = 0; i < 105; i++) {
          pushOperation(createMockOperation(`Op ${i}`));
        }

        let undoCount = 0;
        while (historyStore.canUndo) {
          undo();
          undoCount++;
        }
        expect(undoCount).toBe(100);
      });
    });

    it('should drop oldest operations when limit exceeded', () => {
      testInRoot(() => {
        for (let i = 0; i < 105; i++) {
          pushOperation(createMockOperation(`Op ${i}`));
        }

        for (let i = 0; i < 99; i++) {
          undo();
        }
        expect(historyStore.undoDescription).toBe('Op 5');
      });
    });
  });

  describe('undo', () => {
    it('should call operation undo function', () => {
      testInRoot(() => {
        const op = createMockOperation();
        pushOperation(op);
        undo();
        expect(op.undo).toHaveBeenCalledOnce();
      });
    });

    it('should move operation to redo stack', () => {
      testInRoot(() => {
        pushOperation(createMockOperation('Test'));
        undo();
        expect(historyStore.canRedo).toBe(true);
        expect(historyStore.redoDescription).toBe('Test');
      });
    });

    it('should decrease canUndo after undo', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        expect(historyStore.canUndo).toBe(true);
        undo();
        expect(historyStore.canUndo).toBe(false);
      });
    });

    it('should do nothing when undo stack is empty', () => {
      testInRoot(() => {
        undo();
        expect(historyStore.canUndo).toBe(false);
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should undo operations in reverse order', () => {
      testInRoot(() => {
        const op1 = createMockOperation('First');
        const op2 = createMockOperation('Second');
        const op3 = createMockOperation('Third');

        pushOperation(op1);
        pushOperation(op2);
        pushOperation(op3);

        undo();
        expect(op3.undo).toHaveBeenCalledOnce();

        undo();
        expect(op2.undo).toHaveBeenCalledOnce();

        undo();
        expect(op1.undo).toHaveBeenCalledOnce();
      });
    });
  });

  describe('redo', () => {
    it('should call operation redo function', () => {
      testInRoot(() => {
        const op = createMockOperation();
        pushOperation(op);
        undo();
        redo();
        expect(op.redo).toHaveBeenCalledOnce();
      });
    });

    it('should move operation back to undo stack', () => {
      testInRoot(() => {
        pushOperation(createMockOperation('Test'));
        undo();
        redo();
        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toBe('Test');
      });
    });

    it('should decrease canRedo after redo', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        undo();
        expect(historyStore.canRedo).toBe(true);
        redo();
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should do nothing when redo stack is empty', () => {
      testInRoot(() => {
        redo();
        expect(historyStore.canUndo).toBe(false);
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should redo operations in order', () => {
      testInRoot(() => {
        const op1 = createMockOperation('First');
        const op2 = createMockOperation('Second');

        pushOperation(op1);
        pushOperation(op2);
        undo();
        undo();

        redo();
        expect(op1.redo).toHaveBeenCalledOnce();

        redo();
        expect(op2.redo).toHaveBeenCalledOnce();
      });
    });
  });

  describe('clearHistory', () => {
    it('should clear undo stack', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        pushOperation(createMockOperation());
        clearHistory();
        expect(historyStore.canUndo).toBe(false);
      });
    });

    it('should clear redo stack', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        undo();
        clearHistory();
        expect(historyStore.canRedo).toBe(false);
      });
    });

    it('should reset descriptions to null', () => {
      testInRoot(() => {
        pushOperation(createMockOperation('Test'));
        undo();
        clearHistory();
        expect(historyStore.undoDescription).toBeNull();
        expect(historyStore.redoDescription).toBeNull();
      });
    });
  });

  describe('resetHistory', () => {
    it('should behave same as clearHistory', () => {
      testInRoot(() => {
        pushOperation(createMockOperation());
        undo();
        resetHistory();
        expect(historyStore.canUndo).toBe(false);
        expect(historyStore.canRedo).toBe(false);
      });
    });
  });
});
