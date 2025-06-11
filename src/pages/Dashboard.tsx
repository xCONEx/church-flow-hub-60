
import { 
  Users, 
  Calendar, 
  Music, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user, church } = useAuth();

  const statsData = [
    {
      title: "Total de Membros",
      value: 156,
      change: "+12% este mês",
      changeType: "positive" as const,
      icon: Users,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Escalas Ativas",
      value: 8,
      change: "4 próximas",
      changeType: "neutral" as const,
      icon: Calendar,
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Músicas Cadastradas",
      value: 342,
      change: "+28 esta semana",
      changeType: "positive" as const,
      icon: Music,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Taxa de Participação",
      value: "92%",
      change: "+5% vs mês anterior",
      changeType: "positive" as const,
      icon: TrendingUp,
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "scale",
      title: "Nova escala criada: Culto Domingo",
      time: "2 horas atrás",
      user: "Pastor João",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "member",
      title: "Maria Silva confirmou presença",
      time: "4 horas atrás",
      user: "Maria Silva",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "song",
      title: "Nova música adicionada: 'Reckless Love'",
      time: "6 horas atrás",
      user: "João Músico",
      icon: Music,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "alert",
      title: "Lembrete: Ensaio hoje às 19h",
      time: "8 horas atrás",
      user: "Sistema",
      icon: AlertCircle,
      color: "text-orange-600"
    }
  ];

  const upcomingScales = [
    {
      id: 1,
      title: "Culto Domingo Manhã",
      date: "2024-01-14",
      time: "09:00",
      department: "Louvor",
      confirmed: 4,
      total: 6
    },
    {
      id: 2,
      title: "Reunião de Oração",
      date: "2024-01-16",
      time: "19:30",
      department: "Louvor",
      confirmed: 3,
      total: 4
    },
    {
      id: 3,
      title: "Culto Domingo Noite",
      date: "2024-01-14",
      time: "19:00",
      department: "Mídia",
      confirmed: 2,
      total: 3
    }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Olá, {user?.name}! 👋
          </h2>
          <p className="text-blue-100 mb-4">
            Bem-vindo ao painel de controle da {church?.name}. 
            Aqui você pode acompanhar todas as atividades ministeriais.
          </p>
          <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            Ver Tutorial
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Scales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Próximas Escalas
              </CardTitle>
              <CardDescription>
                Escalas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingScales.map((scale) => (
                  <div key={scale.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {scale.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(scale.date).toLocaleDateString('pt-BR')} • {scale.time}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {scale.department}
                          </span>
                          <span className="text-xs text-gray-600">
                            {scale.confirmed}/{scale.total} confirmados
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas as Escalas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Nova Escala
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Adicionar Membro
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Music className="h-6 w-6 mb-2" />
                Cadastrar Música
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Ver Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
