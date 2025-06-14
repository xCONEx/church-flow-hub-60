
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Youtube, FileText, Music, X, ExternalLink } from 'lucide-react';
import { YouTubePlayer } from './YouTubePlayer';

interface AddSongLinksDialogProps {
  trigger: React.ReactNode;
  song: any;
  onSave: (songId: string, updates: any) => void;
}

export const AddSongLinksDialog = ({ trigger, song, onSave }: AddSongLinksDialogProps) => {
  const [open, setOpen] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState(song.youtubeLinks || []);
  const [documents, setDocuments] = useState(song.documents || []);
  const [audioFiles, setAudioFiles] = useState(song.audioFiles || []);
  const [lyrics, setLyrics] = useState(song.lyrics || '');

  // Estados para novos itens
  const [newYoutubeLink, setNewYoutubeLink] = useState({ title: '', url: '' });
  const [newDocument, setNewDocument] = useState({ title: '', url: '', type: 'pdf' });
  const [newAudioFile, setNewAudioFile] = useState({ title: '', url: '' });

  const addYoutubeLink = () => {
    if (newYoutubeLink.url) {
      setYoutubeLinks([...youtubeLinks, { ...newYoutubeLink, id: Date.now() }]);
      setNewYoutubeLink({ title: '', url: '' });
    }
  };

  const removeYoutubeLink = (id: number) => {
    setYoutubeLinks(youtubeLinks.filter((link: any) => link.id !== id));
  };

  const addDocument = () => {
    if (newDocument.url && newDocument.title) {
      setDocuments([...documents, { ...newDocument, id: Date.now() }]);
      setNewDocument({ title: '', url: '', type: 'pdf' });
    }
  };

  const removeDocument = (id: number) => {
    setDocuments(documents.filter((doc: any) => doc.id !== id));
  };

  const addAudioFile = () => {
    if (newAudioFile.url) {
      setAudioFiles([...audioFiles, { ...newAudioFile, id: Date.now() }]);
      setNewAudioFile({ title: '', url: '' });
    }
  };

  const removeAudioFile = (id: number) => {
    setAudioFiles(audioFiles.filter((audio: any) => audio.id !== id));
  };

  const handleSave = () => {
    onSave(song.id, {
      youtubeLinks,
      documents,
      audioFiles,
      lyrics
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Music className="h-6 w-6 text-blue-600" />
            <div>
              <span>Adicionar Recursos - {song.title}</span>
              <p className="text-sm text-gray-600 font-normal">{song.artist}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="youtube" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="audio">Áudio</TabsTrigger>
            <TabsTrigger value="lyrics">Letra</TabsTrigger>
          </TabsList>

          {/* Tab: YouTube */}
          <TabsContent value="youtube" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <span>Links do YouTube</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar novo link */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">Adicionar Novo Vídeo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <Label>Título</Label>
                      <Input
                        placeholder="Ex: Versão Original"
                        value={newYoutubeLink.title}
                        onChange={(e) => setNewYoutubeLink(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label>URL do YouTube</Label>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={newYoutubeLink.url}
                        onChange={(e) => setNewYoutubeLink(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button onClick={addYoutubeLink} className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de links existentes */}
                <div className="space-y-3">
                  {youtubeLinks.map((link: any) => (
                    <div key={link.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{link.title || 'Vídeo do YouTube'}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeYoutubeLink(link.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <YouTubePlayer url={link.url} height="200" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Documentos */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documentos e Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar novo documento */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">Adicionar Novo Documento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Título</Label>
                      <Input
                        placeholder="Ex: Partitura"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select 
                        value={newDocument.type} 
                        onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">DOC</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>URL/Link</Label>
                      <Input
                        placeholder="https://..."
                        value={newDocument.url}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addDocument} className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de documentos existentes */}
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-600">{doc.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Áudio */}
          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Arquivos de Áudio</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar novo áudio */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">Adicionar Novo Áudio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Título</Label>
                      <Input
                        placeholder="Ex: Playback"
                        value={newAudioFile.title}
                        onChange={(e) => setNewAudioFile(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>URL do Áudio (MP3)</Label>
                      <Input
                        placeholder="https://..."
                        value={newAudioFile.url}
                        onChange={(e) => setNewAudioFile(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addAudioFile} className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de áudios existentes */}
                <div className="space-y-3">
                  {audioFiles.map((audio: any) => (
                    <div key={audio.id} className="space-y-2 border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{audio.title}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAudioFile(audio.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <audio controls className="w-full">
                        <source src={audio.url} type="audio/mpeg" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Letra */}
          <TabsContent value="lyrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Letra da Música</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Cole aqui a letra da música..."
                  className="min-h-64 font-mono"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Salvar Recursos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
