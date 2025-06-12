
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockInvites = [
  {
    id: '1',
    email: 'maria.santos@email.com',
    name: 'Maria Santos',
    role: 'collaborator',
    department: 'Louvor',
    status: 'pending',
    invitedBy: 'Pastor João',
    invitedAt: new Date('2024-01-20'),
    expiresAt: new Date('2024-01-27'),
  },
  {
    id: '2',
    email: 'pedro.oliveira@email.com',
    name: 'Pedro Oliveira',
    role: 'leader',
    department: 'Mídia',
    status: 'accepted',
    invitedBy: 'Pastor João',
    invitedAt: new Date('2024-01-18'),
    acceptedAt: new Date('2024-01-19'),
  },
  {
    id: '3',
    email: 'carlos.silva@email.com',
    name: 'Carlos Silva',
    role: 'collaborator',
    department: 'Sonoplastia',
    status: 'expired',
    invitedBy: 'Ana Karolina',
    invitedAt: new Date('2024-01-10'),
    expiresAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    email: 'juliana.costa@email.com',
    name: 'Juliana Costa',
    role: 'collaborator',
    department: 'Louvor',
    status: 'declined',
    invitedBy: 'Pastor João',
    invitedAt: new Date('2024-01-15'),
    declinedAt: new Date('2024-01-16'),
  },
  {
    id: '5',
    email: 'rafael.santos@email.com',
    name: 'Rafael Santos',
    role: 'collaborator',
    department: 'Instrumentos',
    status: 'pending',
    invitedBy: 'Yuri Adriel',
    invitedAt: new Date('2024-01-22'),
    expiresAt: new Date('2024-01-29'),
  }
];

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  accepted: {
    label: 'Aceito',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  },
  declined: {
    label: 'Recusado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  expired: {
    label: 'Expirado',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600'
  }
};

const roleLabels = {
  leader: 'Líder',
  collaborator: 'Colaborador'
};

export const Invites = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvites = mockInvites.filter(invite => {
    const matchesSearch = invite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canInvite = user?.role === 'admin' || user?.role === 'leader';

  const stats = {
    total: mockInvites.length,
    pending: mockInvites.filter(i => i.status === 'pending').length,
    accepted: mockInvites.filter(i => i.status === 'accepted').length,
    expired: mockInvites.filter(i => i.status === 'expired').length,
  };

  return (
    <DashboardLayout title="Convites">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sistema de Convites</h2>
            <p className="text-gray-600">Gerencie convites para novos membros da equipe</p>
          </div>
          {canInvite && (
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              <UserPlus className="h-4 w-4 mr-2" />
              Enviar Convite
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
                  placeholder="Buscar por nome, email ou departamento..."
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="accepted">Aceito</SelectItem>
                  <SelectItem value="declined">Recusado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
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
              <p className="text-sm text-gray-600">Total de Convites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <p className="text-sm text-gray-600">Aceitos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
              <p className="text-sm text-gray-600">Expirados</p>
            </CardContent>
          </Card>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {filteredInvites.map((invite) => {
            const statusInfo = statusConfig[invite.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={invite.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${statusInfo.iconColor}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{invite.name}</h3>
                        <p className="text-sm text-gray-600">{invite.email}</p>
                        <p className="text-xs text-gray-500">
                          {roleLabels[invite.role as keyof typeof roleLabels]} • {invite.department}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Convidado por {invite.invitedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          {invite.invitedAt.toLocaleDateString('pt-BR')}
                        </p>
                        {invite.status === 'pending' && (
                          <p className="text-xs text-orange-600">
                            Expira em {invite.expiresAt.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      {canInvite && (
                        <div className="flex space-x-2">
                          {invite.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              Reenviar
                            </Button>
                          )}
                          {invite.status === 'expired' && (
                            <Button variant="outline" size="sm">
                              Renovar
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Detalhes
                          </Button>
                        </div>
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
