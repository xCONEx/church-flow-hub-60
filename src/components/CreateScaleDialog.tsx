import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, Music, FileText, Clock, Search, X, UserPlus, GripVertical, Brain, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AISuggestionsDialog } from '@/components/AISuggestionsDialog';
import { TemplateSelectionDialog } from '@/components/TemplateSelectionDialog';
import { AddSongLinksDialog } from '@/components/AddSongLinksDialog';

// Mock data
const mockServiceTypes = [
  'Culto Domingo Manhã',
  'Culto Domingo Noite', 
  'Reunião de Oração',
  'Culto de Jovens',
  'Ensaio Geral',
  'Evento Especial'
];

const mockDepartments = [
  'Louvor',
  'Mídia', 
  'Ministração',
  'Recepção',
  'Palavra',
  'Oração'
];

const mockMembers = [
  { id: '1', name: 'Ana Karolina', role: 'Vocal Contralto', department: 'Louvor', avatar: '', confirmed: false },
  { id: '2', name: 'Yuri Adriel', role: 'Guitarra', department: 'Louvor', avatar: '', confirmed: false },
  { id: '3', name: 'Arthur Cota', role: 'Bateria', department: 'Louvor', avatar: '', confirmed: false },
  { id: '4', name: 'Guilherme Mancebo', role: 'Teclado', department: 'Louvor', avatar: '', confirmed: false },
  { id: '5', name: 'João Pedro', role: 'Baixo', department: 'Louvor', avatar: '', confirmed: false },
  { id: '6', name: 'Oswaldo Begotti', role: 'Fotografia', department: 'Mídia', avatar: '', confirmed: false },
  { id: '7', name: 'Alexandre Jr.', role: 'Sonoplastia', department: 'Mídia', avatar: '', confirmed: false },
  { id: '8', name: 'Haira Bianca', role: 'Ministro(a)', department: 'Ministração', avatar: '', confirmed: false }
];

