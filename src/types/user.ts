// User related types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
}

export type UnitSystem = 'metric' | 'imperial';

// Supported languages for food search (Open Food Facts language codes)
export type FoodSearchLanguage = 
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'nl' // Dutch
  | 'pl' // Polish
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'zh' // Chinese
  | 'ko' // Korean
  | 'ar' // Arabic
  | 'all'; // All languages (no filter)

export interface UserProfile {
  age?: number;
  weight?: number; // stored in kg
  height?: number; // stored in cm
  gender?: 'male' | 'female' | 'other';
  activityLevel?: ActivityLevel;
  goalType?: GoalType;
  dailyCalorieGoal: number;
  dailyProteinGoal?: number; // in grams
  dailyCarbsGoal?: number; // in grams
  dailyFatGoal?: number; // in grams
  unitSystem?: UnitSystem; // user's preferred display units
  preferredLanguage?: FoodSearchLanguage; // language filter for food search results
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extra_active';

export type GoalType = 
  | 'lose_weight' 
  | 'maintain_weight' 
  | 'gain_weight';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
