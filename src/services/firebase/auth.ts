import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, UserProfile } from '@/types';
import { COLLECTIONS } from './config';

class AuthService {
  // Get current user
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  }

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update display name
      await userCredential.user.updateProfile({ displayName });

      // Create user document in Firestore
      const user = await this.createUserDocument(userCredential.user, displayName);
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = await this.getUserDocument(userCredential.user.uid);
      
      if (!user) {
        throw new Error('User document not found');
      }
      
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Create user document in Firestore
  private async createUserDocument(
    firebaseUser: FirebaseAuthTypes.User,
    displayName: string
  ): Promise<User> {
    const defaultProfile: UserProfile = {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 50,
      dailyCarbsGoal: 250,
      dailyFatGoal: 65,
    };

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: defaultProfile,
    };

    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(firebaseUser.uid)
      .set(user);

    return user;
  }

  // Get user document from Firestore
  async getUserDocument(userId: string): Promise<User | null> {
    const doc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as User;
  }

  // Update user profile
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .update({
        profile: firestore.FieldValue.arrayUnion(profile),
        updatedAt: new Date(),
      });
  }

  // Handle auth errors
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email address is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password accounts are not enabled';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please use at least 6 characters';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export const authService = new AuthService();
