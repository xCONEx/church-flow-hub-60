
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { EditMemberDialog } from '@/components/EditMemberDialog';
import { useMembers } from '@/hooks/useMembers';
import { Badge } from '@/components/ui/badge';

export const Members = () => {
  const { user } = useAuth();
  const { members, isLoading, addMember } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
                             member.departments?.includes(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

  const canEditMembers = user?.role === 'admin' || user?.role === 'leader';

  const handleAddMember = async (memberData: any) => {
    await addMember(memberData);
  };

  const handleEditMember = (memberData: any) => {
    console.log('Edit member:', memberData);
    // Implementar edição
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Membros">
        <div className="text-center py-12">Carregando membros...</div>
      </DashboardLayout>
    );
  }

  const departmentCounts = members.reduce((acc, member) => {
    member.departments.forEach(dept => {
      acc[dept] = (acc[dept] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

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
                  {Object.keys(departmentCounts).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{members.length}</div>
              <p className="text-sm text-gray-600">Total de Membros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{departmentCounts['Louvor'] || 0}</div>
              <p className="text-sm text-gray-600">Ministério de Louvor</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{departmentCounts['Mídia'] || 0}</div>
              <p className="text-sm text-gray-600">Ministério de Mídia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {members.filter(m => m.experience === 'advanced').length}
              </div>
              <p className="text-sm text-gray-600">Membros Experientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {members.length === 0 ? 'Nenhum membro cadastrado' : 'Nenhum membro encontrado'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {members.length === 0 
                    ? 'Comece adicionando os primeiros membros da sua equipe ministerial.'
                    : 'Tente ajustar os filtros de busca.'
                  }
                </p>
                {canEditMembers && members.length === 0 && (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && (
                        <p className="text-xs text-gray-500">{member.phone}</p>
                      )}
                    </div>
                    {canEditMembers && (
                      <div className="flex space-x-2">
                        <EditMemberDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                          member={member}
                          onEdit={handleEditMember}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Função:</span>
                      <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                        {member.role === 'leader' ? 'Líder' : 
                         member.role === 'collaborator' ? 'Colaborador' : 'Membro'}
                      </Badge>
                    </div>

                    {member.departments.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Departamentos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.departments.map(dept => (
                            <Badge key={dept} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.skills.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Habilidades:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Experiência:</span>
                      <span className="text-sm font-medium">
                        {member.experience === 'beginner' ? 'Iniciante' :
                         member.experience === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
