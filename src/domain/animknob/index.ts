/**
 * AnimKnob Domain
 *
 * Domain logic for CAnimKnob filmstrip preview functionality.
 */

export {
  calculateFrameIndex,
  calculateFrameOffset,
  calculateNumFrames,
  calculatePreviewValue,
  clampValue,
} from './frameCalculation';

export {
  buildAnimKnobBitmapInfo,
  extractFrameHeight,
  extractNumFrames,
  getBitmapName,
  isAnimKnobWithBitmap,
  parseDefaultValue,
  parseInverseMode,
} from './bitmapInfo';
