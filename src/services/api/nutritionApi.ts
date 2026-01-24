import { FoodItem, FoodSearchResult, NutritionInfo } from '@/types';

// Open Food Facts API - Free, open-source food database
const OPEN_FOOD_FACTS_BASE_URL = 'https://world.openfoodfacts.org';

// USDA FoodData Central API - US government food database
// Get your API key at: https://fdc.nal.usda.gov/api-key-signup.html
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'YOUR_USDA_API_KEY'; // Replace with your API key

interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  serving_size?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

class NutritionApiService {
  // Search Open Food Facts database
  async searchOpenFoodFacts(query: string, page: number = 1): Promise<FoodSearchResult> {
    try {
      const response = await fetch(
        `${OPEN_FOOD_FACTS_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20`
      );

      if (!response.ok) {
        throw new Error('Failed to search Open Food Facts');
      }

      const data = await response.json();
      const items = (data.products || []).map((product: OpenFoodFactsProduct) => 
        this.mapOpenFoodFactsToFoodItem(product)
      ).filter(Boolean) as FoodItem[];

      return {
        items,
        totalCount: data.count || 0,
        page,
        pageSize: 20,
      };
    } catch (error) {
      console.error('Open Food Facts search error:', error);
      return { items: [], totalCount: 0, page, pageSize: 20 };
    }
  }

  // Get product by barcode from Open Food Facts
  async getProductByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(
        `${OPEN_FOOD_FACTS_BASE_URL}/api/v0/product/${barcode}.json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.status !== 1 || !data.product) {
        return null;
      }

      return this.mapOpenFoodFactsToFoodItem(data.product);
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return null;
    }
  }

  // Search USDA FoodData Central
  async searchUSDA(query: string, pageNumber: number = 1): Promise<FoodSearchResult> {
    try {
      const response = await fetch(
        `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=20`
      );

      if (!response.ok) {
        throw new Error('Failed to search USDA database');
      }

      const data = await response.json();
      const items = (data.foods || []).map((food: USDAFood) => 
        this.mapUSDAToFoodItem(food)
      ).filter(Boolean) as FoodItem[];

      return {
        items,
        totalCount: data.totalHits || 0,
        page: pageNumber,
        pageSize: 20,
      };
    } catch (error) {
      console.error('USDA search error:', error);
      return { items: [], totalCount: 0, page: pageNumber, pageSize: 20 };
    }
  }

  // Combined search across multiple databases
  async searchAll(query: string, page: number = 1): Promise<FoodSearchResult> {
    try {
      const [offResults, usdaResults] = await Promise.all([
        this.searchOpenFoodFacts(query, page),
        this.searchUSDA(query, page),
      ]);

      // Combine and deduplicate results
      const combinedItems = [...offResults.items, ...usdaResults.items];
      
      // Remove duplicates based on name similarity
      const uniqueItems = this.deduplicateFoods(combinedItems);

      return {
        items: uniqueItems,
        totalCount: offResults.totalCount + usdaResults.totalCount,
        page,
        pageSize: 40,
      };
    } catch (error) {
      console.error('Combined search error:', error);
      return { items: [], totalCount: 0, page, pageSize: 40 };
    }
  }

  // Map Open Food Facts product to our FoodItem type
  private mapOpenFoodFactsToFoodItem(product: OpenFoodFactsProduct): FoodItem | null {
    if (!product.product_name || !product.nutriments) {
      return null;
    }

    const nutriments = product.nutriments;

    const nutrition: NutritionInfo = {
      calories: Math.round(nutriments['energy-kcal_100g'] || 0),
      protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
      carbohydrates: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
      fiber: nutriments.fiber_100g ? Math.round(nutriments.fiber_100g * 10) / 10 : undefined,
      sugar: nutriments.sugars_100g ? Math.round(nutriments.sugars_100g * 10) / 10 : undefined,
      sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : undefined, // Convert to mg
    };

    return {
      id: `off_${product.code}`,
      name: product.product_name,
      brand: product.brands,
      servingSize: 100,
      servingUnit: 'g',
      nutrition,
      barcode: product.code,
      isCustom: false,
    };
  }

  // Map USDA food to our FoodItem type
  private mapUSDAToFoodItem(food: USDAFood): FoodItem | null {
    if (!food.description) {
      return null;
    }

    // USDA nutrient IDs
    const NUTRIENT_IDS = {
      CALORIES: 1008,
      PROTEIN: 1003,
      CARBS: 1005,
      FAT: 1004,
      FIBER: 1079,
      SUGAR: 2000,
      SODIUM: 1093,
    };

    const getNutrient = (id: number): number => {
      const nutrient = food.foodNutrients.find(n => n.nutrientId === id);
      return nutrient?.value || 0;
    };

    const nutrition: NutritionInfo = {
      calories: Math.round(getNutrient(NUTRIENT_IDS.CALORIES)),
      protein: Math.round(getNutrient(NUTRIENT_IDS.PROTEIN) * 10) / 10,
      carbohydrates: Math.round(getNutrient(NUTRIENT_IDS.CARBS) * 10) / 10,
      fat: Math.round(getNutrient(NUTRIENT_IDS.FAT) * 10) / 10,
      fiber: getNutrient(NUTRIENT_IDS.FIBER) || undefined,
      sugar: getNutrient(NUTRIENT_IDS.SUGAR) || undefined,
      sodium: getNutrient(NUTRIENT_IDS.SODIUM) || undefined,
    };

    return {
      id: `usda_${food.fdcId}`,
      name: food.description,
      brand: food.brandOwner,
      servingSize: food.servingSize || 100,
      servingUnit: (food.servingSizeUnit?.toLowerCase() as any) || 'g',
      nutrition,
      isCustom: false,
    };
  }

  // Remove duplicate foods based on name similarity
  private deduplicateFoods(foods: FoodItem[]): FoodItem[] {
    const seen = new Map<string, FoodItem>();

    for (const food of foods) {
      const key = food.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.set(key, food);
      }
    }

    return Array.from(seen.values());
  }
}

export const nutritionApiService = new NutritionApiService();
