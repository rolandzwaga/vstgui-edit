import type { ViewNode, VSTGUIUIDescription } from '../../types/uidesc';

export const VARIABLE_REFERENCE_PATTERN = /var\.([A-Za-z_][A-Za-z0-9_-]*)/g;

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface VariableUsage {
  viewId: string;
  viewClass: string;
  templateName: string;
  attribute: string;
}

export function findVariableUsages(
  variableName: string,
  document: VSTGUIUIDescription | null
): VariableUsage[] {
  if (!document) return [];

  const vstgui = document['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const usages: VariableUsage[] = [];

  for (const [templateName, template] of Object.entries(vstgui.templates)) {
    findUsagesInView(template, templateName, templateName, variableName, usages);
  }

  return usages;
}

function findUsagesInView(
  view: ViewNode,
  viewId: string,
  templateName: string,
  variableName: string,
  usages: VariableUsage[]
): void {
  const exactPattern = new RegExp(`var\\.${escapeRegExp(variableName)}(?![A-Za-z0-9_-])`);

  for (const [attribute, value] of Object.entries(view.attributes)) {
    if (typeof value === 'string' && exactPattern.test(value)) {
      usages.push({
        viewId,
        viewClass: view.attributes.class,
        templateName,
        attribute,
      });
    }
  }

  if (view.children) {
    for (const [childKey, childView] of Object.entries(view.children)) {
      findUsagesInView(childView, `${viewId}-${childKey}`, templateName, variableName, usages);
    }
  }
}
