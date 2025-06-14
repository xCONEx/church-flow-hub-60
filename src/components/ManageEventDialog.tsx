
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Settings, Trash2, Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ManageEventDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageEventDialog = ({ eventId, open, onOpenChange }: ManageEventDialogProps) => {
  const { events, getEventRegistrations, updateEvent, deleteEvent } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const event = events.find(e => e.id === eventId);
  const registrations = getEventRegistrations(eventId);

  if (!event) return null;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await updateEvent(eventId, { status: 'published' });
      toast({
        title: "Evento publicado!",
        description: "O evento está agora visível para os membros.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível publicar o evento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await updateEvent(eventId, { status: 'cancelled' });
      toast({
        title: "Evento cancelado",
        description: "O evento foi cancelado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o evento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteEvent(eventId);
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído permanentemente.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Gerencie as configurações e inscrições do evento
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(event.status)}>
              {getStatusText(event.status)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="registrations">
              Inscrições ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{registrations.length}</div>
                  {event.maxAttendees && (
                    <p className="text-xs text-muted-foreground">
                      de {event.maxAttendees} vagas
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {registrations.filter(r => r.checkedIn).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    participantes presentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data do Evento</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(event.date, 'dd/MM', { locale: ptBR })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(event.date, 'HH:mm', { locale: ptBR })}h
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Descrição:</strong> {event.description || 'Sem descrição'}</div>
                <div><strong>Local:</strong> {event.location}</div>
                <div><strong>Data:</strong> {format(event.date, 'EEEE, dd MMMM yyyy HH:mm', { locale: ptBR })}</div>
                <div><strong>Público:</strong> {event.isPublic ? 'Sim' : 'Apenas membros'}</div>
                {event.registrationDeadline && (
                  <div><strong>Prazo de inscrição:</strong> {format(event.registrationDeadline, 'dd/MM/yyyy', { locale: ptBR })}</div>
                )}
                {event.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            {registrations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma inscrição ainda
                  </h3>
                  <p className="text-gray-500">
                    As inscrições aparecerão aqui quando os participantes se registrarem.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {registrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {registration.attendeeType === 'member' ? 'Membro' : 'Convidado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Inscrito em {format(registration.registeredAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          <div className="text-xs text-gray-400">
                            QR: {registration.qrCode}
                          </div>
                        </div>
                        <div className="text-right">
                          {registration.checkedIn ? (
                            <div>
                              <Badge className="bg-green-100 text-green-800">
                                Check-in feito
                              </Badge>
                              {registration.checkedInAt && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {format(registration.checkedInAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">
                              Aguardando check-in
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.status === 'draft' && (
                  <Button 
                    onClick={handlePublish} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publicar Evento
                  </Button>
                )}

                {event.status === 'published' && (
                  <Button 
                    onClick={handleCancel} 
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    Cancelar Evento
                  </Button>
                )}

                <Button 
                  onClick={handleDelete} 
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Evento
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leitores de QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.qrReaders.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{email}</span>
                    </div>
                  ))}
                  {event.qrReaders.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nenhum leitor de QR Code configurado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
