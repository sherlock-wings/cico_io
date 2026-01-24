import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { FoodLogProvider } from '@/context/FoodLogContext';
import { RootNavigator } from '@/navigation';
import { colors } from '@/constants/theme';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AuthProvider>
        <FoodLogProvider>
          <RootNavigator />
        </FoodLogProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
