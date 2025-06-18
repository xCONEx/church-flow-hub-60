
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Plus, Users, Music, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { CreateScaleDialog } from '@/components/CreateScaleDialog';

export const Scales = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [scales, setScales] = useState<any[]>([]);

  const canCreateScales = user?.role === 'admin' || user?.role === 'leader';

  const stats = {
    total: 0,
    published: 0,
    completed: 0,
    needAttention: 0,
  };

  return (
    <DashboardLayout title="Escalas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Escalas de Ministério</h2>
            <p className="text-gray-600">Gerencie as escalas de cultos e eventos</p>
          </div>
          {canCreateScales && (
            <CreateScaleDialog
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Escala
                </Button>
              }
            />
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Louvor">Louvor</SelectItem>
                  <SelectItem value="Mídia">Mídia</SelectItem>
                  <SelectItem value="Sonoplastia">Sonoplastia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total de Escalas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-sm text-gray-600">Publicadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">Concluídas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.needAttention}</div>
              <p className="text-sm text-gray-600">Precisam Atenção</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma escala criada ainda
            </h3>
            <p className="text-gray-600 mb-6">
              {canCreateScales 
                ? "Comece criando sua primeira escala de ministério." 
                : "Aguarde um administrador ou líder criar as escalas."
              }
            </p>
            {canCreateScales && (
              <CreateScaleDialog
                trigger={
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Escala
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
