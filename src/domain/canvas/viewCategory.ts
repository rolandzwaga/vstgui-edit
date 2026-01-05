import type { ViewCategory } from '../../types/canvas';

/**
 * Known container view classes
 */
export const CONTAINER_CLASSES = new Set([
  'CView',
  'CViewContainer',
  'CLayeredViewContainer',
  'CRowColumnView',
  'CScrollView',
  'CSplitView',
  'CShadowViewContainer',
  'UIViewSwitchContainer',
]);

/**
 * Known control view classes
 */
export const CONTROL_CLASSES = new Set([
  'CControl',
  'CTextEdit',
  'CSearchTextEdit',
  'CTextButton',
  'COnOffButton',
  'CCheckBox',
  'CSegmentButton',
  'CKickButton',
  'CRockerSwitch',
  'CVerticalSwitch',
  'CHorizontalSwitch',
  'CMovieButton',
  'CKnob',
  'CAnimKnob',
  'CSlider',
  'CXYPad',
  'COptionMenu',
]);

/**
 * Known display view classes
 */
export const DISPLAY_CLASSES = new Set([
  'CTextLabel',
  'CMultiLineTextLabel',
  'CParamDisplay',
  'CVuMeter',
  'CGradientView',
  'CMovieBitmap',
  'CAutoAnimation',
  'CAnimationSplashScreen',
  'CStringListControl',
]);

/**
 * Classifies a view class name into a category for styling.
 *
 * @param className - The VSTGUI class name (e.g., 'CTextButton')
 * @returns The category: 'container', 'control', 'display', or 'custom'
 */
export function getViewCategory(className: string | undefined): ViewCategory {
  if (!className) {
    return 'custom';
  }

  if (CONTAINER_CLASSES.has(className)) {
    return 'container';
  }

  if (CONTROL_CLASSES.has(className)) {
    return 'control';
  }

  if (DISPLAY_CLASSES.has(className)) {
    return 'display';
  }

  return 'custom';
}
