
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Music, Plus } from 'lucide-react';
import { useScales } from '@/hooks/useScales';
import { useChurchSettings } from '@/hooks/useChurchSettings';

interface CreateScaleDialogProps {
  trigger: React.ReactNode;
}

export const CreateScaleDialog = ({ trigger }: CreateScaleDialogProps) => {
  const { availableMembers, availableSongs, createScale } = useScales();
  const { serviceTypes } = useChurchSettings();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    serviceType: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await createScale({
        title: formData.title,
        date: new Date(formData.date),
        time: formData.time,
        memberIds: selectedMembers,
        songIds: selectedSongs
      });
      
      setOpen(false);
      setFormData({ title: '', date: '', time: '', serviceType: '' });
      setSelectedMembers([]);
      setSelectedSongs([]);
    } catch (error) {
      console.error('Error creating scale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSong = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // Agrupar membros por departamento
  const membersByDepartment = availableMembers.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, typeof availableMembers>);

  // Agrupar músicas por categoria
  const songsByCategory = availableSongs.reduce((acc, song) => {
    if (!acc[song.category]) {
      acc[song.category] = [];
    }
    acc[song.category].push(song);
    return acc;
  }, {} as Record<string, typeof availableSongs>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Nova Escala</span>
          </DialogTitle>
          <DialogDescription>
            Crie uma nova escala de ministério para cultos e eventos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Escala</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Culto Domingo Manhã"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="serviceType">Tipo de Culto</Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Tabs defaultValue="team" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team">Seleção da Equipe</TabsTrigger>
              <TabsTrigger value="songs">Músicas da Escala</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Membros Disponíveis ({availableMembers.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(membersByDepartment).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum membro encontrado. Adicione membros primeiro.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(membersByDepartment).map(([department, members]) => (
                        <div key={department}>
                          <h4 className="font-semibold text-gray-900 mb-3">{department}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <Checkbox
                                  id={member.id}
                                  checked={selectedMembers.includes(member.id)}
                                  onCheckedChange={() => toggleMember(member.id)}
                                />
                                <div>
                                  <Label htmlFor={member.id} className="font-medium cursor-pointer">
                                    {member.name}
                                  </Label>
                                  <p className="text-sm text-gray-600">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="songs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Music className="h-5 w-5" />
                    <span>Repertório Disponível ({availableSongs.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(songsByCategory).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma música encontrada. Adicione músicas ao repertório primeiro.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(songsByCategory).map(([category, songs]) => (
                        <div key={category}>
                          <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {songs.map((song) => (
                              <div key={song.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <Checkbox
                                  id={song.id}
                                  checked={selectedSongs.includes(song.id)}
                                  onCheckedChange={() => toggleSong(song.id)}
                                />
                                <div>
                                  <Label htmlFor={song.id} className="font-medium cursor-pointer">
                                    {song.title}
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    {song.artist} • Tom: {song.originalKey}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
              {isLoading ? 'Criando...' : 'Criar Escala'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
