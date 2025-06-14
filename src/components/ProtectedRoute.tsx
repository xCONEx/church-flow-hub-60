
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireChurch?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['admin', 'leader', 'collaborator', 'member'],
  requireChurch = false 
}: ProtectedRouteProps) => {
  const { user, church, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Master tem acesso a tudo, exceto rotas específicas que não são para ele
  if (user.role === 'master') {
    // Master só pode acessar master-dashboard, profile, settings e logout
    const masterOnlyRoutes = ['/master-dashboard', '/profile', '/settings'];
    const currentPath = window.location.pathname;
    
    // Se está tentando acessar uma rota que não é específica do master
    if (!masterOnlyRoutes.includes(currentPath) && currentPath !== '/') {
      return <Navigate to="/master-dashboard" replace />;
    }
    
    return <>{children}</>;
  }

  // Para outros usuários, verificar se o role está permitido
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar se precisa de igreja (não se aplica ao master)
  if (requireChurch && !church) {
    return <Navigate to="/setup-church" replace />;
  }

  return <>{children}</>;
};
