
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Department } from '@/types';
import { useDepartments } from '@/hooks/useDepartments';

interface AddDepartmentDialogProps {
  trigger: React.ReactNode;
  departments: Department[];
  onAdd: () => void;
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

const AddDepartmentDialog = React.memo(({ trigger, departments, onAdd }: AddDepartmentDialogProps) => {
  const { createDepartment } = useDepartments();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    isSubDepartment: false,
    parentDepartmentId: '',
  });

  // Memoize parent departments to avoid recalculation
  const parentDepartments = useMemo(() => 
    departments.filter(dept => !dept.isSubDepartment),
    [departments]
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) return;
    
    if (formData.isSubDepartment && !formData.parentDepartmentId) {
      return;
    }

    setIsLoading(true);
    try {
      await createDepartment({
        name: formData.name,
        type: formData.type,
        parentDepartmentId: formData.isSubDepartment ? formData.parentDepartmentId : undefined,
      });
      
      setFormData({ name: '', type: '', isSubDepartment: false, parentDepartmentId: '' });
      setOpen(false);
      onAdd();
    } catch (error) {
      console.error('Error creating department:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', type: '', isSubDepartment: false, parentDepartmentId: '' });
    setOpen(false);
  };

  // Memoize form validation
  const isFormValid = useMemo(() => 
    formData.name && formData.type && (!formData.isSubDepartment || formData.parentDepartmentId),
    [formData]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Novo Departamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Departamento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Louvor Jovem"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-sub"
              checked={formData.isSubDepartment}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isSubDepartment: checked,
                parentDepartmentId: checked ? prev.parentDepartmentId : ''
              }))}
            />
            <Label htmlFor="is-sub">É um sub-departamento</Label>
          </div>

          {formData.isSubDepartment && (
            <div className="space-y-2">
              <Label htmlFor="parent">Departamento Pai</Label>
              <Select 
                value={formData.parentDepartmentId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentDepartmentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento pai" />
                </SelectTrigger>
                <SelectContent>
                  {parentDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
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
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto" disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Criando...' : 'Criar Departamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

AddDepartmentDialog.displayName = 'AddDepartmentDialog';

export { AddDepartmentDialog };
