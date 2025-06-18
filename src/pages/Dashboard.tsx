
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
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  // Stats zerados para começar limpo
  const stats = {
    totalMembers: 0,
    activeScales: 0,
    totalSongs: 0,
    participationRate: "0%",
  };

  // Define which stats to show based on user role
  const getStatsForUser = () => {
    const allStats = [
      {
        title: "Total de Membros",
        value: stats.totalMembers,
        change: "Comece adicionando membros",
        changeType: "neutral" as const,
        icon: Users,
        gradient: "from-blue-500 to-blue-600",
        showFor: ['admin', 'leader']
      },
      {
        title: "Escalas Ativas",
        value: stats.activeScales,
        change: "Nenhuma escala criada",
        changeType: "neutral" as const,
        icon: Calendar,
        gradient: "from-green-500 to-green-600",
        showFor: ['admin', 'leader', 'collaborator', 'member']
      },
      {
        title: "Músicas Cadastradas",
        value: stats.totalSongs,
        change: "Adicione seu repertório",
        changeType: "neutral" as const,
        icon: Music,
        gradient: "from-purple-500 to-purple-600",
        showFor: ['admin', 'leader', 'collaborator', 'member']
      },
      {
        title: "Taxa de Participação",
        value: stats.participationRate,
        change: "Sem dados ainda",
        changeType: "neutral" as const,
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

  // Dados vazios - sem escalas
  const upcomingScales: any[] = [];

  // Atividades vazias
  const recentActivities: any[] = [];

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
            Bem-vindo ao painel de controle da {church?.name || 'sua igreja'}. 
            Comece adicionando membros e criando suas primeiras escalas.
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
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade ainda</p>
                  <p className="text-sm">As atividades aparecerão aqui quando você começar a usar o sistema</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Activities would appear here */}
                </div>
              )}
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
              {upcomingScales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma escala criada</p>
                  <p className="text-sm mb-4">Comece criando sua primeira escala</p>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/scales')}
                  >
                    Criar Escala
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scales would appear here */}
                </div>
              )}
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
