import { updateViewAttribute } from '../../stores/documentStore';
import type { PropertyEditData } from '../../types/editors';
import type { HistoryOperation } from '../../types/history';

export function createPropertyEditOperation(
  data: PropertyEditData,
  attributeName: string
): HistoryOperation {
  const { viewIds, previousValues, newValue } = data;

  const viewCount = viewIds.length;
  const description =
    viewCount === 1 ? `Change ${attributeName}` : `Change ${attributeName} on ${viewCount} views`;

  return {
    type: 'property-change',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const viewId of viewIds) {
        const prevValue = previousValues[viewId];
        if (prevValue !== undefined) {
          updateViewAttribute(viewId, attributeName, prevValue);
        }
      }
    },
    redo: () => {
      for (const viewId of viewIds) {
        updateViewAttribute(viewId, attributeName, newValue);
      }
    },
  };
}
