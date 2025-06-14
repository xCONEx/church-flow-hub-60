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
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data for calculations
const mockMembers = [
  { id: '1', name: 'Pastor João', role: 'admin', departmentId: '1' },
  { id: '2', name: 'Ana Karolina', role: 'leader', departmentId: '1' },
  { id: '3', name: 'Yuri Adriel', role: 'collaborator', departmentId: '1' },
  { id: '4', name: 'Maria Silva', role: 'member', departmentId: '1' },
  { id: '5', name: 'João Pedro', role: 'collaborator', departmentId: '2' },
  { id: '6', name: 'Arthur', role: 'collaborator', departmentId: '1' },
  { id: '7', name: 'Carlos Santos', role: 'member', departmentId: '1' },
  { id: '8', name: 'Pedro Costa', role: 'collaborator', departmentId: '1' },
  { id: '9', name: 'Juliana', role: 'member', departmentId: '1' },
  { id: '10', name: 'Alexandre', role: 'leader', departmentId: '2' },
];

const mockScales = [
  {
    id: '1',
    title: 'Culto Domingo Manhã',
    date: new Date('2024-12-15'),
    status: 'published',
    totalMembers: 6,
    confirmedMembers: 4,
  },
  {
    id: '2',
    title: 'Reunião de Oração',
    date: new Date('2024-12-17'),
    status: 'published',
    totalMembers: 4,
    confirmedMembers: 3,
  },
  {
    id: '3',
    title: 'Culto Domingo Noite',
    date: new Date('2024-12-15'),
    status: 'published',
    totalMembers: 3,
    confirmedMembers: 3,
  },
  {
    id: '4',
    title: 'Ensaio Geral',
    date: new Date('2024-12-20'),
    status: 'draft',
    totalMembers: 8,
    confirmedMembers: 5,
  },
];

const mockSongs = [
  { id: '1', title: 'Eu Creio em Ti', artist: 'Hillsong' },
  { id: '2', title: 'Pra Te Adorar Eu Vivo', artist: 'Diante do Trono' },
  { id: '3', title: 'Eu Vou Construir', artist: 'Pat Barrett' },
  { id: '4', title: 'Cornerstone', artist: 'Hillsong' },
  { id: '5', title: 'Reckless Love', artist: 'Cory Asbury' },
  { id: '6', title: 'Oceans', artist: 'Hillsong United' },
  { id: '7', title: 'Way Maker', artist: 'Sinach' },
  { id: '8', title: 'Goodness of God', artist: 'Bethel Music' },
];

