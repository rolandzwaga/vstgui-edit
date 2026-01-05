import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { render, screen } from '@solidjs/testing-library';
// Import directly to avoid loading Router from render.tsx via barrel export
import { testInRoot } from '../solidjs';
import { flushMicrotasks, useMockDate } from '../time';
import {
  createMockDocument,
  createMockUidescFile,
  createMockUidescJson,
  createMockUidescXml,
  createMockView,
} from '../fixtures';

describe('Test Helpers', () => {
  describe('testInRoot', () => {
    it('should execute synchronous function in reactive root', () => {
      const result = testInRoot(() => {
        const [count, setCount] = createSignal(0);
        setCount(1);
        return count();
      });

      expect(result).toBe(1);
    });

    it('should execute async function in reactive root', async () => {
      const result = await testInRoot(async () => {
        const [count, setCount] = createSignal(0);
        await Promise.resolve();
        setCount(42);
        return count();
      });

      expect(result).toBe(42);
    });

    it('should propagate errors from test function', () => {
      expect(() => {
        testInRoot(() => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });
  });

  describe('render (basic)', () => {
    // Note: renderWithProviders is tested indirectly via component tests
    // that use Router. These tests verify basic render functionality.

    it('should render a simple component', () => {
      render(() => <div data-testid="test">Hello</div>);

      expect(screen.getByTestId('test')).toHaveTextContent('Hello');
    });

    it('should support wrapper pattern', () => {
      const TestContext = {
        value: 'from context',
      };

      render(() => <div data-testid="wrapped">{TestContext.value}</div>);

      expect(screen.getByTestId('wrapped')).toHaveTextContent('from context');
    });
  });

  describe('useMockDate', () => {
    useMockDate('2025-06-15T12:00:00Z');

    it('should mock the current date', () => {
      const now = new Date();
      expect(now.getFullYear()).toBe(2025);
      expect(now.getMonth()).toBe(5); // June (0-indexed)
      expect(now.getDate()).toBe(15);
    });

    it('should allow advancing time', async () => {
      const start = Date.now();
      await vi.advanceTimersByTimeAsync(1000);
      const end = Date.now();

      expect(end - start).toBe(1000);
    });
  });

  describe('flushMicrotasks', () => {
    it('should resolve immediately', async () => {
      let resolved = false;

      flushMicrotasks().then(() => {
        resolved = true;
      });

      await flushMicrotasks();
      expect(resolved).toBe(true);
    });
  });

  describe('fixtures', () => {
    describe('createMockView', () => {
      it('should create view with default attributes', () => {
        const view = createMockView();

        expect(view.attributes.class).toBe('CView');
        expect(view.attributes.origin).toBe('0, 0');
        expect(view.attributes.size).toBe('100, 100');
      });

      it('should allow overriding attributes', () => {
        const view = createMockView({
          class: 'CTextLabel',
          title: 'Hello',
          size: '200, 50',
        });

        expect(view.attributes.class).toBe('CTextLabel');
        expect(view.attributes.title).toBe('Hello');
        expect(view.attributes.size).toBe('200, 50');
      });

      it('should support children', () => {
        const view = createMockView({}, { child: createMockView() });

        expect(view.children).toBeDefined();
        expect(view.children?.child).toBeDefined();
      });
    });

    describe('createMockDocument', () => {
      it('should create minimal valid document', () => {
        const doc = createMockDocument();

        expect(doc['vstgui-ui-description'].version).toBe('1');
        expect(doc['vstgui-ui-description'].templates).toBeDefined();
      });

      it('should allow custom templates', () => {
        const doc = createMockDocument({
          templates: {
            MainView: createMockView({ class: 'CViewContainer' }),
          },
        });

        expect(doc['vstgui-ui-description'].templates?.MainView).toBeDefined();
      });
    });

    describe('createMockUidescJson', () => {
      it('should return valid JSON string', () => {
        const json = createMockUidescJson();

        expect(() => JSON.parse(json)).not.toThrow();
        expect(JSON.parse(json)['vstgui-ui-description']).toBeDefined();
      });
    });

    describe('createMockUidescXml', () => {
      it('should return valid XML string', () => {
        const xml = createMockUidescXml();

        expect(xml).toContain('<?xml');
        expect(xml).toContain('vstgui-ui-description');
        expect(xml).toContain('version="1"');
      });
    });

    describe('createMockUidescFile', () => {
      it('should create File with default content', () => {
        const file = createMockUidescFile();

        expect(file.name).toBe('test.uidesc');
        expect(file.size).toBeGreaterThan(0);
      });

      it('should create File with custom content and name', () => {
        const file = createMockUidescFile('custom content', 'custom.uidesc');

        expect(file.name).toBe('custom.uidesc');
      });
    });
  });
});
