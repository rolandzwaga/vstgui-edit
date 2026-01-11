import type { Size } from '../../types/canvas';
import { VIEW_CLASSES } from './viewClasses';

const DEFAULT_SIZE: Size = { width: 100, height: 100 };

export function getDefaultSize(className: string): Size {
  const viewClass = VIEW_CLASSES[className];
  return viewClass?.defaultSize ?? DEFAULT_SIZE;
}
