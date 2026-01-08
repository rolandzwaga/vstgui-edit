import type { FontDefinition, ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatAttributes(attrs: Record<string, string | unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      parts.push(`${key}="${escapeXml(String(value))}"`);
    }
  }
  return parts.join(' ');
}

function serializeView(view: ViewNode, indent: string): string {
  const lines: string[] = [];
  const attrs = formatAttributes(view.attributes);

  if (view.children && Object.keys(view.children).length > 0) {
    lines.push(`${indent}<view ${attrs}>`);
    for (const child of Object.values(view.children)) {
      lines.push(serializeView(child, indent + '  '));
    }
    lines.push(`${indent}</view>`);
  } else {
    lines.push(`${indent}<view ${attrs}/>`);
  }

  return lines.join('\n');
}

export function serializeToXml(doc: VSTGUIUIDescription): string {
  const lines: string[] = [];
  const vstgui = doc['vstgui-ui-description'];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(`<vstgui-ui-description version="${vstgui.version}">`);

  if (vstgui.colors && Object.keys(vstgui.colors).length > 0) {
    lines.push('  <colors>');
    for (const [name, rgba] of Object.entries(vstgui.colors)) {
      lines.push(`    <color name="${escapeXml(name)}" rgba="${escapeXml(rgba)}"/>`);
    }
    lines.push('  </colors>');
  }

  if (vstgui.fonts && Object.keys(vstgui.fonts).length > 0) {
    lines.push('  <fonts>');
    for (const [name, fontDef] of Object.entries(vstgui.fonts)) {
      const fontAttrs: string[] = [`name="${escapeXml(name)}"`];
      const font = fontDef as FontDefinition;
      for (const [key, value] of Object.entries(font)) {
        if (value !== undefined) {
          fontAttrs.push(`${key}="${escapeXml(String(value))}"`);
        }
      }
      lines.push(`    <font ${fontAttrs.join(' ')}/>`);
    }
    lines.push('  </fonts>');
  }

  if (vstgui.bitmaps && Object.keys(vstgui.bitmaps).length > 0) {
    lines.push('  <bitmaps>');
    for (const [name, bitmap] of Object.entries(vstgui.bitmaps)) {
      if (typeof bitmap === 'string') {
        lines.push(`    <bitmap name="${escapeXml(name)}" path="${escapeXml(bitmap)}"/>`);
      } else {
        const bitmapAttrs: string[] = [`name="${escapeXml(name)}"`];
        for (const [key, value] of Object.entries(bitmap)) {
          if (value !== undefined) {
            bitmapAttrs.push(`${key}="${escapeXml(String(value))}"`);
          }
        }
        lines.push(`    <bitmap ${bitmapAttrs.join(' ')}/>`);
      }
    }
    lines.push('  </bitmaps>');
  }

  if (vstgui.templates && Object.keys(vstgui.templates).length > 0) {
    lines.push('  <templates>');
    for (const [name, template] of Object.entries(vstgui.templates)) {
      const templateAttrs: string[] = [`name="${escapeXml(name)}"`];
      for (const [key, value] of Object.entries(template.attributes)) {
        if (value !== undefined) {
          templateAttrs.push(`${key}="${escapeXml(String(value))}"`);
        }
      }

      if (template.children && Object.keys(template.children).length > 0) {
        lines.push(`    <template ${templateAttrs.join(' ')}>`);
        for (const child of Object.values(template.children)) {
          lines.push(serializeView(child as ViewNode, '      '));
        }
        lines.push('    </template>');
      } else {
        lines.push(`    <template ${templateAttrs.join(' ')}/>`);
      }
    }
    lines.push('  </templates>');
  }

  lines.push('</vstgui-ui-description>');

  return lines.join('\n');
}
