import { useMemo } from 'react';
import { useGraphViewContext } from '../../GraphView.context';
import { GraphDataFilters } from '../GraphDataFilters/GraphDataFilters';
import styles from './TilesView.module.scss';

export function TilesView() {
  const { 
    data, 
    searchQuery, 
    selectedEntityTypes,
    setSelectedEntity
  } = useGraphViewContext();

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

  const handleNodeClick = (nodeId: string) => {
    setSelectedEntity(nodeId);
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
      <GraphDataFilters />

      {/* Main Content - Tiles Grid */}
      <div className={`${styles.mainContent}`}>
        <div className={styles.tilesGrid}>
          {filteredEntities.map(entity => (
            <div 
              key={entity.id} 
              className={styles.tileItem}
              onClick={() => handleNodeClick(entity.id)}
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