
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, Church } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for testing - incluindo o usuário master
const mockUsers = [
  {
    id: 'master-1',
    email: 'master@churchmanager.com',
    name: 'Master Admin',
    role: 'master' as const,
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: '1',
    email: 'admin@igreja.com',
    name: 'Pastor João',
    role: 'admin' as const,
    churchId: '1',
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: '2', 
    email: 'lider@igreja.com',
    name: 'Ana Karolina',
    role: 'leader' as const,
    churchId: '1',
    departmentId: '1',
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    email: 'colaborador@igreja.com', 
    name: 'Yuri Adriel',
    role: 'collaborator' as const,
    churchId: '1',
    departmentId: '1',
    joinedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    email: 'membro@igreja.com',
    name: 'Maria Silva',
    role: 'member' as const,
    churchId: '1',
    joinedAt: new Date('2024-02-15'),
  }
];

const mockChurch: Church = {
  id: '1',
  name: 'Igreja Batista Central',
  address: 'Rua das Flores, 123',
  phone: '(11) 99999-9999',
  email: 'contato@igreja.com',
  adminId: '1',
  departments: [],
  serviceTypes: [
    'Culto Domingo Manhã',
    'Culto Domingo Noite', 
    'Reunião de Oração',
    'Culto de Jovens',
    'Ensaio Geral',
    'Evento Especial'
  ],
  courses: [],
  createdAt: new Date('2024-01-01'),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('church-manager-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Master não precisa de igreja, outros usuários sim
      if (userData.role !== 'master' && userData.churchId) {
        setChurch(mockChurch);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Usuário não encontrado');
    }

    if (password !== '123456') {
      setIsLoading(false);
      throw new Error('Senha incorreta');
    }

    setUser(foundUser);
    
    // Master não precisa de igreja
    if (foundUser.role !== 'master') {
      setChurch(mockChurch);
    }
    
    localStorage.setItem('church-manager-user', JSON.stringify(foundUser));
    setIsLoading(false);
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      name: userData.name!,
      phone: userData.phone,
      role: 'member', // New users start as members
      churchId: '1',
      joinedAt: new Date(),
    };

    setUser(newUser);
    setChurch(mockChurch);
    localStorage.setItem('church-manager-user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setChurch(null);
    localStorage.removeItem('church-manager-user');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('church-manager-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      church,
      login,
      register,
      logout,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
