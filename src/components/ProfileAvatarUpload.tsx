
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const compressImage = (file: File, maxWidth: number = 300, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

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

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Compress image
      const compressedFile = await compressImage(file);
      console.log('Compressed file size:', compressedFile.size);

      // Create unique filename
      const fileExt = 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading avatar:', filePath);

      // Delete old avatar if exists
      if (user.avatar && user.avatar.includes('avatars/')) {
        const oldPath = user.avatar.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profiles')
            .remove([`avatars/${oldPath}`]);
        }
      }

      // Upload compressed file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      if (!publicUrl) {
        throw new Error('Falha ao obter URL da imagem');
      }

      // Set preview immediately
      setImagePreview(publicUrl);

      // Update user profile
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
      setImagePreview(null);
    } finally {
      setIsUploading(false);
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

  const displayImage = imagePreview || user?.avatar;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={displayImage} 
            alt={user?.name}
            onLoad={() => console.log('Avatar loaded successfully')}
            onError={() => {
              console.log('Avatar failed to load');
              setImagePreview(null);
            }}
          />
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
