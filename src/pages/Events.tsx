
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus, QrCode, Settings, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { CreateEventDialog } from '@/components/CreateEventDialog';
import { EventDetailsDialog } from '@/components/EventDetailsDialog';
import { ManageEventDialog } from '@/components/ManageEventDialog';
import { QRScannerDialog } from '@/components/QRScannerDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Events = () => {
  const { user } = useAuth();
  const { events, activeEvents, getEventRegistrations, loading } = useEvents();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [manageEventId, setManageEventId] = useState<string | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const canCreateEvents = user?.role === 'admin' || user?.role === 'leader';
  const canManageEvents = user?.role === 'admin' || user?.role === 'leader';

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

  const displayEvents = canManageEvents ? events : activeEvents;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Carregando eventos...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Eventos</h1>
            <p className="text-gray-600 mt-2">
              {activeEvents.length > 0 
                ? `${activeEvents.length} evento(s) ativo(s)` 
                : 'Nenhum evento ativo no momento'
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            {canCreateEvents && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Evento
              </Button>
            )}
            
            {canManageEvents && (
              <Button variant="outline" onClick={() => setQrScannerOpen(true)}>
                <QrCode className="h-4 w-4 mr-2" />
                Scanner QR
              </Button>
            )}
          </div>
        </div>

        {displayEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {canCreateEvents 
                  ? 'Comece criando seu primeiro evento para a igreja.'
                  : 'Não há eventos ativos no momento. Volte em breve!'
                }
              </p>
              {canCreateEvents && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((event) => {
              const registrations = getEventRegistrations(event.id);
              const attendeeCount = registrations.length;
              const spotsLeft = event.maxAttendees ? event.maxAttendees - attendeeCount : null;

              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-3 mt-1">
                          {event.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {attendeeCount} inscritos
                        {event.maxAttendees && (
                          <span className="ml-1">
                            / {event.maxAttendees} vagas
                          </span>
                        )}
                      </div>

                      {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Restam {spotsLeft} vagas
                        </Badge>
                      )}

                      {spotsLeft === 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          Esgotado
                        </Badge>
                      )}

                      {event.isPublic && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Aberto ao público
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedEvent(event.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      
                      {canManageEvents && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setManageEventId(event.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CreateEventDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedEvent && (
          <EventDetailsDialog 
            eventId={selectedEvent}
            open={!!selectedEvent}
            onOpenChange={(open) => !open && setSelectedEvent(null)}
          />
        )}

        {manageEventId && (
          <ManageEventDialog 
            eventId={manageEventId}
            open={!!manageEventId}
            onOpenChange={(open) => !open && setManageEventId(null)}
          />
        )}

        <QRScannerDialog 
          open={qrScannerOpen}
          onOpenChange={setQrScannerOpen}
        />
      </div>
    </DashboardLayout>
  );
};
