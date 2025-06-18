
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser, Church, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const loadUserData = useCallback(async (authUser: SupabaseUser) => {
    if (!authUser) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('AuthProvider: Loading user data for:', authUser.email);
      
      // Load profile with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile load timeout')), 5000)
        )
      ]) as any;

      if (profileError || !profile) {
        console.log('AuthProvider: Profile not found, creating fallback user');
        createFallbackUser(authUser);
        return;
      }

      // Get user roles
      let userRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role, church_id')
        .eq('user_id', authUser.id)
        .limit(10);

      if (rolesData && rolesData.length > 0) {
        const roleHierarchy = ['master', 'admin', 'leader', 'collaborator', 'member'];
        for (const role of roleHierarchy) {
          const foundRole = rolesData.find(r => r.role === role);
          if (foundRole) {
            userRole = foundRole.role as AppUser['role'];
            churchId = foundRole.church_id;
            break;
          }
        }
      } else if (authUser.email === 'yuriadrskt@gmail.com') {
        userRole = 'master';
      }

      // Load church data only if needed
      let churchData: Church | null = null;
      if (churchId && userRole !== 'master') {
        const { data: church } = await supabase
          .from('churches')
          .select('*')
          .eq('id', churchId)
          .single();

        if (church) {
          churchData = {
            id: church.id,
            name: church.name,
            address: church.address,
            phone: church.phone,
            email: church.email,
            adminId: church.admin_id,
            departments: [],
            serviceTypes: church.service_types || [],
            courses: [],
            createdAt: new Date(church.created_at)
          };
        }
      }

      const userData: AppUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: userRole,
        churchId: userRole !== 'master' ? churchId : undefined,
        avatar: profile.avatar,
        experience: profile.experience as 'beginner' | 'intermediate' | 'advanced' || 'beginner',
        skills: profile.skills || [],
        language: profile.language || 'pt-BR',
        darkMode: profile.dark_mode || false,
        joinedAt: new Date(profile.created_at),
        lastActive: new Date()
      };

      setUser(userData);
      setChurch(churchData);
      
    } catch (error) {
      console.error('AuthProvider: Error loading user data:', error);
      createFallbackUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFallbackUser = useCallback((authUser: SupabaseUser) => {
    const minimalUser: AppUser = {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
      phone: null,
      role: authUser.email === 'yuriadrskt@gmail.com' ? 'master' : 'member',
      churchId: undefined,
      avatar: authUser.user_metadata?.avatar_url || null,
      experience: 'beginner',
      skills: [],
      language: 'pt-BR',
      darkMode: false,
      joinedAt: new Date(),
      lastActive: new Date()
    };
    
    setUser(minimalUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(initialSession);
        if (initialSession?.user) {
          await loadUserData(initialSession.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error in initAuth:', error);
        if (mounted) setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user && !user) {
          await loadUserData(session.user);
        } else if (!session) {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]); // Apenas loadUserData como dependência

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            full_name: userData.name,
            phone: userData.phone
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar,
        experience: userData.experience,
        skills: userData.skills,
        language: userData.language,
        dark_mode: userData.darkMode,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => prev ? { ...prev, ...userData } : prev);
  };

  const value: AuthContextType = {
    user,
    church,
    login,
    register,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
