
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddServiceTypeDialogProps {
  trigger: React.ReactNode;
  onAdd: (serviceType: string) => void;
}

export const AddServiceTypeDialog = ({ trigger, onAdd }: AddServiceTypeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');

  const handleSubmit = () => {
    if (serviceName.trim()) {
      onAdd(serviceName.trim());
      setServiceName('');
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setServiceName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Novo Tipo de Culto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Nome do Tipo de Culto</Label>
            <Input
              id="service-name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Ex: Culto de Adolescentes"
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!serviceName.trim()}
            className="w-full sm:w-auto"
          >
            Criar Tipo de Culto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
