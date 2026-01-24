import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FoodItem } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface FoodSearchItemProps {
  food: FoodItem;
  onPress: () => void;
}

export const FoodSearchItem: React.FC<FoodSearchItemProps> = ({ food, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon
          name={food.isCustom ? 'star' : 'nutrition'}
          size={20}
          color={food.isCustom ? colors.warning : colors.primary}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        {food.brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {food.brand}
          </Text>
        )}
        <Text style={styles.serving}>
          {food.servingSize} {food.servingUnit}
        </Text>
      </View>

      <View style={styles.nutritionInfo}>
        <Text style={styles.calories}>{food.nutrition.calories}</Text>
        <Text style={styles.calorieLabel}>cal</Text>
      </View>

      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  brand: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 1,
  },
  serving: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutritionInfo: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  calories: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  calorieLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
