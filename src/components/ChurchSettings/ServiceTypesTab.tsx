
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AddServiceTypeDialog } from '@/components/AddServiceTypeDialog';

interface ServiceTypesTabProps {
  serviceTypes: string[];
  onDeleteServiceType: (name: string) => void;
  onReloadServiceTypes: () => void;
}

export const ServiceTypesTab = ({ 
  serviceTypes, 
  onDeleteServiceType, 
  onReloadServiceTypes 
}: ServiceTypesTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <CardTitle className="text-lg md:text-xl">Tipos de Cultos</CardTitle>
            <CardDescription className="text-sm">Configure os tipos de cultos e eventos</CardDescription>
          </div>
          <AddServiceTypeDialog
            trigger={
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Tipo de Culto</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            }
            onAdd={onReloadServiceTypes}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {serviceTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">{type}</h3>
              </div>
              <div className="flex space-x-1 md:space-x-2 ml-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  onClick={() => onDeleteServiceType(type)}
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
