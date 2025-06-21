import { useState, useMemo } from 'react';
import type { GraphData } from '../../../../api/types';
import styles from './TilesView.module.scss';

interface TilesViewProps {
  data: GraphData | undefined;
  searchQuery: string;
  onNodeClick: (nodeId: string) => void;
}

export function TilesView({ data, searchQuery, onNodeClick }: TilesViewProps) {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<string[]>([]);

  // Extract unique entity types
  const availableEntityTypes = useMemo(() => {
    if (!data?.nodes) return [];
    return [...new Set(data.nodes.map(node => node.type))];
  }, [data?.nodes]);

  // Extract unique relation types
  const availableRelationTypes = useMemo(() => {
    if (!data?.edges) return [];
    return [...new Set(data.edges.map(edge => edge.relation_type))];
  }, [data?.edges]);

  // Filter and sort entities
  const filteredEntities = useMemo(() => {
    if (!data?.nodes) return [];
    
    // Filter by search query
    const searchFiltered = data.nodes.filter(node => 
      node.name && node.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by selected entity types
    const typeFiltered = selectedEntityTypes.length > 0 
      ? searchFiltered.filter(node => selectedEntityTypes.includes(node.type))
      : searchFiltered;
    
    // Sort by type
    return typeFiltered.sort((a, b) => a.type.localeCompare(b.type));
  }, [data?.nodes, searchQuery, selectedEntityTypes]);

  const handleEntityTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedEntityTypes(prev => [...prev, type]);
    } else {
      setSelectedEntityTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleRelationTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedRelationTypes(prev => [...prev, type]);
    } else {
      setSelectedRelationTypes(prev => prev.filter(t => t !== type));
    }
  };

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>No data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left Sidebar - Filters */}
      <div className={`${styles.leftSidebar}`}>
        <div className={styles.sidebarSection}>
          <h3>🎯 Entity Types</h3>
          <div className={styles.filterList}>
            {availableEntityTypes.map(type => (
              <label key={type} className={styles.filterItem}>
                <input
                  type="checkbox"
                  checked={selectedEntityTypes.includes(type)}
                  onChange={(e) => handleEntityTypeFilter(type, e.target.checked)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className={styles.sidebarSection}>
          <h3>🔗 Relations</h3>
          <div className={styles.filterList}>
            {availableRelationTypes.map(type => (
              <label key={type} className={styles.filterItem}>
                <input
                  type="checkbox"
                  checked={selectedRelationTypes.includes(type)}
                  onChange={(e) => handleRelationTypeFilter(type, e.target.checked)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Tiles Grid */}
      <div className={`${styles.mainContent}`}>
        <div className={styles.tilesGrid}>
          {filteredEntities.map(entity => (
            <div 
              key={entity.id} 
              className={styles.tileItem}
              onClick={() => onNodeClick(entity.id)}
              data-type={entity.type}
            >
              <strong>{entity.name}</strong>
              <small>{(entity.confidence * 100).toFixed(0)}%</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}