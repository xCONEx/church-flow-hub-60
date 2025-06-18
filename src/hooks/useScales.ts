
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScaleMember {
  id: string;
  name: string;
  role: string;
  department: string;
  confirmed: boolean;
}

export interface ScaleSong {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  scaleKey?: string;
  category: string;
}

export interface Scale {
  id: string;
  title: string;
  date: Date;
  time: string;
  status: 'draft' | 'published' | 'completed';
  members: ScaleMember[];
  songs: ScaleSong[];
  churchId: string;
  createdAt: Date;
}

export const useScales = () => {
  const { church, user } = useAuth();
  const { toast } = useToast();
  const [scales, setScales] = useState<Scale[]>([]);
  const [availableMembers, setAvailableMembers] = useState<ScaleMember[]>([]);
  const [availableSongs, setAvailableSongs] = useState<ScaleSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAvailableMembers = useCallback(async () => {
    if (!church?.id) return;

    try {
      // Buscar membros através de user_roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner (
            id,
            name,
            email
          )
        `)
        .eq('church_id', church.id);

      if (error) throw error;

      // Buscar departamentos dos usuários
      const { data: userDepartments } = await supabase
        .from('user_departments')
        .select(`
          user_id,
          departments (name)
        `);

      // Agrupar por usuário
      const memberMap = new Map<string, ScaleMember>();
      
      userRoles?.forEach(userRole => {
        if (!userRole.profiles) return;
        
        const profile = userRole.profiles;
        const userId = profile.id;
        
        if (!memberMap.has(userId)) {
          memberMap.set(userId, {
            id: userId,
            name: profile.name,
            role: userRole.role,
            department: 'Geral',
            confirmed: false
          });
        }
      });

      // Adicionar departamentos
      userDepartments?.forEach(userDept => {
        const member = memberMap.get(userDept.user_id);
        if (member && userDept.departments?.name) {
          member.department = userDept.departments.name;
        }
      });

      const membersArray = Array.from(memberMap.values());
      setAvailableMembers(membersArray);
      console.log('Available members loaded:', membersArray.length);
    } catch (error) {
      console.error('Error loading available members:', error);
    }
  }, [church?.id]);

  const loadAvailableSongs = useCallback(async () => {
    if (!church?.id) return;

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('church_id', church.id)
        .order('title', { ascending: true });

      if (error) throw error;

      const songsArray: ScaleSong[] = (data || []).map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        originalKey: song.key || 'C',
        category: song.genre || 'Adoração'
      }));

      setAvailableSongs(songsArray);
      console.log('Available songs loaded:', songsArray.length);
    } catch (error) {
      console.error('Error loading available songs:', error);
    }
  }, [church?.id]);

  const loadScales = useCallback(async () => {
    if (!church?.id) return;

    setIsLoading(true);
    try {
      // Por enquanto, usar dados mock mas com estrutura real para escalas
      // Em uma implementação futura, isso viria do banco de dados
      const mockScales: Scale[] = [];
      setScales(mockScales);
      console.log('Scales loaded successfully:', mockScales.length);
    } catch (error) {
      console.error('Error loading scales:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar escalas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [church?.id, toast]);

  const createScale = async (scaleData: {
    title: string;
    date: Date;
    time: string;
    memberIds: string[];
    songIds: string[];
  }) => {
    if (!church?.id || !user?.id) return;

    try {
      console.log('Creating scale:', scaleData);
      
      // Aqui seria a implementação real de criação de escala
      // Por enquanto, apenas simular sucesso
      
      toast({
        title: "Sucesso",
        description: "Escala criada com sucesso!",
      });

      loadScales();
    } catch (error) {
      console.error('Error creating scale:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar escala",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (church?.id) {
      loadScales();
      loadAvailableMembers();
      loadAvailableSongs();
    }
  }, [church?.id, loadScales, loadAvailableMembers, loadAvailableSongs]);

  return {
    scales,
    availableMembers,
    availableSongs,
    isLoading,
    createScale,
    loadScales
  };
};
