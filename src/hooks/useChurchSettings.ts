
import { useState, useEffect, useCallback } from 'react';
import { Department } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useChurchSettings = () => {
  const { church } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [departmentCounts, setDepartmentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadDepartments = useCallback(async () => {
    if (!church?.id) return;

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

      console.log('Departments loaded:', deptArray);
      setDepartments(deptArray);

      // Carregar contadores de colaboradores usando user_departments
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

    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar departamentos",
        variant: "destructive",
      });
    }
  }, [church?.id]);

  const loadServiceTypes = useCallback(async () => {
    if (!church?.id) return;

    try {
      const { data: churchData } = await supabase
        .from('churches')
        .select('service_types')
        .eq('id', church.id)
        .single();

      if (churchData?.service_types) {
        setServiceTypes(churchData.service_types);
      } else {
        // Tipos de serviços padrão
        setServiceTypes([
          'Culto Domingo Manhã',
          'Culto Domingo Noite', 
          'Reunião de Oração',
          'Culto de Jovens'
        ]);
      }
    } catch (error) {
      console.error('Error loading service types:', error);
      // Usar tipos padrão em caso de erro
      setServiceTypes([
        'Culto Domingo Manhã',
        'Culto Domingo Noite', 
        'Reunião de Oração',
        'Culto de Jovens'
      ]);
    }
  }, [church?.id]);

  const loadData = useCallback(async () => {
    if (!church?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    await Promise.all([loadDepartments(), loadServiceTypes()]);
    setIsLoading(false);
  }, [church?.id, loadDepartments, loadServiceTypes]);

  const handleDeleteDepartment = async (id: string) => {
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
  };

  const handleDeleteServiceType = async (name: string) => {
    if (!church?.id) return;

    try {
      const updatedTypes = serviceTypes.filter(type => type !== name);
      
      const { error } = await supabase
        .from('churches')
        .update({ service_types: updatedTypes })
        .eq('id', church.id);

      if (error) throw error;

      setServiceTypes(updatedTypes);
      
      toast({
        title: "Sucesso",
        description: "Tipo de culto removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting service type:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de culto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    departments,
    serviceTypes,
    departmentCounts,
    isLoading,
    loadDepartments,
    loadServiceTypes,
    handleDeleteDepartment,
    handleDeleteServiceType,
  };
};
