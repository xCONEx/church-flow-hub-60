
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaster } from '@/contexts/MasterContext';
import { CreateChurchDialog } from '@/components/CreateChurchDialog';
import { ManageChurchesDialog } from '@/components/ManageChurchesDialog';
import { GlobalReportsDialog } from '@/components/GlobalReportsDialog';
import { SystemSettingsDialog } from '@/components/SystemSettingsDialog';

export const MasterDashboard = () => {
  const { user, logout } = useAuth();
  const { stats, activities, isLoading } = useMaster();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Master
            </h1>
            <p className="text-gray-600 mt-2">
              Bem-vindo, {user?.name}! Gerencie o sistema Church Manager
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Igrejas
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChurches}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newChurchesThisMonth} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersThisWeek} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Igrejas Ativas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChurches}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeChurches / stats.totalChurches) * 100)}% de atividade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CreateChurchDialog />
              <ManageChurchesDialog />
              <GlobalReportsDialog />
              <SystemSettingsDialog />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atividades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.timestamp.getTime() > Date.now() - 60 * 60 * 1000 
                      ? `${Math.round((Date.now() - activity.timestamp.getTime()) / (1000 * 60))}min atrás`
                      : activity.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
                      ? `${Math.round((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60))}h atrás`
                      : `${Math.round((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24))} dia${Math.round((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''} atrás`
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
