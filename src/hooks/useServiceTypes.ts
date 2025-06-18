
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChurchStore } from '@/stores/churchStore';

export const useServiceTypes = () => {
  const { church } = useAuth();
  const { toast } = useToast();
  const isLoadingRef = useRef(false);
  
  const {
    serviceTypes,
    isServiceTypesLoading,
    setServiceTypes,
    setServiceTypesLoading
  } = useChurchStore();

  const loadServiceTypes = useCallback(async () => {
    if (!church?.id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setServiceTypesLoading(true);
    
    try {
      console.log('Loading service types for church:', church.id);
      
      const { data: churchData } = await supabase
        .from('churches')
        .select('service_types')
        .eq('id', church.id)
        .single();

      if (churchData?.service_types) {
        setServiceTypes(churchData.service_types);
      } else {
        // Default service types
        const defaultTypes = [
          'Culto Domingo Manhã',
          'Culto Domingo Noite', 
          'Reunião de Oração',
          'Culto de Jovens'
        ];
        setServiceTypes(defaultTypes);
      }
    } catch (error) {
      console.error('Error loading service types:', error);
      // Use defaults on error
      const defaultTypes = [
        'Culto Domingo Manhã',
        'Culto Domingo Noite', 
        'Reunião de Oração',
        'Culto de Jovens'
      ];
      setServiceTypes(defaultTypes);
    } finally {
      isLoadingRef.current = false;
      setServiceTypesLoading(false);
    }
  }, [church?.id, setServiceTypes, setServiceTypesLoading]);

  const deleteServiceType = useCallback(async (name: string) => {
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
  }, [church?.id, serviceTypes, setServiceTypes, toast]);

  // Load service types when church changes
  useEffect(() => {
    if (church?.id) {
      loadServiceTypes();
    }
  }, [church?.id, loadServiceTypes]);

  return {
    serviceTypes,
    isLoading: isServiceTypesLoading,
    loadServiceTypes,
    deleteServiceType,
  };
};
