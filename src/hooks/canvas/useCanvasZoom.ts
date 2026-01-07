import { applyZoom } from '../../stores/canvasStore';

export interface UseCanvasZoomResult {
  handleWheel: (e: WheelEvent) => void;
}

export function useCanvasZoom(): UseCanvasZoomResult {
  const handleWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }
    e.preventDefault();
    const wrapper = e.currentTarget as HTMLElement;
    applyZoom(e.clientX, e.clientY, wrapper.getBoundingClientRect(), e.deltaY);
  };

  return {
    handleWheel,
  };
}
