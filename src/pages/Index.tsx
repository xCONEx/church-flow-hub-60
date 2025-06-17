
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { Church } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (isLoading && !user) {
        console.warn('Index: Safety timeout reached, stopping loading');
        setHasRedirected(true);
      }
    }, 15000);

    // Só processa depois que o auth terminou de carregar
    if (!isLoading && user && !hasRedirected) {
      console.log('Index: User authenticated, redirecting...', { 
        email: user.email, 
        role: user.role 
      });
      
      setHasRedirected(true);
      const targetPath = user.role === 'master' ? '/master-dashboard' : '/dashboard';
      
      // Redirect immediately
      navigate(targetPath, { replace: true });
    }

    return () => clearTimeout(safetyTimeout);
  }, [user, isLoading, navigate, hasRedirected]);

  // Show loading while determining auth state or while redirecting
  if ((isLoading && !hasRedirected) || (user && !hasRedirected)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Church className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="space-y-2">
            {user ? (
              <>
                <p className="text-gray-600">Bem-vindo, {user.name}!</p>
                <p className="text-sm text-gray-500">Redirecionando...</p>
              </>
            ) : (
              <p className="text-gray-600">Verificando autenticação...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show login interface if no user and auth check is complete
  return <Login />;
};

export default Index;
