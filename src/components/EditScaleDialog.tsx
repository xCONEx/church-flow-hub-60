import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Music, Plus, X, Settings, GripVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SongDetailsModal } from './SongDetailsModal';
import { AddSongLinksDialog } from './AddSongLinksDialog';
import { useToast } from '@/hooks/use-toast';

interface EditScaleDialogProps {
  trigger: React.ReactNode;
  scale: any;
  onSave?: (updatedScale: any) => void;
}

export const EditScaleDialog = ({ trigger, scale, onSave }: EditScaleDialogProps) => {
  const { church } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: scale.title,
    date: scale.date.toISOString().split('T')[0],
    time: scale.time,
    department: scale.department,
    status: scale.status
  });

  const [selectedSongs, setSelectedSongs] = useState(scale.songs || []);
  const [teamMembers, setTeamMembers] = useState(scale.members || []);
  const [agenda, setAgenda] = useState([
    {
      id: 1,
      time: '09:00',
      block: 'Oração',
      description: 'Oração de Abertura',
      people: [{ id: '1', name: 'Pastor João', role: 'Pastor' }],
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
    }
  ]);

  // Mock songs data
  const availableSongs = [
    'Eu Creio em Ti', 'Pra Te Adorar Eu Vivo', 'Eu Vou Construir', 
    'Cornerstone', 'Reckless Love', 'Amazing Grace', 'Como é Bom',
    'Ele Vive', 'Hosana', 'Tua Graça me Basta'
  ];

  // Mock members data
  const availableMembers = [
    { id: '1', name: 'Ana Karolina', roles: ['Vocal Principal', 'Vocal'] },
    { id: '2', name: 'Yuri Adriel', roles: ['Guitarra', 'Violão'] },
    { id: '3', name: 'Arthur', roles: ['Bateria'] },
    { id: '4', name: 'João Pedro', roles: ['Baixo', 'Projeção'] },
    { id: '5', name: 'Maria Silva', roles: ['Vocal'] },
    { id: '6', name: 'Carlos Santos', roles: ['Teclado'] },
    { id: '7', name: 'Pedro Costa', roles: ['Violão', 'Cajon'] },
    { id: '8', name: 'Alexandre', roles: ['Sonoplastia'] },
    { id: '9', name: 'Oswaldo', roles: ['Fotografia'] },
    { id: '10', name: 'Pastor João', roles: ['Pastor', 'Pregação'] }
  ];

  const agendaBlocks = [
    'Oração',
    'Louvor',
    'Avisos', 
    'Palavra',
    'Ministração',
    'Encerramento'
  ];

  const handleSave = () => {
    const updatedScale = {
      ...scale,
      ...formData,
      date: new Date(formData.date + 'T00:00:00'),
      songs: selectedSongs,
      members: teamMembers,
      agenda: agenda,
      totalMembers: teamMembers.length,
      confirmedMembers: teamMembers.filter(m => m.confirmed).length
    };
    
    onSave?.(updatedScale);
    setOpen(false);
    
    toast({
      title: "Escala atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: scale.title,
      date: scale.date.toISOString().split('T')[0],
      time: scale.time,
      department: scale.department,
      status: scale.status
    });
    setSelectedSongs(scale.songs || []);
    setTeamMembers(scale.members || []);
    setOpen(false);
  };

  const addSong = (songTitle: string) => {
    if (!selectedSongs.includes(songTitle)) {
      setSelectedSongs([...selectedSongs, songTitle]);
    }
  };

  const removeSong = (songTitle: string) => {
    setSelectedSongs(selectedSongs.filter(song => song !== songTitle));
  };

  const addTeamMember = (memberName: string, role: string) => {
    const existingMember = teamMembers.find(m => m.name === memberName && m.role === role);
    if (!existingMember) {
      setTeamMembers([...teamMembers, {
        name: memberName,
        role: role,
        confirmed: false
      }]);
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const toggleMemberConfirmation = (index: number) => {
    const updated = [...teamMembers];
    updated[index].confirmed = !updated[index].confirmed;
    setTeamMembers(updated);
  };

  const addAgendaItem = () => {
    setAgenda(prev => [...prev, {
      id: Date.now(),
      time: '',
      block: '',
      description: '',
      people: [],
      notes: ''
    }]);
  };

  const addPersonToAgendaItem = (agendaIndex: number, person: any) => {
    const newAgenda = [...agenda];
    if (!newAgenda[agendaIndex].people.some((p: any) => p.id === person.id)) {
      newAgenda[agendaIndex].people.push(person);
      setAgenda(newAgenda);
    }
  };

  const removePersonFromAgendaItem = (agendaIndex: number, personId: string) => {
    const newAgenda = [...agenda];
    newAgenda[agendaIndex].people = newAgenda[agendaIndex].people.filter((p: any) => p.id !== personId);
    setAgenda(newAgenda);
  };

  const handleSongResourcesUpdate = (songId: string, updates: any) => {
    // Here you would update the song resources
    // For now, just log the updates
    console.log('Song resources updated:', songId, updates);
  };

  // Convert songs to detailed format for modal
  const songsWithDetails = selectedSongs.map((songTitle: string) => ({
    id: `song-${songTitle.toLowerCase().replace(/\s+/g, '-')}`,
    title: songTitle,
    artist: 'Artista Exemplo',
    originalKey: 'C',
    scaleKey: 'D',
    bpm: 120,
    category: 'Louvor',
    lyrics: `Verso 1:\n${songTitle}\nEu te louvo Senhor\nCom todo meu coração\n\nRefrão:\nAleluia, aleluia\nTeu amor me alcançou\nAleluia, aleluia\nPara sempre te louvarei`,
    youtubeLinks: [],
    documents: [],
    audioFiles: []
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <span>Editar Escala</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Escala</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título da Escala</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Culto Domingo Manhã"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData({...formData, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Louvor">Louvor</SelectItem>
                      <SelectItem value="Mídia">Mídia</SelectItem>
                      <SelectItem value="Sonoplastia">Sonoplastia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Agenda do Culto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Agenda do Culto
                <Button onClick={addAgendaItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agenda.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Horário</Label>
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => {
                          const newAgenda = [...agenda];
                          newAgenda[index].time = e.target.value;
                          setAgenda(newAgenda);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Bloco</Label>
                      <Select value={item.block} onValueChange={(value) => {
                        const newAgenda = [...agenda];
                        newAgenda[index].block = value;
                        setAgenda(newAgenda);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {agendaBlocks.map(block => (
                            <SelectItem key={block} value={block}>{block}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newAgenda = [...agenda];
                          newAgenda[index].description = e.target.value;
                          setAgenda(newAgenda);
                        }}
                        placeholder="Ex: Momento de Louvor"
                      />
                    </div>
                  </div>

                  {/* Pessoas responsáveis */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Pessoas Responsáveis</Label>
                      <Select onValueChange={(value) => {
                        const person = availableMembers.find(m => m.id === value);
                        if (person) addPersonToAgendaItem(index, person);
                      }}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Adicionar Pessoa" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers
                            .filter(member => !item.people.some((p: any) => p.id === member.id))
                            .map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.people.map((person: any) => (
                        <Badge key={person.id} variant="secondary" className="flex items-center space-x-1">
                          <span>{person.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removePersonFromAgendaItem(index, person.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Input
                      value={item.notes}
                      onChange={(e) => {
                        const newAgenda = [...agenda];
                        newAgenda[index].notes = e.target.value;
                        setAgenda(newAgenda);
                      }}
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Músicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Músicas Selecionadas ({selectedSongs.length})</span>
                </div>
                <Select onValueChange={addSong}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Adicionar Música" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSongs
                      .filter(song => !selectedSongs.includes(song))
                      .map(song => (
                        <SelectItem key={song} value={song}>
                          {song}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {songsWithDetails.map((song, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-gray-600">Tom: {song.scaleKey}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SongDetailsModal
                        trigger={
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        }
                        song={song}
                      />
                      <AddSongLinksDialog
                        trigger={
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        }
                        song={song}
                        onSave={handleSongResourcesUpdate}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeSong(song.title)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedSongs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma música selecionada</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Equipe ({teamMembers.length})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableMembers.map(member => 
                    member.roles.map(role => (
                      <Button
                        key={`${member.name}-${role}`}
                        variant="outline"
                        size="sm"
                        onClick={() => addTeamMember(member.name, role)}
                        disabled={teamMembers.some(m => m.name === member.name && m.role === role)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {member.name} - {role}
                      </Button>
                    ))
                  )}
                </div>
                
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={member.confirmed ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleMemberConfirmation(index)}
                        >
                          {member.confirmed ? 'Confirmado' : 'Pendente'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum membro adicionado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
