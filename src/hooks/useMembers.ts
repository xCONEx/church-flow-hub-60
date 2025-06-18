
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'collaborator' | 'leader';
  departments: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  churchId: string;
  createdAt: Date;
}

export const useMembers = () => {
  const { church, user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = async () => {
    if (!church?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Buscar membros através de user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner (
            id,
            name,
            email,
            phone,
            experience,
            skills
          )
        `)
        .eq('church_id', church.id);

      if (rolesError) throw rolesError;

      // Buscar departamentos dos usuários
      const { data: userDepartments, error: deptError } = await supabase
        .from('user_departments')
        .select(`
          user_id,
          departments (name)
        `);

      if (deptError) throw deptError;

      // Agrupar por usuário
      const memberMap = new Map<string, Member>();
      
      userRoles?.forEach(userRole => {
        if (!userRole.profiles) return;
        
        const profile = userRole.profiles;
        const userId = profile.id;
        
        if (!memberMap.has(userId)) {
          memberMap.set(userId, {
            id: userId,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            role: userRole.role === 'admin' ? 'leader' : userRole.role as Member['role'],
            departments: [],
            experience: profile.experience as Member['experience'] || 'beginner',
            skills: profile.skills || [],
            churchId: church.id,
            createdAt: new Date()
          });
        }
      });

      // Adicionar departamentos
      userDepartments?.forEach(userDept => {
        const member = memberMap.get(userDept.user_id);
        if (member && userDept.departments?.name && !member.departments.includes(userDept.departments.name)) {
          member.departments.push(userDept.departments.name);
        }
      });

      setMembers(Array.from(memberMap.values()));
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar membros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'churchId' | 'createdAt'>) => {
    if (!church?.id || !user?.id) return;

    try {
      // Verificar se o usuário já existe
      let { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', memberData.email)
        .single();

      let profileId = existingProfile?.id;

      if (!profileId) {
        // Criar novo perfil com UUID gerado pelo Supabase
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(), // Gerar UUID temporário
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            experience: memberData.experience,
            skills: memberData.skills
          })
          .select('id')
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      // Criar role principal
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profileId,
          church_id: church.id,
          role: memberData.role
        });

      if (roleError) throw roleError;

      // Adicionar aos departamentos
      if (memberData.departments.length > 0) {
        const { data: departments } = await supabase
          .from('departments')
          .select('id, name')
          .eq('church_id', church.id)
          .in('name', memberData.departments);

        if (departments) {
          const departmentRoles = departments.map(dept => ({
            user_id: profileId,
            department_id: dept.id,
            role: 'member'
          }));

          await supabase.from('user_departments').insert(departmentRoles);
        }
      }

      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso!",
      });

      await loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMembers();
  }, [church?.id]);

  return {
    members,
    isLoading,
    addMember,
    loadMembers
  };
};
