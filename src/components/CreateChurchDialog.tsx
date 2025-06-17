
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useMaster } from '@/contexts/MasterContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateChurchDialogProps {
  trigger?: React.ReactNode;
}

export const CreateChurchDialog = ({ trigger }: CreateChurchDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminPassword: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const { createChurch, isLoading } = useMaster();
  const { toast } = useToast();

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

    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email do administrador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.adminName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do administrador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.adminPassword.trim() || formData.adminPassword.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      console.log('Creating admin user first...');
      
      // 1. Criar o usuário admin primeiro
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.adminPassword,
        email_confirm: true,
        user_metadata: {
          name: formData.adminName,
          full_name: formData.adminName,
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating admin user:', authError);
        throw new Error(authError?.message || 'Erro ao criar usuário administrador');
      }

      console.log('Admin user created:', authData.user.id);

      // 2. Criar o perfil do admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: formData.adminName,
          email: formData.email,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continuar mesmo se houver erro no perfil (será criado pelo trigger)
      }

      // 3. Criar a igreja com o admin_id
      const churchData = {
        name: formData.name,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email,
        adminId: authData.user.id, // Usar o ID do usuário criado
      };

      await createChurch(churchData);

      // 4. Adicionar o role de admin para o usuário
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          church_id: null, // Será atualizado quando a igreja for criada
          role: 'admin'
        });

      if (roleError) {
        console.error('Error creating admin role:', roleError);
      }

      toast({
        title: "Sucesso!",
        description: `Igreja criada com sucesso! Usuário admin: ${formData.email}`,
      });
      
      setIsOpen(false);
      setFormData({ 
        name: '', 
        address: '', 
        phone: '', 
        email: '', 
        adminName: '', 
        adminPassword: '' 
      });
      
    } catch (error: any) {
      console.error('Failed to create church:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar igreja",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-20 flex-col bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="h-6 w-6 mb-2" />
            Nova Igreja
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Igreja</DialogTitle>
          <DialogDescription>
            Preencha os dados da igreja e do administrador. Um novo usuário será criado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Igreja *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Igreja Batista Central"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Endereço completo da igreja"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email do Admin *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="admin@igreja.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Nome do Admin *</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => handleInputChange('adminName', e.target.value)}
                placeholder="João Silva"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do Admin *</Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating || isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isLoading}>
              {isCreating ? 'Criando...' : 'Criar Igreja'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
