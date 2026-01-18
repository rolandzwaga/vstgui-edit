import { describe, expect, test } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import type { Bitmap } from '../../project/types';
import {
  getBitmapPath,
  extractBitmapNamesFromDocument,
  extractBitmapInfoFromDocument,
  findMissingBitmaps,
  findMissingBitmapInfos,
  matchUploadedFile,
  matchUploadedFiles,
  deriveBasePath,
  detectDuplicateBitmapsInXml,
  detectDuplicateBitmapsInJson,
  detectDuplicateBitmaps,
  type MissingBitmapInfo,
} from '../missingBitmaps';

// Helper to create minimal stored bitmap for testing
function createStoredBitmap(name: string): Bitmap {
  return {
    id: `bitmap-${name}`,
    projectId: 'project-1',
    name,
    blob: new Blob(['test'], { type: 'image/png' }),
    mimeType: 'image/png',
    width: 100,
    height: 100,
    size: 1000,
    addedAt: '2025-01-01T00:00:00Z',
  };
}

// Helper to create minimal uidesc document
function createDocument(bitmaps: Record<string, string | { path: string }>): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      bitmaps,
      templates: {},
    },
  };
}

describe('missingBitmaps', () => {
  describe('getBitmapPath', () => {
    test('returns string path directly', () => {
      expect(getBitmapPath('resources/knob.png')).toBe('resources/knob.png');
    });

    test('extracts path from object definition', () => {
      expect(getBitmapPath({ path: 'images/button.png' })).toBe('images/button.png');
    });

    test('returns empty string for object without path', () => {
      expect(getBitmapPath({} as { path: string })).toBe('');
    });
  });

  describe('extractBitmapNamesFromDocument', () => {
    test('returns empty array for null document', () => {
      expect(extractBitmapNamesFromDocument(null)).toEqual([]);
    });

    test('returns empty array for document without bitmaps', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': { version: '1', templates: {} },
      };
      expect(extractBitmapNamesFromDocument(doc)).toEqual([]);
    });

    test('extracts bitmap names from document', () => {
      const doc = createDocument({
        knob: 'resources/knob.png',
        button: { path: 'images/button.png' },
      });
      const names = extractBitmapNamesFromDocument(doc);
      expect(names).toContain('knob');
      expect(names).toContain('button');
      expect(names).toHaveLength(2);
    });
  });

  describe('extractBitmapInfoFromDocument', () => {
    test('returns empty array for null document', () => {
      expect(extractBitmapInfoFromDocument(null)).toEqual([]);
    });

    test('extracts bitmap info with name and path', () => {
      const doc = createDocument({
        knob: 'resources/knob.png',
        button: { path: 'images/button.png' },
      });
      const infos = extractBitmapInfoFromDocument(doc);

      expect(infos).toContainEqual({ name: 'knob', path: 'resources/knob.png' });
      expect(infos).toContainEqual({ name: 'button', path: 'images/button.png' });
    });
  });

  describe('findMissingBitmaps', () => {
    test('returns empty array when all bitmaps are stored', () => {
      const bitmapNames = ['knob', 'button'];
      const storedBitmaps = [createStoredBitmap('knob'), createStoredBitmap('button')];

      expect(findMissingBitmaps(bitmapNames, storedBitmaps)).toEqual([]);
    });

    test('returns missing bitmap names', () => {
      const bitmapNames = ['knob', 'button', 'slider'];
      const storedBitmaps = [createStoredBitmap('knob')];

      const missing = findMissingBitmaps(bitmapNames, storedBitmaps);
      expect(missing).toContain('button');
      expect(missing).toContain('slider');
      expect(missing).not.toContain('knob');
    });

    test('returns all names when no bitmaps are stored', () => {
      const bitmapNames = ['knob', 'button'];
      expect(findMissingBitmaps(bitmapNames, [])).toEqual(['knob', 'button']);
    });
  });

  describe('findMissingBitmapInfos', () => {
    test('returns missing bitmap infos with paths', () => {
      const bitmapInfos: MissingBitmapInfo[] = [
        { name: 'knob', path: 'resources/knob.png' },
        { name: 'button', path: 'images/button.png' },
      ];
      const storedBitmaps = [createStoredBitmap('knob')];

      const missing = findMissingBitmapInfos(bitmapInfos, storedBitmaps);
      expect(missing).toEqual([{ name: 'button', path: 'images/button.png' }]);
    });
  });

  describe('matchUploadedFile', () => {
    const missingBitmaps: MissingBitmapInfo[] = [
      { name: 'myKnob', path: 'resources/knob.png' },
      { name: 'playButton', path: 'images/buttons/button.png' },
    ];

    test('returns null when no match found', () => {
      expect(matchUploadedFile('slider.png', missingBitmaps)).toBeNull();
    });

    test('matches by filename from path', () => {
      expect(matchUploadedFile('knob.png', missingBitmaps)).toBe('myKnob');
      expect(matchUploadedFile('button.png', missingBitmaps)).toBe('playButton');
    });

    test('matches filename regardless of upload path', () => {
      expect(matchUploadedFile('C:\\Downloads\\knob.png', missingBitmaps)).toBe('myKnob');
    });

    test('returns null for partial filename match', () => {
      expect(matchUploadedFile('knob', missingBitmaps)).toBeNull();
      expect(matchUploadedFile('my-knob.png', missingBitmaps)).toBeNull();
    });
  });

  describe('matchUploadedFiles', () => {
    test('returns empty map when no files match', () => {
      const files = [new File([''], 'slider.png')];
      const missingBitmaps: MissingBitmapInfo[] = [{ name: 'knob', path: 'resources/knob.png' }];

      const matches = matchUploadedFiles(files, missingBitmaps);
      expect(matches.size).toBe(0);
    });

    test('matches multiple files to bitmap names', () => {
      const knobFile = new File(['knob'], 'knob.png');
      const buttonFile = new File(['button'], 'button.png');
      const files = [knobFile, buttonFile];
      const missingBitmaps: MissingBitmapInfo[] = [
        { name: 'myKnob', path: 'resources/knob.png' },
        { name: 'myButton', path: 'images/button.png' },
      ];

      const matches = matchUploadedFiles(files, missingBitmaps);
      expect(matches.get('myKnob')).toBe(knobFile);
      expect(matches.get('myButton')).toBe(buttonFile);
    });

    test('prevents duplicate matches for same path filename', () => {
      const file1 = new File(['1'], 'knob.png');
      const file2 = new File(['2'], 'knob.png');
      const files = [file1, file2];
      const missingBitmaps: MissingBitmapInfo[] = [{ name: 'knob', path: 'resources/knob.png' }];

      const matches = matchUploadedFiles(files, missingBitmaps);
      expect(matches.size).toBe(1);
      expect(matches.get('knob')).toBe(file1);
    });
  });

  describe('deriveBasePath', () => {
    test('returns "bitmaps" for null document', () => {
      expect(deriveBasePath(null)).toBe('bitmaps');
    });

    test('returns "bitmaps" for document without bitmaps section', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': { version: '1', templates: {} },
      };
      expect(deriveBasePath(doc)).toBe('bitmaps');
    });

    test('returns "bitmaps" for empty bitmaps section', () => {
      const doc = createDocument({});
      expect(deriveBasePath(doc)).toBe('bitmaps');
    });

    test('returns directory from first bitmap with a path', () => {
      const doc = createDocument({
        knob: 'resources/knob.png',
        button: 'images/button.png',
      });
      expect(deriveBasePath(doc)).toBe('resources');
    });

    test('returns directory from object-style bitmap definition', () => {
      const doc = createDocument({
        knob: { path: 'assets/controls/knob.png' },
      });
      expect(deriveBasePath(doc)).toBe('assets/controls');
    });

    test('returns "bitmaps" when all bitmaps have no directory', () => {
      const doc = createDocument({
        knob: 'knob.png',
        button: 'button.png',
      });
      expect(deriveBasePath(doc)).toBe('bitmaps');
    });

    test('skips bitmaps without directory and finds first with directory', () => {
      const doc = createDocument({
        knob: 'knob.png',
        button: 'images/button.png',
      });
      expect(deriveBasePath(doc)).toBe('images');
    });

    test('handles Windows-style paths', () => {
      const doc = createDocument({
        knob: 'resources\\controls\\knob.png',
      });
      expect(deriveBasePath(doc)).toBe('resources/controls');
    });
  });

  describe('detectDuplicateBitmapsInXml', () => {
    test('returns empty array when no duplicates', () => {
      const xml = `
        <bitmaps>
          <bitmap name="knob" path="knob.png"/>
          <bitmap name="button" path="button.png"/>
        </bitmaps>
      `;
      expect(detectDuplicateBitmapsInXml(xml)).toEqual([]);
    });

    test('detects duplicate bitmap names', () => {
      const xml = `
        <bitmaps>
          <bitmap name="knob" path="knob1.png"/>
          <bitmap name="knob" path="knob2.png"/>
          <bitmap name="button" path="button.png"/>
        </bitmaps>
      `;
      const duplicates = detectDuplicateBitmapsInXml(xml);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knob');
      expect(duplicates[0].count).toBe(2);
      expect(duplicates[0].paths).toContain('knob1.png');
      expect(duplicates[0].paths).toContain('knob2.png');
    });

    test('handles multiple duplicates', () => {
      const xml = `
        <bitmaps>
          <bitmap name="a" path="a1.png"/>
          <bitmap name="a" path="a2.png"/>
          <bitmap name="b" path="b1.png"/>
          <bitmap name="b" path="b2.png"/>
          <bitmap name="b" path="b3.png"/>
        </bitmaps>
      `;
      const duplicates = detectDuplicateBitmapsInXml(xml);

      expect(duplicates).toHaveLength(2);
      const adup = duplicates.find((d) => d.name === 'a');
      const bdup = duplicates.find((d) => d.name === 'b');
      expect(adup?.count).toBe(2);
      expect(bdup?.count).toBe(3);
    });

    test('handles self-closing and regular bitmap tags', () => {
      const xml = `
        <bitmaps>
          <bitmap name="knob" path="knob1.png"/>
          <bitmap name="knob" path="knob2.png"></bitmap>
        </bitmaps>
      `;
      const duplicates = detectDuplicateBitmapsInXml(xml);
      expect(duplicates[0].count).toBe(2);
    });
  });

  describe('detectDuplicateBitmapsInJson', () => {
    test('returns empty array when no bitmaps section', () => {
      const json = '{ "vstgui-ui-description": { "version": "1" } }';
      expect(detectDuplicateBitmapsInJson(json)).toEqual([]);
    });

    test('returns empty array when no duplicates', () => {
      const json = `{
        "vstgui-ui-description": {
          "bitmaps": {
            "knob": "knob.png",
            "button": "button.png"
          }
        }
      }`;
      expect(detectDuplicateBitmapsInJson(json)).toEqual([]);
    });

    test('detects duplicate bitmap names with string paths', () => {
      const json = `{
        "bitmaps": {
          "knob": "knob1.png",
          "knob": "knob2.png"
        }
      }`;
      const duplicates = detectDuplicateBitmapsInJson(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knob');
      expect(duplicates[0].count).toBe(2);
    });

    test('detects duplicates with object paths', () => {
      const json = `{
        "bitmaps": {
          "knob": { "path": "knob1.png" },
          "knob": { "path": "knob2.png" }
        }
      }`;
      const duplicates = detectDuplicateBitmapsInJson(json);
      expect(duplicates[0].count).toBe(2);
    });

    test('ignores internal properties like path and nineparttiledoffsets', () => {
      const json = `{
        "bitmaps": {
          "knob": { "path": "knob.png", "nineparttiledoffsets": "1,2,3,4" }
        }
      }`;
      expect(detectDuplicateBitmapsInJson(json)).toEqual([]);
    });
  });

  describe('detectDuplicateBitmaps', () => {
    test('detects XML format and processes accordingly', () => {
      const xml = `<?xml version="1.0"?>
        <bitmaps>
          <bitmap name="knob" path="k1.png"/>
          <bitmap name="knob" path="k2.png"/>
        </bitmaps>`;
      const duplicates = detectDuplicateBitmaps(xml);
      expect(duplicates).toHaveLength(1);
    });

    test('detects JSON format and processes accordingly', () => {
      const json = `{
        "bitmaps": {
          "knob": "k1.png",
          "knob": "k2.png"
        }
      }`;
      const duplicates = detectDuplicateBitmaps(json);
      expect(duplicates).toHaveLength(1);
    });

    test('returns empty array for unknown format', () => {
      expect(detectDuplicateBitmaps('random content')).toEqual([]);
      expect(detectDuplicateBitmaps('')).toEqual([]);
    });

    test('handles whitespace before content', () => {
      const xml = `
        <bitmaps><bitmap name="a" path="1"/><bitmap name="a" path="2"/></bitmaps>`;
      expect(detectDuplicateBitmaps(xml)).toHaveLength(1);
    });
  });
});
