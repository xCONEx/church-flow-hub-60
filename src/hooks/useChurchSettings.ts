
import { useMemo } from 'react';
import { useDepartments } from './useDepartments';
import { useServiceTypes } from './useServiceTypes';
import { useChurchStore } from '@/stores/churchStore';

export const useChurchSettings = () => {
  const { isInitializing, setInitializing } = useChurchStore();
  
  const {
    departments,
    departmentCounts,
    isLoading: isDepartmentsLoading,
    loadDepartments,
    createDepartment,
    deleteDepartment,
  } = useDepartments();

  const {
    serviceTypes,
    isLoading: isServiceTypesLoading,
    loadServiceTypes,
    deleteServiceType,
  } = useServiceTypes();

  // Memoize combined loading state
  const isLoading = useMemo(() => 
    isDepartmentsLoading || isServiceTypesLoading || isInitializing,
    [isDepartmentsLoading, isServiceTypesLoading, isInitializing]
  );

  // Update department function with optimized signature
  const updateDepartment = async (departmentId: string, departmentData: {
    name?: string;
    type?: string;
  }) => {
    // Implementation would go here - simplified for now
    console.log('Update department:', departmentId, departmentData);
  };

  return {
    departments,
    serviceTypes,
    departmentCounts,
    isLoading,
    loadDepartments,
    loadServiceTypes,
    createDepartment,
    updateDepartment,
    handleDeleteDepartment: deleteDepartment,
    handleDeleteServiceType: deleteServiceType,
  };
};
