import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DailyLog, FoodItem, FoodEntry, MealType, DailySummary } from '@/types';
import { foodService } from '@/services/firebase';
import { useAuth } from './AuthContext';
import { getTodayDate } from '@/utils/date';

interface FoodLogContextType {
  dailyLog: DailyLog | null;
  weeklyData: DailySummary[];
  customFoods: FoodItem[];
  recentFoods: FoodItem[];
  selectedDate: string;
  isLoading: boolean;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    totalDaysLogged: number;
  };
  setSelectedDate: (date: string) => void;
  refreshLog: () => Promise<void>;
  addEntry: (food: FoodItem, servings: number, mealType: MealType, date: string) => Promise<void>;
  deleteEntry: (entryId: string, date: string) => Promise<void>;
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom' | 'createdBy'>) => Promise<FoodItem>;
}

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined);

export const FoodLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailySummary[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isLoading, setIsLoading] = useState(false);
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0,
  });

  // Load daily log when date or user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      loadDailyLog();
      loadCustomFoods();
    }
  }, [selectedDate, user, isAuthenticated]);

  // Load weekly data
  useEffect(() => {
    if (user && isAuthenticated) {
      loadWeeklyData();
    }
  }, [user, isAuthenticated]);

  const loadDailyLog = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const log = await foodService.getDailyLog(user.id, selectedDate);
      setDailyLog(log);

      // Update recent foods from entries
      if (log.entries.length > 0) {
        const foods = log.entries.map(e => e.foodItem);
        const uniqueFoods = foods.filter((food, index, self) => 
          self.findIndex(f => f.id === food.id) === index
        );
        setRecentFoods(prev => {
          const combined = [...uniqueFoods, ...prev];
          const unique = combined.filter((food, index, self) => 
            self.findIndex(f => f.id === food.id) === index
          );
          return unique.slice(0, 10);
        });
      }
    } catch (error) {
      console.error('Error loading daily log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    if (!user) return;

    try {
      const today = getTodayDate();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const startDate = weekAgo.toISOString().split('T')[0];

      const logs = await foodService.getDailyLogsRange(user.id, startDate, today);
      
      // Create summary data for each day
      const summaries: DailySummary[] = [];
      const calorieGoal = user.profile.dailyCalorieGoal || 2000;

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const log = logs.find(l => l.date === dateStr);
        
        summaries.push({
          date: dateStr,
          totalCalories: log?.totals.calories || 0,
          calorieGoal,
          totalProtein: log?.totals.protein || 0,
          totalCarbs: log?.totals.carbohydrates || 0,
          totalFat: log?.totals.fat || 0,
          mealsLogged: log?.entries.length || 0,
          isGoalMet: (log?.totals.calories || 0) <= calorieGoal && (log?.totals.calories || 0) > 0,
        });
      }

      setWeeklyData(summaries);

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let totalDays = 0;

      for (let i = summaries.length - 1; i >= 0; i--) {
        if (summaries[i].mealsLogged > 0) {
          tempStreak++;
          totalDays++;
          if (i === summaries.length - 1) {
            currentStreak = tempStreak;
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      setStreaks({
        currentStreak,
        longestStreak,
        totalDaysLogged: totalDays,
      });
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  const loadCustomFoods = async () => {
    if (!user) return;

    try {
      const foods = await foodService.getCustomFoods(user.id);
      setCustomFoods(foods);
    } catch (error) {
      console.error('Error loading custom foods:', error);
    }
  };

  const refreshLog = useCallback(async () => {
    await loadDailyLog();
    await loadWeeklyData();
  }, [selectedDate, user]);

  const addEntry = useCallback(async (
    food: FoodItem,
    servings: number,
    mealType: MealType,
    date: string
  ) => {
    if (!user) throw new Error('No user logged in');

    await foodService.addFoodEntry(user.id, food, servings, mealType, date);
    
    if (date === selectedDate) {
      await loadDailyLog();
    }
    await loadWeeklyData();
  }, [user, selectedDate]);

  const deleteEntry = useCallback(async (entryId: string, date: string) => {
    if (!user) throw new Error('No user logged in');

    await foodService.deleteFoodEntry(user.id, entryId, date);
    
    if (date === selectedDate) {
      await loadDailyLog();
    }
    await loadWeeklyData();
  }, [user, selectedDate]);

  const addCustomFood = useCallback(async (
    food: Omit<FoodItem, 'id' | 'isCustom' | 'createdBy'>
  ): Promise<FoodItem> => {
    if (!user) throw new Error('No user logged in');

    const customFood = await foodService.addCustomFood(user.id, food);
    setCustomFoods(prev => [...prev, customFood]);
    return customFood;
  }, [user]);

  return (
    <FoodLogContext.Provider
      value={{
        dailyLog,
        weeklyData,
        customFoods,
        recentFoods,
        selectedDate,
        isLoading,
        streaks,
        setSelectedDate,
        refreshLog,
        addEntry,
        deleteEntry,
        addCustomFood,
      }}
    >
      {children}
    </FoodLogContext.Provider>
  );
};

export const useFoodLog = (): FoodLogContextType => {
  const context = useContext(FoodLogContext);
  if (!context) {
    throw new Error('useFoodLog must be used within a FoodLogProvider');
  }
  return context;
};
