import { type Component, For, createSignal, createMemo, onCleanup } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';
import { sortStops, getColorAtPosition, normalizePosition } from '../../domain/gradients/stopCalculations';
import styles from './GradientStopEditor.module.css';

export interface GradientStopEditorProps {
  stops: GradientColorStop[];
  onChange: (stops: GradientColorStop[]) => void;
}

function rgbaToCSS(rgba: string): string {
  if (!rgba || rgba.length !== 9 || !rgba.startsWith('#')) {
    return 'transparent';
  }
  const r = parseInt(rgba.slice(1, 3), 16);
  const g = parseInt(rgba.slice(3, 5), 16);
  const b = parseInt(rgba.slice(5, 7), 16);
  const a = parseInt(rgba.slice(7, 9), 16) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

function formatPosition(position: number): string {
  return Math.round(position * 100).toString();
}

function parsePositionInput(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return normalizePosition(num / 100);
}

export const GradientStopEditor: Component<GradientStopEditorProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [positionInput, setPositionInput] = createSignal('');
  let barRef: HTMLDivElement | undefined;

  const sortedStops = createMemo(() => sortStops(props.stops));

  const gradientCSS = createMemo(() => {
    const stops = sortedStops();
    if (stops.length === 0) return 'linear-gradient(to right, transparent, transparent)';
    if (stops.length === 1) {
      const color = rgbaToCSS(stops[0].rgba);
      return `linear-gradient(to right, ${color}, ${color})`;
    }
    const colorStops = stops.map(
      (stop) => `${rgbaToCSS(stop.rgba)} ${parseFloat(stop.start) * 100}%`
    );
    return `linear-gradient(to right, ${colorStops.join(', ')})`;
  });

  const getPositionFromEvent = (clientX: number): number => {
    if (!barRef) return 0;
    const rect = barRef.getBoundingClientRect();
    const x = clientX - rect.left;
    return normalizePosition(x / rect.width);
  };

  const handleBarClick = (e: MouseEvent) => {
    if (isDragging()) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-testid="stop-handle"]')) return;

    const position = getPositionFromEvent(e.clientX);
    const color = getColorAtPosition(props.stops, position);
    const newStop: GradientColorStop = {
      rgba: color,
      start: position.toFixed(2),
    };
    const newStops = [...props.stops, newStop];
    props.onChange(sortStops(newStops));
    
    const sortedNew = sortStops(newStops);
    const newIndex = sortedNew.findIndex(s => s.start === newStop.start && s.rgba === newStop.rgba);
    setSelectedIndex(newIndex);
  };

  const handleStopClick = (index: number, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setPositionInput(formatPosition(parseFloat(sortedStops()[index].start)));
  };

  const handleStopMouseDown = (index: number, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragIndex(index);
    setSelectedIndex(index);
    setPositionInput(formatPosition(parseFloat(sortedStops()[index].start)));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || dragIndex() === null) return;
    
    const position = getPositionFromEvent(e.clientX);
    const currentStops = [...props.stops];
    const sortedCurrent = sortStops(currentStops);
    const stopToMove = sortedCurrent[dragIndex()!];
    
    const originalIndex = currentStops.findIndex(
      s => s.start === stopToMove.start && s.rgba === stopToMove.rgba
    );
    
    if (originalIndex !== -1) {
      currentStops[originalIndex] = {
        ...currentStops[originalIndex],
        start: position.toFixed(2),
      };
      props.onChange(currentStops);
      setPositionInput(formatPosition(position));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragIndex(null);
  };

  const handleColorChange = (e: Event) => {
    const index = selectedIndex();
    if (index === null) return;
    
    const target = e.target as HTMLInputElement;
    const newColor = target.value.toUpperCase();
    
    const currentStops = [...props.stops];
    const sortedCurrent = sortStops(currentStops);
    const stopToUpdate = sortedCurrent[index];
    
    const originalIndex = currentStops.findIndex(
      s => s.start === stopToUpdate.start && s.rgba === stopToUpdate.rgba
    );
    
    if (originalIndex !== -1) {
      currentStops[originalIndex] = {
        ...currentStops[originalIndex],
        rgba: newColor,
      };
      props.onChange(currentStops);
    }
  };

  const handlePositionBlur = () => {
    const index = selectedIndex();
    if (index === null) return;
    
    const position = parsePositionInput(positionInput());
    const currentStops = [...props.stops];
    const sortedCurrent = sortStops(currentStops);
    const stopToUpdate = sortedCurrent[index];
    
    const originalIndex = currentStops.findIndex(
      s => s.start === stopToUpdate.start && s.rgba === stopToUpdate.rgba
    );
    
    if (originalIndex !== -1) {
      currentStops[originalIndex] = {
        ...currentStops[originalIndex],
        start: position.toFixed(2),
      };
      props.onChange(currentStops);
    }
  };

  const handleDeleteStop = () => {
    const index = selectedIndex();
    if (index === null || props.stops.length <= 2) return;
    
    const sortedCurrent = sortStops(props.stops);
    const stopToDelete = sortedCurrent[index];
    
    const newStops = props.stops.filter(
      s => !(s.start === stopToDelete.start && s.rgba === stopToDelete.rgba)
    );
    
    props.onChange(newStops);
    setSelectedIndex(null);
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    onCleanup(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });
  }

  return (
    <div class={styles.editor} data-testid="gradient-stop-editor">
      <div
        ref={barRef}
        class={styles.bar}
        style={{ background: gradientCSS() }}
        data-testid="gradient-bar"
        onClick={handleBarClick}
      >
        <For each={sortedStops()}>
          {(stop, index) => {
            const position = () => parseFloat(stop.start) * 100;
            const isSelected = () => selectedIndex() === index();
            
            return (
              <div
                class={`${styles.handle} ${isSelected() ? styles.handleSelected : ''}`}
                style={{ left: `${position()}%` }}
                data-testid="stop-handle"
                data-selected={isSelected() ? 'true' : undefined}
                onClick={(e) => handleStopClick(index(), e)}
                onMouseDown={(e) => handleStopMouseDown(index(), e)}
              >
                <div
                  class={styles.handleColor}
                  style={{ background: rgbaToCSS(stop.rgba) }}
                  data-testid="stop-color"
                />
              </div>
            );
          }}
        </For>
      </div>

      {selectedIndex() !== null && (
        <div class={styles.controls}>
          <div class={styles.controlRow}>
            <label class={styles.label}>Color</label>
            <input
              type="text"
              class={styles.colorInput}
              data-testid="stop-color-input"
              value={sortedStops()[selectedIndex()!]?.rgba ?? ''}
              onInput={handleColorChange}
            />
          </div>
          <div class={styles.controlRow}>
            <label class={styles.label}>Position</label>
            <div class={styles.positionInputContainer}>
              <input
                type="text"
                class={styles.positionInput}
                data-testid="stop-position-input"
                value={positionInput()}
                onInput={(e) => setPositionInput(e.currentTarget.value)}
                onBlur={handlePositionBlur}
              />
              <span class={styles.positionUnit}>%</span>
            </div>
          </div>
          {props.stops.length > 2 && (
            <button
              type="button"
              class={styles.deleteButton}
              data-testid="delete-stop-button"
              onClick={handleDeleteStop}
            >
              Delete Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
};
