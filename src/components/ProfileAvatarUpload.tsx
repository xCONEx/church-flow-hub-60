
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ProfileAvatarUpload = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading avatar:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      if (!publicUrl) {
        throw new Error('Falha ao obter URL da imagem');
      }

      // Update user profile with new avatar URL
      await updateUser({ avatar: publicUrl });

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
          <AvatarFallback className="text-lg">
            {user?.name ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-8 w-8 p-0"
            disabled={isUploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => document.getElementById('avatar-upload')?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Enviando...' : 'Alterar Foto'}
      </Button>
    </div>
  );
};
