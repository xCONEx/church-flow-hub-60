
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDepartments = useCallback(async () => {
    if (!church?.id || isLoading) return;

    try {
      console.log('Loading departments for church:', church.id);
      
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('church_id', church.id)
        .order('created_at', { ascending: true });

      if (deptError) {
        console.error('Error loading departments:', deptError);
        throw deptError;
      }

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

      console.log('Departments loaded:', deptArray.length);
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
      console.log('Department counts loaded:', counts);

    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar departamentos",
        variant: "destructive",
      });
    }
  }, [church?.id, toast, isLoading]);

  const loadServiceTypes = useCallback(async () => {
    if (!church?.id) return;

    try {
      console.log('Loading service types for church:', church.id);
      
      const { data: churchData } = await supabase
        .from('churches')
        .select('service_types')
        .eq('id', church.id)
        .single();

      if (churchData?.service_types) {
        setServiceTypes(churchData.service_types);
        console.log('Service types loaded:', churchData.service_types);
      } else {
        // Tipos de serviços padrão
        const defaultTypes = [
          'Culto Domingo Manhã',
          'Culto Domingo Noite', 
          'Reunião de Oração',
          'Culto de Jovens'
        ];
        setServiceTypes(defaultTypes);
        console.log('Default service types set:', defaultTypes);
      }
    } catch (error) {
      console.error('Error loading service types:', error);
      // Usar tipos padrão em caso de erro
      const defaultTypes = [
        'Culto Domingo Manhã',
        'Culto Domingo Noite', 
        'Reunião de Oração',
        'Culto de Jovens'
      ];
      setServiceTypes(defaultTypes);
    }
  }, [church?.id]);

  const loadData = useCallback(async () => {
    if (!church?.id || isLoading) return;

    setIsLoading(true);
    try {
      await Promise.all([loadDepartments(), loadServiceTypes()]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [church?.id, loadDepartments, loadServiceTypes, isLoading]);

  const handleDeleteDepartment = async (id: string) => {
    try {
      console.log('Deleting department:', id);
      
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting department:', error);
        throw error;
      }

      console.log('Department deleted successfully');
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
      console.log('Deleting service type:', name);
      
      const updatedTypes = serviceTypes.filter(type => type !== name);
      
      const { error } = await supabase
        .from('churches')
        .update({ service_types: updatedTypes })
        .eq('id', church.id);

      if (error) {
        console.error('Error deleting service type:', error);
        throw error;
      }

      setServiceTypes(updatedTypes);
      console.log('Service type deleted successfully');
      
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
    if (church?.id && !hasLoaded && !isLoading) {
      loadData();
    }
  }, [church?.id, hasLoaded, isLoading, loadData]);

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
