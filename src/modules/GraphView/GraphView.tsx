import { useState, useMemo } from 'react';
import { useGraphData } from './graphView.queries';
import { EntityDrawer } from '../EntityDrawer/EntityDrawer';
import styles from './GraphView.module.scss';

export function GraphView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGraphData({
    max_nodes: 300,
    max_edges: 500,
  });

  // Extract unique entity types from actual data
  const availableEntityTypes = useMemo(() => {
    if (!data?.nodes) return [];
    return [...new Set(data.nodes.map(node => node.type))];
  }, [data?.nodes]);

  // Extract unique relation types from actual data
  const availableRelationTypes = useMemo(() => {
    if (!data?.edges) return [];
    return [...new Set(data.edges.map(edge => edge.relation_type))];
  }, [data?.edges]);

  // Group entities by type
  const entitiesByType = useMemo(() => {
    if (!data?.nodes) return {};
    
    // Filter by search query first
    const filteredNodes = data.nodes.filter(node => 
      node.name && node.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by selected entity types
    const typeFilteredNodes = selectedEntityTypes.length > 0 
      ? filteredNodes.filter(node => selectedEntityTypes.includes(node.type))
      : filteredNodes;
    
    // Group by type
    return typeFilteredNodes.reduce((acc, node) => {
      if (!acc[node.type]) {
        acc[node.type] = [];
      }
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, typeof data.nodes>);
  }, [data?.nodes, searchQuery, selectedEntityTypes]);

  // Mock functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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

  const handleNodeClick = (nodeId: string) => {
    setSelectedEntity(nodeId);
  };

  const handleCloseDrawer = () => {
    setSelectedEntity(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>Loading graph...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading graph</h2>
          <p>{error.message}</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>No data available</h2>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1>🕸️ Knowledge Graph</h1>
          <button onClick={() => refetch()} className={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>
        
        <div className={styles.toolbarCenter}>
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.toolbarRight}>
          <div className={styles.stats}>
            <span>{data.nodes?.length || 0} entities</span>
            <span>{data.edges?.length || 0} relations</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Left Sidebar - Filters */}
        <div className={styles.leftSidebar}>
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

        {/* Graph Canvas */}
        <div className={styles.graphCanvas}>
          <div className={styles.graphPlaceholder}>
            <h2>📊 Entities by Type</h2>
            <p>Grouped by entity types</p>
            <div className={styles.entitiesByType}>
              {Object.entries(entitiesByType).map(([type, entities]) => (
                <div key={type} className={styles.entityTypeColumn}>
                  <h3 className={styles.columnHeader} data-type={type}>
                    {type} ({entities.length})
                  </h3>
                  <div className={styles.entityList}>
                    {entities.map(node => (
                      <div 
                        key={node.id} 
                        className={styles.entityItem}
                        onClick={() => handleNodeClick(node.id)}
                        data-type={node.type}
                      >
                        <strong>{node.name}</strong>
                        <small>{(node.confidence * 100).toFixed(0)}%</small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entity Drawer - Separate Module */}
      <EntityDrawer 
        entityId={selectedEntity} 
        onClose={handleCloseDrawer} 
      />
    </div>
  );
}