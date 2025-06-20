import { apiClient } from '../client';
import type { Entity, EntityDetails } from '../types';

export const entityService = {
  async getEntities(params?: {
    limit?: number;
    offset?: number;
    entity_type?: string;
  }): Promise<Entity[]> {
    return apiClient.get('/entities', params);
  },

  async getEntity(entityId: string): Promise<EntityDetails> {
    return apiClient.get(`/entities/${entityId}`);
  },

  async updateEntity(entityId: string, data: Partial<Entity>): Promise<{ status: string; entity_id: string }> {
    return apiClient.put(`/entities/${entityId}`, data);
  },

  async deleteEntity(entityId: string): Promise<{ status: string; entity_id: string }> {
    return apiClient.delete(`/entities/${entityId}`);
  },
};