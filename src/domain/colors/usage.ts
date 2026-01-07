import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export interface ColorUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}

const COLOR_ATTRIBUTES = [
  'background-color',
  'back-color',
  'font-color',
  'frame-color',
  'shadow-color',
  'text-highlight',
  'text-highlight-color',
  'line-color',
  'color',
];

function findUsagesInView(
  colorName: string,
  view: ViewNode,
  viewId: string,
  usages: ColorUsage[]
): void {
  const viewClass = view.attributes.class ?? 'Unknown';
  const colorRef = `~ ${colorName}`;

  for (const attr of COLOR_ATTRIBUTES) {
    const value = view.attributes[attr];
    if (typeof value === 'string' && value === colorRef) {
      usages.push({
        viewId,
        viewClass,
        attribute: attr,
      });
    }
  }

  if (view.children) {
    for (const [key, child] of Object.entries(view.children)) {
      findUsagesInView(colorName, child, `${viewId}-${key}`, usages);
    }
  }
}

export function findColorUsages(colorName: string, doc: VSTGUIUIDescription | null): ColorUsage[] {
  if (!doc) return [];

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: ColorUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(colorName, template, templateName, usages);
  }

  return usages;
}
