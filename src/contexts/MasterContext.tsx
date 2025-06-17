
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Church, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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

export const MasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<ChurchWithStats[]>([]);
  const [stats, setStats] = useState<MasterStats>({
    totalChurches: 0,
    totalUsers: 0,
    activeChurches: 0,
    newChurchesThisMonth: 0,
    newUsersThisWeek: 0,
  });
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'church_created' | 'admin_added' | 'church_deactivated';
    description: string;
    details: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar igrejas reais do banco
      const { data: churchesData, error: churchesError } = await supabase
        .from('churches')
        .select(`
          *,
          departments(*)
        `);

      if (churchesError) {
        console.error('Error loading churches:', churchesError);
        return;
      }

      // Converter dados para o formato esperado
      const churchesWithStats: ChurchWithStats[] = (churchesData || []).map(church => ({
        id: church.id,
        name: church.name,
        address: church.address,
        phone: church.phone,
        email: church.email,
        adminId: church.admin_id,
        departments: church.departments?.map(dept => ({
          id: dept.id,
          name: dept.name,
          churchId: dept.church_id,
          leaderId: dept.leader_id,
          collaborators: [],
          type: dept.type as any,
          parentDepartmentId: dept.parent_department_id,
          isSubDepartment: dept.is_sub_department,
          createdAt: new Date(dept.created_at)
        })) || [],
        serviceTypes: church.service_types || [],
        courses: [],
        createdAt: new Date(church.created_at),
        totalMembers: 0,
        activeMembers: 0,
        lastActivity: new Date(),
        isActive: true,
      }));

      setChurches(churchesWithStats);

      // Calcular estatísticas reais
      const totalUsers = 0;
      const activeCount = churchesWithStats.filter(church => church.isActive).length;
      const thisMonth = new Date();
      thisMonth.setMonth(thisMonth.getMonth() - 1);
      const newThisMonth = churchesWithStats.filter(church => church.createdAt > thisMonth).length;

      setStats({
        totalChurches: churchesWithStats.length,
        totalUsers,
        activeChurches: activeCount,
        newChurchesThisMonth: newThisMonth,
        newUsersThisWeek: 0,
      });

    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChurch = async (churchData: Partial<Church>) => {
    try {
      setIsLoading(true);
      console.log('Creating church with data:', churchData);
      
      const { data, error } = await supabase
        .from('churches')
        .insert({
          name: churchData.name,
          address: churchData.address,
          phone: churchData.phone,
          email: churchData.email,
          admin_id: churchData.adminId, // adminId já deve ser um UUID válido
          service_types: churchData.serviceTypes || [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating church:', error);
        throw error;
      }

      console.log('Church created successfully:', data);
      
      // Atualizar o role do admin com o church_id
      if (churchData.adminId) {
        const { error: roleUpdateError } = await supabase
          .from('user_roles')
          .update({ church_id: data.id })
          .eq('user_id', churchData.adminId)
          .eq('role', 'admin');

        if (roleUpdateError) {
          console.error('Error updating admin role:', roleUpdateError);
        }
      }
      
      // Recarregar dados
      await loadRealData();
      
    } catch (error) {
      console.error('Failed to create church:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChurch = async (churchId: string, data: Partial<Church>) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('churches')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          admin_id: data.adminId,
          service_types: data.serviceTypes,
        })
        .eq('id', churchId);

      if (error) {
        console.error('Error updating church:', error);
        throw error;
      }

      console.log(`Church ${churchId} updated successfully`);
      
      // Recarregar dados
      await loadRealData();
      
    } catch (error) {
      console.error('Failed to update church:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateChurch = async (churchId: string) => {
    try {
      setIsLoading(true);
      
      // Por enquanto, só removemos da lista local
      // Depois implementaremos soft delete no banco
      setChurches(prev => prev.filter(church => church.id !== churchId));
      
      setStats(prev => ({
        ...prev,
        activeChurches: prev.activeChurches - 1,
      }));

      console.log(`Church ${churchId} deactivated`);
      
    } catch (error) {
      console.error('Failed to deactivate church:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
