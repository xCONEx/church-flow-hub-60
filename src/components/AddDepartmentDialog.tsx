
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddDepartmentDialogProps {
  trigger: React.ReactNode;
  onAdd: (department: { name: string; type: string; leaderId?: string; collaborators: string[] }) => void;
}

const departmentTypes = [
  { value: 'louvor', label: 'Louvor' },
  { value: 'midia', label: 'Mídia' },
  { value: 'ministracao', label: 'Ministração' },
  { value: 'recepcao', label: 'Recepção' },
  { value: 'palavra', label: 'Palavra' },
  { value: 'oracao', label: 'Oração' },
  { value: 'sonoplastia', label: 'Sonoplastia' },
  { value: 'instrumentos', label: 'Instrumentos' },
  { value: 'custom', label: 'Personalizado' },
];

export const AddDepartmentDialog = ({ trigger, onAdd }: AddDepartmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });

  const handleSubmit = () => {
    if (formData.name && formData.type) {
      onAdd({
        name: formData.name,
        type: formData.type,
        collaborators: [],
      });
      setFormData({ name: '', type: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Departamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Departamento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Louvor Jovem"
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {departmentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Criar Departamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
