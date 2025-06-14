
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const availableSkills = [
  'Vocal Principal', 'Vocal', 'Guitarra', 'Baixo', 'Bateria', 'Teclado', 'Violão',
  'Cajon', 'Sonoplastia', 'Projeção', 'Fotografia', 'Ministração', 'Recepção'
];

const departments = ['Louvor', 'Mídia', 'Ministração', 'Recepção', 'Palavra', 'Oração'];

const experienceOptions = [
  { value: 'beginner', label: 'Iniciante', level: 3 },
  { value: 'intermediate', label: 'Intermediário', level: 6 },
  { value: 'advanced', label: 'Avançado', level: 8 }
];

interface AddMemberDialogProps {
  trigger: React.ReactNode;
  onAdd: (member: any) => void;
}

export const AddMemberDialog = ({ trigger, onAdd }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    departments: [] as string[],
    experience: 'beginner',
    skills: [] as string[]
  });

  const handleSubmit = () => {
    onAdd(formData);
    setOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'member',
      departments: [],
      experience: 'beginner',
      skills: []
    });
  };

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addDepartment = (department: string) => {
    if (!formData.departments.includes(department)) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, department]
      }));
    }
  };

  const removeDepartment = (department: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== department)
    }));
  };

  const getExperienceLevel = (value: string) => {
    const option = experienceOptions.find(opt => opt.value === value);
    return option ? option.level : 3;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Departamentos</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.departments.map(dept => (
                    <Badge key={dept} variant="default" className="flex items-center gap-1">
                      {dept}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeDepartment(dept)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Select value="" onValueChange={addDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter(dept => !formData.departments.includes(dept))
                      .map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Nível de Experiência</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} (Nível {option.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getExperienceLevel(formData.experience) * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Habilidades</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="default" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Select value="" onValueChange={addSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar habilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills
                      .filter(skill => !formData.skills.includes(skill))
                      .map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Adicionar Membro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
