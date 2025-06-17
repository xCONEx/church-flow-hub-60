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
    
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.error('AuthProvider: OAuth error detected:', error, errorDescription);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show user-friendly error
      if (error === 'server_error' && errorDescription?.includes('Database error')) {
        console.log('AuthProvider: Attempting to recover from database error...');
        // Continue with normal flow to try to recover
      }
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Error getting initial session:', error);
        setIsLoading(false);
        return;
      }
      
      console.log('AuthProvider: Initial session found:', session?.user?.email || 'no session');
      setSession(session);
      
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no session');
        
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
          // Don't reload data on token refresh, just update session
          console.log('AuthProvider: Token refreshed');
        } else if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setChurch(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      console.log('AuthProvider: Loading user data for:', authUser.email);
      setIsLoading(true);
      
      // Try multiple times to ensure database trigger has executed
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!profile && attempts < maxAttempts) {
        attempts++;
        console.log(`AuthProvider: Loading profile attempt ${attempts}...`);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileData) {
          profile = profileData;
          console.log('AuthProvider: Profile found successfully');
          break;
        }
        
        if (profileError) {
          console.log(`AuthProvider: Profile not found (attempt ${attempts}), creating...`, profileError.message);
          
          // Try to create profile manually with more robust error handling
          const profileToCreate = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.full_name || 
                  authUser.user_metadata?.name || 
                  authUser.user_metadata?.given_name ||
                  authUser.email!.split('@')[0],
            phone: authUser.user_metadata?.phone || null,
            avatar: authUser.user_metadata?.avatar_url || 
                   authUser.user_metadata?.picture || null,
            experience: 'beginner',
            skills: [],
            language: 'pt-BR',
            dark_mode: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('AuthProvider: Creating profile with data:', profileToCreate);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert(profileToCreate, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          if (newProfile) {
            profile = newProfile;
            console.log('AuthProvider: Profile created successfully');
            break;
          } else {
            console.error('AuthProvider: Error creating profile:', createError);
            
            // If it's a duplicate key error, try to fetch again
            if (createError?.code === '23505') {
              console.log('AuthProvider: Duplicate key error, retrying fetch...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          }
        }
        
        // Wait before retry
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      if (!profile) {
        throw new Error('Failed to load or create user profile after multiple attempts');
      }

      // Get user roles with retry logic
      let userRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      try {
        let roleAttempts = 0;
        let userRoles = null;
        
        while (!userRoles && roleAttempts < 3) {
          roleAttempts++;
          
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role, church_id')
            .eq('user_id', authUser.id);

          if (!rolesError && rolesData && rolesData.length > 0) {
            userRoles = rolesData;
            break;
          }
          
          if (rolesError) {
            console.log('AuthProvider: Error fetching roles:', rolesError);
          }
          
          // If no roles found, create default role
          if (!rolesData || rolesData.length === 0) {
            console.log('AuthProvider: Creating default member role...');
            
            const defaultRole = authUser.email === 'yuriadrskt@gmail.com' ? 'master' : 'member';
            
            const { data: newRole, error: roleCreateError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: authUser.id,
                role: defaultRole,
                church_id: null
              }, { onConflict: 'user_id,church_id,role' })
              .select();
              
            if (newRole && newRole.length > 0) {
              userRoles = newRole;
              break;
            } else {
              console.error('AuthProvider: Error creating default role:', roleCreateError);
            }
          }
          
          if (roleAttempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (userRoles && userRoles.length > 0) {
          // Find highest priority role
          const roleHierarchy = ['master', 'admin', 'leader', 'collaborator', 'member'];
          for (const role of roleHierarchy) {
            const foundRole = userRoles.find(r => r.role === role);
            if (foundRole) {
              userRole = foundRole.role as AppUser['role'];
              churchId = foundRole.church_id;
              break;
            }
          }
        }
      } catch (roleError) {
        console.warn('AuthProvider: Error with user roles, using default member role:', roleError);
      }

      // Load church data if needed
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
      
    } catch (error) {
      console.error('AuthProvider: Critical error loading user data:', error);
      // Don't throw, just log and continue with limited functionality
      
      // Try to create minimal user data
      try {
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
      } catch (fallbackError) {
        console.error('AuthProvider: Even fallback user creation failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
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
      // Don't set loading to false here, let the auth state change handler do it
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
