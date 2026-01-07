import type { Point } from '../../types/canvas';
import type { ViewAttributes, ViewNode } from '../../types/uidesc';
import type { SerializedView } from '../../types/views';

function attributesToRecord(attrs: ViewAttributes): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function recordToAttributes(record: Record<string, string>): ViewAttributes {
  return record as unknown as ViewAttributes;
}

export function serializeView(viewId: string, viewNode: ViewNode): SerializedView {
  const serialized: SerializedView = {
    originalId: viewId,
    class: viewNode.attributes.class,
    attributes: attributesToRecord(viewNode.attributes),
  };

  if (viewNode.children) {
    serialized.children = [];
    for (const [key, child] of Object.entries(viewNode.children)) {
      const childId = `${viewId}-${key}`;
      serialized.children.push(serializeView(childId, child));
    }
  }

  return serialized;
}

export function deserializeView(serialized: SerializedView): ViewNode {
  const viewNode: ViewNode = {
    attributes: recordToAttributes(serialized.attributes),
  };

  if (serialized.children && serialized.children.length > 0) {
    viewNode.children = {};
    for (let i = 0; i < serialized.children.length; i++) {
      viewNode.children[String(i)] = deserializeView(serialized.children[i]);
    }
  }

  return viewNode;
}

export function extractOrigin(serialized: SerializedView): Point {
  const origin = serialized.attributes.origin ?? '0, 0';
  const parts = origin.split(',').map(s => s.trim());
  const x = Number.parseInt(parts[0], 10) || 0;
  const y = Number.parseInt(parts[1], 10) || 0;
  return { x, y };
}

export function applyOffsetToSerialized(serialized: SerializedView, offset: Point): SerializedView {
  const origin = extractOrigin(serialized);
  const newOrigin = {
    x: origin.x + offset.x,
    y: origin.y + offset.y,
  };

  return {
    ...serialized,
    attributes: {
      ...serialized.attributes,
      origin: `${Math.round(newOrigin.x)}, ${Math.round(newOrigin.y)}`,
    },
    children: serialized.children?.map(child => applyOffsetToSerialized(child, { x: 0, y: 0 })),
  };
}

export function collectOriginsFromSerialized(
  serializedViews: SerializedView[]
): Record<string, Point> {
  const origins: Record<string, Point> = {};

  for (const view of serializedViews) {
    origins[view.originalId] = extractOrigin(view);
  }

  return origins;
}
