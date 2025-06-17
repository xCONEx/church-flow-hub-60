
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser, Church, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    console.log('Initializing auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Buscar perfil do usuário
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        
        // Se perfil não existe, criar um novo
        if (profileError.code === 'PGRST116') {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            console.log('Creating new profile for user:', authUser.user.email);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.user.id,
                email: authUser.user.email!,
                name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setIsLoading(false);
              return;
            }
            
            // Usar o perfil recém-criado
            profile = newProfile;
          }
        } else {
          setIsLoading(false);
          return;
        }
      }

      // Buscar roles do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, church_id')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error loading user roles:', rolesError);
      }

      // Determinar o role principal e igreja
      let primaryRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      if (userRoles && userRoles.length > 0) {
        // Priorizar master, depois roles por ordem hierárquica
        const masterRole = userRoles.find(r => r.role === 'master');
        if (masterRole) {
          primaryRole = 'master';
        } else {
          // Pegar o role mais alto em qualquer igreja
          const roleHierarchy = ['admin', 'leader', 'collaborator', 'member'];
          for (const role of roleHierarchy) {
            const foundRole = userRoles.find(r => r.role === role && r.church_id);
            if (foundRole) {
              primaryRole = foundRole.role as AppUser['role'];
              churchId = foundRole.church_id;
              break;
            }
          }
        }
      }

      // Buscar dados da igreja se não for master
      let churchData: Church | null = null;
      if (churchId && primaryRole !== 'master') {
        const { data: church, error: churchError } = await supabase
          .from('churches')
          .select(`
            *,
            departments:departments(
              id,
              name,
              type,
              leader_id,
              is_sub_department,
              parent_department_id,
              church_id,
              created_at
            )
          `)
          .eq('id', churchId)
          .single();

        if (!churchError && church) {
          churchData = {
            id: church.id,
            name: church.name,
            address: church.address,
            phone: church.phone,
            email: church.email,
            adminId: church.admin_id,
            departments: church.departments?.map(dept => ({
              id: dept.id,
              name: dept.name,
              churchId: dept.church_id,
              leaderId: dept.leader_id,
              collaborators: [], // Will be loaded separately when needed
              type: dept.type as any,
              parentDepartmentId: dept.parent_department_id,
              isSubDepartment: dept.is_sub_department,
              createdAt: new Date(dept.created_at)
            })) || [],
            serviceTypes: church.service_types || [],
            courses: [], // Will be loaded separately when needed
            createdAt: new Date(church.created_at)
          };
        }
      }

      const userData: AppUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: primaryRole,
        churchId,
        avatar: profile.avatar,
        experience: profile.experience as 'beginner' | 'intermediate' | 'advanced',
        skills: profile.skills || [],
        language: profile.language || 'pt-BR',
        darkMode: profile.dark_mode || false,
        joinedAt: new Date(profile.created_at),
        lastActive: new Date()
      };

      console.log('User profile loaded successfully:', userData);
      setUser(userData);
      setChurch(churchData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting login for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
    // User will be loaded automatically by onAuthStateChange
  };

  const register = async (userData: Partial<AppUser>) => {
    setIsLoading(true);
    console.log('Attempting registration for:', userData.email);

    if (!userData.email || !userData.name) {
      throw new Error('Email e nome são obrigatórios');
    }

    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.email, // Temporary password, user should change it
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          name: userData.name,
          full_name: userData.name
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw error;
    }
    // User will be loaded automatically by onAuthStateChange
  };

  const logout = async () => {
    console.log('Logging out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    // State will be cleared automatically by onAuthStateChange
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating user profile:', userData);
    
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

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    // Reload user profile
    await loadUserProfile(user.id);
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
