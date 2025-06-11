
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

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireChurch && !church) {
    return <Navigate to="/setup-church" replace />;
  }

  return <>{children}</>;
};
