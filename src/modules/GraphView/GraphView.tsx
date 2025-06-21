// src/modules/GraphView/GraphView.tsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGraphData, useStats } from './graphView.queries';
import { EntityDrawer } from '../EntityDrawer/EntityDrawer';
import styles from './GraphView.module.scss';
import { TilesView } from './components/TilesView/TilesView';

export function GraphView() {
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
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

      <Routes>
        <Route path="tiles" element={
          <TilesView
            data={data}
            searchQuery={searchQuery}
            onNodeClick={handleNodeClick}
          />
        } />
        <Route path="network" element={<div>NetworkView - Coming Soon</div>} />
        <Route path="*" element={<Navigate to="tiles" replace />} />
      </Routes>

      {/* Global Entity Drawer */}
      <EntityDrawer
        entityId={selectedEntity}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}