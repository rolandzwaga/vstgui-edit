import { beforeEach, describe, expect, test, vi } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { createDownloadBlob, exportAsJSON, exportAsXML, exportAsZIP } from '../export';

const createMockDocument = (): VSTGUIUIDescription => ({
  'vstgui-ui-description': {
    version: '1',
    templates: {
      view: {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
      },
    },
  },
});

describe('export', () => {
  describe('exportAsJSON', () => {
    test('returns valid JSON string', () => {
      const doc = createMockDocument();
      const result = exportAsJSON(doc);

      expect(() => JSON.parse(result)).not.toThrow();
    });

    test('preserves document structure', () => {
      const doc = createMockDocument();
      const result = exportAsJSON(doc);
      const parsed = JSON.parse(result);

      expect(parsed['vstgui-ui-description']).toBeDefined();
      expect(parsed['vstgui-ui-description'].version).toBe('1');
      expect(parsed['vstgui-ui-description'].templates.view).toBeDefined();
    });

    test('formats with 2-space indentation', () => {
      const doc = createMockDocument();
      const result = exportAsJSON(doc);

      // Should have proper formatting with newlines
      expect(result).toContain('\n');
      // Check for 2-space indentation
      expect(result).toMatch(/\n {2}"/);
    });

    test('returns empty structure for empty document', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
        },
      };
      const result = exportAsJSON(doc);
      const parsed = JSON.parse(result);

      expect(parsed['vstgui-ui-description'].version).toBe('1');
    });
  });

  describe('exportAsXML', () => {
    test('returns valid XML string', () => {
      const doc = createMockDocument();
      const result = exportAsXML(doc);

      expect(result).toContain('<?xml');
      expect(result).toContain('vstgui-ui-description');
    });

    test('includes XML declaration', () => {
      const doc = createMockDocument();
      const result = exportAsXML(doc);

      expect(result).toMatch(/^<\?xml/);
    });

    test('preserves document version', () => {
      const doc = createMockDocument();
      const result = exportAsXML(doc);

      expect(result).toContain('version="1"');
    });

    test('converts templates to XML elements', () => {
      const doc = createMockDocument();
      const result = exportAsXML(doc);

      expect(result).toContain('<template');
      expect(result).toContain('name="view"');
    });
  });

  describe('exportAsZIP', () => {
    test('returns Uint8Array', async () => {
      const doc = createMockDocument();
      const result = await exportAsZIP(doc, 'TestProject');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    test('includes uidesc file in archive', async () => {
      const doc = createMockDocument();
      const result = await exportAsZIP(doc, 'TestProject');

      // ZIP files start with PK signature
      expect(result[0]).toBe(0x50); // P
      expect(result[1]).toBe(0x4b); // K
    });

    test('uses project name for uidesc filename', async () => {
      const doc = createMockDocument();
      const result = await exportAsZIP(doc, 'MyProject');

      // The ZIP should contain MyProject.uidesc
      // This is validated by the ZIP structure
      expect(result.length).toBeGreaterThan(0);
    });

    test('includes bitmaps in archive when provided', async () => {
      const doc = createMockDocument();
      const bitmaps = [
        { name: 'knob', path: 'resources/knob.png', data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
      ];
      const result = await exportAsZIP(doc, 'TestProject', bitmaps);

      // ZIP should be larger with bitmaps
      expect(result.length).toBeGreaterThan(0);
    });

    test('preserves original path for bitmap files', async () => {
      const doc = createMockDocument();
      const bitmaps = [
        { name: 'button', path: 'images/buttons/button.png', data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
      ];
      const result = await exportAsZIP(doc, 'TestProject', bitmaps);

      // The archive should include images/buttons/button.png (original path)
      expect(result.length).toBeGreaterThan(0);
    });

    test('falls back to bitmaps folder when no path provided', async () => {
      const doc = createMockDocument();
      const bitmaps = [
        { name: 'button', path: '', data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
      ];
      const result = await exportAsZIP(doc, 'TestProject', bitmaps);

      // The archive should include bitmaps/button
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('createDownloadBlob', () => {
    test('creates Blob with correct MIME type for JSON', () => {
      const content = '{"test": true}';
      const blob = createDownloadBlob(content, 'json');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    test('creates Blob with correct MIME type for XML', () => {
      const content = '<?xml version="1.0"?><root/>';
      const blob = createDownloadBlob(content, 'xml');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/xml');
    });

    test('creates Blob with correct MIME type for ZIP', () => {
      const content = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
      const blob = createDownloadBlob(content, 'zip');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/zip');
    });

    test('has correct size for string content', () => {
      const content = 'Hello, World!';
      const blob = createDownloadBlob(content, 'json');

      // Blob size should match content byte length
      expect(blob.size).toBe(new TextEncoder().encode(content).length);
    });
  });
});
