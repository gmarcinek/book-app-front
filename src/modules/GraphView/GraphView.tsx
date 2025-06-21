// src/modules/GraphView/GraphView.tsx
import { useState } from 'react';
import { useGraphData, useStats } from './graphView.queries';
import { GraphViewProvider } from './GraphView.context';
import { EntityDrawer } from '../EntityDrawer/EntityDrawer';
import styles from './GraphView.module.scss';
import { GraphViewRoutes } from './GraphView.routing';

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

  const { data: stats } = useStats();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCloseDrawer = () => {
    setSelectedEntity(null);
  };

  const contextValue = {
    data,
    isLoading,
    error,
    stats,
    searchQuery,
    setSearchQuery,
    selectedEntityTypes,
    setSelectedEntityTypes,
    selectedRelationTypes,
    setSelectedRelationTypes,
    selectedEntity,
    setSelectedEntity,
    refetch,
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

  return (
    <GraphViewProvider value={contextValue}>
      <div className={styles.container}>
        {/* Global Toolbar */}
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
              <span>{data?.nodes?.length || 0} entities</span>
              <span>{data?.edges?.length || 0} relations</span>
            </div>
          </div>
        </div>

        <GraphViewRoutes />

        {/* Global Entity Drawer */}
        <EntityDrawer
          entityId={selectedEntity}
          onClose={handleCloseDrawer}
        />
      </div>
    </GraphViewProvider>
  );
}