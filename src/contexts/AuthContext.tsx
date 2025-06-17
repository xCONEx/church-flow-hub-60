
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
    console.log('AuthProvider: Initializing auth state listener...');
    
    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check:', session?.user?.email || 'no session');
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no session');
        
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Loading user profile for:', userId);
      
      // Get current auth user data
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        console.error('AuthProvider: No authenticated user found');
        setIsLoading(false);
        return;
      }

      // Get or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('AuthProvider: Error loading profile:', profileError);
        
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          console.log('AuthProvider: Creating new profile for user:', authUser.user.email);
          
          const name = authUser.user.user_metadata?.full_name || 
                      authUser.user.user_metadata?.name || 
                      authUser.user.email!.split('@')[0];

          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.user.id,
                email: authUser.user.email!,
                name: name,
                avatar: authUser.user.user_metadata?.avatar_url || authUser.user.user_metadata?.picture,
                created_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('AuthProvider: Error creating profile:', createError);
              throw createError;
            }
            
            profile = newProfile;
            console.log('AuthProvider: Profile created successfully:', profile);
          } catch (createProfileError) {
            console.error('AuthProvider: Failed to create profile:', createProfileError);
            setIsLoading(false);
            return;
          }
        } else {
          setIsLoading(false);
          return;
        }
      }

      // Load user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, church_id')
        .eq('user_id', userId);

      let primaryRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      if (userRoles && userRoles.length > 0) {
        const masterRole = userRoles.find(r => r.role === 'master');
        if (masterRole) {
          primaryRole = 'master';
        } else {
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

      // Load church data if user has one
      let churchData: Church | null = null;
      if (churchId && primaryRole !== 'master') {
        const { data: church } = await supabase
          .from('churches')
          .select(`
            *,
            departments:departments(
              id, name, type, leader_id, is_sub_department, 
              parent_department_id, church_id, created_at
            )
          `)
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
            departments: church.departments?.map(dept => ({
              id: dept.id,
              name: dept.name,
              churchId: dept.church_id,
              leaderId: dept.leader_id,
              collaborators: [],
              type: dept.type as any,
              parentDepartmentId: dept.parent_department_id,
              isSubDepartment: dept.is_sub_department,
              createdAt: new Date(dept.created_at)
            })) || [],
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

      console.log('AuthProvider: User profile loaded successfully:', userData);
      setUser(userData);
      setChurch(churchData);
      setIsLoading(false);
    } catch (error) {
      console.error('AuthProvider: Error in loadUserProfile:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('AuthProvider: Attempting login for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('AuthProvider: Login error:', error);
      setIsLoading(false);
      throw error;
    }
    // User will be loaded automatically by onAuthStateChange
  };

  const register = async (userData: Partial<AppUser> & { password: string }) => {
    setIsLoading(true);
    console.log('AuthProvider: Attempting registration for:', userData.email);

    if (!userData.email || !userData.name) {
      throw new Error('Email e nome são obrigatórios');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: userData.name,
            full_name: userData.name,
            phone: userData.phone
          }
        }
      });

      if (error) {
        console.error('AuthProvider: Registration error:', error);
        setIsLoading(false);
        throw error;
      }

      console.log('AuthProvider: Registration successful:', data);
      setIsLoading(false);
    } catch (error) {
      console.error('AuthProvider: Registration failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logging out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthProvider: Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) throw new Error('No user logged in');

    console.log('AuthProvider: Updating user profile:', userData);
    
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
      console.error('AuthProvider: Error updating user:', error);
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
