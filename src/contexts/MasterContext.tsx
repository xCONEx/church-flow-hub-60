
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
      console.log('MasterContext: Loading data for master user');
      
      // Load churches with admin names using a simpler approach
      const { data: churchesData, error: churchesError } = await supabase
        .from('churches')
        .select('*')
        .order('created_at', { ascending: false });

      if (churchesError) {
        console.error('Error loading churches:', churchesError);
        setChurches([]);
      } else {
        // Get admin names separately
        const churchesWithAdminNames = await Promise.all(
          (churchesData || []).map(async (church) => {
            const { data: adminData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', church.admin_id)
              .single();

            return {
              ...church,
              admin_name: adminData?.name || 'Sem nome'
            };
          })
        );

        setChurches(churchesWithAdminNames);
      }

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

      // Load recent activities from actual data
      const recentActivities = (churchesData || []).slice(0, 5).map((church, index) => ({
        id: `activity-${church.id}`,
        description: 'Nova igreja cadastrada',
        details: `${church.name} foi adicionada ao sistema`,
        timestamp: new Date(church.created_at),
      }));

      setActivities(recentActivities);

    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChurch = async (churchData: any) => {
    await loadData();
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
    if (user?.role === 'master') {
      loadData();
    } else {
      setIsLoading(false);
    }
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
