import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export interface GradientUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}

export const GRADIENT_ATTRIBUTES = ['gradient'];

function findUsagesInView(
  gradientName: string,
  view: ViewNode,
  viewId: string,
  usages: GradientUsage[]
): void {
  const viewClass = view.attributes.class ?? 'Unknown';

  for (const attr of GRADIENT_ATTRIBUTES) {
    const value = view.attributes[attr];
    if (typeof value === 'string' && (value === gradientName || value === `~ ${gradientName}`)) {
      usages.push({
        viewId,
        viewClass,
        attribute: attr,
      });
    }
  }

  if (view.children) {
    for (const [key, child] of Object.entries(view.children)) {
      findUsagesInView(gradientName, child, `${viewId}-${key}`, usages);
    }
  }
}

export function findGradientUsages(
  gradientName: string,
  doc: VSTGUIUIDescription | null
): GradientUsage[] {
  if (!doc) return [];

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: GradientUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(gradientName, template, templateName, usages);
  }

  return usages;
}
