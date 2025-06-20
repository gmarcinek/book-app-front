import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GraphView } from '../modules/GraphView/GraphView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <GraphView />,
  },
  {
    path: '/graph',
    element: <GraphView />,
  },
  {
    path: '*',
    element: <div>404 - Page not found</div>,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}