
import { lazy } from 'react';

// Lazy load heavy components to improve performance
export const LazyAddSongDialog = lazy(() => 
  import('./AddSongDialog').then(module => ({ default: module.AddSongDialog }))
);

export const LazyEditSongDialog = lazy(() => 
  import('./EditSongDialog').then(module => ({ default: module.EditSongDialog }))
);

export const LazySongDetailsModal = lazy(() => 
  import('./SongDetailsModal').then(module => ({ default: module.SongDetailsModal }))
);

export const LazyMasterDashboard = lazy(() => 
  import('../pages/MasterDashboard').then(module => ({ default: module.MasterDashboard }))
);

export const LazyRepertoire = lazy(() => 
  import('../pages/Repertoire').then(module => ({ default: module.Repertoire }))
);

// Loading fallback component - mais leve
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
  </div>
);

// Loading fallback para páginas
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);
