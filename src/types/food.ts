// Food and nutrition related types
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: ServingUnit;
  nutrition: NutritionInfo;
  barcode?: string;
  isCustom: boolean;
  createdBy?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
  transFat?: number; // grams
}

export type ServingUnit = 
  | 'g' 
  | 'ml' 
  | 'oz' 
  | 'fl oz'  // Fluid ounces (converted to ml for storage)
  | 'cup' 
  | 'tbsp' 
  | 'tsp' 
  | 'piece' 
  | 'slice' 
  | 'serving';

export interface FoodEntry {
  id: string;
  userId: string;
  foodItem: FoodItem;
  servings: number;
  mealType: MealType;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: Date;
  notes?: string;
}

export type MealType = 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'snack';

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  entries: FoodEntry[];
  totals: NutritionInfo;
}

export interface FoodSearchResult {
  items: FoodItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}
