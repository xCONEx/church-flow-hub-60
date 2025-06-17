
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SendInviteDialogProps {
  trigger: React.ReactNode;
  onInviteSent: (inviteData: any) => void;
}

export const SendInviteDialog = ({ trigger, onInviteSent }: SendInviteDialogProps) => {
  const { user, church } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    departmentId: '',
    message: ''
  });

  const [departments, setDepartments] = useState(church?.departments || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !church || !user) return;

    setIsLoading(true);
    try {
      console.log('Enviando convite:', formData);

      const { data, error } = await supabase
        .from('invites')
        .insert({
          email: formData.email,
          name: formData.name,
          role: formData.role as any,
          department_id: formData.departmentId || null,
          church_id: church.id,
          invited_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao enviar convite:', error);
        toast({
          title: "Erro ao enviar convite",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Convite criado:', data);

      // Simular dados do convite para o callback
      const inviteData = {
        id: data.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: departments.find(d => d.id === formData.departmentId)?.name || 'Geral',
        status: 'pending',
        invitedBy: user.name,
        invitedAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at)
      };

      onInviteSent(inviteData);
      
      toast({
        title: "Convite enviado com sucesso!",
        description: `O convite foi enviado para ${formData.email}.`
      });

      setOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'member',
        departmentId: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Definir roles disponíveis baseado no role do usuário atual
  const getAvailableRoles = () => {
    if (user?.role === 'master') {
      return [
        { value: 'admin', label: 'Administrador' },
        { value: 'leader', label: 'Líder' },
        { value: 'collaborator', label: 'Colaborador' },
        { value: 'member', label: 'Membro' }
      ];
    }
    
    if (user?.role === 'admin') {
      return [
        { value: 'admin', label: 'Administrador' },
        { value: 'leader', label: 'Líder' },
        { value: 'collaborator', label: 'Colaborador' },
        { value: 'member', label: 'Membro' }
      ];
    }

    if (user?.role === 'leader') {
      return [
        { value: 'collaborator', label: 'Colaborador' },
        { value: 'member', label: 'Membro' }
      ];
    }

    return [
      { value: 'member', label: 'Membro' }
    ];
  };

  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Convite</DialogTitle>
          <DialogDescription>
            Convide um novo membro para participar da {church?.name || 'igreja'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da pessoa"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="role">Função</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.role === 'leader' || formData.role === 'collaborator' || formData.role === 'member') && departments.length > 0 && (
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum departamento específico</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Adicione uma mensagem personalizada ao convite..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
