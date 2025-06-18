
import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Search, Plus, FileText, Video, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddSongDialog } from '@/components/AddSongDialog';

export const Repertoire = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [songs, setSongs] = useState<any[]>([]);

  const canManageSongs = user?.role === 'admin' || user?.role === 'leader';

  const handleAddSong = (songData: any) => {
    const newSong = {
      id: Date.now().toString(),
      ...songData,
      createdAt: new Date()
    };
    setSongs([...songs, newSong]);
  };

  const categories = [
    { id: 'louvor', name: 'Louvor', count: 0 },
    { id: 'adoracao', name: 'Adoração', count: 0 },
    { id: 'infantil', name: 'Infantil', count: 0 },
    { id: 'especial', name: 'Especial', count: 0 }
  ];

  const stats = {
    total: 0,
    withChords: 0,
    withVideos: 0,
    withAudio: 0
  };

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
              <div className="text-2xl font-bold text-orange-600">{stats.withAudio}</div>
              <p className="text-sm text-gray-600">Com Áudio</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="louvor">Louvor</TabsTrigger>
            <TabsTrigger value="adoracao">Adoração</TabsTrigger>
            <TabsTrigger value="infantil">Infantil</TabsTrigger>
            <TabsTrigger value="especial">Especial</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Empty State */}
            <Card>
              <CardContent className="text-center py-16">
                <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma música cadastrada ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  {canManageSongs 
                    ? "Comece adicionando músicas ao repertório da igreja." 
                    : "Aguarde um administrador ou líder adicionar as músicas."
                  }
                </p>
                {canManageSongs && (
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
          </TabsContent>

          {/* Outras tabs com empty state similar */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <Card>
                <CardContent className="text-center py-16">
                  <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma música de {category.name} cadastrada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Adicione músicas da categoria {category.name} ao repertório.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
