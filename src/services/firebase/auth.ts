import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserProfile } from '@/types';
import { COLLECTIONS } from './config';

// Mock auth service using AsyncStorage for development
// Replace with Firebase JS SDK later

const STORAGE_KEYS = {
  CURRENT_USER: '@cico_current_user',
  USERS: '@cico_users',
};

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  private notifyListeners() {
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const defaultProfile: UserProfile = {
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 50,
        dailyCarbsGoal: 250,
        dailyFatGoal: 65,
      };

      const user: User = {
        id: `user_${Date.now()}`,
        email: email,
        displayName: displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: defaultProfile,
      };

      // Save user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.currentUser = user;
      this.notifyListeners();
      
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      // For mock, just create/load user
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.email === email) {
          this.currentUser = user;
          this.notifyListeners();
          return user;
        }
      }
      
      // Create mock user if not exists
      return this.signUp(email, password, email.split('@')[0]);
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = null;
      this.notifyListeners();
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    // Mock implementation - just log
    console.log('Password reset requested for:', email);
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = {
          ...this.currentUser,
          ...updates,
          updatedAt: new Date(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
        this.notifyListeners();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Update profile failed');
    }
  }
}

export const authService = new AuthService();
