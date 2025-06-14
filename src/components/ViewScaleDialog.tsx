
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Music, Clock, User, CheckCircle, X, GripVertical } from 'lucide-react';
import { SongDetailsModal } from './SongDetailsModal';

interface ViewScaleDialogProps {
  trigger: React.ReactNode;
  scale: any;
}

export const ViewScaleDialog = ({ trigger, scale }: ViewScaleDialogProps) => {
  const statusConfig = {
    draft: {
      label: 'Rascunho',
      color: 'bg-gray-100 text-gray-800',
      icon: Clock
    },
    published: {
      label: 'Publicada',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle
    },
    completed: {
      label: 'Concluída',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    }
  };

  const statusInfo = statusConfig[scale.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  // Mock agenda data for demonstration
  const mockAgenda = [
    {
      id: 1,
      time: '09:00',
      block: 'Oração',
      description: 'Oração de Abertura',
      people: [
        { id: '1', name: 'Pastor João', role: 'Pastor' }
      ],
      notes: 'Oração pelos visitantes'
    },
    {
      id: 2,
      time: '09:10',
      block: 'Louvor',
      description: 'Momento de Adoração',
      people: [
        { id: '2', name: 'Ana Karolina', role: 'Vocal Principal' },
        { id: '3', name: 'Yuri Adriel', role: 'Guitarra' }
      ],
      notes: 'Três músicas de louvor'
    },
    {
      id: 3,
      time: '09:30',
      block: 'Palavra',
      description: 'Mensagem',
      people: [
        { id: '1', name: 'Pastor João', role: 'Pastor' }
      ],
      notes: 'Série: Fé que Transforma'
    }
  ];

  // Mock songs data with details
  const songsWithDetails = scale.songs.map((songTitle: string) => ({
    id: `song-${songTitle.toLowerCase().replace(/\s+/g, '-')}`,
    title: songTitle,
    artist: 'Artista Exemplo',
    originalKey: 'C',
    scaleKey: 'D',
    bpm: 120,
    category: 'Louvor',
    lyrics: `Verso 1:\n${songTitle}\nEu te louvo Senhor\nCom todo meu coração\n\nRefrão:\nAleluia, aleluia\nTeu amor me alcançou\nAleluia, aleluia\nPara sempre te louvarei`,
    youtubeLinks: [
      {
        title: `${songTitle} - Playback`,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    documents: [
      {
        title: `${songTitle} - Cifra`,
        type: 'PDF',
        url: '#'
      }
    ],
    audioFiles: [
      {
        title: `${songTitle} - MP3`,
        url: '#'
      }
    ]
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <span>{scale.title}</span>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações da Escala</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Data e Hora</p>
                  <p className="font-semibold">
                    {scale.date.toLocaleDateString('pt-BR')} às {scale.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Título</p>
                  <p className="font-semibold">{scale.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="steps">Etapas</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
              <TabsTrigger value="songs">Músicas</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            {/* Tab: Etapas */}
            <TabsContent value="steps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Agenda do Culto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockAgenda.length > 0 ? (
                    <div className="space-y-3">
                      {mockAgenda.map((item, index) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium text-lg">{item.time}</span>
                                <Badge variant="outline">{item.block}</Badge>
                              </div>
                              <p className="text-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                          
                          {item.people.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Responsáveis:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.people.map((person: any) => (
                                  <Badge key={person.id} variant="secondary">
                                    {person.name} - {person.role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-sm text-gray-600">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma etapa definida na agenda</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Equipe */}
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Membros da Equipe</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {scale.confirmedMembers}/{scale.totalMembers} confirmados
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scale.members.map((member: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.confirmed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmado
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Músicas */}
            <TabsContent value="songs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span>Músicas Selecionadas ({scale.songs.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {songsWithDetails.length > 0 ? (
                    <div className="space-y-3">
                      {songsWithDetails.map((song: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">
                                {index + 1}.
                              </span>
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <p className="text-sm text-gray-600">
                                  {song.artist} • Tom: {song.scaleKey} • {song.bpm} BPM
                                </p>
                              </div>
                            </div>
                          </div>
                          <SongDetailsModal
                            trigger={
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                            }
                            song={song}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma música selecionada</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Detalhes */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Status da Escala</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusIcon className="h-4 w-4" />
                      <span className="font-semibold">{statusInfo.label}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Confirmação</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(scale.confirmedMembers / scale.totalMembers) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round((scale.confirmedMembers / scale.totalMembers) * 100)}% confirmado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
