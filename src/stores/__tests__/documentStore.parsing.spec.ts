import { beforeEach, describe, expect, it } from 'vitest';
import { createMockUidescFile } from '../../__tests__/helpers/fixtures';
import { documentStore, loadFile, reset } from '../documentStore';

describe('documentStore parsing integration', () => {
  beforeEach(() => {
    reset();
  });

  describe('initial state', () => {
    it('should have idle parseState initially', () => {
      expect(documentStore.parseState).toBe('idle');
    });

    it('should have null document initially', () => {
      expect(documentStore.document).toBeNull();
    });

    it('should have null parseErrors initially', () => {
      expect(documentStore.parseErrors).toBeNull();
    });

    it('should have null detectedFormat initially', () => {
      expect(documentStore.detectedFormat).toBeNull();
    });
  });

  describe('auto-parsing on upload success (FR-000)', () => {
    it('should automatically parse valid JSON after upload', async () => {
      const validJson = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
        },
      });
      const file = createMockUidescFile(validJson);

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.parseState).toBe('valid');
      expect(documentStore.document).not.toBeNull();
      expect(documentStore.document?.['vstgui-ui-description'].version).toBe('1');
      expect(documentStore.detectedFormat).toBe('json');
    });

    it('should set parseState to invalid for invalid JSON', async () => {
      const invalidJson = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          unknownProperty: 'value',
        },
      });
      const file = createMockUidescFile(invalidJson);

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.parseState).toBe('invalid');
      expect(documentStore.document).toBeNull();
      expect(documentStore.parseErrors).not.toBeNull();
      expect(documentStore.parseErrors!.length).toBeGreaterThan(0);
    });

    it('should set parseState to invalid for malformed JSON', async () => {
      const malformedJson = '{ invalid json }';
      const file = createMockUidescFile(malformedJson);

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.parseState).toBe('invalid');
      expect(documentStore.parseErrors).not.toBeNull();
      expect(documentStore.parseErrors![0].type).toBe('syntax');
    });

    it('should set parseState to invalid for unknown format', async () => {
      const unknownFormat = 'hello world';
      const file = createMockUidescFile(unknownFormat);

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.parseState).toBe('invalid');
      expect(documentStore.detectedFormat).toBe('unknown');
      expect(documentStore.parseErrors![0].type).toBe('format');
    });
  });

  describe('parsed document content (FR-008, FR-014)', () => {
    it('should preserve colors in parsed document', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          colors: {
            Background: '#1a1a1a',
            Foreground: '#ffffff',
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      expect(documentStore.document?.['vstgui-ui-description'].colors).toEqual({
        Background: '#1a1a1a',
        Foreground: '#ffffff',
      });
    });

    it('should preserve fonts in parsed document', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            MainFont: {
              'font-name': 'Arial',
              size: '12',
            },
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      expect(documentStore.document?.['vstgui-ui-description'].fonts?.MainFont).toEqual({
        'font-name': 'Arial',
        size: '12',
      });
    });

    it('should preserve bitmaps in parsed document', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          bitmaps: {
            Knob: {
              path: 'images/knob.png',
            },
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      expect(documentStore.document?.['vstgui-ui-description'].bitmaps?.Knob.path).toBe(
        'images/knob.png'
      );
    });

    it('should preserve templates with nested views', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '800, 600',
              },
              children: {
                Button1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 10',
                    size: '100, 30',
                  },
                },
              },
            },
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      const templates = documentStore.document?.['vstgui-ui-description'].templates;
      expect(templates?.MainView.attributes.class).toBe('CViewContainer');
      expect(templates?.MainView.children?.Button1.attributes.class).toBe('CTextButton');
    });
  });

  describe('reset behavior', () => {
    it('should reset parsing state to initial values', async () => {
      const validJson = JSON.stringify({
        'vstgui-ui-description': { version: '1' },
      });
      const file = createMockUidescFile(validJson);

      await loadFile(file);
      expect(documentStore.parseState).toBe('valid');

      reset();

      expect(documentStore.parseState).toBe('idle');
      expect(documentStore.document).toBeNull();
      expect(documentStore.parseErrors).toBeNull();
      expect(documentStore.detectedFormat).toBeNull();
    });
  });

  describe('error details (FR-006, FR-007)', () => {
    it('should collect multiple validation errors', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            Font1: { size: '12' },
            Font2: { size: '14' },
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      expect(documentStore.parseState).toBe('invalid');
      expect(documentStore.parseErrors!.length).toBeGreaterThanOrEqual(2);
    });

    it('should include path in validation errors', async () => {
      const json = JSON.stringify({
        'vstgui-ui-description': {
          version: '1',
          fonts: {
            TestFont: { size: '12' },
          },
        },
      });
      const file = createMockUidescFile(json);

      await loadFile(file);

      expect(documentStore.parseState).toBe('invalid');
      expect(documentStore.parseErrors!.some((e) => e.path?.includes('TestFont'))).toBe(true);
    });
  });
});
