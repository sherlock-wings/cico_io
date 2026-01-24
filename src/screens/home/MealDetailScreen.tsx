import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeStackScreenProps, FoodEntry } from '@/types';
import { useFoodLog } from '@/context/FoodLogContext';
import { FoodEntryCard } from '@/components/FoodEntryCard';
import { colors, spacing, typography } from '@/constants/theme';

const MealDetailScreen: React.FC<HomeStackScreenProps<'MealDetail'>> = ({ navigation, route }) => {
  const { mealType, date } = route.params;
  const { dailyLog, deleteEntry } = useFoodLog();

  const entries = dailyLog?.entries.filter(entry => entry.mealType === mealType) || [];
  const totalCalories = entries.reduce((sum, entry) => {
    return sum + entry.foodItem.nutrition.calories * entry.servings;
  }, 0);

  const handleDeleteEntry = (entry: FoodEntry) => {
    Alert.alert(
      'Delete Entry',
      `Remove ${entry.foodItem.name} from ${mealType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(entry.id, date),
        },
      ]
    );
  };

  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'restaurant-outline';
      case 'dinner': return 'moon-outline';
      case 'snack': return 'nutrition-outline';
      default: return 'restaurant-outline';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name={getMealIcon()} size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No foods added yet</Text>
      <Text style={styles.emptyText}>Tap the button below to add food</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Icon name={getMealIcon()} size={32} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.mealTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            <Text style={styles.calorieText}>{totalCalories} calories</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodEntryCard
            entry={item}
            onDelete={() => handleDeleteEntry(item)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          entries.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('FoodSearch', { mealType, date })}
        >
          <Icon name="add-circle-outline" size={24} color={colors.white} />
          <Text style={styles.addButtonText}>Add Food</Text>
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
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.md,
  },
  mealTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  calorieText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
});

export default MealDetailScreen;
