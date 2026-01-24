import firestore from '@react-native-firebase/firestore';
import { FoodEntry, FoodItem, DailyLog, MealType, NutritionInfo } from '@/types';
import { COLLECTIONS } from './config';
import { formatDate, getTodayDate } from '@/utils/date';

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
    const entryRef = firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .doc();

    const entry: FoodEntry = {
      id: entryRef.id,
      userId,
      foodItem,
      servings,
      mealType,
      date,
      timestamp: new Date(),
      notes,
    };

    await entryRef.set(entry);
    await this.updateDailyLog(userId, date);

    return entry;
  }

  // Get food entries for a specific date
  async getFoodEntriesByDate(userId: string, date: string): Promise<FoodEntry[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .where('date', '==', date)
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as FoodEntry);
  }

  // Get food entries by meal type for a specific date
  async getFoodEntriesByMeal(
    userId: string,
    date: string,
    mealType: MealType
  ): Promise<FoodEntry[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .where('date', '==', date)
      .where('mealType', '==', mealType)
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as FoodEntry);
  }

  // Update a food entry
  async updateFoodEntry(
    userId: string,
    entryId: string,
    updates: Partial<Pick<FoodEntry, 'servings' | 'mealType' | 'notes'>>
  ): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .doc(entryId)
      .update(updates);
  }

  // Delete a food entry
  async deleteFoodEntry(userId: string, entryId: string, date: string): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .doc(entryId)
      .delete();

    await this.updateDailyLog(userId, date);
  }

  // Get daily log with totals
  async getDailyLog(userId: string, date: string): Promise<DailyLog> {
    const entries = await this.getFoodEntriesByDate(userId, date);
    const totals = this.calculateTotals(entries);

    return {
      date,
      entries,
      totals,
    };
  }

  // Get daily logs for a date range
  async getDailyLogsRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyLog[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.DAILY_LOGS)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as DailyLog);
  }

  // Add a custom food item
  async addCustomFood(userId: string, foodItem: Omit<FoodItem, 'id' | 'isCustom' | 'createdBy'>): Promise<FoodItem> {
    const foodRef = firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.CUSTOM_FOODS)
      .doc();

    const customFood: FoodItem = {
      ...foodItem,
      id: foodRef.id,
      isCustom: true,
      createdBy: userId,
    };

    await foodRef.set(customFood);

    return customFood;
  }

  // Get user's custom foods
  async getCustomFoods(userId: string): Promise<FoodItem[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.CUSTOM_FOODS)
      .orderBy('name', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as FoodItem);
  }

  // Search custom foods
  async searchCustomFoods(userId: string, query: string): Promise<FoodItem[]> {
    // Note: Firestore doesn't support full-text search
    // For production, consider using Algolia or similar
    const customFoods = await this.getCustomFoods(userId);
    const lowerQuery = query.toLowerCase();
    
    return customFoods.filter(food => 
      food.name.toLowerCase().includes(lowerQuery) ||
      food.brand?.toLowerCase().includes(lowerQuery)
    );
  }

  // Calculate nutrition totals from entries
  calculateTotals(entries: FoodEntry[]): NutritionInfo {
    const totals: NutritionInfo = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    for (const entry of entries) {
      const multiplier = entry.servings;
      const nutrition = entry.foodItem.nutrition;

      totals.calories += nutrition.calories * multiplier;
      totals.protein += nutrition.protein * multiplier;
      totals.carbohydrates += nutrition.carbohydrates * multiplier;
      totals.fat += nutrition.fat * multiplier;
      totals.fiber = (totals.fiber || 0) + (nutrition.fiber || 0) * multiplier;
      totals.sugar = (totals.sugar || 0) + (nutrition.sugar || 0) * multiplier;
      totals.sodium = (totals.sodium || 0) + (nutrition.sodium || 0) * multiplier;
    }

    // Round to 1 decimal place
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbohydrates = Math.round(totals.carbohydrates * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;

    return totals;
  }

  // Update daily log (called after adding/removing entries)
  private async updateDailyLog(userId: string, date: string): Promise<void> {
    const entries = await this.getFoodEntriesByDate(userId, date);
    const totals = this.calculateTotals(entries);

    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.DAILY_LOGS)
      .doc(date)
      .set({
        date,
        totals,
        entryCount: entries.length,
        updatedAt: new Date(),
      }, { merge: true });
  }

  // Subscribe to food entries for real-time updates
  subscribeToFoodEntries(
    userId: string,
    date: string,
    callback: (entries: FoodEntry[]) => void
  ) {
    return firestore()
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.FOOD_ENTRIES)
      .where('date', '==', date)
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const entries = snapshot.docs.map(doc => doc.data() as FoodEntry);
        callback(entries);
      });
  }
}

export const foodService = new FoodService();
