import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '@/types';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import WeeklyReportScreen from '@/screens/dashboard/WeeklyReportScreen';
import MonthlyReportScreen from '@/screens/dashboard/MonthlyReportScreen';
import TrendDetailsScreen from '@/screens/dashboard/TrendDetailsScreen';
import { colors } from '@/constants/theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeeklyReport"
        component={WeeklyReportScreen}
        options={{ title: 'Weekly Report' }}
      />
      <Stack.Screen
        name="MonthlyReport"
        component={MonthlyReportScreen}
        options={{ title: 'Monthly Report' }}
      />
      <Stack.Screen
        name="TrendDetails"
        component={TrendDetailsScreen}
        options={{ title: 'Trends' }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
