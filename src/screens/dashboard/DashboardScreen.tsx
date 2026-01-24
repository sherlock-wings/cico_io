import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { DashboardStackScreenProps, TimeRange } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useFoodLog } from '@/context/FoodLogContext';
import { colors, spacing, typography } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC<DashboardStackScreenProps<'Dashboard'>> = ({ navigation }) => {
  const { user } = useAuth();
  const { weeklyData, streaks } = useFoodLog();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fill: colors.textSecondary,
    },
  };

  const calorieData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: weeklyData.map(d => d.totalCalories),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      },
      {
        data: weeklyData.map(d => d.calorieGoal),
        color: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
        strokeDasharray: '5, 5',
      },
    ],
  };

  const macroData = [
    {
      name: 'Protein',
      calories: weeklyData.reduce((sum, d) => sum + d.totalProtein * 4, 0) / 7,
      color: colors.protein,
      legendFontColor: colors.text,
    },
    {
      name: 'Carbs',
      calories: weeklyData.reduce((sum, d) => sum + d.totalCarbs * 4, 0) / 7,
      color: colors.carbs,
      legendFontColor: colors.text,
    },
    {
      name: 'Fat',
      calories: weeklyData.reduce((sum, d) => sum + d.totalFat * 9, 0) / 7,
      color: colors.fat,
      legendFontColor: colors.text,
    },
  ];

  const avgCalories = Math.round(
    weeklyData.reduce((sum, d) => sum + d.totalCalories, 0) / weeklyData.length
  );

  const daysOnGoal = weeklyData.filter(d => d.isGoalMet).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.rangeSelector}>
          {(['week', 'month'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.rangeButton, selectedRange === range && styles.rangeButtonActive]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[styles.rangeText, selectedRange === range && styles.rangeTextActive]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="flame-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{avgCalories}</Text>
            <Text style={styles.statLabel}>Avg. Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{daysOnGoal}/7</Text>
            <Text style={styles.statLabel}>Days on Goal</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up-outline" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{streaks.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Calorie Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Calorie Trend</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrendDetails', { type: 'calories' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={calorieData}
            width={screenWidth - spacing.lg * 2 - spacing.md * 2}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={false}
            withOuterLines={false}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Actual</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.textSecondary }]} />
              <Text style={styles.legendText}>Goal</Text>
            </View>
          </View>
        </View>

        {/* Macro Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Macro Distribution</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TrendDetails', { type: 'macros' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <PieChart
            data={macroData}
            width={screenWidth - spacing.lg * 2 - spacing.md * 2}
            height={180}
            chartConfig={chartConfig}
            accessor="calories"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('WeeklyReport')}
          >
            <Icon name="calendar-outline" size={24} color={colors.primary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Weekly Report</Text>
              <Text style={styles.actionSubtitle}>View detailed weekly analysis</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MonthlyReport')}
          >
            <Icon name="stats-chart-outline" size={24} color={colors.primary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Monthly Report</Text>
              <Text style={styles.actionSubtitle}>View monthly progress overview</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  rangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  rangeButtonActive: {
    backgroundColor: colors.primary,
  },
  rangeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  rangeTextActive: {
    color: colors.white,
    fontWeight: typography.weights.medium as any,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  chart: {
    borderRadius: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  actionsSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});

export default DashboardScreen;
