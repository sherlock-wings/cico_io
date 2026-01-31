import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeStackScreenProps, MealType, FoodEntry } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useFoodLog } from '@/context/FoodLogContext';
import { CalorieProgressRing } from '@/components/CalorieProgressRing';
import { MacroBar } from '@/components/MacroBar';
import { MealCard } from '@/components/MealCard';
import { DateSelector } from '@/components/DateSelector';
import { colors, spacing, typography } from '@/constants/theme';
import { getTodayDate, formatDisplayDate } from '@/utils/date';

const HomeScreen: React.FC<HomeStackScreenProps<'Home'>> = ({ navigation }) => {
  const { user } = useAuth();
  const { dailyLog, isLoading, refreshLog, selectedDate, setSelectedDate } = useFoodLog();
  const [refreshing, setRefreshing] = useState(false);

  const calorieGoal = user?.profile.dailyCalorieGoal || 2000;
  const consumedCalories = dailyLog?.totals?.calories || 0;
  const remainingCalories = calorieGoal - consumedCalories;

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLog();
    setRefreshing(false);
  };

  const getMealEntries = (mealType: MealType): FoodEntry[] => {
    return dailyLog?.entries.filter(entry => entry.mealType === mealType) || [];
  };

  const getMealCalories = (mealType: MealType): number => {
    const entries = getMealEntries(mealType);
    return entries.reduce((sum, entry) => {
      return sum + entry.foodItem.nutrition.calories * entry.servings;
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'there'}!</Text>
          <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="calendar-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calorie Summary Card */}
        <View style={styles.summaryCard}>
          <CalorieProgressRing
            consumed={consumedCalories}
            goal={calorieGoal}
            size={160}
          />
          <View style={styles.calorieStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calorieGoal}</Text>
              <Text style={styles.statLabel}>Goal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{consumedCalories}</Text>
              <Text style={styles.statLabel}>Consumed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, remainingCalories < 0 && styles.overGoal]}>
                {Math.abs(remainingCalories)}
              </Text>
              <Text style={styles.statLabel}>
                {remainingCalories >= 0 ? 'Remaining' : 'Over'}
              </Text>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macrosContainer}>
          <MacroBar
            label="Protein"
            current={dailyLog?.totals?.protein || 0}
            goal={user?.profile.dailyProteinGoal || 50}
            unit="g"
            color={colors.protein}
          />
          <MacroBar
            label="Carbs"
            current={dailyLog?.totals?.carbohydrates || 0}
            goal={user?.profile.dailyCarbsGoal || 250}
            unit="g"
            color={colors.carbs}
          />
          <MacroBar
            label="Fat"
            current={dailyLog?.totals?.fat || 0}
            goal={user?.profile.dailyFatGoal || 65}
            unit="g"
            color={colors.fat}
          />
        </View>

        {/* Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Meals</Text>
          {mealTypes.map((mealType) => (
            <MealCard
              key={mealType}
              mealType={mealType}
              entries={getMealEntries(mealType)}
              totalCalories={getMealCalories(mealType)}
              onPress={() => navigation.navigate('MealDetail', { mealType, date: selectedDate })}
              onAddPress={() => navigation.navigate('FoodSearch', { mealType, date: selectedDate })}
            />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddFood', { date: selectedDate })}
      >
        <Icon name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  calorieStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  overGoal: {
    color: colors.error,
  },
  macrosContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  mealsSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
