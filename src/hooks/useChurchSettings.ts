
import { useState, useEffect } from 'react';
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

  const loadDepartments = async () => {
    if (!church?.id) return;

    try {
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

// Suponha que cada dept tenha ao menos um id: string
type Department = { id: string };

// Você pode ajustar esse tipo com base na sua estrutura real
const loadDepartmentCounts = async (deptArray: Department[]) => {
  const counts: Record<string, number> = {};

  for (const dept of deptArray) {
    try {
      const { data: collaborators, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('department_id', dept.id);

      if (error) {
        console.error('Supabase error:', error);
        counts[dept.id] = 0;
      } else {
        counts[dept.id] = collaborators?.length ?? 0;
      }
    } catch (err) {
      console.error('Error counting collaborators for dept', dept.id, err);
      counts[dept.id] = 0;
    }
  }

  setDepartmentCounts(counts);
};


  const loadServiceTypes = async () => {
    setServiceTypes([
      'Culto Domingo Manhã',
      'Culto Domingo Noite', 
      'Reunião de Oração',
      'Culto de Jovens'
    ]);
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadDepartments(), loadServiceTypes()]);
    setIsLoading(false);
  };

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
    setServiceTypes(prev => prev.filter(type => type !== name));
    
    toast({
      title: "Sucesso",
      description: "Tipo de culto removido com sucesso",
    });
  };

  useEffect(() => {
    loadData();
  }, [church?.id]);

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
