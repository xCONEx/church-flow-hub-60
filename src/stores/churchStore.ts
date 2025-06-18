
import { create } from 'zustand';
import { Department } from '@/types';

interface ChurchStore {
  // Departments
  departments: Department[];
  departmentCounts: Record<string, number>;
  isDepartmentsLoading: boolean;
  
  // Service Types
  serviceTypes: string[];
  isServiceTypesLoading: boolean;
  
  // Global loading state
  isInitializing: boolean;
  
  // Actions
  setDepartments: (departments: Department[]) => void;
  setDepartmentCounts: (counts: Record<string, number>) => void;
  setDepartmentsLoading: (loading: boolean) => void;
  setServiceTypes: (types: string[]) => void;
  setServiceTypesLoading: (loading: boolean) => void;
  setInitializing: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useChurchStore = create<ChurchStore>((set) => ({
  // Initial state
  departments: [],
  departmentCounts: {},
  isDepartmentsLoading: false,
  serviceTypes: [],
  isServiceTypesLoading: false,
  isInitializing: true,
  
  // Actions
  setDepartments: (departments) => set({ departments }),
  setDepartmentCounts: (departmentCounts) => set({ departmentCounts }),
  setDepartmentsLoading: (isDepartmentsLoading) => set({ isDepartmentsLoading }),
  setServiceTypes: (serviceTypes) => set({ serviceTypes }),
  setServiceTypesLoading: (isServiceTypesLoading) => set({ isServiceTypesLoading }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  
  // Reset state when switching churches
  reset: () => set({
    departments: [],
    departmentCounts: {},
    isDepartmentsLoading: false,
    serviceTypes: [],
    isServiceTypesLoading: false,
    isInitializing: true,
  }),
}));
