import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Search, Plus, ExternalLink, FileText, send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddSongDialog } from '@/components/AddSongDialog';
import { EditSongDialog } from '@/components/EditSongDialog';
import { AddSongLinksDialog } from '@/components/AddSongLinksDialog';
import { toast } from 'react-toastify';

// Mock data
const initialMockSongs = [
  {
    id: '1',
    title: 'Eu Creio em Ti',
    artist: 'Hillsong United',
    originalKey: 'F',
    category: 'Adoração',
    youtubeUrl: 'https://youtube.com/watch?v=example1',
    cifraUrl: 'https://cifraclub.com.br/example1',
    hasLyrics: true,
    lyrics: '',
    tags: ['adoração', 'fé', 'confiança'],
    addedBy: 'Pastor João',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Pra Te Adorar Eu Vivo',
    artist: 'Diante do Trono',
    originalKey: 'C',
    category: 'Adoração',
    youtubeUrl: 'https://youtube.com/watch?v=example2',
    cifraUrl: 'https://cifraclub.com.br/example2',
    hasLyrics: true,
    lyrics: '',
    tags: ['adoração', 'entrega', 'devoção'],
    addedBy: 'Ana Karolina',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Eu Vou Construir',
    artist: 'Rend Collective',
    originalKey: 'C',
    category: 'Celebração',
    youtubeUrl: 'https://youtube.com/watch?v=example3',
    cifraUrl: 'https://cifraclub.com.br/example3',
    hasLyrics: true,
    lyrics: '',
    tags: ['celebração', 'alegria', 'construção'],
    addedBy: 'Yuri Adriel',
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '4',
    title: 'Reckless Love',
    artist: 'Cory Asbury',
    originalKey: 'Bb',
    category: 'Adoração',
    youtubeUrl: 'https://youtube.com/watch?v=example4',
    cifraUrl: 'https://cifraclub.com.br/example4',
    hasLyrics: false,
    lyrics: '',
    tags: ['amor', 'graça', 'adoração'],
    addedBy: 'Pastor João',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '5',
    title: 'Cornerstone',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    category: 'Adoração',
    youtubeUrl: 'https://youtube.com/watch?v=example5',
    cifraUrl: 'https://cifraclub.com.br/example5',
    hasLyrics: true,
    lyrics: '',
    tags: ['fundamento', 'jesus', 'rocha'],
    addedBy: 'Ana Karolina',
    createdAt: new Date('2024-01-03'),
  }
];

const categories = ['Todas', 'Adoração', 'Celebração', 'Ministração', 'Comunhão'];

export const Repertoire = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState(initialMockSongs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'Todas' || song.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const canEditRepertoire = user?.role === 'admin' || user?.role === 'leader';

  const handleSongAdded = (newSong: any) => {
    setSongs(prev => [newSong, ...prev]);
  };

  const handleSongUpdated = (songId: string, updatedSong: any) => {
    setSongs(prev => prev.map(song => song.id === songId ? updatedSong : song));
  };

  const handleSongLinksUpdated = (songId: string, updates: any) => {
    setSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, ...updates } : song
    ));
  };

  const handleSendInvite = () => {
    toast({
      title: "Convite Enviado",
      description: "Convite para colaborar no repertório foi enviado com sucesso!"
    });
  };

  return (
    <DashboardLayout title="Repertório">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Repertório Musical</h2>
            <p className="text-gray-600">Gerencie as músicas disponíveis para as escalas</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSendInvite}
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              <send className="h-4 w-4 mr-2" />
              Enviar Convite
            </Button>
            {canEditRepertoire && (
              <AddSongDialog
                trigger={
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Música
                  </Button>
                }
                onSongAdded={handleSongAdded}
              />
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, artista ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{songs.length}</div>
              <p className="text-sm text-gray-600">Total de Músicas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {songs.filter(s => s.category === 'Adoração').length}
              </div>
              <p className="text-sm text-gray-600">Adoração</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {songs.filter(s => s.category === 'Celebração').length}
              </div>
              <p className="text-sm text-gray-600">Celebração</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {songs.filter(s => s.hasLyrics).length}
              </div>
              <p className="text-sm text-gray-600">Com Letras</p>
            </CardContent>
          </Card>
        </div>

        {/* Songs List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSongs.map((song) => (
            <Card key={song.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {song.artist} • Tom: {song.originalKey}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{song.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {song.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Adicionado por {song.addedBy}</span>
                  <span>{song.createdAt.toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {song.youtubeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        YouTube
                      </a>
                    </Button>
                  )}
                  {song.cifraUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={song.cifraUrl} target="_blank" rel="noopener noreferrer">
                        <Music className="h-3 w-3 mr-1" />
                        Cifra
                      </a>
                    </Button>
                  )}
                  {song.hasLyrics && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Letra
                    </Button>
                  )}
                  <AddSongLinksDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Recursos
                      </Button>
                    }
                    song={song}
                    onSave={handleSongLinksUpdated}
                  />
                </div>

                {canEditRepertoire && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <EditSongDialog
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                      }
                      song={song}
                      onSongUpdated={handleSongUpdated}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
