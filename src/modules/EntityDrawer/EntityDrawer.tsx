import styles from './EntityDrawer.module.scss';
import { useEntityDetails } from './entityDrawer.queries';

interface EntityDrawerProps {
  entityId: string | null;
  onClose: () => void;
}

export function EntityDrawer({ entityId, onClose }: EntityDrawerProps) {
  const { 
    data: entityDetails, 
    isLoading, 
    error 
  } = useEntityDetails(entityId);

  if (!entityId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.drawerOverlay} onClick={onClose}>
        <div className={styles.entityDrawer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <h2>📄 Entity Details</h2>
            <button onClick={onClose} className={styles.closeButton}>
              ✕
            </button>
          </div>
          <div className={styles.drawerContent}>
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading entity details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.drawerOverlay} onClick={onClose}>
        <div className={styles.entityDrawer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <h2>📄 Entity Details</h2>
            <button onClick={onClose} className={styles.closeButton}>
              ✕
            </button>
          </div>
          <div className={styles.drawerContent}>
            <div className={styles.error}>
              <h3>Error loading entity</h3>
              <p>{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entityDetails) {
    return null;
  }

  const entity = entityDetails.entity;

  // Helper function to get entity name by ID
  const getEntityNameById = (id: string): string => {
    const relatedEntity = entityDetails.related_entities?.find(e => e.id === id);
    return relatedEntity?.name || id; // fallback to ID if name not found
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.entityDrawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.entityTitle}>
            <h2>{entity.name}</h2>
            <span className={styles.entityType} data-type={entity.type}>
              {entity.type}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        
        <div className={styles.drawerContent}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3>📝 Description</h3>
            <h4>{entity.description || 'No description available'}</h4>
          </div>

          {/* Aliases */}
          {entity.aliases && entity.aliases.length > 0 && (
            <div className={styles.section}>
              <h3>🏷️ Aliases</h3>
              <div className={styles.aliases}>
                {entity.aliases.map((alias, index) => (
                  <span key={index} className={styles.alias}>
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confidence & Context */}
          <div className={styles.section}>
            <h3>📊 Details</h3>
            <div className={styles.detailsList}>
              <div className={styles.detail}>
                <span>Confidence:</span>
                <span>{(entity.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className={styles.detail}>
                <span>Created:</span>
                <span>{new Date(entity.created_at).toLocaleDateString()}</span>
              </div>
              <div className={styles.detail}>
                <span>Merge Count:</span>
                <span>{entity.merge_count}</span>
              </div>
            </div>
          </div>

          {/* Context */}
          {entity.context && (
            <div className={styles.section}>
              <h3>🔍 Context</h3>
              <div className={styles.context}>
                {entity.context}
              </div>
            </div>
          )}

          {/* Relationships */}
          {entityDetails.relationships && entityDetails.relationships.length > 0 && (
            <div className={styles.section}>
              <h3>🔗 Relationships</h3>
              <div className={styles.relationships}>
                {entityDetails.relationships.map((rel, index) => (
                  <div key={index} className={styles.relationship}>
                    <div className={styles.relationshipType}>
                      {rel.relation_type}
                    </div>
                    <div className={styles.relationshipTarget}>
                      Target: {getEntityNameById(rel.target === entity.id ? rel.source_id : rel.target_id)}
                    </div>
                    <div className={styles.relationshipConfidence}>
                      {(rel.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Entities */}
          {entityDetails.related_entities && entityDetails.related_entities.length > 0 && (
            <div className={styles.section}>
              <h3>🌐 Related Entities</h3>
              <div className={styles.relatedEntities}>
                {entityDetails.related_entities.map((related) => (
                  <div key={related.id} className={styles.relatedEntity}>
                    <strong>{related.name}</strong>
                    <span className={styles.relatedType}>{related.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.drawerActions}>
            <button className={styles.editButton}>
              ✏️ Edit Entity
            </button>
            <button className={styles.deleteButton}>
              🗑️ Delete Entity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}