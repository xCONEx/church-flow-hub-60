
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockMembers = [
  {
    id: '1',
    name: 'Ana Karolina Silva',
    email: 'ana@igreja.com',
    phone: '(11) 99999-1111',
    avatar: '/placeholder.svg',
    departments: ['Louvor'],
    role: 'Vocal Principal',
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
    role: 'Guitarrista',
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
    role: 'Baterista',
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
    role: 'Projeção',
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
    departments: ['Mídia'],
    role: 'Sonoplastia',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
                             member.departments.includes(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

  const canEditMembers = user?.role === 'admin' || user?.role === 'leader';

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
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
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
                  <SelectItem value="Sonoplastia">Sonoplastia</SelectItem>
                  <SelectItem value="Instrumentos">Instrumentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{mockMembers.length}</div>
              <p className="text-sm text-gray-600">Total de Membros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {mockMembers.filter(m => m.departments.includes('Louvor')).length}
              </div>
              <p className="text-sm text-gray-600">Ministério de Louvor</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {mockMembers.filter(m => m.departments.includes('Mídia')).length}
              </div>
              <p className="text-sm text-gray-600">Ministério de Mídia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {mockMembers.filter(m => m.experience >= 7).length}
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
                      <p className="text-sm text-gray-600">{member.role}</p>
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
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Histórico
                    </Button>
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
