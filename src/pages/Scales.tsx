import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Plus, Clock, Users, Music, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { CreateScaleDialog } from '@/components/CreateScaleDialog';
import { ViewScaleDialog } from '@/components/ViewScaleDialog';
import { EditScaleDialog } from '@/components/EditScaleDialog';

// Mock data
const mockScales = [
  {
    id: '1',
    title: 'Culto Domingo Manhã',
    date: new Date('2024-01-28'),
    time: '09:00',
    department: 'Louvor',
    status: 'published',
    totalMembers: 6,
    confirmedMembers: 4,
    songs: ['Eu Creio em Ti', 'Pra Te Adorar Eu Vivo', 'Eu Vou Construir'],
    createdBy: 'Pastor João',
    createdAt: new Date('2024-01-20'),
    members: [
      { name: 'Ana Karolina', role: 'Vocal Principal', confirmed: true },
      { name: 'Yuri Adriel', role: 'Guitarra', confirmed: true },
      { name: 'Arthur', role: 'Bateria', confirmed: true },
      { name: 'João Pedro', role: 'Baixo', confirmed: false },
      { name: 'Maria Silva', role: 'Vocal', confirmed: true },
      { name: 'Carlos Santos', role: 'Teclado', confirmed: false },
    ]
  },
  {
    id: '2',
    title: 'Reunião de Oração',
    date: new Date('2024-01-30'),
    time: '19:30',
    department: 'Louvor',
    status: 'draft',
    totalMembers: 4,
    confirmedMembers: 2,
    songs: ['Cornerstone', 'Reckless Love'],
    createdBy: 'Ana Karolina',
    createdAt: new Date('2024-01-22'),
    members: [
      { name: 'Ana Karolina', role: 'Vocal', confirmed: true },
      { name: 'Yuri Adriel', role: 'Violão', confirmed: true },
      { name: 'Maria Silva', role: 'Vocal', confirmed: false },
      { name: 'Pedro Costa', role: 'Cajon', confirmed: false },
    ]
  },
  {
    id: '3',
    title: 'Culto Domingo Noite',
    date: new Date('2024-01-28'),
    time: '19:00',
    department: 'Mídia',
    status: 'published',
    totalMembers: 3,
    confirmedMembers: 3,
    songs: [],
    createdBy: 'Alexandre',
    createdAt: new Date('2024-01-21'),
    members: [
      { name: 'João Pedro', role: 'Projeção', confirmed: true },
      { name: 'Alexandre', role: 'Sonoplastia', confirmed: true },
      { name: 'Oswaldo', role: 'Fotografia', confirmed: true },
    ]
  },
  {
    id: '4',
    title: 'Ensaio Geral',
    date: new Date('2024-01-26'),
    time: '19:00',
    department: 'Louvor',
    status: 'completed',
    totalMembers: 8,
    confirmedMembers: 7,
    songs: ['Eu Creio em Ti', 'Pra Te Adorar Eu Vivo', 'Eu Vou Construir', 'Cornerstone'],
    createdBy: 'Pastor João',
    createdAt: new Date('2024-01-19'),
    members: [
      { name: 'Ana Karolina', role: 'Vocal Principal', confirmed: true },
      { name: 'Yuri Adriel', role: 'Guitarra', confirmed: true },
      { name: 'Arthur', role: 'Bateria', confirmed: true },
      { name: 'João Pedro', role: 'Baixo', confirmed: true },
      { name: 'Maria Silva', role: 'Vocal', confirmed: true },
      { name: 'Carlos Santos', role: 'Teclado', confirmed: true },
      { name: 'Pedro Costa', role: 'Violão', confirmed: true },
      { name: 'Juliana', role: 'Vocal', confirmed: false },
    ]
  }
];

const statusConfig = {
  draft: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  },
  published: {
    label: 'Publicada',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  completed: {
    label: 'Concluída',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  }
};

export const Scales = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [scales, setScales] = useState(mockScales);

  const filteredScales = scales.filter(scale => {
    const matchesSearch = scale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scale.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || scale.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || scale.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const canCreateScales = user?.role === 'admin' || user?.role === 'leader';

  const stats = {
    total: scales.length,
    published: scales.filter(s => s.status === 'published').length,
    completed: scales.filter(s => s.status === 'completed').length,
    needAttention: scales.filter(s => s.confirmedMembers < s.totalMembers && s.status === 'published').length,
  };

  const handleSaveScale = (updatedScale: any) => {
    setScales(prev => prev.map(scale => 
      scale.id === updatedScale.id ? updatedScale : scale
    ));
    console.log('Scale updated:', updatedScale);
  };

  const handlePublishScale = (scaleId: string) => {
    const scale = scales.find(s => s.id === scaleId);
    if (!scale) return;

    // Atualizar status da escala
    const updatedScale = { ...scale, status: 'published' as const };
    setScales(prev => prev.map(s => 
      s.id === scaleId ? updatedScale : s
    ));

    // Criar notificação
    addNotification({
      type: 'scale',
      title: 'Nova Escala Publicada',
      message: `A escala "${scale.title}" do dia ${scale.date.toLocaleDateString('pt-BR')} foi publicada.`,
      scaleId: scale.id
    });

    console.log('Scale published:', updatedScale);
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

        {/* Scales List */}
        <div className="space-y-4">
          {filteredScales.map((scale) => {
            const statusInfo = statusConfig[scale.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;
            const confirmationRate = (scale.confirmedMembers / scale.totalMembers) * 100;
            const needsAttention = scale.confirmedMembers < scale.totalMembers && scale.status === 'published';
            
            return (
              <Card key={scale.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{scale.title}</h3>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        {needsAttention && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Atenção
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {scale.date.toLocaleDateString('pt-BR')} às {scale.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            {scale.confirmedMembers}/{scale.totalMembers} confirmados
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Music className="h-4 w-4" />
                          <span className="text-sm">
                            {scale.songs.length} músicas
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Badge variant="outline">{scale.department}</Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Confirmações</span>
                          <span>{Math.round(confirmationRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${confirmationRate === 100 ? 'bg-green-500' : confirmationRate >= 75 ? 'bg-blue-500' : 'bg-orange-500'}`}
                            style={{ width: `${confirmationRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Members List */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Equipe:</h4>
                        <div className="flex flex-wrap gap-2">
                          {scale.members.slice(0, 4).map((member, index) => (
                            <Badge 
                              key={index} 
                              variant={member.confirmed ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {member.name} - {member.role}
                            </Badge>
                          ))}
                          {scale.members.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{scale.members.length - 4} mais
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Criado por {scale.createdBy} em {scale.createdAt.toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <ViewScaleDialog
                        trigger={
                          <Button variant="outline" size="sm">
                            Visualizar
                          </Button>
                        }
                        scale={scale}
                      />
                      {canCreateScales && (
                        <>
                          <EditScaleDialog
                            trigger={
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            }
                            scale={scale}
                            onSave={handleSaveScale}
                          />
                          {scale.status === 'draft' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handlePublishScale(scale.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Publicar
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
