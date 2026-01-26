import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, FoodItem, DailyLog, MealType, NutritionInfo } from '@/types';
import { COLLECTIONS } from './config';
import { formatDate, getTodayDate } from '@/utils/date';

const STORAGE_KEYS = {
  FOOD_ENTRIES: '@cico_food_entries',
  DAILY_LOGS: '@cico_daily_logs',
  CUSTOM_FOODS: '@cico_custom_foods',
};

class FoodService {
  // Add a food entry
  async addFoodEntry(
    userId: string,
    foodItem: FoodItem,
    servings: number,
    mealType: MealType,
    date: string,
    notes?: string
  ): Promise<FoodEntry> {
    const entry: FoodEntry = {
      id: `entry_${Date.now()}`,
      userId,
      foodItem,
      servings,
      mealType,
      date,
      timestamp: new Date(),
      notes,
    };

    // Get existing entries
    const entries = await this.getAllFoodEntries(userId);
    entries.push(entry);
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.FOOD_ENTRIES}_${userId}`,
      JSON.stringify(entries)
    );
    
    await this.updateDailyLog(userId, date);

    return entry;
  }

  // Get all food entries for a user
  private async getAllFoodEntries(userId: string): Promise<FoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.FOOD_ENTRIES}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Get food entries for a specific date
  async getFoodEntriesByDate(userId: string, date: string): Promise<FoodEntry[]> {
    const entries = await this.getAllFoodEntries(userId);
    return entries
      .filter(e => e.date === date)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Get food entries by meal type for a specific date
  async getFoodEntriesByMeal(
    userId: string,
    date: string,
    mealType: MealType
  ): Promise<FoodEntry[]> {
    const entries = await this.getAllFoodEntries(userId);
    return entries
      .filter(e => e.date === date && e.mealType === mealType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Update a food entry
  async updateFoodEntry(
    userId: string,
    entryId: string,
    updates: Partial<Pick<FoodEntry, 'servings' | 'mealType' | 'notes'>>
  ): Promise<void> {
    const entries = await this.getAllFoodEntries(userId);
    const index = entries.findIndex(e => e.id === entryId);
    
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.FOOD_ENTRIES}_${userId}`,
        JSON.stringify(entries)
      );
      await this.updateDailyLog(userId, entries[index].date);
    }
  }

  // Delete a food entry
  async deleteFoodEntry(userId: string, entryId: string): Promise<void> {
    const entries = await this.getAllFoodEntries(userId);
    const entry = entries.find(e => e.id === entryId);
    const filteredEntries = entries.filter(e => e.id !== entryId);
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.FOOD_ENTRIES}_${userId}`,
      JSON.stringify(filteredEntries)
    );
    
    if (entry) {
      await this.updateDailyLog(userId, entry.date);
    }
  }

  // Get daily log
  async getDailyLog(userId: string, date: string): Promise<DailyLog | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_LOGS}_${userId}`);
      const logs: DailyLog[] = data ? JSON.parse(data) : [];
      return logs.find(l => l.date === date) || null;
    } catch {
      return null;
    }
  }

  // Update daily log (recalculate totals)
  private async updateDailyLog(userId: string, date: string): Promise<void> {
    const entries = await this.getFoodEntriesByDate(userId, date);
    
    const totals: NutritionInfo = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    entries.forEach(entry => {
      const multiplier = entry.servings;
      totals.calories += (entry.foodItem.nutrition.calories || 0) * multiplier;
      totals.protein += (entry.foodItem.nutrition.protein || 0) * multiplier;
      totals.carbohydrates += (entry.foodItem.nutrition.carbohydrates || 0) * multiplier;
      totals.fat += (entry.foodItem.nutrition.fat || 0) * multiplier;
      totals.fiber += (entry.foodItem.nutrition.fiber || 0) * multiplier;
      totals.sugar += (entry.foodItem.nutrition.sugar || 0) * multiplier;
      totals.sodium += (entry.foodItem.nutrition.sodium || 0) * multiplier;
    });

    const dailyLog: DailyLog = {
      id: `log_${userId}_${date}`,
      userId,
      date,
      entries,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbohydrates,
      totalFat: totals.fat,
    };

    // Get existing logs and update
    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_LOGS}_${userId}`);
    const logs: DailyLog[] = data ? JSON.parse(data) : [];
    const index = logs.findIndex(l => l.date === date);
    
    if (index !== -1) {
      logs[index] = dailyLog;
    } else {
      logs.push(dailyLog);
    }
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.DAILY_LOGS}_${userId}`,
      JSON.stringify(logs)
    );
  }

  // Get weekly logs
  async getWeeklyLogs(userId: string, startDate: string): Promise<DailyLog[]> {
    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_LOGS}_${userId}`);
    const logs: DailyLog[] = data ? JSON.parse(data) : [];
    
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7);
    
    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate < end;
    });
  }

  // Add custom food
  async addCustomFood(userId: string, food: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const customFood: FoodItem = {
      ...food,
      id: `custom_${Date.now()}`,
      isCustom: true,
    };

    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CUSTOM_FOODS}_${userId}`);
    const foods: FoodItem[] = data ? JSON.parse(data) : [];
    foods.push(customFood);
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CUSTOM_FOODS}_${userId}`,
      JSON.stringify(foods)
    );

    return customFood;
  }

  // Get custom foods
  async getCustomFoods(userId: string): Promise<FoodItem[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CUSTOM_FOODS}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Delete custom food
  async deleteCustomFood(userId: string, foodId: string): Promise<void> {
    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CUSTOM_FOODS}_${userId}`);
    const foods: FoodItem[] = data ? JSON.parse(data) : [];
    const filtered = foods.filter(f => f.id !== foodId);
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CUSTOM_FOODS}_${userId}`,
      JSON.stringify(filtered)
    );
  }
}

export const foodService = new FoodService();
