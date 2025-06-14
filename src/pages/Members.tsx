
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Phone, Mail, Edit, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { EditMemberDialog } from '@/components/EditMemberDialog';
import { MemberHistoryDialog } from '@/components/MemberHistoryDialog';
import { useToast } from '@/hooks/use-toast';

// Mock data
const initialMembers = [
  {
    id: '1',
    name: 'Ana Karolina Silva',
    email: 'ana@igreja.com',
    phone: '(11) 99999-1111',
    avatar: '/placeholder.svg',
    departments: ['Louvor'],
    role: 'collaborator',
    skills: ['Vocal Principal', 'Vocal'],
    experience: 9,
    joinedAt: new Date('2023-01-15'),
    lastActive: new Date(),
  },
  {
    id: '2',
    name: 'Yuri Adriel Santos',
    email: 'yuri@igreja.com',
    phone: '(11) 99999-2222',
    avatar: '/placeholder.svg',
    departments: ['Louvor'],
    role: 'collaborator',
    skills: ['Guitarra', 'Violão'],
    experience: 8,
    joinedAt: new Date('2023-03-20'),
    lastActive: new Date(),
  },
  {
    id: '3',
    name: 'Arthur Oliveira',
    email: 'arthur@igreja.com',
    phone: '(11) 99999-3333',
    avatar: '/placeholder.svg',
    departments: ['Louvor'],
    role: 'member',
    skills: ['Bateria', 'Cajon'],
    experience: 7,
    joinedAt: new Date('2023-05-10'),
    lastActive: new Date(),
  },
  {
    id: '4',
    name: 'João Pedro Costa',
    email: 'joao@igreja.com',
    phone: '(11) 99999-4444',
    avatar: '/placeholder.svg',
    departments: ['Mídia'],
    role: 'member',
    skills: ['Projeção', 'Fotografia'],
    experience: 6,
    joinedAt: new Date('2023-07-05'),
    lastActive: new Date(),
  },
  {
    id: '5',
    name: 'Alexandre Ferreira',
    email: 'alex@igreja.com',
    phone: '(11) 99999-5555',
    avatar: '/placeholder.svg',
    departments: ['Mídia', 'Louvor'],
    role: 'leader',
    skills: ['Sonoplastia', 'Teclado'],
    experience: 8,
    joinedAt: new Date('2023-02-12'),
    lastActive: new Date(),
  }
];

const experienceLabels = {
  0: 'Iniciante',
  1: 'Iniciante',
  2: 'Iniciante',
  3: 'Treinamento',
  4: 'Treinamento',
  5: 'Intermediário',
  6: 'Intermediário',
  7: 'Avançado',
  8: 'Avançado',
  9: 'Experiente',
  10: 'Experiente'
};

export const Members = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [members, setMembers] = useState(initialMembers);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
                             member.departments.includes(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

  const canEditMembers = user?.role === 'admin' || user?.role === 'leader';

  const handleAddMember = (memberData: any) => {
    const newMember = {
      ...memberData,
      id: Date.now().toString(),
      avatar: '/placeholder.svg',
      departments: memberData.department ? [memberData.department] : [],
      experience: memberData.experience === 'beginner' ? 3 : 
                  memberData.experience === 'intermediate' ? 6 : 8,
      joinedAt: new Date(),
      lastActive: new Date(),
    };

    setMembers(prev => [...prev, newMember]);
    toast({
      title: "Membro Adicionado",
      description: `${memberData.name} foi adicionado com sucesso.`,
    });
  };

  const handleEditMember = (updatedMember: any) => {
    setMembers(prev => prev.map(member => 
      member.id === updatedMember.id ? {
        ...updatedMember,
        departments: updatedMember.department ? [updatedMember.department] : updatedMember.departments,
        experience: updatedMember.experience === 'beginner' ? 3 : 
                   updatedMember.experience === 'intermediate' ? 6 : 8,
      } : member
    ));
    toast({
      title: "Membro Atualizado",
      description: `Os dados de ${updatedMember.name} foram atualizados.`,
    });
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      member: 'Membro',
      collaborator: 'Colaborador',
      leader: 'Líder'
    };
    return roleMap[role as keyof typeof roleMap] || role;
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
              <div className="text-2xl font-bold text-blue-600">{members.length}</div>
              <p className="text-sm text-gray-600">Total de Membros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.departments.includes('Louvor')).length}
              </div>
              <p className="text-sm text-gray-600">Ministério de Louvor</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {members.filter(m => m.departments.includes('Mídia')).length}
              </div>
              <p className="text-sm text-gray-600">Ministério de Mídia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {members.filter(m => m.experience >= 7).length}
              </div>
              <p className="text-sm text-gray-600">Membros Experientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{getRoleDisplay(member.role)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {member.departments.map((dept) => (
                    <Badge key={dept} variant="secondary">
                      {dept}
                    </Badge>
                  ))}
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experiência:</span>
                    <span className="font-medium">
                      {experienceLabels[member.experience as keyof typeof experienceLabels]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${member.experience * 10}%` }}
                    />
                  </div>
                </div>

                {canEditMembers && (
                  <div className="flex space-x-2 pt-2">
                    <EditMemberDialog
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      }
                      member={member}
                      onEdit={handleEditMember}
                    />
                    <MemberHistoryDialog
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                          <History className="h-4 w-4 mr-1" />
                          Histórico
                        </Button>
                      }
                      member={member}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
