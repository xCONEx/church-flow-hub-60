
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit, Trash2, ChevronRight } from 'lucide-react';
import { AddDepartmentDialog } from '@/components/AddDepartmentDialog';
import { Department } from '@/types';
import { getDepartmentHierarchy } from '@/utils/departmentUtils';

interface DepartmentsTabProps {
  departments: Department[];
  departmentCounts: Record<string, number>;
  onDeleteDepartment: (id: string) => void;
  onReloadDepartments: () => void;
}

export const DepartmentsTab = ({ 
  departments, 
  departmentCounts, 
  onDeleteDepartment, 
  onReloadDepartments 
}: DepartmentsTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <CardTitle className="text-lg md:text-xl">Departamentos</CardTitle>
            <CardDescription className="text-sm">Gerencie os departamentos e sub-departamentos da igreja</CardDescription>
          </div>
          <AddDepartmentDialog
            departments={departments}
            trigger={
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Departamento</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            }
            onAdd={onReloadDepartments}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {getDepartmentHierarchy(departments).map((dept) => (
            <div key={dept.id} className="space-y-2">
              {/* Departamento Pai */}
              <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg bg-card">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">{dept.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 capitalize">{dept.type}</p>
                  <p className="text-xs text-gray-500">{departmentCounts[dept.id] || 0} colaboradores</p>
                </div>
                <div className="flex space-x-1 md:space-x-2 ml-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    onClick={() => onDeleteDepartment(dept.id)}
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Sub-departamentos */}
              {dept.subDepartments.map((subDept) => (
                <div key={subDept.id} className="ml-4 md:ml-6 flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{subDept.name}</h4>
                      <p className="text-xs text-gray-500">{departmentCounts[subDept.id] || 0} colaboradores</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                      onClick={() => onDeleteDepartment(subDept.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
