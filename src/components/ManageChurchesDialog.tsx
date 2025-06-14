
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Search, Edit, Trash2 } from 'lucide-react';
import { useMaster } from '@/contexts/MasterContext';
import { useToast } from '@/hooks/use-toast';

interface ManageChurchesDialogProps {
  trigger?: React.ReactNode;
}

export const ManageChurchesDialog = ({ trigger }: ManageChurchesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { churches, deactivateChurch, isLoading } = useMaster();
  const { toast } = useToast();

  const filteredChurches = churches.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeactivate = async (churchId: string, churchName: string) => {
    if (window.confirm(`Tem certeza que deseja desativar a igreja "${churchName}"?`)) {
      try {
        await deactivateChurch(churchId);
        toast({
          title: "Igreja desativada",
          description: `${churchName} foi desativada com sucesso`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao desativar igreja",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-20 flex-col">
            <Building className="h-6 w-6 mb-2" />
            Gerenciar Igrejas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Igrejas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar igrejas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Churches List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredChurches.map((church) => (
              <div key={church.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{church.name}</h3>
                      <Badge variant={church.isActive ? "default" : "secondary"}>
                        {church.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    {church.address && (
                      <p className="text-sm text-gray-600">{church.address}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {church.email && <span>{church.email}</span>}
                      {church.phone && <span>{church.phone}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {church.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(church.id, church.name)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{church.totalMembers}</span>
                    </div>
                    <p className="text-xs text-gray-500">Total Membros</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{church.activeMembers}</span>
                    </div>
                    <p className="text-xs text-gray-500">Ativos</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium">
                      {church.lastActivity.toLocaleDateString('pt-BR')}
                    </span>
                    <p className="text-xs text-gray-500">Última Atividade</p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredChurches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma igreja encontrada</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
