import {
  type IconDefinition as CoreIconDefinition,
  library,
} from '@fortawesome/fontawesome-svg-core';
import {
  faEyeSlash,
  faFolder,
  faFont,
  faLock,
  faPuzzlePiece,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import type { ViewCategory } from '../../types/canvas';

library.add(
  faFolder as CoreIconDefinition,
  faSliders as CoreIconDefinition,
  faFont as CoreIconDefinition,
  faPuzzlePiece as CoreIconDefinition,
  faLock as CoreIconDefinition,
  faEyeSlash as CoreIconDefinition
);

export const CATEGORY_ICON_NAMES: Record<ViewCategory, string> = {
  container: 'folder',
  control: 'sliders',
  display: 'font',
  custom: 'puzzle-piece',
};
