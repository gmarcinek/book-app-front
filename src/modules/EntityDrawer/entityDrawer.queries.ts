import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../../api/services/entityService';

export const ENTITY_DRAWER_QUERY_KEYS = {
  entityDetails: (id: string) => ['entity-drawer', 'details', id],
  entityRelationships: (id: string) => ['entity-drawer', 'relationships', id],
} as const;

export const useEntityDetails = (entityId: string | null) => {
  return useQuery({
    queryKey: ENTITY_DRAWER_QUERY_KEYS.entityDetails(entityId!),
    queryFn: () => entityService.getEntity(entityId!),
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUpdateEntityInDrawer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: any }) =>
      entityService.updateEntity(entityId, data),
    onSuccess: (_, { entityId }) => {
      // Invalidate drawer-specific queries
      queryClient.invalidateQueries({ 
        queryKey: ENTITY_DRAWER_QUERY_KEYS.entityDetails(entityId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ENTITY_DRAWER_QUERY_KEYS.entityRelationships(entityId) 
      });
      
      // Also invalidate graph queries (cross-module invalidation)
      queryClient.invalidateQueries({ queryKey: ['graph'] });
    },
  });
};

export const useDeleteEntityFromDrawer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: entityService.deleteEntity,
    onSuccess: () => {
      // Invalidate all related queries across modules
      queryClient.invalidateQueries({ queryKey: ['graph'] });
      queryClient.invalidateQueries({ queryKey: ['entity-drawer'] });
    },
  });
};