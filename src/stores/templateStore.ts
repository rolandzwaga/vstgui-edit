import { createSignal } from 'solid-js';
import { resetSelection } from './selectionStore';

const [activeTemplateId, setActiveTemplateIdSignal] = createSignal<string | null>(null);

export const templateStore = {
  get activeTemplateId() {
    return activeTemplateId();
  },
};

export function setActiveTemplate(templateId: string | null): void {
  const currentId = activeTemplateId();
  if (currentId !== templateId) {
    resetSelection();
  }
  setActiveTemplateIdSignal(templateId);
}

export function resetTemplateStore(): void {
  setActiveTemplateIdSignal(null);
}
