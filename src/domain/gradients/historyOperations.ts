import type { HistoryOperation } from '../../types/history';
import type { GradientColorStop } from '../../types/uidesc';

export interface RemovedGradientReference {
  viewId: string;
  attribute: string;
  value: string;
}

type AddGradientFn = (name: string, stops: GradientColorStop[]) => void;
type DeleteGradientFn = (name: string) => { removedReferences: RemovedGradientReference[] } | null;
type UpdateGradientNameFn = (oldName: string, newName: string) => boolean;
type UpdateGradientStopsFn = (
  name: string,
  stops: GradientColorStop[]
) => GradientColorStop[] | null;
type UpdateViewAttributeFn = (viewId: string, attribute: string, value: string) => void;

let storeAddGradient: AddGradientFn;
let storeDeleteGradient: DeleteGradientFn;
let storeUpdateGradientName: UpdateGradientNameFn;
let storeUpdateGradientStops: UpdateGradientStopsFn;
let storeUpdateViewAttribute: UpdateViewAttributeFn;

export function initGradientHistoryOperations(
  addGradient: AddGradientFn,
  deleteGradient: DeleteGradientFn,
  updateGradientName: UpdateGradientNameFn,
  updateGradientStops: UpdateGradientStopsFn,
  updateViewAttribute: UpdateViewAttributeFn
): void {
  storeAddGradient = addGradient;
  storeDeleteGradient = deleteGradient;
  storeUpdateGradientName = updateGradientName;
  storeUpdateGradientStops = updateGradientStops;
  storeUpdateViewAttribute = updateViewAttribute;
}

export function createAddGradientOperation(
  name: string,
  stops: GradientColorStop[]
): HistoryOperation {
  let removedReferences: RemovedGradientReference[] = [];
  return {
    type: 'add-gradient',
    description: `Add gradient "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      const result = storeDeleteGradient(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      storeAddGradient(name, stops);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
  };
}

export function createEditGradientNameOperation(
  oldName: string,
  newName: string
): HistoryOperation {
  return {
    type: 'edit-gradient-name',
    description: `Rename gradient "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateGradientName(newName, oldName),
    redo: () => storeUpdateGradientName(oldName, newName),
  };
}

export function createEditGradientStopsOperation(
  name: string,
  oldStops: GradientColorStop[],
  newStops: GradientColorStop[]
): HistoryOperation {
  return {
    type: 'edit-gradient-stops',
    description: `Update stops of gradient "${name}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateGradientStops(name, oldStops),
    redo: () => storeUpdateGradientStops(name, newStops),
  };
}

export function createDeleteGradientOperation(
  name: string,
  stops: GradientColorStop[],
  removedReferences: RemovedGradientReference[] = []
): HistoryOperation {
  return {
    type: 'delete-gradient',
    description: `Delete gradient "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      storeAddGradient(name, stops);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
    redo: () => storeDeleteGradient(name),
  };
}
