// Dashboard and analytics related types
export interface DashboardData {
  today: DailySummary;
  weeklyData: DailySummary[];
  monthlyData: DailySummary[];
  streaks: StreakInfo;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  calorieGoal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealsLogged: number;
  isGoalMet: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
}

export interface MacroBreakdown {
  protein: {
    grams: number;
    percentage: number;
    calories: number;
  };
  carbohydrates: {
    grams: number;
    percentage: number;
    calories: number;
  };
  fat: {
    grams: number;
    percentage: number;
    calories: number;
  };
}

export interface CalorieTrend {
  date: string;
  calories: number;
  goal: number;
  difference: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export type TimeRange = 'day' | 'week' | 'month' | 'year';
