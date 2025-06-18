
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChurchSettings } from '@/hooks/useChurchSettings';
import { DepartmentsTab } from '@/components/ChurchSettings/DepartmentsTab';
import { ServiceTypesTab } from '@/components/ChurchSettings/ServiceTypesTab';

export const ChurchSettings = () => {
  const { user } = useAuth();
  const {
    departments,
    serviceTypes,
    departmentCounts,
    isLoading,
    loadDepartments,
    loadServiceTypes,
    handleDeleteDepartment,
    handleDeleteServiceType,
  } = useChurchSettings();

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout title="Acesso Negado">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Apenas administradores podem acessar as configurações da igreja.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Configurações da Igreja">
        <div className="text-center py-12">Carregando configurações...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configurações da Igreja">
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Configurações da Igreja</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie departamentos e tipos de cultos</p>
        </div>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="departments" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-4">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Departamentos</span>
              <span className="sm:hidden">Deptos</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm px-2 md:px-4">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Tipos de Cultos</span>
              <span className="sm:hidden">Cultos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <DepartmentsTab
              departments={departments}
              departmentCounts={departmentCounts}
              onDeleteDepartment={handleDeleteDepartment}
              onReloadDepartments={loadDepartments}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <ServiceTypesTab
              serviceTypes={serviceTypes}
              onDeleteServiceType={handleDeleteServiceType}
              onReloadServiceTypes={loadServiceTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
