
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Building, Calendar, Download } from 'lucide-react';
import { useMaster } from '@/contexts/MasterContext';

interface GlobalReportsDialogProps {
  trigger?: React.ReactNode;
}

export const GlobalReportsDialog = ({ trigger }: GlobalReportsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { churches, stats } = useMaster();

  const handleDownloadReport = (type: string) => {
    console.log(`Baixando relatório: ${type}`);
    // TODO: Implementar download de relatórios
  };

  const churchGrowthData = churches.map(church => ({
    name: church.name,
    members: church.totalMembers,
    active: church.activeMembers,
    growth: Math.round((church.activeMembers / church.totalMembers) * 100),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-20 flex-col">
            <BarChart3 className="h-6 w-6 mb-2" />
            Relatórios Globais
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Relatórios Globais do Sistema</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="churches">Igrejas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Igrejas</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Igrejas Ativas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeChurches}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.activeChurches / stats.totalChurches) * 100)}% ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Membros</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.totalUsers / stats.totalChurches)}
                  </div>
                  <p className="text-xs text-muted-foreground">por igreja</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleDownloadReport('overview')}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório Geral
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="churches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Igreja</CardTitle>
                <CardDescription>Membros totais vs ativos por igreja</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {churchGrowthData.map((church, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{church.name}</span>
                        <span className="text-sm text-gray-500">
                          {church.active}/{church.members} ({church.growth}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${church.growth}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Administradores</span>
                      <span className="font-medium">{stats.totalChurches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Líderes</span>
                      <span className="font-medium">{Math.round(stats.totalUsers * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Colaboradores</span>
                      <span className="font-medium">{Math.round(stats.totalUsers * 0.25)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Membros</span>
                      <span className="font-medium">{Math.round(stats.totalUsers * 0.6)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crescimento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Janeiro</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-sm">+12</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fevereiro</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }} />
                        </div>
                        <span className="text-sm">+8</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Março</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                        </div>
                        <span className="text-sm">+15</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes do Sistema</CardTitle>
                <CardDescription>Últimas 10 atividades registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churches.slice(0, 5).map((church, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Atividade em {church.name}</p>
                          <p className="text-sm text-gray-600">
                            {church.activeMembers} membros ativos
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {church.lastActivity.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
