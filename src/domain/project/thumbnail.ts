/**
 * Thumbnail Generation
 *
 * Generates preview thumbnails for projects by rendering the first template
 * to an off-screen canvas and scaling to 200x150 pixels.
 */

import { THUMBNAIL } from './types';

/**
 * View data needed for thumbnail rendering.
 */
export interface ThumbnailView {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
}

/**
 * Template data needed for thumbnail generation.
 */
export interface ThumbnailTemplate {
  width: number;
  height: number;
  views: ThumbnailView[];
  backgroundColor?: string;
}

/**
 * Result of thumbnail generation.
 */
export interface ThumbnailResult {
  success: boolean;
  dataUrl: string | null;
  error?: string;
}

/**
 * Category colors for rendering view rectangles.
 */
const CATEGORY_COLORS: Record<string, string> = {
  container: '#4a90d9',
  control: '#7b68ee',
  display: '#2eb872',
  custom: '#e67e22',
};

/**
 * Determines the category of a VSTGUI class.
 */
function getViewCategory(className: string): string {
  const containerClasses = [
    'CViewContainer',
    'CScrollView',
    'CRowColumnView',
    'CLayeredViewContainer',
    'CSplitView',
    'UIViewSwitchContainer',
    'CGradientView',
  ];
  const controlClasses = [
    'COnOffButton',
    'CTextButton',
    'CKickButton',
    'CCheckBox',
    'CKnob',
    'CAnimKnob',
    'CSlider',
    'CVerticalSlider',
    'CHorizontalSlider',
    'CVerticalSwitch',
    'CHorizontalSwitch',
    'COptionMenu',
    'CXYPad',
    'CRockerSwitch',
    'CSegmentButton',
  ];
  const displayClasses = [
    'CTextLabel',
    'CTextEdit',
    'CParamDisplay',
    'CVuMeter',
    'CMovieBitmap',
    'CMovieButton',
  ];

  if (containerClasses.includes(className)) return 'container';
  if (controlClasses.includes(className)) return 'control';
  if (displayClasses.includes(className)) return 'display';
  return 'custom';
}

/**
 * Extracts view data from a parsed uidesc document.
 */
function extractViewsFromNode(
  node: Record<string, unknown>,
  offsetX: number,
  offsetY: number
): ThumbnailView[] {
  const views: ThumbnailView[] = [];
  const attrs = node.attributes as Record<string, string> | undefined;

  if (!attrs) return views;

  // Parse origin and size
  const origin = attrs.origin?.split(',').map(s => Number.parseInt(s.trim(), 10)) ?? [0, 0];
  const size = attrs.size?.split(',').map(s => Number.parseInt(s.trim(), 10)) ?? [100, 100];
  const className = attrs.class ?? 'CView';

  const x = offsetX + (origin[0] ?? 0);
  const y = offsetY + (origin[1] ?? 0);
  const width = size[0] ?? 100;
  const height = size[1] ?? 100;

  views.push({
    x,
    y,
    width,
    height,
    class: className,
  });

  // Process children recursively
  const children = node.children as Record<string, Record<string, unknown>> | undefined;
  if (children) {
    for (const child of Object.values(children)) {
      views.push(...extractViewsFromNode(child, x, y));
    }
  }

  return views;
}

/**
 * Extracts the first template from a parsed uidesc document.
 */
export function extractFirstTemplate(document: Record<string, unknown>): ThumbnailTemplate | null {
  const uidesc = document['vstgui-ui-description'] as Record<string, unknown> | undefined;
  if (!uidesc) return null;

  const templates = uidesc.templates as Record<string, Record<string, unknown>> | undefined;
  if (!templates) return null;

  const templateNames = Object.keys(templates);
  if (templateNames.length === 0) return null;

  const firstTemplateName = templateNames[0];
  const template = templates[firstTemplateName];
  if (!template) return null;

  const attrs = template.attributes as Record<string, string> | undefined;
  if (!attrs) return null;

  // Parse template size
  const size = attrs.size?.split(',').map(s => Number.parseInt(s.trim(), 10)) ?? [400, 300];
  const width = size[0] ?? 400;
  const height = size[1] ?? 300;

  // Extract background color
  const backgroundColor = attrs['background-color'];

  // Extract all views
  const views = extractViewsFromNode(template, 0, 0);

  return {
    width,
    height,
    views,
    backgroundColor,
  };
}

