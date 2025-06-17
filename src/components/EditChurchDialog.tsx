
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMaster } from '@/contexts/MasterContext';
import { useToast } from '@/hooks/use-toast';

interface Church {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface EditChurchDialogProps {
  church: Church;
  isOpen: boolean;
  onClose: () => void;
}

export const EditChurchDialog = ({ church, isOpen, onClose }: EditChurchDialogProps) => {
  const [formData, setFormData] = useState({
    name: church.name,
    address: church.address || '',
    phone: church.phone || '',
    email: church.email || '',
  });
  
  const { updateChurch, isLoading } = useMaster();
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: church.name,
      address: church.address || '',
      phone: church.phone || '',
      email: church.email || '',
    });
  }, [church]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da igreja é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateChurch(church.id, formData);
      toast({
        title: "Sucesso!",
        description: "Igreja atualizada com sucesso",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar igreja",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Igreja</DialogTitle>
          <DialogDescription>
            Edite as informações da igreja. Os dados serão atualizados imediatamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Igreja *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Igreja Batista Central"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Endereço</Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Endereço completo da igreja"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email do Admin</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="admin@igreja.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
