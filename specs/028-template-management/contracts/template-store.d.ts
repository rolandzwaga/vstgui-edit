export interface TemplateStore {
  readonly activeTemplateId: string | null;
}

export declare function setActiveTemplate(templateId: string | null): void;
export declare function resetTemplateStore(): void;
