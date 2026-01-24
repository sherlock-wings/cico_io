# CICO - Calorie Tracking App

A React Native mobile application for tracking daily calorie intake and nutritional goals.

## Features

- 🍎 **Food Logging**: Track meals (breakfast, lunch, dinner, snacks)
- 📊 **Dashboard**: Visual charts showing calorie trends and macro distribution
- 🎯 **Goal Setting**: Set personalized daily calorie and macro targets
- 🔍 **Food Search**: Search from Open Food Facts database
- ➕ **Custom Foods**: Create and save your own food entries
- 📈 **Progress Tracking**: Weekly and monthly reports
- 🔥 **Streaks**: Track consecutive days of logging

## Tech Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Backend**: Firebase (Authentication, Firestore)
- **Charts**: react-native-chart-kit
- **Icons**: react-native-vector-icons

## Project Structure

```
cico_io/
├── src/
│   ├── components/       # Reusable UI components
│   ├── constants/        # Theme, colors, spacing
│   ├── context/          # React Context providers
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Dashboard & reports
│   │   ├── home/         # Food logging screens
│   │   └── profile/      # User profile screens
│   ├── services/         # API & Firebase services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── App.tsx               # App entry point
├── index.js              # React Native entry
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   cd cico_io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Set up Firebase**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Add iOS and Android apps to your project
   - Download configuration files:
     - `GoogleService-Info.plist` → `ios/cico_io/`
     - `google-services.json` → `android/app/`
   - Enable Email/Password authentication
   - Create a Firestore database
   - Update `src/services/firebase/config.ts` with your Firebase config

5. **Run the app**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## Configuration

### Firebase Setup

Update `src/services/firebase/config.ts` with your Firebase project credentials:

```typescript
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### Nutrition API (Optional)

For USDA Food Database integration, get an API key from:
https://fdc.nal.usda.gov/api-key-signup.html

Update `src/services/api/nutritionApi.ts`:

```typescript
const USDA_API_KEY = 'YOUR_USDA_API_KEY';
```

## Firestore Data Structure

```
users/
  {userId}/
    - email
    - displayName
    - profile
      - dailyCalorieGoal
      - dailyProteinGoal
      - dailyCarbsGoal
      - dailyFatGoal
    foodEntries/
      {entryId}/
        - foodItem
        - servings
        - mealType
        - date
        - timestamp
    customFoods/
      {foodId}/
        - name
        - nutrition
        - servingSize
    dailyLogs/
      {date}/
        - totals
        - entryCount
```

## Available Scripts

- `npm run start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Barcode scanning
- [ ] AI food recognition from photos
- [ ] Water tracking
- [ ] Exercise logging
- [ ] Apple Health / Google Fit integration
- [ ] Social features
- [ ] Export data to CSV/PDF
- [ ] Dark mode support

## License

MIT License - see LICENSE file for details
