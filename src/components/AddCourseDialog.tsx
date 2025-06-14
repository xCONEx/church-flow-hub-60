
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department } from '@/types';

interface AddCourseDialogProps {
  trigger: React.ReactNode;
  onAdd: (course: { name: string; description?: string; departmentId?: string }) => void;
  departments: Department[];
}

export const AddCourseDialog = ({ trigger, onAdd, departments }: AddCourseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onAdd({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        departmentId: formData.departmentId || undefined,
      });
      setFormData({ name: '', description: '', departmentId: '' });
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', departmentId: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Novo Curso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course-name">Nome do Curso</Label>
            <Input
              id="course-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Curso de Violão"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course-description">Descrição (opcional)</Label>
            <Textarea
              id="course-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o conteúdo do curso..."
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento (opcional)</Label>
            <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Geral (Todos os departamentos)</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name.trim()}
            className="w-full sm:w-auto"
          >
            Criar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
