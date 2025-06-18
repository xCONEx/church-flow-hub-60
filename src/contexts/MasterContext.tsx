
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MasterStats {
  totalChurches: number;
  totalUsers: number;
  activeChurches: number;
  newChurchesThisMonth: number;
  newUsersThisWeek: number;
}

interface Activity {
  id: string;
  description: string;
  details: string;
  timestamp: Date;
}

interface Church {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  admin_id: string;
  created_at: string;
  admin_name?: string;
}

interface MasterContextType {
  stats: MasterStats;
  activities: Activity[];
  churches: Church[];
  isLoading: boolean;
  createChurch: (churchData: any) => Promise<void>;
  updateChurch: (churchId: string, churchData: any) => Promise<void>;
  deleteChurch: (churchId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MasterContext = createContext<MasterContextType | undefined>(undefined);

export const MasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MasterStats>({
    totalChurches: 0,
    totalUsers: 0,
    activeChurches: 0,
    newChurchesThisMonth: 0,
    newUsersThisWeek: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (user?.role !== 'master') {
      setIsLoading(false);
      return;
    }

    try {
      // Load churches
      const { data: churchesData } = await supabase
        .from('churches')
        .select(`
          *,
          profiles!churches_admin_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      const churchesWithAdminNames = churchesData?.map(church => ({
        ...church,
        admin_name: church.profiles?.name || 'Sem nome'
      })) || [];

      setChurches(churchesWithAdminNames);

      // Load users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const newChurchesThisMonth = churchesData?.filter(church => 
        new Date(church.created_at) >= oneMonthAgo
      ).length || 0;

      setStats({
        totalChurches: churchesData?.length || 0,
        totalUsers: usersCount || 0,
        activeChurches: churchesData?.length || 0,
        newChurchesThisMonth,
        newUsersThisWeek: 0,
      });

      // Mock activities for now
      setActivities([
        {
          id: '1',
          description: 'Nova igreja cadastrada',
          details: 'Igreja Batista Central foi adicionada ao sistema',
          timestamp: new Date(),
        },
        {
          id: '2',
          description: 'Usuário registrado',
          details: 'Novo administrador se registrou no sistema',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ]);

    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChurch = async (churchData: any) => {
    // This function will handle church creation
    await loadData(); // Refresh data after creation
  };

  const updateChurch = async (churchId: string, churchData: any) => {
    try {
      const { error } = await supabase
        .from('churches')
        .update({
          name: churchData.name,
          address: churchData.address,
          phone: churchData.phone,
          email: churchData.email,
        })
        .eq('id', churchId);

      if (error) throw error;

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error updating church:', error);
      throw error;
    }
  };

  const deleteChurch = async (churchId: string) => {
    try {
      // Delete related data first
      await supabase.from('user_roles').delete().eq('church_id', churchId);
      await supabase.from('departments').delete().eq('church_id', churchId);
      
      // Delete the church
      const { error } = await supabase
        .from('churches')
        .delete()
        .eq('id', churchId);

      if (error) throw error;

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error deleting church:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const value: MasterContextType = {
    stats,
    activities,
    churches,
    isLoading,
    createChurch,
    updateChurch,
    deleteChurch,
    refreshData,
  };

  return (
    <MasterContext.Provider value={value}>
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
