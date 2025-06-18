
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Users, Building, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddMemberDialog } from '@/components/AddMemberDialog';

export const Members = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [members] = useState([]); // Começar com array vazio

  const filteredMembers = members.filter((member: any) => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
                             member.departments?.includes(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

  const canEditMembers = user?.role === 'admin' || user?.role === 'leader';

  const handleAddMember = (memberData: any) => {
    // Implementar lógica para adicionar membro real
    console.log('Member to add:', memberData);
  };

  return (
    <DashboardLayout title="Membros">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Membros da Igreja</h2>
            <p className="text-gray-600">Gerencie os membros e suas funções nos ministérios</p>
          </div>
          {canEditMembers && (
            <AddMemberDialog
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              }
              onAdd={handleAddMember}
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
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Departamentos</SelectItem>
                  <SelectItem value="Louvor">Louvor</SelectItem>
                  <SelectItem value="Mídia">Mídia</SelectItem>
                  <SelectItem value="Ministração">Ministração</SelectItem>
                  <SelectItem value="Recepção">Recepção</SelectItem>
                  <SelectItem value="Palavra">Palavra</SelectItem>
                  <SelectItem value="Oração">Oração</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-sm text-gray-600">Total de Membros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">Ministério de Louvor</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Ministério de Mídia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">Membros Experientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum membro cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece adicionando os primeiros membros da sua equipe ministerial.
                </p>
                {canEditMembers && (
                  <AddMemberDialog
                    trigger={
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Membro
                      </Button>
                    }
                    onAdd={handleAddMember}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Guide */}
        {members.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Como começar
              </CardTitle>
              <CardDescription>
                Passos para organizar sua equipe ministerial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Adicione membros da equipe</h4>
                    <p className="text-sm text-gray-600">
                      Cadastre músicos, operadores de som, mídia e outros colaboradores
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Organize por departamentos</h4>
                    <p className="text-sm text-gray-600">
                      Defina quem pertence ao louvor, mídia, ministração, etc.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Defina habilidades e experiência</h4>
                    <p className="text-sm text-gray-600">
                      Registre instrumentos, funções e nível de experiência de cada membro
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
