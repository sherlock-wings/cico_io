import { NutritionInfo, MacroBreakdown } from '@/types';

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 */
export const calculateBMR = (
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female' | 'other'
): number => {
  // Mifflin-St Jeor equation
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  switch (gender) {
    case 'male':
      return Math.round(baseBMR + 5);
    case 'female':
      return Math.round(baseBMR - 161);
    default:
      return Math.round(baseBMR - 78); // Average of male and female
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
): number => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
};

/**
 * Calculate macro breakdown from nutrition info
 */
export const calculateMacroBreakdown = (nutrition: NutritionInfo): MacroBreakdown => {
  const proteinCals = nutrition.protein * 4;
  const carbCals = nutrition.carbohydrates * 4;
  const fatCals = nutrition.fat * 9;
  const totalCals = proteinCals + carbCals + fatCals;

  return {
    protein: {
      grams: nutrition.protein,
      percentage: totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0,
      calories: proteinCals,
    },
    carbohydrates: {
      grams: nutrition.carbohydrates,
      percentage: totalCals > 0 ? Math.round((carbCals / totalCals) * 100) : 0,
      calories: carbCals,
    },
    fat: {
      grams: nutrition.fat,
      percentage: totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0,
      calories: fatCals,
    },
  };
};

/**
 * Calculate calorie goal based on weight goal
 */
export const calculateCalorieGoal = (
  tdee: number,
  goalType: 'lose_weight' | 'maintain_weight' | 'gain_weight'
): number => {
  switch (goalType) {
    case 'lose_weight':
      return Math.round(tdee - 500); // 500 cal deficit for ~1 lb/week loss
    case 'gain_weight':
      return Math.round(tdee + 500); // 500 cal surplus for ~1 lb/week gain
    default:
      return tdee;
  }
};

/**
 * Calculate recommended macros based on calorie goal
 */
export const calculateRecommendedMacros = (
  calorieGoal: number,
  goalType: 'lose_weight' | 'maintain_weight' | 'gain_weight'
): { protein: number; carbs: number; fat: number } => {
  let proteinRatio: number;
  let fatRatio: number;
  let carbRatio: number;

  switch (goalType) {
    case 'lose_weight':
      // Higher protein for muscle preservation
      proteinRatio = 0.30;
      fatRatio = 0.25;
      carbRatio = 0.45;
      break;
    case 'gain_weight':
      // Higher carbs for energy
      proteinRatio = 0.25;
      fatRatio = 0.25;
      carbRatio = 0.50;
      break;
    default:
      // Balanced macros
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
  }

  return {
    protein: Math.round((calorieGoal * proteinRatio) / 4),
    carbs: Math.round((calorieGoal * carbRatio) / 4),
    fat: Math.round((calorieGoal * fatRatio) / 9),
  };
};

/**
 * Scale nutrition values by serving multiplier
 */
export const scaleNutrition = (
  nutrition: NutritionInfo,
  servings: number
): NutritionInfo => {
  return {
    calories: Math.round(nutrition.calories * servings),
    protein: Math.round(nutrition.protein * servings * 10) / 10,
    carbohydrates: Math.round(nutrition.carbohydrates * servings * 10) / 10,
    fat: Math.round(nutrition.fat * servings * 10) / 10,
    fiber: nutrition.fiber ? Math.round(nutrition.fiber * servings * 10) / 10 : undefined,
    sugar: nutrition.sugar ? Math.round(nutrition.sugar * servings * 10) / 10 : undefined,
    sodium: nutrition.sodium ? Math.round(nutrition.sodium * servings) : undefined,
    cholesterol: nutrition.cholesterol ? Math.round(nutrition.cholesterol * servings) : undefined,
    saturatedFat: nutrition.saturatedFat ? Math.round(nutrition.saturatedFat * servings * 10) / 10 : undefined,
    transFat: nutrition.transFat ? Math.round(nutrition.transFat * servings * 10) / 10 : undefined,
  };
};

/**
 * Sum multiple nutrition info objects
 */
export const sumNutrition = (nutritionArray: NutritionInfo[]): NutritionInfo => {
  return nutritionArray.reduce(
    (total, current) => ({
      calories: total.calories + current.calories,
      protein: total.protein + current.protein,
      carbohydrates: total.carbohydrates + current.carbohydrates,
      fat: total.fat + current.fat,
      fiber: (total.fiber || 0) + (current.fiber || 0),
      sugar: (total.sugar || 0) + (current.sugar || 0),
      sodium: (total.sodium || 0) + (current.sodium || 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    }
  );
};
