
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
    adminEmail: '',
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

    if (!formData.adminEmail.trim()) {
      toast({
        title: "Erro",
        description: "Email do administrador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      console.log('Searching for existing admin user with email:', formData.adminEmail);
      
      // 1. Buscar usuário existente pelo email
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', formData.adminEmail)
        .single();

      if (profileError || !existingProfile) {
        toast({
          title: "Erro",
          description: "Usuário com este email não foi encontrado no sistema. O admin deve criar uma conta primeiro.",
          variant: "destructive",
        });
        return;
      }

      console.log('Admin user found:', existingProfile.id);

      // 2. Verificar se o usuário já é admin de outra igreja
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role, church_id')
        .eq('user_id', existingProfile.id)
        .eq('role', 'admin');

      if (existingRoles && existingRoles.length > 0) {
        toast({
          title: "Erro",
          description: "Este usuário já é administrador de outra igreja.",
          variant: "destructive",
        });
        return;
      }

      // 3. Criar a igreja
      const { data: createdChurch, error: churchError } = await supabase
        .from('churches')
        .insert({
          name: formData.name,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.adminEmail,
          admin_id: existingProfile.id,
        })
        .select()
        .single();

      if (churchError || !createdChurch) {
        console.error('Error creating church:', churchError);
        throw new Error(churchError?.message || 'Erro ao criar igreja');
      }

      console.log('Church created successfully:', createdChurch.id);

      // 4. IMPORTANTE: Remover role 'member' anterior se existir
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', existingProfile.id)
        .eq('role', 'member');

      // 5. Adicionar role de admin para o usuário na igreja criada
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: existingProfile.id,
          church_id: createdChurch.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        // Tentar deletar a igreja se falhou ao criar o admin
        await supabase.from('churches').delete().eq('id', createdChurch.id);
        throw new Error('Erro ao atribuir role de administrador');
      }

      console.log('Admin role assigned successfully');

      toast({
        title: "Sucesso!",
        description: `Igreja "${formData.name}" criada com sucesso! Admin: ${existingProfile.name}`,
      });
      
      setIsOpen(false);
      setFormData({ 
        name: '', 
        address: '', 
        phone: '', 
        adminEmail: '' 
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
            Preencha os dados da igreja e o email do administrador (que já deve ter conta no sistema).
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
            <Label htmlFor="adminEmail">Email do Administrador *</Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => handleInputChange('adminEmail', e.target.value)}
              placeholder="admin@igreja.com"
              required
            />
            <p className="text-sm text-gray-500">
              O administrador deve já ter uma conta cadastrada no sistema.
            </p>
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
