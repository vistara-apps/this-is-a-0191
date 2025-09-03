import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService } from '../services/supabaseService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { session, error: sessionError } = await supabaseService.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          const { user: currentUser, error: userError } = await supabaseService.getCurrentUser();
          
          if (userError) {
            throw userError;
          }
          
          if (currentUser) {
            const { user: profile, error: profileError } = await supabaseService.getUserProfile(currentUser.id);
            
            if (profileError) {
              throw profileError;
            }
            
            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                subscriptionPlan: profile.subscription_plan,
                createdAt: new Date(profile.created_at)
              });
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabaseService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user: profile, error: profileError } = await supabaseService.getUserProfile(session.user.id);
          
          if (!profileError && profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              subscriptionPlan: profile.subscription_plan,
              createdAt: new Date(profile.created_at)
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user: authUser, error: signInError } = await supabaseService.signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      if (authUser) {
        const { user: profile, error: profileError } = await supabaseService.getUserProfile(authUser.id);
        
        if (profileError) {
          throw profileError;
        }
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            subscriptionPlan: profile.subscription_plan,
            createdAt: new Date(profile.created_at)
          });
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user: authUser, error: signUpError } = await supabaseService.signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // User will be set by the auth state change listener
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: signOutError } = await supabaseService.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await supabaseService.resetPassword(email);
      
      if (resetError) {
        throw resetError;
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

