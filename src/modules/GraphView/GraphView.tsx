import { useState } from 'react';
import { useGraphData } from './graphView.queries';
import { EntityDrawer } from '../EntityDrawer/EntityDrawer';
import styles from './GraphView.module.scss';

export function GraphView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
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

  // Mock functions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search:', query);
  };

  const handleEntityTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedEntityTypes(prev => [...prev, type]);
    } else {
      setSelectedEntityTypes(prev => prev.filter(t => t !== type));
    }
    console.log('Filter entity type:', type, checked);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedEntity(nodeId);
    console.log('Node clicked:', nodeId);
  };

  const handleCloseDrawer = () => {
    setSelectedEntity(null);
    console.log('Drawer closed');
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
              {(data.available_entity_types || []).map(type => (
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
              <label className={styles.filterItem}>
                <input type="checkbox" defaultChecked />
                <span>IS</span>
              </label>
              <label className={styles.filterItem}>
                <input type="checkbox" defaultChecked />
                <span>HAS</span>
              </label>
              <label className={styles.filterItem}>
                <input type="checkbox" defaultChecked />
                <span>RELATED_TO</span>
              </label>
            </div>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className={styles.graphCanvas}>
          <div className={styles.graphPlaceholder}>
            <h2>📊 Graph Visualization</h2>
            <p>D3.js graph will be rendered here</p>
            <div className={styles.mockNodes}>
              {(data.nodes || []).slice(0, 10).map(node => (
                <div 
                  key={node.id} 
                  className={styles.mockNode}
                  onClick={() => handleNodeClick(node.id)}
                  data-type={node.type}
                >
                  <strong>{node.name}</strong>
                  <small>{node.type}</small>
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