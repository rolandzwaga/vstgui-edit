/**
 * Thumbnail generation tests
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  extractFirstTemplate,
  generateThumbnail,
  createPlaceholderThumbnail,
  renderThumbnail,
  type ThumbnailTemplate,
} from '../thumbnail';
import { THUMBNAIL } from '../types';

describe('thumbnail', () => {
  // Mock canvas API
  let mockContext: {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    fillRect: ReturnType<typeof vi.fn>;
    strokeRect: ReturnType<typeof vi.fn>;
    fillText: ReturnType<typeof vi.fn>;
  };
  let mockCanvas: {
    width: number;
    height: number;
    getContext: ReturnType<typeof vi.fn>;
    toDataURL: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockThumbnail'),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractFirstTemplate', () => {
    it('returns null for empty document', () => {
      const result = extractFirstTemplate({});
      expect(result).toBeNull();
    });

    it('returns null for document without templates', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          colors: {},
        },
      };
      const result = extractFirstTemplate(doc);
      expect(result).toBeNull();
    });

    it('extracts first template with size', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '800, 600',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result).not.toBeNull();
      expect(result?.width).toBe(800);
      expect(result?.height).toBe(600);
    });

    it('extracts views from template', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
              children: {
                button1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                    size: '100, 30',
                  },
                },
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.views).toHaveLength(2); // Container + button
      expect(result?.views[1]).toMatchObject({
        x: 10,
        y: 20,
        width: 100,
        height: 30,
        class: 'CTextButton',
      });
    });

    it('extracts background color', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                size: '400, 300',
                'background-color': '#ff5500ff',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.backgroundColor).toBe('#ff5500ff');
    });

    it('handles nested children recursively', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                origin: '0, 0',
                size: '400, 300',
              },
              children: {
                inner: {
                  attributes: {
                    class: 'CViewContainer',
                    origin: '50, 50',
                    size: '200, 200',
                  },
                  children: {
                    deepChild: {
                      attributes: {
                        class: 'CKnob',
                        origin: '20, 20',
                        size: '40, 40',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      // Root, inner container, deep child
      expect(result?.views).toHaveLength(3);
      // Deep child position should be accumulated: 50+20=70
      expect(result?.views[2]).toMatchObject({
        x: 70,
        y: 70,
        width: 40,
        height: 40,
        class: 'CKnob',
      });
    });

    it('uses default size when not specified', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.width).toBe(400);
      expect(result?.height).toBe(300);
    });
  });

  describe('renderThumbnail', () => {
    it('creates canvas with correct dimensions', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [],
      };

      renderThumbnail(template);

      expect(mockCanvas.width).toBe(THUMBNAIL.WIDTH);
      expect(mockCanvas.height).toBe(THUMBNAIL.HEIGHT);
    });

    it('draws background', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [],
        backgroundColor: '#1a1a1a',
      };

      renderThumbnail(template);

      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, THUMBNAIL.WIDTH, THUMBNAIL.HEIGHT);
    });

    it('draws template bounds', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [],
      };

      renderThumbnail(template);

      // strokeRect called for template bounds
      expect(mockContext.strokeRect).toHaveBeenCalled();
    });

    it('draws views as colored rectangles', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [
          { x: 0, y: 0, width: 400, height: 300, class: 'CViewContainer' },
          { x: 10, y: 10, width: 100, height: 30, class: 'CTextButton' },
        ],
      };

      renderThumbnail(template);

      // fillRect called for background + each view fill
      // strokeRect called for template bounds + each view border
      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThanOrEqual(3);
      expect(mockContext.strokeRect.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('returns data URL', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [],
      };

      const result = renderThumbnail(template);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(result).toBe('data:image/png;base64,mockThumbnail');
    });

    it('handles predefined color references', () => {
      const template: ThumbnailTemplate = {
        width: 400,
        height: 300,
        views: [],
        backgroundColor: '~ BlackCColor',
      };

      renderThumbnail(template);

      // Should resolve to black
      expect(mockContext.fillStyle).toBe('#000000');
    });
  });

  describe('createPlaceholderThumbnail', () => {
    it('creates canvas with correct dimensions', () => {
      createPlaceholderThumbnail();

      expect(mockCanvas.width).toBe(THUMBNAIL.WIDTH);
      expect(mockCanvas.height).toBe(THUMBNAIL.HEIGHT);
    });

    it('draws background and text', () => {
      createPlaceholderThumbnail();

      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalledWith(
        'No Template',
        THUMBNAIL.WIDTH / 2,
        THUMBNAIL.HEIGHT / 2
      );
    });

    it('returns data URL', () => {
      const result = createPlaceholderThumbnail();

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(result).toBe('data:image/png;base64,mockThumbnail');
    });

    it('returns fallback when canvas context unavailable', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = createPlaceholderThumbnail();

      // Should return minimal transparent PNG
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('generateThumbnail', () => {
    it('generates thumbnail for document with templates', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                size: '400, 300',
              },
            },
          },
        },
      };

      const result = generateThumbnail(doc);

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBe('data:image/png;base64,mockThumbnail');
      expect(result.error).toBeUndefined();
    });

    it('generates placeholder for document without templates', () => {
      const doc = {
        'vstgui-ui-description': {
          version: '1',
          colors: {},
        },
      };

      const result = generateThumbnail(doc);

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBe('data:image/png;base64,mockThumbnail');
    });

    it('handles empty document', () => {
      const result = generateThumbnail({});

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBe('data:image/png;base64,mockThumbnail');
    });

    it('returns error on exception', () => {
      // Force an error by making getContext throw
      mockCanvas.getContext.mockImplementation(() => {
        throw new Error('Canvas not supported');
      });

      const doc = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            myView: {
              attributes: {
                class: 'CViewContainer',
                size: '400, 300',
              },
            },
          },
        },
      };

      const result = generateThumbnail(doc);

      expect(result.success).toBe(false);
      expect(result.dataUrl).toBeNull();
      expect(result.error).toBe('Canvas not supported');
    });
  });

  describe('view category detection', () => {
    it('categorizes container views correctly', () => {
      const doc = {
        'vstgui-ui-description': {
          templates: {
            view: {
              attributes: {
                class: 'CViewContainer',
                size: '100, 100',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.views[0].class).toBe('CViewContainer');
    });

    it('categorizes control views correctly', () => {
      const doc = {
        'vstgui-ui-description': {
          templates: {
            view: {
              attributes: {
                class: 'CKnob',
                size: '50, 50',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.views[0].class).toBe('CKnob');
    });

    it('categorizes display views correctly', () => {
      const doc = {
        'vstgui-ui-description': {
          templates: {
            view: {
              attributes: {
                class: 'CTextLabel',
                size: '100, 20',
              },
            },
          },
        },
      };

      const result = extractFirstTemplate(doc);
      expect(result?.views[0].class).toBe('CTextLabel');
    });
  });
});
