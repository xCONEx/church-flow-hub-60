
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { Church } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index: Auth state -', { user: user?.email || 'no user', isLoading, role: user?.role });
    
    // Only redirect after auth state is determined
    if (!isLoading) {
      if (user) {
        // User is logged in, redirect to appropriate dashboard
        console.log('Index: User logged in, redirecting to dashboard');
        if (user.role === 'master') {
          navigate('/master-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // User is not logged in, stay on login page without redirect loop
        console.log('Index: No user, staying on login');
        // Don't redirect to /login to avoid loops - just show login UI here
      }
    }
  }, [user, isLoading, navigate]);

  // If no user and not loading, show login interface directly
  if (!isLoading && !user) {
    return <Login />;
  }

  // Show loading while determining auth state or while logged in user is being redirected
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Church className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">
          {isLoading ? 'Carregando...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
};

export default Index;