const mockSongs = [
  { 
    id: '1', 
    title: 'Eu Creio em Ti', 
    artist: 'Hillsong', 
    originalKey: 'G', 
    bpm: 120, 
    category: 'Adoração',
    lyrics: 'Verso 1:\nEu creio em Ti\nEu creio em Teu amor\nQue nunca falhará\n\nRefrão:\nTu és fiel, Senhor\nTu és fiel, Senhor\nEu descanso em Ti\nTu és fiel',
    youtubeLinks: [
      { id: 1, title: 'Versão Original', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { id: 2, title: 'Acústico', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    ],
    documents: [
      { id: 1, title: 'Partitura Piano', type: 'pdf', url: 'https://example.com/partitura.pdf' },
      { id: 2, title: 'Cifra Simplificada', type: 'doc', url: 'https://example.com/cifra.doc' }
    ],
    audioFiles: [
      { id: 1, title: 'Playback Original', url: 'https://example.com/playback.mp3' },
      { id: 2, title: 'Playback -2 tons', url: 'https://example.com/playback-2.mp3' }
    ]
  },
  { 
    id: '2', 
    title: 'Pra Te Adorar Eu Vivo', 
    artist: 'Diante do Trono', 
    originalKey: 'C', 
    bpm: 85, 
    category: 'Adoração',
    lyrics: 'Pra te adorar eu vivo\nPra te adorar eu vivo\nJesus, és o centro\nDa minha devoção',
    youtubeLinks: [
      { id: 1, title: 'Ao Vivo', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    ],
    documents: [],
    audioFiles: []
  },
  { 
    id: '3', 
    title: 'Eu Vou Construir', 
    artist: 'Toque no Altar', 
    originalKey: 'F', 
    bpm: 130, 
    category: 'Celebração',
    lyrics: 'Eu vou construir a minha vida em Ti\nTu és a rocha eternal\nSobre a rocha firme eu vou ficar',
    youtubeLinks: [],
    documents: [
      { id: 1, title: 'Tablatura Guitarra', type: 'pdf', url: 'https://example.com/tab.pdf' }
    ],
    audioFiles: []
  },
  { 
    id: '4', 
    title: 'Rei do Meu Coração', 
    artist: 'Ministério Zoe', 
    originalKey: 'A', 
    bpm: 95, 
    category: 'Adoração',
    lyrics: 'Seja bem-vindo aqui\nToma o Teu lugar\nRei do meu coração',
    youtubeLinks: [
      { id: 1, title: 'Versão Studio', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    ],
    documents: [],
    audioFiles: [
      { id: 1, title: 'Playback', url: 'https://example.com/rei-playback.mp3' }
    ]
  },
  { 
    id: '5', 
    title: 'Cornerstone', 
    artist: 'Hillsong', 
    originalKey: 'D', 
    bpm: 105, 
    category: 'Adoração',
    lyrics: 'My hope is built on nothing less\nThan Jesus blood and righteousness\nI dare not trust the sweetest frame\nBut wholly trust in Jesus name',
    youtubeLinks: [
      { id: 1, title: 'Live', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    ],
    documents: [
      { id: 1, title: 'Lead Sheet', type: 'pdf', url: 'https://example.com/leadsheet.pdf' }
    ],
    audioFiles: []
  }
];

const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const agendaBlocks = [
  'Oração',
  'Louvor',
  'Avisos', 
  'Palavra',
  'Ministração',
  'Encerramento'
];

interface CreateScaleDialogProps {
  trigger: React.ReactNode;
}

export const CreateScaleDialog = ({ trigger }: CreateScaleDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    serviceType: '',
    department: '',
    saveAsTemplate: false,
    notes: ''
  });

  const [selectedMembers, setSelectedMembers] = useState<{[key: string]: any[]}>({});
  const [selectedSongs, setSelectedSongs] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [searchMember, setSearchMember] = useState('');
  const [searchSong, setSearchSong] = useState('');
  const [showAddPersonDialog, setShowAddPersonDialog] = useState('');

  const canCreateScales = user?.role === 'admin' || user?.role === 'leader';

  if (!canCreateScales) {
    return null;
  }

  const handleSubmit = () => {
    console.log('Nova escala criada:', {
      ...formData,
      selectedMembers,
      selectedSongs,
      agenda
    });
    setOpen(false);
    // Reset form
    setFormData({
      title: '',
      date: '',
      time: '',
      serviceType: '',
      department: '',
      saveAsTemplate: false,
      notes: ''
    });
    setSelectedMembers({});
    setSelectedSongs([]);
    setAgenda([]);
  };

  const addMemberToDepartment = (member: any, department: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [department]: [...(prev[department] || []), { ...member, confirmed: false }]
    }));
  };

  const removeMemberFromDepartment = (memberId: string, department: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [department]: (prev[department] || []).filter(m => m.id !== memberId)
    }));
  };

  const addSongToScale = (song: any) => {
    setSelectedSongs(prev => [...prev, { ...song, scaleKey: song.originalKey }]);
  };

  const removeSongFromScale = (songId: string) => {
    setSelectedSongs(prev => prev.filter(s => s.id !== songId));
  };

  const updateSongKey = (songId: string, newKey: string) => {
    setSelectedSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, scaleKey: newKey } : song
    ));
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

  const moveAgendaItem = (fromIndex: number, toIndex: number) => {
    const newAgenda = [...agenda];
    const [movedItem] = newAgenda.splice(fromIndex, 1);
    newAgenda.splice(toIndex, 0, movedItem);
    setAgenda(newAgenda);
  };

  const filteredMembers = mockMembers.filter(member => 
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  const filteredSongs = mockSongs.filter(song => 
    song.title.toLowerCase().includes(searchSong.toLowerCase())
  );

  const handleApplyAISuggestions = (suggestions: { [department: string]: any[] }) => {
    setSelectedMembers(suggestions);
    console.log('Sugestões de IA aplicadas:', suggestions);
  };

  const handleApplyTemplate = (template: any) => {
    // Aplicar dados do template
    setFormData(prev => ({
      ...prev,
      title: template.name,
      serviceType: template.serviceType,
      department: template.department
    }));

    // Aplicar membros do template
    const templateMembers: {[key: string]: any[]} = {};
    template.members.forEach((member: any) => {
      if (!templateMembers[member.department]) {
        templateMembers[member.department] = [];
      }
      templateMembers[member.department].push({
        ...member,
        id: Math.random().toString(), // ID temporário
        confirmed: false
      });
    });
    setSelectedMembers(templateMembers);

    // Aplicar músicas do template
    const templateSongs = template.songs.map((songTitle: string, index: number) => ({
      id: `template-${index}`,
      title: songTitle,
      artist: 'Artista',
      originalKey: 'C',
      scaleKey: 'C',
      bpm: 120,
      category: 'Adoração'
    }));
    setSelectedSongs(templateSongs);

    console.log('Template aplicado:', template);
  };

  const updateSongResources = (songId: string, updates: any) => {
    setSelectedSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, ...updates } : song
    ));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nova Escala
            </DialogTitle>
          </DialogHeader>

          {/* Opções Iniciais - IA e Templates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center space-y-2 border-2 hover:border-blue-300"
              onClick={() => {
                // Continuar com criação manual
              }}
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Criar Manualmente</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center space-y-2 border-2 hover:border-purple-300"
              onClick={() => {
                if (!formData.department || !formData.time || !formData.date) {
                  alert('Preencha pelo menos o Departamento, Data e Horário antes de usar a IA.');
                  return;
                }
                setShowAIDialog(true);
              }}
            >
              <Brain className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Sugestão com IA</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center space-y-2 border-2 hover:border-green-300"
              onClick={() => setShowTemplateDialog(true)}
            >
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Usar Template</span>
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Geral</span>
              </TabsTrigger>
              <TabsTrigger value="agenda" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Agenda</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Equipe</span>
                {Object.keys(selectedMembers).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(selectedMembers).flat().length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="songs" className="flex items-center space-x-1">
                <Music className="h-4 w-4" />
                <span>Músicas</span>
                {selectedSongs.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedSongs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Observações</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Informações Gerais */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Escala</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Culto Domingo Manhã"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceType">Tipo de Culto</Label>
                    <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de culto" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockServiceTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="department">Departamento Principal</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepartments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="template"
                      checked={formData.saveAsTemplate}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, saveAsTemplate: !!checked }))}
                    />
                    <Label htmlFor="template">Salvar como Template</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Agenda */}
            <TabsContent value="agenda" className="space-y-4">
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
                  {agenda.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum item na agenda. Clique em "Adicionar Item" para começar.</p>
                  ) : (
                    agenda.map((item, index) => (
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
                              const person = mockMembers.find(m => m.id === value);
                              if (person) addPersonToAgendaItem(index, person);
                            }}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Adicionar Pessoa" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockMembers
                                  .filter(member => !item.people.some((p: any) => p.id === member.id))
                                  .map(member => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name} - {member.role}
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
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Equipe */}
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Seleção da Equipe
                    {formData.department && formData.time && formData.date && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAIDialog(true)}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Sugerir com IA
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar membros..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {mockDepartments.map(department => (
                    <div key={department} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{department}</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddPersonDialog(department)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Adicionar Pessoa
                        </Button>
                      </div>
                      
                      {/* Membros selecionados */}
                      <div className="space-y-2">
                        {(selectedMembers[department] || []).map(member => (
                          <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                {member.aiSuggestion && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                      IA
                                    </Badge>
                                    <span className="text-xs text-purple-600">Score: {member.aiScore}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMemberFromDepartment(member.id, department)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Dialog para adicionar pessoas */}
                      {showAddPersonDialog === department && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">Adicionar pessoa ao {department}</h5>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAddPersonDialog('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {filteredMembers
                              .filter(member => member.department === department)
                              .filter(member => !(selectedMembers[department] || []).some(sm => sm.id === member.id))
                              .map(member => (
                                <Button
                                  key={member.id}
                                  variant="outline"
                                  className="justify-start h-auto p-2"
                                  onClick={() => {
                                    addMemberToDepartment(member, department);
                                    setShowAddPersonDialog('');
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        {member.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="text-left">
                                      <p className="text-sm font-medium">{member.name}</p>
                                      <p className="text-xs text-gray-600">{member.role}</p>
                                    </div>
                                  </div>
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Músicas */}
            <TabsContent value="songs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Músicas da Escala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar músicas..."
                      value={searchSong}
                      onChange={(e) => setSearchSong(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Músicas selecionadas */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Músicas Selecionadas:</h4>
                    {selectedSongs.length === 0 ? (
                      <p className="text-gray-500">Nenhuma música selecionada</p>
                    ) : (
                      selectedSongs.map((song, index) => (
                        <div key={song.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-gray-600">{song.artist} - BPM: {song.bpm}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500">Tom:</span>
                              <Select value={song.scaleKey} onValueChange={(value) => updateSongKey(song.id, value)}>
                                <SelectTrigger className="w-20 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {musicalKeys.map(key => (
                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-gray-400">(Original: {song.originalKey})</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AddSongLinksDialog
                              trigger={
                                <Button variant="outline" size="sm">
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              }
                              song={song}
                              onSave={updateSongResources}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSongFromScale(song.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Repertório disponível */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Repertório Disponível:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {filteredSongs
                        .filter(song => !selectedSongs.some(ss => ss.id === song.id))
                        .map(song => (
                          <Button
                            key={song.id}
                            variant="outline"
                            className="justify-start h-auto p-3"
                            onClick={() => addSongToScale(song)}
                          >
                            <div className="text-left">
                              <p className="font-medium">{song.title}</p>
                              <p className="text-sm text-gray-600">{song.artist} - Tom Original: {song.originalKey} - BPM: {song.bpm}</p>
                              <Badge variant="secondary" className="text-xs mt-1">{song.category}</Badge>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Observações */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Observações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Adicione observações gerais sobre esta escala..."
                    className="min-h-32"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-purple-500">
              Salvar Escala
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs de IA e Templates */}
      <AISuggestionsDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        requirements={{
          department: formData.department,
          time: formData.time,
          date: formData.date ? new Date(formData.date) : new Date(),
          serviceType: formData.serviceType
        }}
        availableMembers={mockMembers}
        onApplySuggestions={handleApplyAISuggestions}
      />

      <TemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelectTemplate={handleApplyTemplate}
      />
    </>
  );
};
