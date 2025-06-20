import { apiClient } from '../client';
import type { GraphData, SearchQuery, SearchResult, Stats, EntityTypes } from '../types';

export const graphService = {
  async getGraphData(params?: {
    max_nodes?: number;
    max_edges?: number;
    entity_types?: string;
  }): Promise<GraphData> {
    return apiClient.get('/graph', params);
  },

  async searchEntities(query: SearchQuery): Promise<SearchResult> {
    return apiClient.post('/search', query);
  },

  async getStats(): Promise<Stats> {
    return apiClient.get('/stats');
  },

  async getEntityTypes(): Promise<EntityTypes> {
    return apiClient.get('/entity-types');
  },
};