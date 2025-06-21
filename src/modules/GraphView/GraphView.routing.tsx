import { Routes, Route, Navigate } from 'react-router-dom';
import { TilesView } from './components/TilesView/TilesView';
import { NetworkView } from './components/NetworkView/NetworkView';

export function GraphViewRoutes() {
  return (
    <Routes>
      <Route path="tiles" element={<TilesView />} />
      <Route path="network" element={<NetworkView />} />
      <Route path="*" element={<Navigate to="tiles" replace />} />
    </Routes>
  );
}