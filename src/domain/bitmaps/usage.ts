import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export interface BitmapUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}

export const BITMAP_ATTRIBUTES = [
  'bitmap',
  'disabled-bitmap',
  'handle-bitmap',
  'off-bitmap',
  'icon',
  'icon-highlighted',
  'splash-bitmap',
];

function findUsagesInView(
  bitmapName: string,
  view: ViewNode,
  viewId: string,
  usages: BitmapUsage[]
): void {
  const viewClass = view.attributes.class ?? 'Unknown';

  for (const attr of BITMAP_ATTRIBUTES) {
    const value = view.attributes[attr];
    if (typeof value === 'string' && (value === bitmapName || value === `~ ${bitmapName}`)) {
      usages.push({
        viewId,
        viewClass,
        attribute: attr,
      });
    }
  }

  if (view.children) {
    for (const [key, child] of Object.entries(view.children)) {
      findUsagesInView(bitmapName, child, `${viewId}-${key}`, usages);
    }
  }
}

export function findBitmapUsages(
  bitmapName: string,
  doc: VSTGUIUIDescription | null
): BitmapUsage[] {
  if (!doc) return [];

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: BitmapUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(bitmapName, template, templateName, usages);
  }

  return usages;
}
