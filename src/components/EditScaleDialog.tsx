
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Music, Plus, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SongDetailsModal } from './SongDetailsModal';
import { AddSongLinksDialog } from './AddSongLinksDialog';

interface EditScaleDialogProps {
  trigger: React.ReactNode;
  scale: any;
  onSave?: (updatedScale: any) => void;
}

export const EditScaleDialog = ({ trigger, scale, onSave }: EditScaleDialogProps) => {
  const { church } = useAuth();
  const [formData, setFormData] = useState({
    title: scale.title,
    date: scale.date.toISOString().split('T')[0],
    time: scale.time,
    department: scale.department,
    status: scale.status
  });

  const [selectedSongs, setSelectedSongs] = useState(scale.songs || []);
  const [teamMembers, setTeamMembers] = useState(scale.members || []);

  // Mock songs data
  const availableSongs = [
    'Eu Creio em Ti', 'Pra Te Adorar Eu Vivo', 'Eu Vou Construir', 
    'Cornerstone', 'Reckless Love', 'Amazing Grace', 'Como é Bom',
    'Ele Vive', 'Hosana', 'Tua Graça me Basta'
  ];

  // Mock members data
  const availableMembers = [
    { name: 'Ana Karolina', roles: ['Vocal Principal', 'Vocal'] },
    { name: 'Yuri Adriel', roles: ['Guitarra', 'Violão'] },
    { name: 'Arthur', roles: ['Bateria'] },
    { name: 'João Pedro', roles: ['Baixo', 'Projeção'] },
    { name: 'Maria Silva', roles: ['Vocal'] },
    { name: 'Carlos Santos', roles: ['Teclado'] },
    { name: 'Pedro Costa', roles: ['Violão', 'Cajon'] },
    { name: 'Alexandre', roles: ['Sonoplastia'] },
    { name: 'Oswaldo', roles: ['Fotografia'] }
  ];

  const handleSave = () => {
    const updatedScale = {
      ...scale,
      ...formData,
      date: new Date(formData.date + 'T00:00:00'),
      songs: selectedSongs,
      members: teamMembers,
      totalMembers: teamMembers.length,
      confirmedMembers: teamMembers.filter(m => m.confirmed).length
    };
    
    onSave?.(updatedScale);
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
    <Dialog>
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
            <Button variant="outline">
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
