
import { lazy } from 'react';

// Lazy load heavy components to improve performance
export const LazyAddSongDialog = lazy(() => 
  import('./AddSongDialog').then(module => ({ default: module.AddSongDialog }))
);

export const LazyMasterDashboard = lazy(() => 
  import('../pages/MasterDashboard').then(module => ({ default: module.MasterDashboard }))
);

// Loading fallback component
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);
