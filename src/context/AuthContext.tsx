import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserProfile, AuthState } from '@/types';
import { authService } from '@/services/firebase';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await authService.getUserDocument(firebaseUser.uid);
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.signIn(email, password);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await authService.signUp(email, password, displayName);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!state.user) throw new Error('No user logged in');
    
    try {
      await authService.updateUserProfile(state.user.id, profile);
      setState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          profile: { ...prev.user.profile, ...profile },
        } : null,
      }));
    } catch (error: any) {
      throw error;
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
