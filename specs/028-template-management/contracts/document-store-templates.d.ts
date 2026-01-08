import type { TemplateDefinition, TemplatesDefinition } from '../../../src/types/uidesc';

export declare function getTemplates(): TemplatesDefinition | undefined;
export declare function getTemplate(name: string): TemplateDefinition | undefined;
export declare function getTemplateNames(): string[];

export declare function addTemplate(name: string, template: TemplateDefinition): boolean;
export declare function duplicateTemplate(sourceName: string, newName: string): boolean;
export declare function renameTemplate(oldName: string, newName: string): boolean;

export interface DeleteTemplateResult {
  template: TemplateDefinition;
}
export declare function deleteTemplate(name: string): DeleteTemplateResult | null;
