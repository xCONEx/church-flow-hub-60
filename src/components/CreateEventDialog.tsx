
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEvents } from '@/contexts/EventContext';
import { useToast } from '@/hooks/use-toast';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEventDialog = ({ open, onOpenChange }: CreateEventDialogProps) => {
  const { createEvent } = useEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    location: '',
    maxAttendees: '',
    isPublic: false,
    hasLimit: false,
    registrationDeadline: new Date(),
    hasDeadline: false,
    qrReaders: [''],
    tags: [''],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combinar data e hora
      const eventDateTime = new Date(formData.date);
      if (formData.time) {
        const [hours, minutes] = formData.time.split(':');
        eventDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      await createEvent({
        title: formData.title,
        description: formData.description,
        date: eventDateTime,
        location: formData.location,
        maxAttendees: formData.hasLimit ? parseInt(formData.maxAttendees) : undefined,
        isPublic: formData.isPublic,
        registrationDeadline: formData.hasDeadline ? formData.registrationDeadline : undefined,
        qrReaders: formData.qrReaders.filter(email => email.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        status: 'draft',
      });

      toast({
        title: "Evento criado!",
        description: "O evento foi criado como rascunho. Publique-o quando estiver pronto.",
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      time: '',
      location: '',
      maxAttendees: '',
      isPublic: false,
      hasLimit: false,
      registrationDeadline: new Date(),
      hasDeadline: false,
      qrReaders: [''],
      tags: [''],
    });
  };

  const addQRReader = () => {
    setFormData(prev => ({
      ...prev,
      qrReaders: [...prev.qrReaders, '']
    }));
  };

  const removeQRReader = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qrReaders: prev.qrReaders.filter((_, i) => i !== index)
    }));
  };

  const updateQRReader = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      qrReaders: prev.qrReaders.map((email, i) => i === index ? value : email)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha as informações do evento. Você pode salvá-lo como rascunho e publicar depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Conferência de Jovens 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o evento..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Data do Evento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Auditório Principal"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasLimit"
                  checked={formData.hasLimit}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLimit: checked }))}
                />
                <Label htmlFor="hasLimit">Limitar número de vagas</Label>
              </div>

              {formData.hasLimit && (
                <div>
                  <Label htmlFor="maxAttendees">Número máximo de participantes</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                    placeholder="Ex: 100"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Evento aberto ao público</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasDeadline"
                  checked={formData.hasDeadline}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDeadline: checked }))}
                />
                <Label htmlFor="hasDeadline">Definir prazo de inscrição</Label>
              </div>

              {formData.hasDeadline && (
                <div>
                  <Label>Prazo de inscrição</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.registrationDeadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.registrationDeadline ? 
                          format(formData.registrationDeadline, "dd/MM/yyyy", { locale: ptBR }) : 
                          "Selecione o prazo"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.registrationDeadline}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <div>
              <Label>Emails para leitura de QR Code</Label>
              <div className="space-y-2">
                {formData.qrReaders.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateQRReader(index, e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                    {formData.qrReaders.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQRReader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQRReader}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Email
                </Button>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="Ex: jovens, conferência"
                    />
                    {formData.tags.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTag(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tag
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
