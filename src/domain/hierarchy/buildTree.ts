import type { TreeNode } from '../../types/hierarchy';
import type { ViewNode } from '../../types/uidesc';
import { getViewCategory } from '../canvas/viewCategory';

export function buildTree(view: ViewNode, id: string, depth = 0): TreeNode {
  const className = view.attributes.class;
  const label = className || 'Unknown';
  const children = view.children ?? {};
  const childEntries = Object.entries(children);

  return {
    id,
    label,
    category: getViewCategory(className),
    hasChildren: childEntries.length > 0,
    depth,
    children: childEntries.map(([key, child]) => buildTree(child, `${id}-${key}`, depth + 1)),
  };
}

export function getContainerIds(tree: TreeNode): string[] {
  const ids: string[] = [];

  function collect(node: TreeNode): void {
    if (node.hasChildren) {
      ids.push(node.id);
      for (const child of node.children) {
        collect(child);
      }
    }
  }

  collect(tree);
  return ids;
}
