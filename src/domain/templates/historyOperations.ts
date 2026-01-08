import type { HistoryOperation } from '../../types/history';
import { renameTemplate } from '../../stores/documentStore';

export function createRenameTemplateOperation(oldName: string, newName: string): HistoryOperation {
  return {
    type: 'template-rename',
    description: `Rename template "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => {
      renameTemplate(newName, oldName);
    },
    redo: () => {
      renameTemplate(oldName, newName);
    },
  };
}