/**
 * Resolves a VSTGUI color reference to a hex color.
 */
function resolveBackgroundColor(colorRef: string | undefined): string {
  if (!colorRef) return '#2d2d2d';

  // Handle predefined color references
  if (colorRef.startsWith('~')) {
    const colorName = colorRef.slice(1).trim();
    const predefinedColors: Record<string, string> = {
      BlackCColor: '#000000',
      WhiteCColor: '#ffffff',
      RedCColor: '#ff0000',
      GreenCColor: '#00ff00',
      BlueCColor: '#0000ff',
      YellowCColor: '#ffff00',
      TransparentCColor: 'transparent',
    };
    return predefinedColors[colorName] ?? '#2d2d2d';
  }

  // Handle hex colors (e.g., "#ff5500ff")
  if (colorRef.startsWith('#')) {
    return colorRef.slice(0, 7); // Remove alpha if present
  }

  return '#2d2d2d';
}

/**
 * Generates a thumbnail data URL for a template.
 *
 * Renders views as colored rectangles scaled to fit the thumbnail dimensions.
 *
 * @param template - Template data to render
 * @returns PNG data URL
 */
export function renderThumbnail(template: ThumbnailTemplate): string {
  // Create off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL.WIDTH;
  canvas.height = THUMBNAIL.HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return createPlaceholderThumbnail();
  }

  // Calculate scale to fit template in thumbnail while preserving aspect ratio
  const scaleX = THUMBNAIL.WIDTH / template.width;
  const scaleY = THUMBNAIL.HEIGHT / template.height;
  const scale = Math.min(scaleX, scaleY);

  // Center the template in the thumbnail
  const offsetX = (THUMBNAIL.WIDTH - template.width * scale) / 2;
  const offsetY = (THUMBNAIL.HEIGHT - template.height * scale) / 2;

  // Draw background
  const bgColor = resolveBackgroundColor(template.backgroundColor);
  ctx.fillStyle = bgColor === 'transparent' ? '#2d2d2d' : bgColor;
  ctx.fillRect(0, 0, THUMBNAIL.WIDTH, THUMBNAIL.HEIGHT);

  // Draw template bounds
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.strokeRect(offsetX, offsetY, template.width * scale, template.height * scale);

  // Draw views as colored rectangles
  for (const view of template.views) {
    const category = getViewCategory(view.class);
    const color = CATEGORY_COLORS[category] ?? '#888888';

    const x = offsetX + view.x * scale;
    const y = offsetY + view.y * scale;
    const width = view.width * scale;
    const height = view.height * scale;

    // Fill with semi-transparent color
    ctx.fillStyle = `${color}40`; // 25% opacity
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Creates a placeholder thumbnail for projects without templates.
 *
 * @returns PNG data URL
 */
export function createPlaceholderThumbnail(): string {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL.WIDTH;
  canvas.height = THUMBNAIL.HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Return a minimal 1x1 transparent PNG as fallback
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }

  // Draw dark background
  ctx.fillStyle = '#3d3d3d';
  ctx.fillRect(0, 0, THUMBNAIL.WIDTH, THUMBNAIL.HEIGHT);

  // Draw "No Template" text
  ctx.fillStyle = '#888888';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No Template', THUMBNAIL.WIDTH / 2, THUMBNAIL.HEIGHT / 2);

  return canvas.toDataURL('image/png');
}

/**
 * Generates a thumbnail for a parsed uidesc document.
 *
 * @param document - Parsed uidesc document
 * @returns Result with data URL or error
 */
export function generateThumbnail(document: Record<string, unknown>): ThumbnailResult {
  try {
    const template = extractFirstTemplate(document);

    if (!template) {
      return {
        success: true,
        dataUrl: createPlaceholderThumbnail(),
      };
    }

    const dataUrl = renderThumbnail(template);
    return {
      success: true,
      dataUrl,
    };
  } catch (error) {
    return {
      success: false,
      dataUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error generating thumbnail',
    };
  }
}
