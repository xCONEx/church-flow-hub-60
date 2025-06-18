
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChurchStore } from '@/stores/churchStore';
import { Department } from '@/types';

type DepartmentType = "louvor" | "louvor-juniores" | "louvor-teens" | "midia" | "midia-juniores" | "sonoplastia" | "instrumentos" | "recepcao" | "ministracao" | "palavra" | "oracao" | "custom";

export const useDepartments = () => {
  const { church } = useAuth();
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const isLoadingRef = useRef(false);
  
  const {
    departments,
    departmentCounts,
    isDepartmentsLoading,
    setDepartments,
    setDepartmentCounts,
    setDepartmentsLoading
  } = useChurchStore();

  const loadDepartments = useCallback(async () => {
    if (!church?.id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setDepartmentsLoading(true);
    
    try {
      console.log('Loading departments for church:', church.id);
      
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('church_id', church.id)
        .order('created_at', { ascending: true });

      if (deptError) throw deptError;

      const deptArray: Department[] = [];
      
      if (deptData) {
        for (const dept of deptData) {
          deptArray.push({
            id: dept.id,
            name: dept.name,
            churchId: dept.church_id,
            leaderId: dept.leader_id,
            collaborators: [],
            type: dept.type,
            parentDepartmentId: dept.parent_department_id,
            isSubDepartment: dept.is_sub_department,
            createdAt: new Date(dept.created_at),
          });
        }
      }

      setDepartments(deptArray);

      // Load collaborator counts
      const counts: Record<string, number> = {};
      if (deptArray.length > 0) {
        const { data: collaborators } = await supabase
          .from('user_departments')
          .select('department_id')
          .in('department_id', deptArray.map(d => d.id));
        
        if (collaborators) {
          collaborators.forEach(collab => {
            if (collab.department_id) {
              counts[collab.department_id] = (counts[collab.department_id] || 0) + 1;
            }
          });
        }
      }
      
      setDepartmentCounts(counts);
      console.log('Departments loaded successfully:', deptArray.length);

    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar departamentos",
        variant: "destructive",
      });
    } finally {
      isLoadingRef.current = false;
      setDepartmentsLoading(false);
    }
  }, [church?.id, setDepartments, setDepartmentCounts, setDepartmentsLoading, toast]);

  const createDepartment = useCallback(async (departmentData: {
    name: string;
    type: string;
    parentDepartmentId?: string;
  }) => {
    if (!church?.id) return;

    try {
      const validType: DepartmentType = departmentData.type as DepartmentType || 'custom';
      
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          type: validType,
          church_id: church.id,
          parent_department_id: departmentData.parentDepartmentId || null,
          is_sub_department: !!departmentData.parentDepartmentId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Departamento criado com sucesso!",
      });

      // Reload departments after creation
      await loadDepartments();
      return data;
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar departamento",
        variant: "destructive",
      });
      throw error;
    }
  }, [church?.id, loadDepartments, toast]);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Departamento removido com sucesso",
      });

      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover departamento",
        variant: "destructive",
      });
    }
  }, [loadDepartments, toast]);

  // Setup subscription with proper cleanup
  useEffect(() => {
    if (!church?.id) return;

    // Cleanup previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Setup new subscription with unique channel name
    const channelName = `departments_${church.id}_${Date.now()}`;
    subscriptionRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'departments', filter: `church_id=eq.${church.id}` },
        () => {
          console.log('Department change detected, reloading...');
          loadDepartments();
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [church?.id, loadDepartments]);

  // Load departments when church changes
  useEffect(() => {
    if (church?.id) {
      loadDepartments();
    }
  }, [church?.id, loadDepartments]);

  return {
    departments,
    departmentCounts,
    isLoading: isDepartmentsLoading,
    loadDepartments,
    createDepartment,
    deleteDepartment,
  };
};
