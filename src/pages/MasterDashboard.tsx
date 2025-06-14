
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Plus, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const MasterDashboard = () => {
  const { user } = useAuth();

  const handleCreateChurch = () => {
    // TODO: Implementar criação de igreja
    console.log('Criar nova igreja');
  };

  const handleManageChurches = () => {
    // TODO: Implementar gerenciamento de igrejas
    console.log('Gerenciar igrejas');
  };

  const handleViewReports = () => {
    // TODO: Implementar relatórios globais
    console.log('Ver relatórios globais');
  };

  const handleSystemSettings = () => {
    // TODO: Implementar configurações do sistema
    console.log('Configurações do sistema');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Master
          </h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {user?.name}! Gerencie o sistema Church Manager
          </p>
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
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">
                +2 este mês
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
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +45 esta semana
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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                80% de atividade
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
              <Button 
                onClick={handleCreateChurch}
                className="h-20 flex-col bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-6 w-6 mb-2" />
                Nova Igreja
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={handleManageChurches}
              >
                <Building className="h-6 w-6 mb-2" />
                Gerenciar Igrejas
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={handleViewReports}
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                Relatórios Globais
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={handleSystemSettings}
              >
                <Settings className="h-6 w-6 mb-2" />
                Config. Sistema
              </Button>
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
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Nova igreja cadastrada</p>
                  <p className="text-sm text-gray-600">Igreja Batista Nova Vida</p>
                </div>
                <span className="text-sm text-gray-500">2h atrás</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Novo admin cadastrado</p>
                  <p className="text-sm text-gray-600">Pastor Carlos - Igreja Central</p>
                </div>
                <span className="text-sm text-gray-500">5h atrás</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Igreja desativada</p>
                  <p className="text-sm text-gray-600">Igreja Comunidade Cristã</p>
                </div>
                <span className="text-sm text-gray-500">1 dia atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
