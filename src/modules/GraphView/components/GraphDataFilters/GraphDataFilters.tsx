import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGraphViewContext } from '../../GraphView.context';
import styles from './GraphDataFilters.module.scss';

export function GraphDataFilters() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    data,
    selectedEntityTypes,
    setSelectedEntityTypes,
    selectedRelationTypes,
    setSelectedRelationTypes,
  } = useGraphViewContext();

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

  const handleEntityTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedEntityTypes([...selectedEntityTypes, type]);
    } else {
      setSelectedEntityTypes(selectedEntityTypes.filter(t => t !== type));
    }
  };

  const handleRelationTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedRelationTypes([...selectedRelationTypes, type]);
    } else {
      setSelectedRelationTypes(selectedRelationTypes.filter(t => t !== type));
    }
  };

  const isActiveView = (view: string) => {
    return location.pathname.includes(view);
  };

  return (
    <div className={styles.filtersContainer}>
      {/* Navigation */}
      <div className={styles.navigation}>
        <div
          className={`${styles.navButton} ${isActiveView('tiles') ? styles.active : ''}`}
          onClick={() => navigate('/graph/tiles')}
        >
          Tiles
        </div>
        <div
          className={`${styles.navButton} ${isActiveView('network') ? styles.active : ''}`}
          onClick={() => navigate('/graph/network')}
        >
          Graph
        </div>
      </div>

      {/* Filters */}
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
  );
}