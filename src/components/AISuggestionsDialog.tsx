
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Star, Users, CheckCircle, Lightbulb } from 'lucide-react';
import { generateBalancedTeam } from '@/utils/scaleAI';

interface AISuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirements: {
    department: string;
    time: string;
    date: Date;
    serviceType: string;
  };
  availableMembers: any[];
  onApplySuggestions: (suggestions: { [department: string]: any[] }) => void;
}

export const AISuggestionsDialog = ({
  open,
  onOpenChange,
  requirements,
  availableMembers,
  onApplySuggestions
}: AISuggestionsDialogProps) => {
  const [suggestions, setSuggestions] = useState<{ [department: string]: any[] }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simular tempo de processamento da IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSuggestions = generateBalancedTeam(requirements, availableMembers);
    setSuggestions(newSuggestions);
    setIsGenerating(false);
  };

  const handleApplySuggestions = () => {
    onApplySuggestions(suggestions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sugestões de IA para Escala
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Escala */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Escala</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Departamento:</span>
                  <p className="font-semibold">{requirements.department}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Data:</span>
                  <p className="font-semibold">{requirements.date.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Horário:</span>
                  <p className="font-semibold">{requirements.time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tipo:</span>
                  <p className="font-semibold">{requirements.serviceType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão para Gerar Sugestões */}
          {Object.keys(suggestions).length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">IA Pronta para Sugerir</h3>
              <p className="text-gray-600 mb-6">
                Nossa IA analisará a experiência, disponibilidade e histórico dos membros para criar a melhor equipe possível.
              </p>
              <Button 
                onClick={generateSuggestions} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analisando Membros...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gerar Sugestões com IA
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Sugestões Geradas */}
          {Object.keys(suggestions).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Sugestões Geradas</span>
                </h3>
                <Button onClick={generateSuggestions} variant="outline" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              </div>

              {Object.entries(suggestions).map(([department, members]) => (
                <Card key={department}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>{department}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {members.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                              <p className="text-xs text-purple-600">{member.aiReason}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-semibold">{member.aiScore}</span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              IA
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleApplySuggestions} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Aplicar Sugestões
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
