
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Calendar, Users, Music, Clock } from 'lucide-react';

// Mock templates
const mockTemplates = [
  {
    id: '1',
    name: 'Culto Domingo Manhã - Padrão',
    department: 'Louvor',
    serviceType: 'Culto Domingo Manhã',
    members: [
      { name: 'Ana Karolina', role: 'Vocal Principal', department: 'Louvor' },
      { name: 'Yuri Adriel', role: 'Guitarra', department: 'Louvor' },
      { name: 'Arthur Cota', role: 'Bateria', department: 'Louvor' },
      { name: 'João Pedro', role: 'Baixo', department: 'Louvor' }
    ],
    songs: ['Eu Creio em Ti', 'Pra Te Adorar Eu Vivo', 'Eu Vou Construir'],
    createdBy: 'Pastor João',
    createdAt: new Date('2024-01-15'),
    usageCount: 8
  },
  {
    id: '2',
    name: 'Reunião de Oração - Intimista',
    department: 'Louvor',
    serviceType: 'Reunião de Oração',
    members: [
      { name: 'Ana Karolina', role: 'Vocal', department: 'Louvor' },
      { name: 'Yuri Adriel', role: 'Violão', department: 'Louvor' }
    ],
    songs: ['Cornerstone', 'Reckless Love'],
    createdBy: 'Ana Karolina',
    createdAt: new Date('2024-01-10'),
    usageCount: 5
  },
  {
    id: '3',
    name: 'Culto Mídia Completo',
    department: 'Mídia',
    serviceType: 'Culto Domingo Manhã',
    members: [
      { name: 'João Pedro', role: 'Projeção', department: 'Mídia' },
      { name: 'Alexandre Jr.', role: 'Sonoplastia', department: 'Mídia' },
      { name: 'Oswaldo Begotti', role: 'Fotografia', department: 'Mídia' }
    ],
    songs: [],
    createdBy: 'Alexandre Jr.',
    createdAt: new Date('2024-01-12'),
    usageCount: 12
  }
];

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: any) => void;
}

export const TemplateSelectionDialog = ({
  open,
  onOpenChange,
  onSelectTemplate
}: TemplateSelectionDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleSelectTemplate = (template: any) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Selecionar Template
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mockTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-600">Nenhum Template Disponível</h3>
              <p className="text-gray-500">
                Crie escalas e marque "Salvar como Template" para começar a usar templates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{template.name}</span>
                      <Badge variant="outline">{template.department}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{template.serviceType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{template.members.length} membros</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Music className="h-4 w-4 text-gray-500" />
                        <span>{template.songs.length} músicas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Usado {template.usageCount}x</span>
                      </div>
                    </div>

                    {/* Preview dos membros */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Equipe:</h4>
                      <div className="flex -space-x-2">
                        {template.members.slice(0, 4).map((member, index) => (
                          <Avatar key={index} className="border-2 border-white w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {template.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{template.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview das músicas */}
                    {template.songs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Músicas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.songs.slice(0, 2).map((song, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {song}
                            </Badge>
                          ))}
                          {template.songs.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.songs.length - 2} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 border-t pt-2">
                      Criado por {template.createdBy} em {template.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
