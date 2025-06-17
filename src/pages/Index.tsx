
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Church } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect after auth state is determined
    if (!isLoading) {
      if (user) {
        // User is logged in, redirect to appropriate dashboard
        if (user.role === 'master') {
          navigate('/master-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // User is not logged in, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Church className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
