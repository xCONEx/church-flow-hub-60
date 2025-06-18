
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Invite {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'collaborator' | 'member' | 'master';
  departmentId?: string;
  departmentName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  invitedByName?: string;
  churchId: string;
  createdAt: Date;
  expiresAt?: Date;
}

export const useInvites = () => {
  const { church, user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvites = async () => {
    if (!church?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          departments (name),
          profiles!invited_by (name)
        `)
        .eq('church_id', church.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvites: Invite[] = (data || []).map(invite => ({
        id: invite.id,
        name: invite.name,
        email: invite.email,
        role: invite.role,
        departmentId: invite.department_id,
        departmentName: invite.departments?.name,
        status: invite.status,
        invitedBy: invite.invited_by,
        invitedByName: invite.profiles?.name,
        churchId: invite.church_id,
        createdAt: new Date(invite.created_at),
        expiresAt: invite.expires_at ? new Date(invite.expires_at) : undefined
      }));

      setInvites(formattedInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar convites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvite = async (inviteData: {
    name: string;
    email: string;
    role: string;
    departmentId?: string;
    message?: string;
  }) => {
    if (!church?.id || !user?.id) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { data, error } = await supabase
        .from('invites')
        .insert({
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role as 'admin' | 'leader' | 'collaborator' | 'member' | 'master',
          department_id: inviteData.departmentId || null,
          church_id: church.id,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${inviteData.email} com sucesso.`,
      });

      await loadInvites();
      return data;
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar convite. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!church?.id) return;

    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId)
        .eq('church_id', church.id);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });

      await loadInvites();
    } catch (error) {
      console.error('Error canceling invite:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar convite",
        variant: "destructive",
      });
    }
  };

  const resendInvite = async (inviteId: string) => {
    if (!church?.id) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('invites')
        .update({
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .eq('id', inviteId)
        .eq('church_id', church.id);

      if (error) throw error;

      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso.",
      });

      await loadInvites();
    } catch (error) {
      console.error('Error resending invite:', error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar convite",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInvites();
  }, [church?.id]);

  return {
    invites,
    isLoading,
    sendInvite,
    cancelInvite,
    resendInvite,
    loadInvites
  };
};
