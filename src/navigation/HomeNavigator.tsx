import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/types';
import HomeScreen from '@/screens/home/HomeScreen';
import AddFoodScreen from '@/screens/home/AddFoodScreen';
import FoodSearchScreen from '@/screens/home/FoodSearchScreen';
import FoodDetailScreen from '@/screens/home/FoodDetailScreen';
import CustomFoodScreen from '@/screens/home/CustomFoodScreen';
import MealDetailScreen from '@/screens/home/MealDetailScreen';
import { colors } from '@/constants/theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
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
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{ title: 'Add Food' }}
      />
      <Stack.Screen
        name="FoodSearch"
        component={FoodSearchScreen}
        options={{ title: 'Search Food' }}
      />
      <Stack.Screen
        name="FoodDetail"
        component={FoodDetailScreen}
        options={{ title: 'Food Details' }}
      />
      <Stack.Screen
        name="CustomFood"
        component={CustomFoodScreen}
        options={{ title: 'Create Custom Food' }}
      />
      <Stack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={({ route }) => ({
          title: route.params.mealType.charAt(0).toUpperCase() + route.params.mealType.slice(1),
        })}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
