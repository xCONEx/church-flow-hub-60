import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, QrCode, Link, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface EventDetailsDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsDialog = ({ eventId, open, onOpenChange }: EventDetailsDialogProps) => {
  const { events, registerForEvent, getEventRegistrations } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const event = events.find(e => e.id === eventId);
  const registrations = getEventRegistrations(eventId);
  const userRegistration = registrations.find(r => r.attendeeId === user?.id && r.attendeeType === 'member');
  const attendeeCount = registrations.length;
  const spotsLeft = event?.maxAttendees ? event.maxAttendees - attendeeCount : null;
  const canRegister = event && event.status === 'published' && !userRegistration && (spotsLeft === null || spotsLeft > 0);

  if (!event) return null;

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await registerForEvent(eventId);
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no evento com sucesso. Seu QR Code foi gerado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a inscrição.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    const eventUrl = `${window.location.origin}/events/register/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Link copiado!",
      description: "O link do evento foi copiado para a área de transferência.",
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {event.description}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(event.status)}>
              {getStatusText(event.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium">
                  {format(event.date, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(event.date, 'HH:mm', { locale: ptBR })}h
                </div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-3 text-red-600" />
              <div>
                <div className="font-medium">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Users className="h-5 w-5 mr-3 text-green-600" />
              <div>
                <div className="font-medium">
                  {attendeeCount} inscritos
                </div>
                {event.maxAttendees && (
                  <div className="text-sm text-gray-500">
                    de {event.maxAttendees} vagas
                  </div>
                )}
              </div>
            </div>

            {event.registrationDeadline && (
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-orange-600" />
                <div>
                  <div className="font-medium">Prazo de inscrição</div>
                  <div className="text-sm text-gray-500">
                    {format(event.registrationDeadline, 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {event.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {event.isPublic && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Link className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium text-blue-900">Evento Público</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Este evento está aberto ao público. Pessoas de fora da igreja podem se inscrever.
              </p>
            </div>
          )}

          {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                <span className="font-medium text-orange-900">Poucas vagas restantes</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Restam apenas {spotsLeft} vagas para este evento.
              </p>
            </div>
          )}

          {spotsLeft === 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-red-600" />
                <span className="font-medium text-red-900">Evento Esgotado</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Todas as vagas foram preenchidas.
              </p>
            </div>
          )}

          {userRegistration && (
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-medium text-green-900">Você está inscrito!</span>
              </div>
              <p className="text-green-700 text-sm">
                Sua inscrição foi confirmada. Use o QR Code abaixo para fazer check-in no evento.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                >
                  {showQR ? 'Ocultar' : 'Ver'} QR Code
                </Button>
              </div>

              {showQR && (
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <div className="text-center">
                    <QRCodeSVG 
                      value={userRegistration.qrCode} 
                      size={200}
                      level="M"
                      includeMargin
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Código: {userRegistration.qrCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            {canRegister && (
              <Button 
                onClick={handleRegister} 
                disabled={isRegistering}
                className="flex-1"
              >
                {isRegistering ? 'Inscrevendo...' : 'Inscrever-se'}
              </Button>
            )}
            
            {event.isPublic && (
              <Button 
                variant="outline" 
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
