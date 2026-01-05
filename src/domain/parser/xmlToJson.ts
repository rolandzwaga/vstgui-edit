import type { VSTGUIUIDescription } from '../../types/uidesc';

/**
 * Result of XML to JSON conversion
 * FR-012: Includes path mapping for error location translation
 */
export interface XmlToJsonResult {
  json: VSTGUIUIDescription;
  pathMap: Map<string, Element>;
}

/**
 * Converts an XML DOM Document to JSON structure matching the uidesc schema.
 *
 * FR-010: Convert XML tree to JSON-equivalent structure
 * FR-012: Build path mapping for error location translation
 * FR-013: Produce identical structure from equivalent XML and JSON inputs
 *
 * @param doc - The parsed XML Document
 * @returns XmlToJsonResult with JSON structure and path mapping
 */
export function xmlToJson(doc: Document): XmlToJsonResult {
  const pathMap = new Map<string, Element>();
  const root = doc.documentElement;

  // Build the vstgui-ui-description object
  // Cast version to literal type '1' as that's the only valid version
  const version = (root.getAttribute('version') ?? '1') as '1';
  const uidesc: VSTGUIUIDescription['vstgui-ui-description'] = {
    version,
  };

  // Register root path
  pathMap.set('/vstgui-ui-description', root);

  // Process child elements
  for (const child of Array.from(root.children)) {
    const tagName = child.tagName.toLowerCase();

    switch (tagName) {
      case 'color':
        if (!uidesc.colors) uidesc.colors = {};
        processColor(child, uidesc.colors, pathMap);
        break;

      case 'font':
        if (!uidesc.fonts) uidesc.fonts = {};
        processFont(
          child,
          uidesc.fonts as unknown as Record<string, Record<string, string>>,
          pathMap
        );
        break;

      case 'bitmap':
        if (!uidesc.bitmaps) uidesc.bitmaps = {};
        processBitmap(
          child,
          uidesc.bitmaps as unknown as Record<string, Record<string, string>>,
          pathMap
        );
        break;

      case 'gradient':
        if (!uidesc.gradients) uidesc.gradients = {};
        processGradient(child, uidesc.gradients, pathMap);
        break;

      case 'control-tags':
        if (!uidesc['control-tags']) uidesc['control-tags'] = {};
        processControlTags(child, uidesc['control-tags'], pathMap);
        break;

      case 'variable':
        if (!uidesc.variables) uidesc.variables = {};
        processVariable(child, uidesc.variables, pathMap);
        break;

      case 'template':
        if (!uidesc.templates) uidesc.templates = {};
        processTemplate(child, uidesc.templates, pathMap);
        break;
    }
  }

  return {
    json: { 'vstgui-ui-description': uidesc },
    pathMap,
  };
}

/**
 * Process a color element
 */
function processColor(
  el: Element,
  colors: Record<string, string>,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  const rgba = el.getAttribute('rgba');

  if (name && rgba) {
    colors[name] = rgba;
    pathMap.set(`/vstgui-ui-description/colors/${name}`, el);
  }
}

/**
 * Process a font element
 */
function processFont(
  el: Element,
  fonts: Record<string, Record<string, string>>,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  if (!name) return;

  const fontDef: Record<string, string> = {};

  // Copy all attributes except 'name'
  for (const attr of Array.from(el.attributes)) {
    if (attr.name !== 'name') {
      fontDef[attr.name] = attr.value;
    }
  }

  fonts[name] = fontDef;
  pathMap.set(`/vstgui-ui-description/fonts/${name}`, el);
}

/**
 * Process a bitmap element
 */
function processBitmap(
  el: Element,
  bitmaps: Record<string, Record<string, string>>,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  if (!name) return;

  const bitmapDef: Record<string, string> = {};

  // Copy all attributes except 'name'
  for (const attr of Array.from(el.attributes)) {
    if (attr.name !== 'name') {
      bitmapDef[attr.name] = attr.value;
    }
  }

  bitmaps[name] = bitmapDef;
  pathMap.set(`/vstgui-ui-description/bitmaps/${name}`, el);
}

/**
 * Process a gradient element
 */
function processGradient(
  el: Element,
  gradients: Record<string, Array<{ rgba: string; start: string }>>,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  if (!name) return;

  const colorStops: Array<{ rgba: string; start: string }> = [];

  for (const stop of Array.from(el.children)) {
    if (stop.tagName.toLowerCase() === 'color-stop') {
      const rgba = stop.getAttribute('rgba');
      const start = stop.getAttribute('start');
      if (rgba && start) {
        colorStops.push({ rgba, start });
      }
    }
  }

  gradients[name] = colorStops;
  pathMap.set(`/vstgui-ui-description/gradients/${name}`, el);
}

/**
 * Process control-tags container element
 */
function processControlTags(
  el: Element,
  controlTags: Record<string, string>,
  pathMap: Map<string, Element>
): void {
  for (const child of Array.from(el.children)) {
    if (child.tagName.toLowerCase() === 'control-tag') {
      const name = child.getAttribute('name');
      const tag = child.getAttribute('tag');
      if (name && tag) {
        controlTags[name] = tag;
        pathMap.set(`/vstgui-ui-description/control-tags/${name}`, child);
      }
    }
  }
}

/**
 * Process a variable element
 */
function processVariable(
  el: Element,
  variables: Record<string, string>,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  const value = el.getAttribute('value');

  if (name && value) {
    variables[name] = value;
    pathMap.set(`/vstgui-ui-description/variables/${name}`, el);
  }
}

/**
 * Process a template element
 */
function processTemplate(
  el: Element,
  templates: Record<
    string,
    { attributes: Record<string, unknown>; children?: Record<string, unknown> }
  >,
  pathMap: Map<string, Element>
): void {
  const name = el.getAttribute('name');
  if (!name) return;

  const basePath = `/vstgui-ui-description/templates/${name}`;
  pathMap.set(basePath, el);

  // Build attributes (all except 'name')
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name !== 'name') {
      attributes[attr.name] = attr.value;
    }
  }

  const templateDef: { attributes: Record<string, unknown>; children?: Record<string, unknown> } = {
    attributes,
  };

  // Process child views
  const viewChildren = Array.from(el.children).filter(
    child => child.tagName.toLowerCase() === 'view'
  );

  if (viewChildren.length > 0) {
    templateDef.children = {};
    let viewIndex = 0;
    for (const viewChild of viewChildren) {
      const viewId = `view_${viewIndex++}`;
      processView(viewChild, templateDef.children, `${basePath}/children/${viewId}`, pathMap);
    }
  }

  templates[name] = templateDef;
}

/**
 * Process a view element recursively
 */
function processView(
  el: Element,
  container: Record<string, unknown>,
  basePath: string,
  pathMap: Map<string, Element>
): void {
  pathMap.set(basePath, el);

  // Build attributes
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    attributes[attr.name] = attr.value;
  }

  const viewDef: { attributes: Record<string, unknown>; children?: Record<string, unknown> } = {
    attributes,
  };

  // Process nested views
  const viewChildren = Array.from(el.children).filter(
    child => child.tagName.toLowerCase() === 'view'
  );

  if (viewChildren.length > 0) {
    viewDef.children = {};
    let viewIndex = 0;
    for (const viewChild of viewChildren) {
      const viewId = `view_${viewIndex++}`;
      processView(viewChild, viewDef.children, `${basePath}/children/${viewId}`, pathMap);
    }
  }

  // Use element position as key
  const key = basePath.split('/').pop() ?? 'view';
  container[key] = viewDef;
}
