import {
  type IconDefinition as CoreIconDefinition,
  library,
} from '@fortawesome/fontawesome-svg-core';
import {
  faEye,
  faEyeSlash,
  faFolder,
  faFont,
  faLock,
  faLockOpen,
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
  faLockOpen as CoreIconDefinition,
  faEye as CoreIconDefinition,
  faEyeSlash as CoreIconDefinition
);

export const CATEGORY_ICON_NAMES: Record<ViewCategory, string> = {
  container: 'folder',
  control: 'sliders',
  display: 'font',
  custom: 'puzzle-piece',
};
