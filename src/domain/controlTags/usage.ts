import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export const CONTROL_TAG_ATTRIBUTE = 'control-tag';

export interface ControlTagUsage {
  viewId: string;
  viewClass: string;
  templateName: string;
}

export function findControlTagUsages(
  tagName: string,
  document: VSTGUIUIDescription | null
): ControlTagUsage[] {
  if (!document) return [];

  const vstgui = document['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: ControlTagUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(template, templateName, templateName, tagName, usages);
  }

  return usages;
}

function findUsagesInView(
  view: ViewNode,
  viewId: string,
  templateName: string,
  tagName: string,
  usages: ControlTagUsage[]
): void {
  if (view.attributes[CONTROL_TAG_ATTRIBUTE] === tagName) {
    usages.push({
      viewId,
      viewClass: view.attributes.class,
      templateName,
    });
  }

  if (view.children) {
    for (const [childKey, childView] of Object.entries(view.children)) {
      findUsagesInView(childView, `${viewId}-${childKey}`, templateName, tagName, usages);
    }
  }
}