export const Dashboard = () => {
  const { user, church } = useAuth();
  const navigate = useNavigate();
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Redirecionar usuário master para o dashboard específico
  useEffect(() => {
    if (user?.role === 'master') {
      navigate('/master-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Calculate real stats
  const stats = useMemo(() => {
    const activeScales = mockScales.filter(scale => scale.status === 'published');
    const totalInvited = activeScales.reduce((sum, scale) => sum + scale.totalMembers, 0);
    const totalConfirmed = activeScales.reduce((sum, scale) => sum + scale.confirmedMembers, 0);
    const participationRate = totalInvited > 0 ? Math.round((totalConfirmed / totalInvited) * 100) : 0;

    return {
      totalMembers: mockMembers.length,
      activeScales: activeScales.length,
      totalSongs: mockSongs.length,
      participationRate: `${participationRate}%`,
    };
  }, []);

  // Define which stats to show based on user role
  const getStatsForUser = () => {
    const canViewMemberStats = user?.role === 'admin' || user?.role === 'leader';
    
    const allStats = [
      {
        title: "Total de Membros",
        value: stats.totalMembers,
        change: "+2 este mês",
        changeType: "positive" as const,
        icon: Users,
        gradient: "from-blue-500 to-blue-600",
        showFor: ['admin', 'leader']
      },
      {
        title: "Escalas Ativas",
        value: stats.activeScales,
        change: `${mockScales.filter(s => s.status === 'draft').length} rascunhos`,
        changeType: "neutral" as const,
        icon: Calendar,
        gradient: "from-green-500 to-green-600",
        showFor: ['admin', 'leader', 'collaborator', 'member']
      },
      {
        title: "Músicas Cadastradas",
        value: stats.totalSongs,
        change: "+2 esta semana",
        changeType: "positive" as const,
        icon: Music,
        gradient: "from-purple-500 to-purple-600",
        showFor: ['admin', 'leader', 'collaborator', 'member']
      },
      {
        title: "Taxa de Participação",
        value: stats.participationRate,
        change: "+3% vs mês anterior",
        changeType: "positive" as const,
        icon: TrendingUp,
        gradient: "from-orange-500 to-orange-600",
        showFor: ['admin', 'leader']
      }
    ];

    return allStats.filter(stat => 
      user && stat.showFor.includes(user.role)
    );
  };

  const statsData = getStatsForUser();

  // Dados das próximas escalas com datas mais realistas
  const upcomingScales = [
    {
      id: 1,
      title: "Culto Domingo Manhã",
      date: "2024-12-15",
      time: "09:00",
      department: "Louvor",
      confirmed: 4,
      total: 6
    },
    {
      id: 2,
      title: "Reunião de Oração",
      date: "2024-12-17",
      time: "19:30",
      department: "Louvor",
      confirmed: 3,
      total: 4
    },
    {
      id: 3,
      title: "Culto Domingo Noite",
      date: "2024-12-15",
      time: "19:00",
      department: "Mídia",
      confirmed: 2,
      total: 3
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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-scale':
        navigate('/scales');
        break;
      case 'add-member':
        navigate('/members');
        break;
      case 'add-song':
        navigate('/repertoire');
        break;
      case 'reports':
        navigate('/reports');
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
  };

  const TutorialContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎯 Bem-vindo ao Sistema de Escalas!</h3>
        <p className="text-sm text-muted-foreground">
          Este tutorial vai te ajudar a navegar pelas principais funcionalidades do sistema.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-medium">📊 Dashboard</h4>
          <p className="text-sm text-muted-foreground">
            Visualize estatísticas importantes, atividades recentes e próximas escalas.
          </p>
        </div>

        <div className="border-l-4 border-green-500 pl-4">
          <h4 className="font-medium">📅 Escalas</h4>
          <p className="text-sm text-muted-foreground">
            Crie, edite e gerencie escalas de cultos e eventos. Confirme presenças e organize sua equipe.
          </p>
        </div>

        <div className="border-l-4 border-purple-500 pl-4">
          <h4 className="font-medium">👥 Membros</h4>
          <p className="text-sm text-muted-foreground">
            Gerencie sua equipe ministerial, adicione novos membros e organize por departamentos.
          </p>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <h4 className="font-medium">🎵 Repertório</h4>
          <p className="text-sm text-muted-foreground">
            Mantenha um catálogo de músicas com letras, acordes e links para facilitar os ensaios.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Dicas Importantes:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use as ações rápidas para acessar funcionalidades frequentes</li>
          <li>• Confirme sua presença nas escalas o quanto antes</li>
          <li>• Mantenha seu perfil sempre atualizado</li>
          <li>• Use o modo escuro nas configurações para melhor experiência noturna</li>
        </ul>
      </div>
    </div>
  );

  // Check if user can see quick actions
  const canViewQuickActions = user?.role === 'admin' || user?.role === 'leader';

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
          <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Ver Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tutorial do Sistema</DialogTitle>
                <DialogDescription>
                  Aprenda a usar todas as funcionalidades do sistema de escalas
                </DialogDescription>
              </DialogHeader>
              <TutorialContent />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 gap-6 ${statsData.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : statsData.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                  <div key={scale.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium mb-1">
                          {scale.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(scale.date).toLocaleDateString('pt-BR')} • {scale.time}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                            {scale.department}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {scale.confirmed}/{scale.total} confirmados
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/scales')}
              >
                Ver Todas as Escalas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only for admin and leader */}
        {canViewQuickActions && (
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('new-scale')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Nova Escala
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('add-member')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Adicionar Membro
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('add-song')}
                >
                  <Music className="h-6 w-6 mb-2" />
                  Cadastrar Música
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction('reports')}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Ver Relatórios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
