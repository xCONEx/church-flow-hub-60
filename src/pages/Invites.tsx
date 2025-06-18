
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SendInviteDialog } from '@/components/SendInviteDialog';
import { useInvites } from '@/hooks/useInvites';

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
  admin: 'Administrador',
  leader: 'Líder',
  collaborator: 'Colaborador',
  member: 'Membro',
  master: 'Master'
};

export const Invites = () => {
  const { user } = useAuth();
  const { invites, isLoading, sendInvite, cancelInvite, resendInvite } = useInvites();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invite.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canInvite = user?.role === 'admin' || user?.role === 'leader' || user?.role === 'master';

  const stats = {
    total: invites.length,
    pending: invites.filter(i => i.status === 'pending').length,
    accepted: invites.filter(i => i.status === 'accepted').length,
    expired: invites.filter(i => i.status === 'expired').length,
  };

  const handleInviteSent = async (inviteData: any) => {
    try {
      await sendInvite(inviteData);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Convites">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando convites...</p>
        </div>
      </DashboardLayout>
    );
  }

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
            <SendInviteDialog
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enviar Convite
                </Button>
              }
              onInviteSent={handleInviteSent}
            />
          )}
        </div>

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

        {/* Invites List */}
        <div className="space-y-4">
          {filteredInvites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {invites.length === 0 ? 'Nenhum convite enviado ainda' : 'Nenhum convite encontrado'}
                </h3>
                <p className="text-gray-600">
                  {invites.length === 0 
                    ? (canInvite ? "Comece enviando convites para novos membros." : "Não há convites disponíveis.")
                    : "Tente ajustar os filtros de busca."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInvites.map((invite) => {
              const statusInfo = statusConfig[invite.status];
              const StatusIcon = statusInfo.icon;
              const isExpired = invite.expiresAt && new Date() > invite.expiresAt;
              
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
                            {roleLabels[invite.role]} • {invite.departmentName || 'Geral'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Convidado por {invite.invitedByName || 'Admin'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invite.createdAt.toLocaleDateString('pt-BR')}
                          </p>
                          {invite.status === 'pending' && invite.expiresAt && (
                            <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                              {isExpired ? 'Expirado' : `Expira em ${invite.expiresAt.toLocaleDateString('pt-BR')}`}
                            </p>
                          )}
                        </div>

                        {canInvite && (
                          <div className="flex space-x-2">
                            {invite.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resendInvite(invite.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => cancelInvite(invite.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
