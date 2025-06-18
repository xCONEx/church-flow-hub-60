import { useState, useEffect, useCallback } from 'react';
import { Department } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type DepartmentType = "louvor" | "louvor-juniores" | "louvor-teens" | "midia" | "midia-juniores" | "sonoplastia" | "instrumentos" | "recepcao" | "ministracao" | "palavra" | "oracao" | "custom";

export const useChurchSettings = () => {
  const { church } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [departmentCounts, setDepartmentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadDepartments = useCallback(async () => {
    if (!church?.id) return;

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

      console.log('Departments loaded successfully:', deptArray.length);
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
  }, [church?.id, toast]);

  const createDepartment = async (departmentData: {
    name: string;
    type: string;
    parentDepartmentId?: string;
  }) => {
    if (!church?.id) return;

    try {
      console.log('Creating department:', departmentData);
      
      // Converter o tipo para um dos tipos aceitos pelo Supabase
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

      if (error) {
        console.error('Error creating department:', error);
        throw error;
      }

      console.log('Department created successfully:', data);
      toast({
        title: "Sucesso",
        description: "Departamento criado com sucesso!",
      });

      // Recarregar departamentos
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
  };

  const updateDepartment = async (departmentId: string, departmentData: {
    name?: string;
    type?: string;
  }) => {
    if (!church?.id) return;

    try {
      console.log('Updating department:', departmentId, departmentData);
      
      // Preparar dados de atualização com tipos corretos
      const updateData: any = {};
      if (departmentData.name) {
        updateData.name = departmentData.name;
      }
      if (departmentData.type) {
        updateData.type = departmentData.type as DepartmentType;
      }
      
      const { error } = await supabase
        .from('departments')
        .update(updateData)
        .eq('id', departmentId)
        .eq('church_id', church.id);

      if (error) {
        console.error('Error updating department:', error);
        throw error;
      }

      console.log('Department updated successfully');
      toast({
        title: "Sucesso",
        description: "Departamento atualizado com sucesso!",
      });

      await loadDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar departamento",
        variant: "destructive",
      });
      throw error;
    }
  };

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
    if (!church?.id) return;

    setIsLoading(true);
    try {
      await Promise.all([loadDepartments(), loadServiceTypes()]);
    } finally {
      setIsLoading(false);
    }
  }, [church?.id, loadDepartments, loadServiceTypes]);

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
    if (church?.id) {
      loadData();
    }
  }, [church?.id]);

  // Recarregar dados quando houver mudanças no banco
  useEffect(() => {
    if (!church?.id) return;

    const subscription = supabase
      .channel('departments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'departments', filter: `church_id=eq.${church.id}` },
        () => {
          console.log('Department change detected, reloading...');
          loadDepartments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [church?.id, loadDepartments]);

  return {
    departments,
    serviceTypes,
    departmentCounts,
    isLoading,
    loadDepartments,
    loadServiceTypes,
    createDepartment,
    updateDepartment,
    handleDeleteDepartment,
    handleDeleteServiceType,
  };
};
