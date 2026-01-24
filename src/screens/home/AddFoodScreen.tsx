import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeStackScreenProps, MealType } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

const mealOptions: { type: MealType; icon: string; label: string; color: string }[] = [
  { type: 'breakfast', icon: 'sunny-outline', label: 'Breakfast', color: '#FF9500' },
  { type: 'lunch', icon: 'restaurant-outline', label: 'Lunch', color: '#34C759' },
  { type: 'dinner', icon: 'moon-outline', label: 'Dinner', color: '#5856D6' },
  { type: 'snack', icon: 'nutrition-outline', label: 'Snack', color: '#FF2D55' },
];

const AddFoodScreen: React.FC<HomeStackScreenProps<'AddFood'>> = ({ navigation, route }) => {
  const { date } = route.params || {};
  const selectedDate = date || new Date().toISOString().split('T')[0];

  const handleMealSelect = (mealType: MealType) => {
    navigation.navigate('FoodSearch', { mealType, date: selectedDate });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Add to which meal?</Text>
        <Text style={styles.subtitle}>Select a meal to add food to</Text>

        <View style={styles.mealGrid}>
          {mealOptions.map((meal) => (
            <TouchableOpacity
              key={meal.type}
              style={styles.mealCard}
              onPress={() => handleMealSelect(meal.type)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${meal.color}20` }]}>
                <Icon name={meal.icon} size={32} color={meal.color} />
              </View>
              <Text style={styles.mealLabel}>{meal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => navigation.navigate('CustomFood', { mealType: 'snack', date: selectedDate })}
        >
          <Icon name="create-outline" size={24} color={colors.primary} />
          <Text style={styles.customButtonText}>Create Custom Food</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  mealCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mealLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  customButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
});

export default AddFoodScreen;
