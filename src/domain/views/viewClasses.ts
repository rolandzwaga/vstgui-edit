import type { PaletteCategory, PaletteCategoryId, ViewClass } from '../../types/views';

export const VIEW_CLASSES: Record<string, ViewClass> = {
  CViewContainer: {
    name: 'CViewContainer',
    category: 'containers',
    defaultSize: { width: 200, height: 200 },
  },
  CLayeredViewContainer: {
    name: 'CLayeredViewContainer',
    category: 'containers',
    defaultSize: { width: 200, height: 200 },
  },
  CScrollView: {
    name: 'CScrollView',
    category: 'containers',
    defaultSize: { width: 200, height: 200 },
  },
  CRowColumnView: {
    name: 'CRowColumnView',
    category: 'containers',
    defaultSize: { width: 200, height: 100 },
  },
  CSplitView: {
    name: 'CSplitView',
    category: 'containers',
    defaultSize: { width: 300, height: 200 },
  },
  CShadowViewContainer: {
    name: 'CShadowViewContainer',
    category: 'containers',
    defaultSize: { width: 200, height: 200 },
  },
  UIViewSwitchContainer: {
    name: 'UIViewSwitchContainer',
    category: 'containers',
    defaultSize: { width: 200, height: 200 },
  },

  CSlider: {
    name: 'CSlider',
    category: 'controls',
    defaultSize: { width: 20, height: 100 },
  },
  CKnob: {
    name: 'CKnob',
    category: 'controls',
    defaultSize: { width: 50, height: 50 },
  },
  CAnimKnob: {
    name: 'CAnimKnob',
    category: 'controls',
    defaultSize: { width: 50, height: 50 },
  },
  COnOffButton: {
    name: 'COnOffButton',
    category: 'controls',
    defaultSize: { width: 50, height: 20 },
  },
  CKickButton: {
    name: 'CKickButton',
    category: 'controls',
    defaultSize: { width: 50, height: 30 },
  },
  CTextButton: {
    name: 'CTextButton',
    category: 'controls',
    defaultSize: { width: 100, height: 30 },
  },
  CCheckBox: {
    name: 'CCheckBox',
    category: 'controls',
    defaultSize: { width: 100, height: 20 },
  },
  CSegmentButton: {
    name: 'CSegmentButton',
    category: 'controls',
    defaultSize: { width: 200, height: 30 },
  },
  CVerticalSwitch: {
    name: 'CVerticalSwitch',
    category: 'controls',
    defaultSize: { width: 30, height: 60 },
  },
  CHorizontalSwitch: {
    name: 'CHorizontalSwitch',
    category: 'controls',
    defaultSize: { width: 60, height: 30 },
  },
  CRockerSwitch: {
    name: 'CRockerSwitch',
    category: 'controls',
    defaultSize: { width: 40, height: 60 },
  },
  CXYPad: {
    name: 'CXYPad',
    category: 'controls',
    defaultSize: { width: 100, height: 100 },
  },

  CTextLabel: {
    name: 'CTextLabel',
    category: 'displays',
    defaultSize: { width: 100, height: 20 },
  },
  CMultiLineTextLabel: {
    name: 'CMultiLineTextLabel',
    category: 'displays',
    defaultSize: { width: 150, height: 60 },
  },
  CParamDisplay: {
    name: 'CParamDisplay',
    category: 'displays',
    defaultSize: { width: 60, height: 20 },
  },
  CVuMeter: {
    name: 'CVuMeter',
    category: 'displays',
    defaultSize: { width: 20, height: 100 },
  },
  CGradientView: {
    name: 'CGradientView',
    category: 'displays',
    defaultSize: { width: 100, height: 100 },
  },

  CTextEdit: {
    name: 'CTextEdit',
    category: 'text-input',
    defaultSize: { width: 150, height: 24 },
  },
  CSearchTextEdit: {
    name: 'CSearchTextEdit',
    category: 'text-input',
    defaultSize: { width: 200, height: 24 },
  },
  COptionMenu: {
    name: 'COptionMenu',
    category: 'text-input',
    defaultSize: { width: 120, height: 24 },
  },

  CMovieBitmap: {
    name: 'CMovieBitmap',
    category: 'animation',
    defaultSize: { width: 100, height: 100 },
  },
  CMovieButton: {
    name: 'CMovieButton',
    category: 'animation',
    defaultSize: { width: 50, height: 50 },
  },
  CAutoAnimation: {
    name: 'CAutoAnimation',
    category: 'animation',
    defaultSize: { width: 100, height: 100 },
  },
  CAnimationSplashScreen: {
    name: 'CAnimationSplashScreen',
    category: 'animation',
    defaultSize: { width: 200, height: 150 },
  },
  CStringListControl: {
    name: 'CStringListControl',
    category: 'animation',
    defaultSize: { width: 150, height: 200 },
  },
};

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'containers',
    label: 'Containers',
    viewClasses: [
      'CViewContainer',
      'CLayeredViewContainer',
      'CScrollView',
      'CRowColumnView',
      'CSplitView',
      'CShadowViewContainer',
      'UIViewSwitchContainer',
    ],
  },
  {
    id: 'controls',
    label: 'Controls',
    viewClasses: [
      'CSlider',
      'CKnob',
      'CAnimKnob',
      'COnOffButton',
      'CKickButton',
      'CTextButton',
      'CCheckBox',
      'CSegmentButton',
      'CVerticalSwitch',
      'CHorizontalSwitch',
      'CRockerSwitch',
      'CXYPad',
    ],
  },
  {
    id: 'displays',
    label: 'Displays',
    viewClasses: [
      'CTextLabel',
      'CMultiLineTextLabel',
      'CParamDisplay',
      'CVuMeter',
      'CGradientView',
    ],
  },
  {
    id: 'text-input',
    label: 'Text Input',
    viewClasses: ['CTextEdit', 'CSearchTextEdit', 'COptionMenu'],
  },
  {
    id: 'animation',
    label: 'Animation',
    viewClasses: [
      'CMovieBitmap',
      'CMovieButton',
      'CAutoAnimation',
      'CAnimationSplashScreen',
      'CStringListControl',
    ],
  },
];

export function getViewClass(className: string): ViewClass | undefined {
  return VIEW_CLASSES[className];
}

export function getViewClassesByCategory(category: PaletteCategoryId): ViewClass[] {
  return Object.values(VIEW_CLASSES).filter(vc => vc.category === category);
}

export function isContainerClass(className: string): boolean {
  const viewClass = VIEW_CLASSES[className];
  return viewClass?.category === 'containers';
}
