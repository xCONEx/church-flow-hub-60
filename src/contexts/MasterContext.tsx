
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Church, User } from '@/types';

interface ChurchWithStats extends Church {
  totalMembers: number;
  activeMembers: number;
  lastActivity: Date;
  isActive: boolean;
}

interface MasterStats {
  totalChurches: number;
  totalUsers: number;
  activeChurches: number;
  newChurchesThisMonth: number;
  newUsersThisWeek: number;
}

interface MasterContextType {
  churches: ChurchWithStats[];
  stats: MasterStats;
  activities: Array<{
    id: string;
    type: 'church_created' | 'admin_added' | 'church_deactivated';
    description: string;
    details: string;
    timestamp: Date;
  }>;
  createChurch: (churchData: Partial<Church>) => Promise<void>;
  updateChurch: (churchId: string, data: Partial<Church>) => Promise<void>;
  deactivateChurch: (churchId: string) => Promise<void>;
  isLoading: boolean;
}

const MasterContext = createContext<MasterContextType | undefined>(undefined);

// Mock data para desenvolvimento
const mockChurches: ChurchWithStats[] = [
  {
    id: '1',
    name: 'Igreja Batista Central',
    address: 'Rua das Flores, 123',
    phone: '(11) 99999-9999',
    email: 'contato@batista-central.com',
    adminId: '1',
    departments: [],
    serviceTypes: ['Culto Domingo Manhã', 'Culto Domingo Noite'],
    courses: [],
    createdAt: new Date('2024-01-15'),
    totalMembers: 245,
    activeMembers: 198,
    lastActivity: new Date('2024-06-13'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Igreja Nova Vida',
    address: 'Av. Esperança, 456',
    phone: '(11) 88888-8888',
    email: 'contato@nova-vida.com',
    adminId: '2',
    departments: [],
    serviceTypes: ['Culto Domingo', 'Reunião de Oração'],
    courses: [],
    createdAt: new Date('2024-02-01'),
    totalMembers: 189,
    activeMembers: 156,
    lastActivity: new Date('2024-06-12'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Igreja Comunidade Cristã',
    address: 'Rua da Paz, 789',
    phone: '(11) 77777-7777',
    email: 'contato@comunidade.com',
    adminId: '3',
    departments: [],
    serviceTypes: ['Culto Principal'],
    courses: [],
    createdAt: new Date('2024-03-10'),
    totalMembers: 78,
    activeMembers: 45,
    lastActivity: new Date('2024-06-10'),
    isActive: true,
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'church_created' as const,
    description: 'Nova igreja cadastrada',
    details: 'Igreja Batista Nova Vida',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
  },
  {
    id: '2',
    type: 'admin_added' as const,
    description: 'Novo admin cadastrado',
    details: 'Pastor Carlos - Igreja Central',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h atrás
  },
  {
    id: '3',
    type: 'church_deactivated' as const,
    description: 'Igreja desativada',
    details: 'Igreja Comunidade Cristã',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
  }
];

export const MasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<ChurchWithStats[]>([]);
  const [stats, setStats] = useState<MasterStats>({
    totalChurches: 0,
    totalUsers: 0,
    activeChurches: 0,
    newChurchesThisMonth: 0,
    newUsersThisWeek: 0,
  });
  const [activities] = useState(mockActivities);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setChurches(mockChurches);
      
      const totalUsers = mockChurches.reduce((sum, church) => sum + church.totalMembers, 0);
      const activeCount = mockChurches.filter(church => church.isActive).length;
      const thisMonth = new Date();
      thisMonth.setMonth(thisMonth.getMonth() - 1);
      const newThisMonth = mockChurches.filter(church => church.createdAt > thisMonth).length;
      
      setStats({
        totalChurches: mockChurches.length,
        totalUsers,
        activeChurches: activeCount,
        newChurchesThisMonth: newThisMonth,
        newUsersThisWeek: 45, // Mock data
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const createChurch = async (churchData: Partial<Church>) => {
    setIsLoading(true);
    
    // Simular criação
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newChurch: ChurchWithStats = {
      id: Date.now().toString(),
      name: churchData.name || '',
      address: churchData.address || '',
      phone: churchData.phone || '',
      email: churchData.email || '',
      adminId: '',
      departments: [],
      serviceTypes: [],
      courses: [],
      createdAt: new Date(),
      totalMembers: 0,
      activeMembers: 0,
      lastActivity: new Date(),
      isActive: true,
    };
    
    setChurches(prev => [...prev, newChurch]);
    setStats(prev => ({
      ...prev,
      totalChurches: prev.totalChurches + 1,
      activeChurches: prev.activeChurches + 1,
      newChurchesThisMonth: prev.newChurchesThisMonth + 1,
    }));
    
    setIsLoading(false);
  };

  const updateChurch = async (churchId: string, data: Partial<Church>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setChurches(prev => prev.map(church => 
      church.id === churchId ? { ...church, ...data } : church
    ));
    
    setIsLoading(false);
  };

  const deactivateChurch = async (churchId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setChurches(prev => prev.map(church => 
      church.id === churchId ? { ...church, isActive: false } : church
    ));
    
    setStats(prev => ({
      ...prev,
      activeChurches: prev.activeChurches - 1,
    }));
    
    setIsLoading(false);
  };

  return (
    <MasterContext.Provider value={{
      churches,
      stats,
      activities,
      createChurch,
      updateChurch,
      deactivateChurch,
      isLoading,
    }}>
      {children}
    </MasterContext.Provider>
  );
};

export const useMaster = () => {
  const context = useContext(MasterContext);
  if (context === undefined) {
    throw new Error('useMaster must be used within a MasterProvider');
  }
  return context;
};
