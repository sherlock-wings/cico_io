import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MealType, FoodEntry } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface MealCardProps {
  mealType: MealType;
  entries: FoodEntry[];
  totalCalories: number;
  onPress: () => void;
  onAddPress: () => void;
}

const mealIcons: Record<MealType, string> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'nutrition-outline',
};

const mealColors: Record<MealType, string> = {
  breakfast: '#FF9500',
  lunch: '#34C759',
  dinner: '#5856D6',
  snack: '#FF2D55',
};

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  entries,
  totalCalories,
  onPress,
  onAddPress,
}) => {
  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const itemCount = entries.length;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${mealColors[mealType]}20` }]}>
        <Icon name={mealIcons[mealType]} size={24} color={mealColors[mealType]} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.mealName}>{mealLabel}</Text>
        <Text style={styles.itemCount}>
          {itemCount === 0 ? 'No items yet' : `${itemCount} item${itemCount > 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.calories}>{totalCalories} cal</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Icon name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  mealName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  itemCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addButton: {
    padding: 4,
  },
});
