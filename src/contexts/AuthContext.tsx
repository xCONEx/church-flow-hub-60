
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser, Church, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication system...');
    
    let isInitializing = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('AuthProvider: Initial session found:', session?.user?.email || 'no session');
        setSession(session);
        
        if (session?.user && isInitializing) {
          await loadUserData(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Critical error getting session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no session');
        
        // Prevent processing during initialization
        if (isInitializing && event === 'INITIAL_SESSION') {
          return;
        }
        
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: User signed in, loading data...');
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out');
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('AuthProvider: Token refreshed');
          // Don't reload data on token refresh if we already have user data
          if (!user) {
            await loadUserData(session.user);
          }
        } else if (!session) {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        }
      }
    );

    // Mark initialization as complete after a short delay
    setTimeout(() => {
      isInitializing = false;
    }, 1000);

    return () => {
      subscription.unsubscribe();
      isInitializing = false;
    };
  }, []);

  const loadUserData = async (authUser: SupabaseUser) => {
    // Prevent multiple concurrent loads for the same user
    if (user && user.id === authUser.id) {
      console.log('AuthProvider: User data already loaded, skipping...');
      setIsLoading(false);
      return;
    }

    try {
      console.log('AuthProvider: Loading user data for:', authUser.email);
      setIsLoading(true);
      
      // Load profile with single attempt
      console.log('AuthProvider: Loading profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        console.log('AuthProvider: Profile not found, creating fallback user');
        createFallbackUser(authUser);
        return;
      }

      console.log('AuthProvider: Profile found successfully');

      // Get user roles
      let userRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      try {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role, church_id')
          .eq('user_id', authUser.id);

        if (rolesData && rolesData.length > 0) {
          // Find highest priority role
          const roleHierarchy = ['master', 'admin', 'leader', 'collaborator', 'member'];
          for (const role of roleHierarchy) {
            const foundRole = rolesData.find(r => r.role === role);
            if (foundRole) {
              userRole = foundRole.role as AppUser['role'];
              churchId = foundRole.church_id;
              break;
            }
          }
          console.log('AuthProvider: User role found:', userRole);
        } else {
          // Fallback for master user
          if (authUser.email === 'yuriadrskt@gmail.com') {
            userRole = 'master';
            console.log('AuthProvider: Using master role fallback');
          }
        }
      } catch (roleError) {
        console.warn('AuthProvider: Error loading user roles:', roleError);
        if (authUser.email === 'yuriadrskt@gmail.com') {
          userRole = 'master';
        }
      }

      // Load church data if needed (only if not master)
      let churchData: Church | null = null;
      if (churchId && userRole !== 'master') {
        try {
          const { data: church } = await supabase
            .from('churches')
            .select(`
              *,
              departments(*)
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
        } catch (churchError) {
          console.warn('AuthProvider: Error loading church data:', churchError);
        }
      }

      const userData: AppUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: userRole,
        churchId,
        avatar: profile.avatar,
        experience: profile.experience as 'beginner' | 'intermediate' | 'advanced' || 'beginner',
        skills: profile.skills || [],
        language: profile.language || 'pt-BR',
        darkMode: profile.dark_mode || false,
        joinedAt: new Date(profile.created_at),
        lastActive: new Date()
      };

      console.log('AuthProvider: User data loaded successfully:', userData.email, userData.role);
      setUser(userData);
      setChurch(churchData);
      
    } catch (error) {
      console.error('AuthProvider: Error loading user data:', error);
      createFallbackUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const createFallbackUser = (authUser: SupabaseUser) => {
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
    
    console.log('AuthProvider: Setting minimal user data as fallback');
    setUser(minimalUser);
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting login for:', email);
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthProvider: Login error:', error);
        throw error;
      }
      
      console.log('AuthProvider: Login successful for:', email);
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    console.log('AuthProvider: Attempting registration for:', userData.email);

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            full_name: userData.name,
            phone: userData.phone
          }
        }
      });

      if (error) {
        console.error('AuthProvider: Registration error:', error);
        throw error;
      }

      console.log('AuthProvider: Registration successful for:', userData.email);
      
      if (data.user && !data.user.email_confirmed_at) {
        console.log('AuthProvider: User needs email confirmation');
      }
      
    } catch (error) {
      console.error('AuthProvider: Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logging out user');
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Logout error:', error);
        throw error;
      }
    } catch (error) {
      console.error('AuthProvider: Logout failed:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) throw new Error('No user logged in');

    console.log('AuthProvider: Updating user profile');
    
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

    // Reload user data
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user) {
      await loadUserData(authUser.user);
    }
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
