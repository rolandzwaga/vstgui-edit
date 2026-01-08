import {
  addTemplate,
  deleteTemplate,
  renameTemplate,
  restoreTemplate,
} from '../../stores/documentStore';
import type { HistoryOperation } from '../../types/history';
import type { TemplateDefinition } from '../../types/uidesc';

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

export function createAddTemplateOperation(name: string): HistoryOperation {
  return {
    type: 'template-add',
    description: `Add template "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      deleteTemplate(name);
    },
    redo: () => {
      addTemplate(name);
    },
  };
}

export function createDeleteTemplateOperation(
  name: string,
  templateData: TemplateDefinition
): HistoryOperation {
  return {
    type: 'template-delete',
    description: `Delete template "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      restoreTemplate(name, templateData);
    },
    redo: () => {
      deleteTemplate(name);
    },
  };
}

export function createDuplicateTemplateOperation(
  newName: string,
  templateData: TemplateDefinition
): HistoryOperation {
  return {
    type: 'template-duplicate',
    description: `Duplicate template as "${newName}"`,
    timestamp: Date.now(),
    undo: () => {
      deleteTemplate(newName);
    },
    redo: () => {
      restoreTemplate(newName, JSON.parse(JSON.stringify(templateData)));
    },
  };
}
