// Firebase configuration
// Replace these values with your Firebase project configuration
// Get these from Firebase Console > Project Settings > Your apps > SDK setup and configuration

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID', // Optional
};

// Collection names for Firestore
export const COLLECTIONS = {
  USERS: 'users',
  FOOD_ENTRIES: 'foodEntries',
  CUSTOM_FOODS: 'customFoods',
  DAILY_LOGS: 'dailyLogs',
} as const;

// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Add an iOS/Android app to your project
// 4. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
// 5. Place them in the appropriate directories:
//    - Android: android/app/google-services.json
//    - iOS: ios/cico_io/GoogleService-Info.plist
// 6. Enable Authentication (Email/Password, Google Sign-In)
// 7. Create a Firestore database
