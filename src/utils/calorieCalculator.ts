/**
 * Calorie Calculator Utility
 * Uses the Mifflin-St Jeor equation to calculate BMR and TDEE
 */

import { ActivityLevel, GoalType } from '@/types';

export interface CalorieCalculatorInput {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

export interface CalorieCalculatorResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure (maintenance)
  recommendedCalories: number; // Adjusted for goal
  deficit: number; // Calorie adjustment from TDEE
  goalDescription: string;
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise
  lightly_active: 1.375, // Light exercise 1-3 days/week
  moderately_active: 1.55, // Moderate exercise 3-5 days/week
  very_active: 1.725, // Hard exercise 6-7 days/week
  extra_active: 1.9, // Very hard exercise, physical job
};

/**
 * Goal adjustments (calories per day)
 * - Weight loss: 500 calorie deficit = ~0.5kg/1lb per week
 * - Weight gain: 300-500 calorie surplus = lean muscle gain
 */
const GOAL_ADJUSTMENTS: Record<GoalType, { adjustment: number; description: string }> = {
  lose_weight: {
    adjustment: -500,
    description: 'Lose ~0.5 kg (1 lb) per week',
  },
  maintain_weight: {
    adjustment: 0,
    description: 'Maintain current weight',
  },
  gain_weight: {
    adjustment: 400,
    description: 'Gain ~0.3-0.5 kg per week (lean)',
  },
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  const baseCalc = 10 * weight + 6.25 * height - 5 * age;
  
  switch (gender) {
    case 'male':
      return Math.round(baseCalc + 5);
    case 'female':
      return Math.round(baseCalc - 161);
    case 'other':
      // Use average of male and female formulas
      return Math.round(baseCalc - 78);
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate recommended daily calories based on all factors
 */
export function calculateRecommendedCalories(
  input: CalorieCalculatorInput
): CalorieCalculatorResult {
  const { weight, height, age, gender, activityLevel, goalType } = input;

  // Step 1: Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // Step 2: Calculate TDEE (maintenance calories)
  const tdee = calculateTDEE(bmr, activityLevel);

  // Step 3: Apply goal adjustment
  const goalData = GOAL_ADJUSTMENTS[goalType];
  let recommendedCalories = tdee + goalData.adjustment;

  // Safety bounds: Don't go below 1200 for women or 1500 for men
  const minimumCalories = gender === 'female' ? 1200 : 1500;
  if (recommendedCalories < minimumCalories) {
    recommendedCalories = minimumCalories;
  }

  // Cap at reasonable maximum
  const maximumCalories = 5000;
  if (recommendedCalories > maximumCalories) {
    recommendedCalories = maximumCalories;
  }

  return {
    bmr,
    tdee,
    recommendedCalories: Math.round(recommendedCalories),
    deficit: goalData.adjustment,
    goalDescription: goalData.description,
  };
}

/**
 * Check if we have enough data to calculate calories
 */
export function canCalculateCalories(data: {
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}): boolean {
  return !!(data.weight && data.height && data.age && data.gender);
}

/**
 * Format calorie result for display
 */
export function formatCalorieBreakdown(result: CalorieCalculatorResult): string {
  const lines = [
    `🔬 BMR (Base Metabolism): ${result.bmr.toLocaleString()} cal`,
    `🏃 TDEE (Maintenance): ${result.tdee.toLocaleString()} cal`,
    `🎯 Goal: ${result.goalDescription}`,
    `${result.deficit > 0 ? '➕' : result.deficit < 0 ? '➖' : '⚖️'} Adjustment: ${result.deficit > 0 ? '+' : ''}${result.deficit} cal`,
  ];
  return lines.join('\n');
}
