
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Youtube, FileText, Download, ExternalLink } from 'lucide-react';
import { YouTubePlayer } from './YouTubePlayer';

interface SongDetailsModalProps {
  trigger: React.ReactNode;
  song: any;
}

export const SongDetailsModal = ({ trigger, song }: SongDetailsModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Music className="h-6 w-6 text-blue-600" />
            <div>
              <span>{song.title}</span>
              <p className="text-sm text-gray-600 font-normal">{song.artist}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Música</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tom Original</p>
                  <p className="font-semibold">{song.originalKey}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BPM</p>
                  <p className="font-semibold">{song.bpm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <Badge variant="secondary">{song.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tom da Escala</p>
                  <p className="font-semibold">{song.scaleKey || song.originalKey}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="media">Mídia</TabsTrigger>
              <TabsTrigger value="lyrics">Letra</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="audio">Áudio</TabsTrigger>
            </TabsList>

            {/* Tab: Mídia (YouTube) */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <span>Vídeos do YouTube</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {song.youtubeLinks?.length > 0 ? (
                    song.youtubeLinks.map((link: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{link.title || `Vídeo ${index + 1}`}</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Abrir no YouTube
                            </a>
                          </Button>
                        </div>
                        <YouTubePlayer url={link.url} />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum vídeo do YouTube disponível</p>
                  )}
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
                  {song.lyrics ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                      {song.lyrics}
                    </pre>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Letra não disponível</p>
                  )}
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
                <CardContent>
                  {song.documents?.length > 0 ? (
                    <div className="space-y-3">
                      {song.documents.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-gray-600">{doc.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Abrir
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum documento disponível</p>
                  )}
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
                <CardContent>
                  {song.audioFiles?.length > 0 ? (
                    <div className="space-y-3">
                      {song.audioFiles.map((audio: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{audio.title || `Áudio ${index + 1}`}</p>
                            <Button variant="outline" size="sm" asChild>
                              <a href={audio.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                          <audio controls className="w-full">
                            <source src={audio.url} type="audio/mpeg" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum arquivo de áudio disponível</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
