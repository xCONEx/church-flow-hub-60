
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { Church } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !redirected) {
      setRedirected(true);
      const targetPath = user.role === 'master' ? '/master-dashboard' : '/dashboard';
      navigate(targetPath, { replace: true });
    }
  }, [user, isLoading, navigate, redirected]);

  // Show loading
  if (isLoading || (user && !redirected)) {
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
              <p className="text-gray-600">Carregando...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <Login />;
};

export default Index;
