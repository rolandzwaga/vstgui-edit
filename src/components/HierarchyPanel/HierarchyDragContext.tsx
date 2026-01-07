import { type Component, type JSX, createContext, useContext } from 'solid-js';
import type { HierarchyDragState } from '../../types/hierarchy';
import { createHierarchyDragState, type HierarchyDragActions } from '../../hooks/hierarchy';

export interface HierarchyDragContextValue {
  state: HierarchyDragState;
  actions: HierarchyDragActions;
}

const HierarchyDragContext = createContext<HierarchyDragContextValue>();

export interface HierarchyDragProviderProps {
  children: JSX.Element;
}

export const HierarchyDragProvider: Component<HierarchyDragProviderProps> = (props) => {
  const [state, actions] = createHierarchyDragState();

  return (
    <HierarchyDragContext.Provider value={{ state, actions }}>
      {props.children}
    </HierarchyDragContext.Provider>
  );
};

export function useHierarchyDragContext(): HierarchyDragContextValue {
  const context = useContext(HierarchyDragContext);
  if (!context) {
    throw new Error('useHierarchyDragContext must be used within HierarchyDragProvider');
  }
  return context;
}
