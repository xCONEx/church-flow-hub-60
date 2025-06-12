
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock data for member history
const mockHistory = [
  {
    id: '1',
    date: new Date('2024-01-28'),
    event: 'Culto Domingo Manhã',
    role: 'Vocal Principal',
    status: 'confirmed',
    department: 'Louvor'
  },
  {
    id: '2',
    date: new Date('2024-01-26'),
    event: 'Ensaio Geral',
    role: 'Vocal Principal',
    status: 'confirmed',
    department: 'Louvor'
  },
  {
    id: '3',
    date: new Date('2024-01-21'),
    event: 'Culto Domingo Noite',
    role: 'Vocal',
    status: 'declined',
    department: 'Louvor'
  },
  {
    id: '4',
    date: new Date('2024-01-19'),
    event: 'Reunião de Oração',
    role: 'Vocal Principal',
    status: 'pending',
    department: 'Louvor'
  },
  {
    id: '5',
    date: new Date('2024-01-14'),
    event: 'Culto Domingo Manhã',
    role: 'Vocal Principal',
    status: 'confirmed',
    department: 'Louvor'
  }
];

const statusConfig = {
  confirmed: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  declined: {
    label: 'Recusado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  }
};

interface MemberHistoryDialogProps {
  trigger: React.ReactNode;
  member: any;
}

export const MemberHistoryDialog = ({ trigger, member }: MemberHistoryDialogProps) => {
  const stats = {
    total: mockHistory.length,
    confirmed: mockHistory.filter(h => h.status === 'confirmed').length,
    declined: mockHistory.filter(h => h.status === 'declined').length,
    pending: mockHistory.filter(h => h.status === 'pending').length,
  };

  const participationRate = Math.round((stats.confirmed / stats.total) * 100);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {member?.name?.charAt(0) || 'M'}
              </span>
            </div>
            <div>
              <span>Histórico de {member?.name || 'Membro'}</span>
              <p className="text-sm text-gray-600 font-normal">{member?.department || 'Departamento'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-gray-600">Total de Escalas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <p className="text-sm text-gray-600">Confirmadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
                <p className="text-sm text-gray-600">Recusadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{participationRate}%</div>
                <p className="text-sm text-gray-600">Taxa de Participação</p>
              </CardContent>
            </Card>
          </div>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Participações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHistory.map((item) => {
                  const statusInfo = statusConfig[item.status as keyof typeof statusConfig];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {item.date.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.event}</h4>
                          <p className="text-sm text-gray-600">{item.role} - {item.department}</p>
                        </div>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
