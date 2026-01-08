import { createSignal } from 'solid-js';

const [activeTemplateId, setActiveTemplateIdSignal] = createSignal<string | null>(null);

export const templateStore = {
  get activeTemplateId() {
    return activeTemplateId();
  },
};

export function setActiveTemplate(templateId: string | null): void {
  setActiveTemplateIdSignal(templateId);
}

export function resetTemplateStore(): void {
  setActiveTemplateIdSignal(null);
}
