import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  clearCursorPosition,
  resetRulerStore,
  rulerStore,
  setCursorPosition,
} from '../rulerStore';

describe('rulerStore', () => {
  beforeEach(() => {
    resetRulerStore();
  });

  describe('initial state', () => {
    it('should initialize with null cursor position', () => {
      testInRoot(() => {
        expect(rulerStore.cursorPosition).toBeNull();
      });
    });
  });

  describe('setCursorPosition', () => {
    it('should set cursor position', () => {
      testInRoot(() => {
        setCursorPosition({ x: 100, y: 50 });
        expect(rulerStore.cursorPosition).toEqual({ x: 100, y: 50 });
      });
    });

    it('should update cursor position on subsequent calls', () => {
      testInRoot(() => {
        setCursorPosition({ x: 100, y: 50 });
        setCursorPosition({ x: 200, y: 150 });
        expect(rulerStore.cursorPosition).toEqual({ x: 200, y: 150 });
      });
    });

    it('should handle negative coordinates', () => {
      testInRoot(() => {
        setCursorPosition({ x: -50, y: -100 });
        expect(rulerStore.cursorPosition).toEqual({ x: -50, y: -100 });
      });
    });
  });

  describe('clearCursorPosition', () => {
    it('should clear cursor position to null', () => {
      testInRoot(() => {
        setCursorPosition({ x: 100, y: 50 });
        clearCursorPosition();
        expect(rulerStore.cursorPosition).toBeNull();
      });
    });

    it('should be idempotent when already null', () => {
      testInRoot(() => {
        clearCursorPosition();
        expect(rulerStore.cursorPosition).toBeNull();
      });
    });
  });

  describe('resetRulerStore', () => {
    it('should reset to initial state', () => {
      testInRoot(() => {
        setCursorPosition({ x: 100, y: 50 });
        resetRulerStore();
        expect(rulerStore.cursorPosition).toBeNull();
      });
    });
  });
});
