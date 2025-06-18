
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey?: string;
  category: string;
  youtubeUrl?: string;
  cifraUrl?: string;
  lyrics?: string;
  tags: string[];
  hasLyrics: boolean;
  churchId: string;
  createdAt: Date;
}

export const useRepertoire = () => {
  const { church, user } = useAuth();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSongs = useCallback(async () => {
    if (!church?.id || isLoading) return;

    setIsLoading(true);
    try {
      console.log('Loading songs for church:', church.id);
      
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('church_id', church.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading songs:', error);
        throw error;
      }

      const formattedSongs: Song[] = (data || []).map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        originalKey: song.key,
        category: song.genre || 'Adoração',
        youtubeUrl: song.youtube_url,
        cifraUrl: song.cifra_url,
        lyrics: song.lyrics,
        tags: song.tags || [],
        hasLyrics: !!song.lyrics,
        churchId: song.church_id,
        createdAt: new Date(song.created_at)
      }));

      setSongs(formattedSongs);
      console.log('Songs loaded successfully:', formattedSongs.length);
    } catch (error) {
      console.error('Error loading songs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar repertório",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [church?.id, toast]);

  const addSong = async (songData: Omit<Song, 'id' | 'churchId' | 'createdAt' | 'hasLyrics'>) => {
    if (!church?.id || !user?.id) return;

    try {
      console.log('Adding song:', songData);
      
      const { data, error } = await supabase
        .from('songs')
        .insert({
          title: songData.title,
          artist: songData.artist,
          key: songData.originalKey,
          genre: songData.category,
          youtube_url: songData.youtubeUrl,
          cifra_url: songData.cifraUrl,
          lyrics: songData.lyrics,
          tags: songData.tags,
          church_id: church.id,
          added_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding song:', error);
        throw error;
      }

      console.log('Song added successfully:', data);
      toast({
        title: "Sucesso",
        description: "Música adicionada ao repertório!",
      });

      loadSongs();
    } catch (error) {
      console.error('Error adding song:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar música",
        variant: "destructive",
      });
    }
  };

  const updateSong = async (songId: string, songData: Partial<Song>) => {
    if (!church?.id) return;

    try {
      console.log('Updating song:', songId, songData);
      
      const { error } = await supabase
        .from('songs')
        .update({
          title: songData.title,
          artist: songData.artist,
          key: songData.originalKey,
          genre: songData.category,
          youtube_url: songData.youtubeUrl,
          cifra_url: songData.cifraUrl,
          lyrics: songData.lyrics,
          tags: songData.tags
        })
        .eq('id', songId)
        .eq('church_id', church.id);

      if (error) {
        console.error('Error updating song:', error);
        throw error;
      }

      console.log('Song updated successfully');
      toast({
        title: "Sucesso",
        description: "Música atualizada com sucesso!",
      });

      loadSongs();
    } catch (error) {
      console.error('Error updating song:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar música",
        variant: "destructive",
      });
    }
  };

  const deleteSong = async (songId: string) => {
    if (!church?.id) return;

    try {
      console.log('Deleting song:', songId);
      
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
        .eq('church_id', church.id);

      if (error) {
        console.error('Error deleting song:', error);
        throw error;
      }

      console.log('Song deleted successfully');
      toast({
        title: "Sucesso",
        description: "Música removida do repertório!",
      });

      loadSongs();
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover música",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (church?.id) {
      loadSongs();
    }
  }, [church?.id]);

  return {
    songs,
    isLoading,
    addSong,
    updateSong,
    deleteSong,
    loadSongs
  };
};
