import { type Accessor, createSignal, onCleanup } from 'solid-js';
import { selectionStore } from '../stores/selectionStore';

const TOOLTIP_DELAY_MS = 500;

export interface Point {
  x: number;
  y: number;
}

export interface UseTooltipResult {
  showTooltip: Accessor<boolean>;
  tooltipPosition: Accessor<Point>;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseLeave: () => void;
}

export function useTooltip(): UseTooltipResult {
  const [showTooltip, setShowTooltip] = createSignal(false);
  const [tooltipPosition, setTooltipPosition] = createSignal<Point>({ x: 0, y: 0 });
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  const handleMouseMove = (e: MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });

    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      setShowTooltip(false);
    }

    if (selectionStore.hoveredId) {
      tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, TOOLTIP_DELAY_MS);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    setShowTooltip(false);
  };

  onCleanup(() => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
    }
  });

  return {
    showTooltip,
    tooltipPosition,
    handleMouseMove,
    handleMouseLeave,
  };
}
