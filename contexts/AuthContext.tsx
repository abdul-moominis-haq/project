'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { localStorageService } from '@/services/local-storage';

// Define types locally to avoid import issues
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    location?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type Session = {
  user: SupabaseUser;
  [key: string]: any;
} | null;

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  profile: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, location: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Function to fetch profile data from database
  const fetchProfile = async (userId: string) => {
    try {
      // Initialize local storage for user
      localStorageService.initializeUser(userId);
      
      // Try to get cached profile first
      const cachedProfile = localStorageService.getProfile(userId);
      if (cachedProfile) {
        setProfile(cachedProfile);
      }

      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        
        // Save profile to local storage
        localStorageService.saveProfile(userId, data.profile);
        
        return data.profile;
      } else if (response.status === 404) {
        // Profile doesn't exist - this should now be handled by the API
        console.log('Profile not found (404), but should be auto-created');
        setProfile(null);
        return null;
      } else {
        // Other error - use cached profile if available
        const errorData = await response.json();
        console.error('Profile fetch error:', errorData);
        
        if (cachedProfile) {
          console.log('Using cached profile due to API error');
          return cachedProfile;
        }
        
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Fallback to cached profile
      const cachedProfile = localStorageService.getProfile(userId);
      if (cachedProfile) {
        console.log('Using cached profile due to network error');
        setProfile(cachedProfile);
        return cachedProfile;
      }
      
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      await fetchProfile(supabaseUser.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        // Map Supabase user to your User type
        const mappedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          location: session.user.user_metadata?.location || 'Unknown'
        };
        setUser(mappedUser);
        
        // Fetch profile data from database
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: Session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const mappedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            location: session.user.user_metadata?.location || 'Unknown'
          };
          setUser(mappedUser);
          
          // Fetch profile data from database
          await fetchProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, location: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            location,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error.message);
        setIsLoading(false);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
      }
      
      // Clear local state
      setUser(null);
      setSupabaseUser(null);
      setProfile(null);
      
      // Clear local storage for the current user
      if (supabaseUser?.id) {
        localStorageService.clearUserData(supabaseUser.id);
        console.log('Cleared local storage for user:', supabaseUser.id);
      }
      
      console.log('Logout successful, redirecting to login...');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSupabaseUser(null);
      setProfile(null);
      
      // Try to clear any stored user data
      try {
        if (supabaseUser?.id) {
          localStorageService.clearUserData(supabaseUser.id);
        }
      } catch (storageError) {
        console.error('Error clearing storage during logout:', storageError);
      }
      
      // Always redirect to login, even if there were errors
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, profile, login, signup, logout, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}