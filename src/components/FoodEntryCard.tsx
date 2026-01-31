import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FoodEntry } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface FoodEntryCardProps {
  entry: FoodEntry;
  onPress?: () => void;
  onDelete: () => void;
}

export const FoodEntryCard: React.FC<FoodEntryCardProps> = ({ entry, onPress, onDelete }) => {
  const totalCalories = Math.round(entry.foodItem.nutrition.calories * entry.servings);
  const totalProtein = Math.round(entry.foodItem.nutrition.protein * entry.servings * 10) / 10;
  const totalCarbs = Math.round(entry.foodItem.nutrition.carbohydrates * entry.servings * 10) / 10;
  const totalFat = Math.round(entry.foodItem.nutrition.fat * entry.servings * 10) / 10;

  // Format serving unit for display
  const formatUnit = (unit: string): string => {
    switch (unit) {
      case 'ml': return 'mL';
      case 'g': return 'g';
      case 'oz': return 'oz';
      case 'fl oz': return 'fl oz';
      default: return unit;
    }
  };

  // Format serving size with appropriate decimals
  const formatServing = (size: number, unit: string): string => {
    if (unit === 'ml' || unit === 'g') {
      return Math.round(size).toString();
    }
    return (Math.round(size * 10) / 10).toString();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.foodItem.name}
          </Text>
          <Text style={styles.serving}>
            {formatServing(entry.foodItem.servingSize, entry.foodItem.servingUnit)} {formatUnit(entry.foodItem.servingUnit)}
            {entry.servings !== 1 && ` × ${entry.servings}`}
          </Text>
        </View>
        <View style={styles.actions}>
          {onPress && (
            <TouchableOpacity style={styles.editButton} onPress={onPress}>
              <Icon name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Icon name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
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
      
      {entry.notes && (
        <View style={styles.notesContainer}>
          <Icon name="chatbubble-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.notesText} numberOfLines={1}>{entry.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
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
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
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
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
});
