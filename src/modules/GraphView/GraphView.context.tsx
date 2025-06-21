import { createContext, useContext } from 'react';
import type { GraphData, Stats } from '../../api/types';

interface GraphViewContextType {
  // Data z API
  data: GraphData | undefined;
  isLoading: boolean;
  error: Error | null;
  stats: Stats | undefined;
  
  // Search & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedEntityTypes: string[];
  setSelectedEntityTypes: (types: string[]) => void;
  selectedRelationTypes: string[];
  setSelectedRelationTypes: (types: string[]) => void;
  
  // Selected entity (dla EntityDrawer)
  selectedEntity: string | null;
  setSelectedEntity: (id: string | null) => void;
  
  // Actions
  refetch: () => void;
}

const GraphViewContext = createContext<GraphViewContextType | null>(null);

export const GraphViewProvider = GraphViewContext.Provider;

export function useGraphViewContext(): GraphViewContextType {
  const context = useContext(GraphViewContext);
  
  if (!context) {
    console.error('useGraphViewContext must be used within GraphViewProvider');
    throw new Error('useGraphViewContext must be used within GraphViewProvider');
  }
  
  return context;
}