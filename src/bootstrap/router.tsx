import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { GraphView } from '../modules/GraphView/GraphView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/graph" replace />,
  },
  {
    path: '/graph',
    element: <GraphView />,
    children: [
      {
        path: '',
        element: <Navigate to="tiles" replace />,
      },
      {
        path: 'tiles',
        element: null, // będzie obsłużone przez GraphView
      },
      {
        path: 'network', 
        element: null, // będzie obsłużone przez GraphView
      },
    ],
  },
  {
    path: '*',
    element: <div>404 - Page not found</div>,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}