
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
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      console.log('AuthProvider: Initial session:', session?.user?.email || 'no session');
      setSession(session);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no session');
        
        setSession(session);
        
        if (session?.user) {
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
      
      // Check if profile exists
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        console.log('AuthProvider: Creating profile for user:', authUser.email);
        
        const name = authUser.user_metadata?.full_name || 
                     authUser.user_metadata?.name || 
                     authUser.email!.split('@')[0];

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            name: name,
            phone: authUser.user_metadata?.phone || null,
            avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('AuthProvider: Error creating profile:', createError);
          setIsLoading(false);
          return;
        }
        
        profile = newProfile;
        console.log('AuthProvider: Profile created successfully');
      } else if (profileError) {
        console.error('AuthProvider: Error loading profile:', profileError);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.error('AuthProvider: No profile found and could not create one');
        setIsLoading(false);
        return;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, church_id')
        .eq('user_id', authUser.id);

      if (rolesError) {
        console.error('AuthProvider: Error loading user roles:', rolesError);
      }

      let primaryRole: AppUser['role'] = 'member';
      let churchId: string | undefined;

      // Check if user is master
      if (authUser.email === 'yuriadrskt@gmail.com') {
        primaryRole = 'master';
        
        // Ensure master role exists in database
        const { error: masterRoleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: authUser.id,
            role: 'master',
            church_id: null
          });

        if (masterRoleError) {
          console.error('AuthProvider: Error creating master role:', masterRoleError);
        }
      } else if (userRoles && userRoles.length > 0) {
        // Find highest role
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

      // Load church data if user belongs to one
      let churchData: Church | null = null;
      if (churchId && primaryRole !== 'master') {
        const { data: church, error: churchError } = await supabase
          .from('churches')
          .select(`
            *,
            departments(*)
          `)
          .eq('id', churchId)
          .single();

        if (churchError) {
          console.error('AuthProvider: Error loading church data:', churchError);
        } else if (church) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('AuthProvider: Attempting login for:', email);
    
    try {
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
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    setIsLoading(true);
    console.log('AuthProvider: Attempting registration for:', userData.email);

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
        throw error;
      }

      console.log('AuthProvider: Registration successful for:', userData.email);
      
      // If user is confirmed immediately, they will be automatically logged in
      if (data.user && !data.user.email_confirmed_at) {
        console.log('AuthProvider: User needs email confirmation');
      }
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logging out user');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Logout error:', error);
        throw error;
      }
    } finally {
      setIsLoading(false);
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
