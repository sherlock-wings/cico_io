// Navigation related types
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { FoodItem, MealType, FoodEntry } from './food';

// Root Stack (contains auth and main app)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack (Food Logging)
export type HomeStackParamList = {
  Home: undefined;
  AddFood: { mealType?: MealType; date?: string };
  FoodSearch: { mealType: MealType; date: string };
  FoodDetail: { foodItem: FoodItem; mealType: MealType; date: string };
  CustomFood: { mealType: MealType; date: string };
  BarcodeScanner: { mealType: MealType; date: string };
  MealDetail: { mealType: MealType; date: string };
  EditEntry: { entry: FoodEntry; date: string };
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
  WeeklyReport: undefined;
  MonthlyReport: undefined;
  TrendDetails: { type: 'calories' | 'macros' | 'weight' };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Goals: undefined;
  Settings: undefined;
  DataExport: undefined;
  About: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type DashboardStackScreenProps<T extends keyof DashboardStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;
