import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export interface FontUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}

const FONT_ATTRIBUTES = ['font'];

function findUsagesInView(
  fontName: string,
  view: ViewNode,
  viewId: string,
  usages: FontUsage[]
): void {
  const viewClass = view.attributes.class ?? 'Unknown';

  for (const attr of FONT_ATTRIBUTES) {
    const value = view.attributes[attr];
    if (typeof value === 'string' && (value === fontName || value === `~ ${fontName}`)) {
      usages.push({
        viewId,
        viewClass,
        attribute: attr,
      });
    }
  }

  if (view.children) {
    for (const [key, child] of Object.entries(view.children)) {
      findUsagesInView(fontName, child, `${viewId}-${key}`, usages);
    }
  }
}

export function findFontUsages(fontName: string, doc: VSTGUIUIDescription | null): FontUsage[] {
  if (!doc) return [];

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: FontUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(fontName, template, templateName, usages);
  }

  return usages;
}
