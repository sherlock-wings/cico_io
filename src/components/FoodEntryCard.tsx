import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FoodEntry } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete: () => void;
}

export const FoodEntryCard: React.FC<FoodEntryCardProps> = ({ entry, onDelete }) => {
  const totalCalories = Math.round(entry.foodItem.nutrition.calories * entry.servings);
  const totalProtein = Math.round(entry.foodItem.nutrition.protein * entry.servings * 10) / 10;
  const totalCarbs = Math.round(entry.foodItem.nutrition.carbohydrates * entry.servings * 10) / 10;
  const totalFat = Math.round(entry.foodItem.nutrition.fat * entry.servings * 10) / 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.foodItem.name}
          </Text>
          <Text style={styles.serving}>
            {entry.servings} × {entry.foodItem.servingSize}{entry.foodItem.servingUnit}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Icon name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{totalCalories}</Text>
          <Text style={styles.nutritionLabel}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{totalProtein}g</Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{totalCarbs}g</Text>
          <Text style={styles.nutritionLabel}>carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{totalFat}g</Text>
          <Text style={styles.nutritionLabel}>fat</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  serving: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
