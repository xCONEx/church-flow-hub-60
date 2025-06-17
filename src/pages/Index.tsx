
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { Church } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Só processa depois que o auth terminou de carregar
    if (!isLoading) {
      setHasCheckedAuth(true);
      
      console.log('Index: Auth state determined -', { 
        user: user?.email || 'no user', 
        role: user?.role,
        hasUser: !!user
      });
      
      if (user) {
        console.log('Index: User authenticated, redirecting...');
        const targetPath = user.role === 'master' ? '/master-dashboard' : '/dashboard';
        
        // Small delay to ensure smooth transition
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 100);
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while determining auth state
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Church className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="space-y-2">
            <p className="text-gray-600">Verificando autenticação...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but still on index (during redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Church className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="space-y-2">
            <p className="text-gray-600">Bem-vindo, {user.name}!</p>
            <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-pulse" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login interface if no user and auth check is complete
  return <Login />;
};

export default Index;
