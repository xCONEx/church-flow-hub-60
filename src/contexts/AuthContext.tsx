
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Church } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('church_manager_user');
        const savedChurch = localStorage.getItem('church_manager_church');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedChurch) {
          setChurch(JSON.parse(savedChurch));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: 'Pastor João Silva',
        role: 'admin',
        churchId: 'church-1',
        joinedAt: new Date(),
        lastActive: new Date(),
      };

      const mockChurch: Church = {
        id: 'church-1',
        name: 'Igreja Batista Central',
        adminId: '1',
        departments: [
          {
            id: 'dept-1',
            name: 'Louvor',
            churchId: 'church-1',
            leaderId: '1',
            collaborators: [],
            type: 'louvor',
            createdAt: new Date(),
          },
          {
            id: 'dept-2',
            name: 'Mídia',
            churchId: 'church-1',
            collaborators: [],
            type: 'midia',
            createdAt: new Date(),
          }
        ],
        createdAt: new Date(),
      };

      setUser(mockUser);
      setChurch(mockChurch);
      
      localStorage.setItem('church_manager_user', JSON.stringify(mockUser));
      localStorage.setItem('church_manager_church', JSON.stringify(mockChurch));
    } catch (error) {
      throw new Error('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        name: userData.name!,
        role: 'member',
        joinedAt: new Date(),
        ...userData,
      };

      setUser(newUser);
      localStorage.setItem('church_manager_user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Falha no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setChurch(null);
    localStorage.removeItem('church_manager_user');
    localStorage.removeItem('church_manager_church');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('church_manager_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    church,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
