
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, XCircle, Clock, Star, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { church } = useAuth();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [profileHistory, setProfileHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (member?.id && church?.id) {
      loadMemberData();
    }
  }, [member?.id, church?.id]);

  const loadMemberData = async () => {
    if (!member?.id || !church?.id) return;
    
    setIsLoading(true);
    try {
      // Carregar avaliações
      const { data: evaluationsData, error: evalError } = await supabase
        .from('member_evaluations')
        .select(`
          *,
          evaluator:evaluator_id(name),
          department:department_id(name)
        `)
        .eq('member_id', member.id)
        .eq('church_id', church.id)
        .order('evaluation_date', { ascending: false });

      if (evalError) {
        console.error('Erro ao carregar avaliações:', evalError);
      } else {
        setEvaluations(evaluationsData || []);
      }

      // Carregar histórico de perfil
      const { data: historyData, error: historyError } = await supabase
        .from('profile_history')
        .select(`
          *,
          changed_by_user:changed_by(name),
          department:department_id(name)
        `)
        .eq('user_id', member.id)
        .eq('church_id', church.id)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('Erro ao carregar histórico:', historyError);
      } else {
        setProfileHistory(historyData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: mockHistory.length,
    confirmed: mockHistory.filter(h => h.status === 'confirmed').length,
    declined: mockHistory.filter(h => h.status === 'declined').length,
    pending: mockHistory.filter(h => h.status === 'pending').length,
  };

  const participationRate = Math.round((stats.confirmed / stats.total) * 100);

  const averageRating = evaluations.length > 0 
    ? evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_rating || 0), 0) / evaluations.length 
    : 0; 

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="participation">Participações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  <div className="text-2xl font-bold text-purple-600">{participationRate}%</div>
                  <p className="text-sm text-gray-600">Taxa de Participação</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">Avaliação Média</p>
                </CardContent>
              </Card>
            </div>

            {/* Última avaliação */}
            {evaluations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Última Avaliação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avaliação Geral:</span>
                      {renderStars(evaluations[0].overall_rating)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Habilidades Técnicas:</span>
                      {renderStars(evaluations[0].technical_skills)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Comprometimento:</span>
                      {renderStars(evaluations[0].commitment)}
                    </div>
                    {evaluations[0].notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Observações:</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{evaluations[0].notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evaluations" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Carregando avaliações...</div>
            ) : evaluations.length > 0 ? (
              evaluations.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">
                          Avaliado por: {evaluation.evaluator?.name || 'Desconhecido'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR')}
                        </p>
                        {evaluation.department && (
                          <p className="text-sm text-gray-600">
                            Departamento: {evaluation.department.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Avaliação Geral</p>
                        {renderStars(evaluation.overall_rating)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Técnicas</p>
                        {renderStars(evaluation.technical_skills)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Liderança</p>
                        {renderStars(evaluation.leadership_skills)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Comprometimento</p>
                        {renderStars(evaluation.commitment)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Equipe</p>
                        {renderStars(evaluation.teamwork)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pontualidade</p>
                        {renderStars(evaluation.punctuality)}
                      </div>
                    </div>

                    {evaluation.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Observações:</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{evaluation.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma avaliação encontrada
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Carregando histórico...</div>
            ) : profileHistory.length > 0 ? (
              profileHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium capitalize">{item.action_type}</span>
                          {item.previous_role && item.new_role && (
                            <span className="text-sm text-gray-600">
                              de {item.previous_role} para {item.new_role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Por: {item.changed_by_user?.name || 'Sistema'}
                        </p>
                        {item.department && (
                          <p className="text-sm text-gray-600">
                            Departamento: {item.department.name}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum histórico encontrado
              </div>
            )}
          </TabsContent>

          <TabsContent value="participation" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
