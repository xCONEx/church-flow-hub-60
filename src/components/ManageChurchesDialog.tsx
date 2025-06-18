
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Users, Trash2, Edit, Eye } from 'lucide-react';
import { useMaster } from '@/contexts/MasterContext';
import { useToast } from '@/hooks/use-toast';
import { EditChurchDialog } from '@/components/EditChurchDialog';

export const ManageChurchesDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { churches, isLoading, deleteChurch } = useMaster();
  const { toast } = useToast();

  const handleDeleteChurch = async (churchId: string, churchName: string) => {
    try {
      await deleteChurch(churchId);
      toast({
        title: "Igreja Deletada",
        description: `${churchName} foi removida do sistema com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar igreja. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-20 flex-col bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
          <Building className="h-6 w-6 mb-2" />
          Gerenciar Igrejas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Igrejas</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {churches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma igreja cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-4">
                {churches.map((church) => (
                  <Card key={church.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{church.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Admin: {church.admin_name}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {new Date(church.created_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <strong>Email:</strong> {church.email}
                        </p>
                        {church.phone && (
                          <p className="text-sm">
                            <strong>Telefone:</strong> {church.phone}
                          </p>
                        )}
                        {church.address && (
                          <p className="text-sm">
                            <strong>Endereço:</strong> {church.address}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        
                        <EditChurchDialog
                          church={church}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          }
                        />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Deletar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar a igreja <strong>{church.name}</strong>? 
                                Esta ação irá remover todos os dados relacionados (departamentos, escalas, etc.) 
                                e não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteChurch(church.id, church.name)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar Igreja
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
