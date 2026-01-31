import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile, AuthState } from '@/types';
import { authService } from '@/services/firebase';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  createLocalUser: (displayName?: string) => Promise<void>;
}

const STORAGE_KEY = '@cico_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
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
      const updatedUser = {
        ...state.user,
        profile: { ...state.user.profile, ...profile },
      };
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error: any) {
      throw error;
    }
  }, [state.user]);

  // Create a local user without requiring email/password
  // Used for "Start Fresh" flow and after importing data
  const createLocalUser = useCallback(async (displayName?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Check if there's already user data from an import
      const existingUserJson = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (existingUserJson) {
        // User data exists (from import), just load it
        const existingUser = JSON.parse(existingUserJson);
        setState({
          user: existingUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return;
      }
      
      // Create a new local user
      const defaultProfile: UserProfile = {
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 50,
        dailyCarbsGoal: 250,
        dailyFatGoal: 65,
      };

      const user: User = {
        id: `local_user_${Date.now()}`,
        email: '',
        displayName: displayName || 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: defaultProfile,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        updateProfile,
        createLocalUser,
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
