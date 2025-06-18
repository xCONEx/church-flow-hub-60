
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Music, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user, church } = useAuth();

  const stats = [
    {
      title: 'Próximos Eventos',
      value: '3',
      description: 'Esta semana',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Membros Ativos',
      value: '24',
      description: 'Total cadastrados',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Músicas',
      value: '12',
      description: 'No repertório',
      icon: Music,
      color: 'text-purple-600'
    },
    {
      title: 'Notificações',
      value: '2',
      description: 'Não lidas',
      icon: Bell,
      color: 'text-orange-600'
    }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao {church?.name || 'painel da igreja'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Eventos programados para os próximos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Culto Domingo</h4>
                    <p className="text-sm text-gray-600">Domingo, 9:00</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Em 2 dias
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Reunião de Oração</h4>
                    <p className="text-sm text-gray-600">Quarta, 19:30</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Em 5 dias
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas atividades da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Nova música adicionada ao repertório</p>
                    <p className="text-xs text-gray-500">há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Escala do próximo domingo criada</p>
                    <p className="text-xs text-gray-500">há 1 dia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Novo membro adicionado à equipe</p>
                    <p className="text-xs text-gray-500">há 3 dias</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
