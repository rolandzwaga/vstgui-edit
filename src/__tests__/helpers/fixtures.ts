import type { RenderableView, ViewCategory } from '../../types/canvas';
import type {
  BitmapsDefinition,
  ColorsDefinition,
  FontsDefinition,
  TemplatesDefinition,
  ViewAttributes,
  ViewDefinition,
  VSTGUIUIDescription,
} from '../../types/uidesc';

/**
 * Creates a mock view definition with sensible defaults.
 *
 * @example
 * ```ts
 * const view = createMockView({ class: 'CTextLabel', title: 'Hello' });
 * ```
 */
export function createMockView(
  overrides: Partial<ViewAttributes> = {},
  children?: Record<string, ViewDefinition>
): ViewDefinition {
  return {
    attributes: {
      class: 'CView',
      origin: '0, 0',
      size: '100, 100',
      ...overrides,
    },
    ...(children && { children }),
  };
}

/**
 * Creates a mock CViewContainer with optional children.
 *
 * @example
 * ```ts
 * const container = createMockContainer(
 *   { size: '400, 300' },
 *   { child1: createMockView({ class: 'CTextLabel' }) }
 * );
 * ```
 */
export function createMockContainer(
  overrides: Partial<ViewAttributes> = {},
  children?: Record<string, ViewDefinition>
): ViewDefinition {
  return createMockView(
    {
      class: 'CViewContainer',
      'background-color': '#00000000',
      ...overrides,
    },
    children
  );
}

/**
 * Creates a minimal valid VSTGUIUIDescription document.
 *
 * @example
 * ```ts
 * const doc = createMockDocument();
 *
 * // With custom templates
 * const doc = createMockDocument({
 *   templates: {
 *     MainView: createMockContainer({ size: '800, 600' }),
 *   },
 * });
 * ```
 */
export function createMockDocument(
  overrides: {
    colors?: ColorsDefinition;
    fonts?: FontsDefinition;
    bitmaps?: BitmapsDefinition;
    templates?: TemplatesDefinition;
  } = {}
): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      colors: overrides.colors,
      fonts: overrides.fonts,
      bitmaps: overrides.bitmaps,
      templates: overrides.templates ?? {
        view: createMockView(),
      },
    },
  };
}

/**
 * Creates a mock uidesc JSON string for testing parsing.
 *
 * @example
 * ```ts
 * const json = createMockUidescJson();
 * const result = parseUidesc(json);
 * ```
 */
export function createMockUidescJson(
  overrides: Parameters<typeof createMockDocument>[0] = {}
): string {
  return JSON.stringify(createMockDocument(overrides), null, 2);
}

/**
 * Creates a mock uidesc XML string for testing parsing.
 *
 * @example
 * ```ts
 * const xml = createMockUidescXml();
 * const result = parseUidesc(xml);
 * ```
 */
export function createMockUidescXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <template name="view" class="CView" origin="0, 0" size="100, 100" />
</vstgui-ui-description>`;
}

/**
 * Creates a mock File object with uidesc content.
 *
 * @example
 * ```ts
 * const file = createMockUidescFile('{"vstgui-ui-description": {...}}');
 * await loadFile(file);
 * ```
 */
export function createMockUidescFile(
  content: string = createMockUidescJson(),
  filename: string = 'test.uidesc'
): File {
  return new File([content], filename, { type: 'text/plain' });
}

export function createMockRenderableView(
  overrides: Partial<RenderableView> = {}
): RenderableView {
  const absoluteX = overrides.absoluteX ?? 0;
  const absoluteY = overrides.absoluteY ?? 0;
  return {
    id: 'view-0',
    absoluteX,
    absoluteY,
    relativeX: overrides.relativeX ?? absoluteX,
    relativeY: overrides.relativeY ?? absoluteY,
    width: 100,
    height: 100,
    className: 'CView',
    category: 'control' as ViewCategory,
    zIndex: 0,
    parentId: null,
    ...overrides,
  };
}
