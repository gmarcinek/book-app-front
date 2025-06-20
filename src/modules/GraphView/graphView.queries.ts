import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphService } from '../../api/services/graphService';

export const GRAPH_VIEW_QUERY_KEYS = {
  graph: (params?: any) => ['graph-view', 'graph', params],
  stats: () => ['graph-view', 'stats'],
  entityTypes: () => ['graph-view', 'entity-types'],
  search: (query: string) => ['graph-view', 'search', query],
} as const;

export const useGraphData = (params?: {
  max_nodes?: number;
  max_edges?: number;
  entity_types?: string;
}) => {
  return useQuery({
    queryKey: GRAPH_VIEW_QUERY_KEYS.graph(params),
    queryFn: () => graphService.getGraphData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSearchEntities = () => {
  return useMutation({
    mutationFn: graphService.searchEntities,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: GRAPH_VIEW_QUERY_KEYS.stats(),
    queryFn: graphService.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEntityTypes = () => {
  return useQuery({
    queryKey: GRAPH_VIEW_QUERY_KEYS.entityTypes(),
    queryFn: graphService.getEntityTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};