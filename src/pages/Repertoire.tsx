
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Search, Plus, Edit, Trash2, ExternalLink, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddSongDialog } from '@/components/AddSongDialog';
import { EditSongDialog } from '@/components/EditSongDialog';
import { useRepertoire } from '@/hooks/useRepertoire';

export const Repertoire = () => {
  const { user } = useAuth();
  const { songs, isLoading, addSong, updateSong, deleteSong } = useRepertoire();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const canManageSongs = user?.role === 'admin' || user?.role === 'leader';

  const handleAddSong = async (songData: any) => {
    await addSong(songData);
  };

  const handleUpdateSong = async (songId: string, songData: any) => {
    await updateSong(songId, songData);
  };

  const handleDeleteSong = async (songId: string) => {
    if (confirm('Tem certeza que deseja remover esta música do repertório?')) {
      await deleteSong(songId);
    }
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || song.category.toLowerCase() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'adoracao', name: 'Adoração', count: songs.filter(s => s.category.toLowerCase() === 'adoracao').length },
    { id: 'celebracao', name: 'Celebração', count: songs.filter(s => s.category.toLowerCase() === 'celebracao').length },
    { id: 'ministracao', name: 'Ministração', count: songs.filter(s => s.category.toLowerCase() === 'ministracao').length },
    { id: 'comunhao', name: 'Comunhão', count: songs.filter(s => s.category.toLowerCase() === 'comunhao').length }
  ];

  const stats = {
    total: songs.length,
    withChords: songs.filter(s => s.cifraUrl).length,
    withVideos: songs.filter(s => s.youtubeUrl).length,
    withAudio: 0
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Repertório">
        <div className="text-center py-12">Carregando repertório...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Repertório">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Repertório Musical</h2>
            <p className="text-gray-600">
              Gerencie o repertório de músicas da igreja
            </p>
          </div>
          {canManageSongs && (
            <AddSongDialog
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Música
                </Button>
              }
              onSongAdded={handleAddSong}
            />
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar músicas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total de Músicas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.withChords}</div>
              <p className="text-sm text-gray-600">Com Cifras</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.withVideos}</div>
              <p className="text-sm text-gray-600">Com Vídeos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{songs.filter(s => s.hasLyrics).length}</div>
              <p className="text-sm text-gray-600">Com Letra</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas ({songs.length})</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {filteredSongs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {songs.length === 0 
                      ? 'Nenhuma música cadastrada ainda'
                      : 'Nenhuma música encontrada'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {songs.length === 0 
                      ? (canManageSongs 
                          ? "Comece adicionando músicas ao repertório da igreja." 
                          : "Aguarde um administrador ou líder adicionar as músicas."
                        )
                      : "Tente ajustar os filtros de busca."
                    }
                  </p>
                  {canManageSongs && songs.length === 0 && (
                    <AddSongDialog
                      trigger={
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Primeira Música
                        </Button>
                      }
                      onSongAdded={handleAddSong}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map((song) => (
                  <Card key={song.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{song.category}</Badge>
                        {song.originalKey && (
                          <Badge variant="outline">Tom: {song.originalKey}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{song.title}</CardTitle>
                      <CardDescription>{song.artist}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {song.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {song.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {song.youtubeUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                <Play className="h-3 w-3 mr-1" />
                                YouTube
                              </a>
                            </Button>
                          )}
                          {song.cifraUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={song.cifraUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Cifra
                              </a>
                            </Button>
                          )}
                        </div>

                        {canManageSongs && (
                          <div className="flex justify-end space-x-2 pt-2 border-t">
                            <EditSongDialog
                              trigger={
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                              song={song}
                              onSongUpdated={handleUpdateSong}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteSong(song.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
