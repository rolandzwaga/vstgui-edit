import { onCleanup } from 'solid-js';
import { canvasStore, endPan, startPan, updatePan } from '../../stores/canvasStore';

export interface UseCanvasPanResult {
  handlePanMouseDown: (e: MouseEvent) => void;
}

export function useCanvasPan(): UseCanvasPanResult {
  const handleMouseMove = (e: MouseEvent) => {
    updatePan(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    endPan();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handlePanMouseDown = (e: MouseEvent) => {
    if (canvasStore.isPanning) {
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  return {
    handlePanMouseDown,
  };
}
