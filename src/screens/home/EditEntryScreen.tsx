import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeStackScreenProps, MealType, ServingUnit } from '@/types';
import { useFoodLog } from '@/context/FoodLogContext';
import { NutritionLabel } from '@/components/NutritionLabel';
import { colors, spacing, typography } from '@/constants/theme';

// Conversions
const OZ_TO_GRAMS = 28.3495;      // Weight: 1 oz = 28.3495g
const FL_OZ_TO_ML = 29.5735;     // Volume: 1 fl oz = 29.5735 mL
const ML_TO_GRAMS = 1;           // Approximate for most beverages (water density)

type MeasurementUnit = 'g' | 'oz' | 'ml' | 'fl oz';
type MeasurementType = 'weight' | 'volume';

const EditEntryScreen: React.FC<HomeStackScreenProps<'EditEntry'>> = ({ navigation, route }) => {
  const { entry, date } = route.params;
  const { updateEntry, deleteEntry } = useFoodLog();
  
  // Detect if food is likely a liquid based on name
  const isLiquid = /beer|soda|juice|water|milk|coffee|tea|wine|drink|beverage|smoothie|shake|cola|sprite|pepsi|coke|lemonade|energy drink/i.test(entry.foodItem.name);
  
  // Determine initial unit based on stored unit and food type
  const getInitialUnit = (): MeasurementUnit => {
    const existingUnit = entry.foodItem.servingUnit;
    if (existingUnit === 'ml') return isLiquid ? 'ml' : 'ml';
    if (existingUnit === 'oz' && isLiquid) return 'fl oz';
    if (existingUnit === 'oz') return 'oz';
    if (isLiquid) return 'ml';
    return 'g';
  };
  
  // Initialize with existing entry values
  const initialUnit = getInitialUnit();
  const [servingAmount, setServingAmount] = useState(
    entry.foodItem.servingSize?.toString() || '100'
  );
  const [servingUnit, setServingUnit] = useState<MeasurementUnit>(initialUnit);
  const [measurementType, setMeasurementType] = useState<MeasurementType>(
    initialUnit === 'ml' || initialUnit === 'fl oz' ? 'volume' : 'weight'
  );
  const [numberOfServings, setNumberOfServings] = useState(entry.servings.toString());
  const [mealType, setMealType] = useState<MealType>(entry.mealType);
  const [notes, setNotes] = useState(entry.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const mealTypes: { value: MealType; label: string; icon: string }[] = [
    { value: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
    { value: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
    { value: 'dinner', label: 'Dinner', icon: 'moon-outline' },
    { value: 'snack', label: 'Snack', icon: 'nutrition-outline' },
  ];

  // Get the base nutrition per 100g from the original food item
  // We need to reverse calculate if nutrition was already scaled
  const getBaseNutritionPer100g = () => {
    // Check if the original entry had scaled nutrition
    const originalServingGrams = entry.foodItem.servingUnit === 'oz' 
      ? entry.foodItem.servingSize * OZ_TO_GRAMS 
      : entry.foodItem.servingSize;
    const wasScaled = entry.servings === 1 && originalServingGrams !== 100;
    
    if (wasScaled && originalServingGrams > 0) {
      // Reverse the scaling to get per 100g values
      const reverseScale = 100 / originalServingGrams;
      return {
        calories: entry.foodItem.nutrition.calories * reverseScale,
        protein: entry.foodItem.nutrition.protein * reverseScale,
        carbohydrates: entry.foodItem.nutrition.carbohydrates * reverseScale,
        fat: entry.foodItem.nutrition.fat * reverseScale,
        fiber: entry.foodItem.nutrition.fiber ? entry.foodItem.nutrition.fiber * reverseScale : undefined,
        sugar: entry.foodItem.nutrition.sugar ? entry.foodItem.nutrition.sugar * reverseScale : undefined,
        sodium: entry.foodItem.nutrition.sodium ? entry.foodItem.nutrition.sodium * reverseScale : undefined,
      };
    }
    
    return entry.foodItem.nutrition;
  };

  const baseNutrition = getBaseNutritionPer100g();

  // Calculate nutrition based on serving size
  const getServingInGrams = (): number => {
    const amount = parseFloat(servingAmount) || 0;
    switch (servingUnit) {
      case 'oz':
        return amount * OZ_TO_GRAMS;
      case 'fl oz':
        return amount * FL_OZ_TO_ML * ML_TO_GRAMS; // fl oz -> ml -> g
      case 'ml':
        return amount * ML_TO_GRAMS;
      default:
        return amount;
    }
  };

  const servingGrams = getServingInGrams();
  const scaleFactor = servingGrams / 100;
  const servingsCount = parseFloat(numberOfServings) || 1;
  
  // Nutrition per single serving
  const nutritionPerServing = {
    calories: Math.round(baseNutrition.calories * scaleFactor),
    protein: Math.round(baseNutrition.protein * scaleFactor * 10) / 10,
    carbohydrates: Math.round(baseNutrition.carbohydrates * scaleFactor * 10) / 10,
    fat: Math.round(baseNutrition.fat * scaleFactor * 10) / 10,
    fiber: baseNutrition.fiber ? Math.round(baseNutrition.fiber * scaleFactor * 10) / 10 : undefined,
    sugar: baseNutrition.sugar ? Math.round(baseNutrition.sugar * scaleFactor * 10) / 10 : undefined,
    sodium: baseNutrition.sodium ? Math.round(baseNutrition.sodium * scaleFactor) : undefined,
  };
  
  // Total nutrition (per serving × number of servings)
  const scaledNutrition = {
    calories: Math.round(nutritionPerServing.calories * servingsCount),
    protein: Math.round(nutritionPerServing.protein * servingsCount * 10) / 10,
    carbohydrates: Math.round(nutritionPerServing.carbohydrates * servingsCount * 10) / 10,
    fat: Math.round(nutritionPerServing.fat * servingsCount * 10) / 10,
    fiber: nutritionPerServing.fiber ? Math.round(nutritionPerServing.fiber * servingsCount * 10) / 10 : undefined,
    sugar: nutritionPerServing.sugar ? Math.round(nutritionPerServing.sugar * servingsCount * 10) / 10 : undefined,
    sodium: nutritionPerServing.sodium ? Math.round(nutritionPerServing.sodium * servingsCount) : undefined,
  };

  const handleSave = async () => {
    const amount = parseFloat(servingAmount) || 0;
    const servings = parseFloat(numberOfServings) || 0;
    if (amount <= 0) {
      Alert.alert('Invalid Serving', 'Please enter a valid serving size');
      return;
    }
    if (servings <= 0) {
      Alert.alert('Invalid Servings', 'Please enter a valid number of servings');
      return;
    }

    setIsLoading(true);
    try {
      // Store fl oz as ml internally for consistency
      const storageUnit: ServingUnit = servingUnit === 'fl oz' ? 'ml' : servingUnit as ServingUnit;
      const storageAmount = servingUnit === 'fl oz' 
        ? amount * FL_OZ_TO_ML 
        : amount;
      
      const updatedFoodItem = {
        ...entry.foodItem,
        servingSize: storageAmount,
        servingUnit: storageUnit,
        nutrition: nutritionPerServing,
      };
      
      await updateEntry(
        entry.id,
        {
          foodItem: updatedFoodItem,
          servings,
          mealType,
          notes: notes || undefined,
        },
        date
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete ${entry.foodItem.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entry.id, date);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const getQuickServings = (): string[] => {
    switch (servingUnit) {
      case 'g':
        return ['50', '100', '150', '200', '250'];
      case 'oz':
        return ['1', '2', '3', '4', '6'];
      case 'ml':
        return ['100', '200', '330', '355', '500']; // Common beverage sizes
      case 'fl oz':
        return ['4', '8', '12', '16', '20']; // Common US beverage sizes
      default:
        return ['50', '100', '150', '200', '250'];
    }
  };
  const quickServings = getQuickServings();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.foodName}>{entry.foodItem.name}</Text>
          {entry.foodItem.brand && (
            <Text style={styles.brandName}>{entry.foodItem.brand}</Text>
          )}
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal</Text>
          <View style={styles.mealTypeRow}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.value}
                style={[
                  styles.mealTypeButton,
                  mealType === meal.value && styles.mealTypeButtonActive
                ]}
                onPress={() => setMealType(meal.value)}
              >
                <Icon 
                  name={meal.icon} 
                  size={20} 
                  color={mealType === meal.value ? colors.white : colors.textSecondary} 
                />
                <Text style={[
                  styles.mealTypeText,
                  mealType === meal.value && styles.mealTypeTextActive
                ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Serving Size Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serving Size</Text>
          
          {/* Measurement Type Toggle (Weight vs Volume) */}
          <View style={styles.measurementTypeToggle}>
            <TouchableOpacity
              style={[styles.measurementTypeButton, measurementType === 'weight' && styles.measurementTypeButtonActive]}
              onPress={() => {
                setMeasurementType('weight');
                // Convert to grams
                const grams = getServingInGrams();
                setServingAmount(Math.round(grams).toString());
                setServingUnit('g');
              }}
            >
              <Icon name="scale-outline" size={18} color={measurementType === 'weight' ? colors.white : colors.textSecondary} />
              <Text style={[styles.measurementTypeText, measurementType === 'weight' && styles.measurementTypeTextActive]}>
                Weight
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.measurementTypeButton, measurementType === 'volume' && styles.measurementTypeButtonActive]}
              onPress={() => {
                setMeasurementType('volume');
                // Convert to ml (approximate 1g = 1ml for beverages)
                const grams = getServingInGrams();
                setServingAmount(Math.round(grams).toString());
                setServingUnit('ml');
              }}
            >
              <Icon name="water-outline" size={18} color={measurementType === 'volume' ? colors.white : colors.textSecondary} />
              <Text style={[styles.measurementTypeText, measurementType === 'volume' && styles.measurementTypeTextActive]}>
                Volume
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Unit Toggle */}
          <View style={styles.unitToggle}>
            {measurementType === 'weight' ? (
              <>
                <TouchableOpacity
                  style={[styles.unitButton, servingUnit === 'g' && styles.unitButtonActive]}
                  onPress={() => {
                    if (servingUnit === 'oz') {
                      const grams = parseFloat(servingAmount) * OZ_TO_GRAMS;
                      setServingAmount(Math.round(grams).toString());
                    }
                    setServingUnit('g');
                  }}
                >
                  <Text style={[styles.unitButtonText, servingUnit === 'g' && styles.unitButtonTextActive]}>
                    Grams (g)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitButton, servingUnit === 'oz' && styles.unitButtonActive]}
                  onPress={() => {
                    if (servingUnit === 'g') {
                      const oz = parseFloat(servingAmount) / OZ_TO_GRAMS;
                      setServingAmount((Math.round(oz * 10) / 10).toString());
                    }
                    setServingUnit('oz');
                  }}
                >
                  <Text style={[styles.unitButtonText, servingUnit === 'oz' && styles.unitButtonTextActive]}>
                    Ounces (oz)
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.unitButton, servingUnit === 'ml' && styles.unitButtonActive]}
                  onPress={() => {
                    if (servingUnit === 'fl oz') {
                      const ml = parseFloat(servingAmount) * FL_OZ_TO_ML;
                      setServingAmount(Math.round(ml).toString());
                    }
                    setServingUnit('ml');
                  }}
                >
                  <Text style={[styles.unitButtonText, servingUnit === 'ml' && styles.unitButtonTextActive]}>
                    Milliliters (mL)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitButton, servingUnit === 'fl oz' && styles.unitButtonActive]}
                  onPress={() => {
                    if (servingUnit === 'ml') {
                      const flOz = parseFloat(servingAmount) / FL_OZ_TO_ML;
                      setServingAmount((Math.round(flOz * 10) / 10).toString());
                    }
                    setServingUnit('fl oz');
                  }}
                >
                  <Text style={[styles.unitButtonText, servingUnit === 'fl oz' && styles.unitButtonTextActive]}>
                    Fluid Oz (fl oz)
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Serving Input */}
          <View style={styles.servingCard}>
            <View style={styles.servingInputRow}>
              <TextInput
                style={styles.servingInput}
                value={servingAmount}
                onChangeText={setServingAmount}
                keyboardType="decimal-pad"
                textAlign="center"
                selectTextOnFocus
              />
              <Text style={styles.servingUnitLabel}>{servingUnit}</Text>
            </View>
            
            {/* Quick Select Buttons */}
            <View style={styles.quickServings}>
              {quickServings.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickButton,
                    servingAmount === amount && styles.quickButtonActive
                  ]}
                  onPress={() => setServingAmount(amount)}
                >
                  <Text style={[
                    styles.quickButtonText,
                    servingAmount === amount && styles.quickButtonTextActive
                  ]}>
                    {amount}{servingUnit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Number of Servings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Servings</Text>
          <View style={styles.servingsCountCard}>
            <TouchableOpacity
              style={styles.servingsAdjustButton}
              onPress={() => {
                const current = parseFloat(numberOfServings) || 1;
                if (current > 0.5) {
                  setNumberOfServings((current - 0.5).toString());
                }
              }}
            >
              <Icon name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.servingsInputContainer}>
              <TextInput
                style={styles.servingsInput}
                value={numberOfServings}
                onChangeText={setNumberOfServings}
                keyboardType="decimal-pad"
                textAlign="center"
                selectTextOnFocus
              />
              <Text style={styles.servingsLabel}>
                {parseFloat(numberOfServings) === 1 ? 'serving' : 'servings'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.servingsAdjustButton}
              onPress={() => {
                const current = parseFloat(numberOfServings) || 0;
                setNumberOfServings((current + 0.5).toString());
              }}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.quickServingsCount}>
            {['0.5', '1', '1.5', '2', '3'].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.quickButton,
                  numberOfServings === count && styles.quickButtonActive
                ]}
                onPress={() => setNumberOfServings(count)}
              >
                <Text style={[
                  styles.quickButtonText,
                  numberOfServings === count && styles.quickButtonTextActive
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calories Highlight */}
        <View style={styles.calorieHighlight}>
          <Text style={styles.calorieValue}>{scaledNutrition.calories}</Text>
          <Text style={styles.calorieLabel}>
            total calories{servingsCount !== 1 && ` (${servingsCount} × ${nutritionPerServing.calories})`}
          </Text>
        </View>

        {/* Nutrition Label */}
        <NutritionLabel nutrition={scaledNutrition} />

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this food..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  foodName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  brandName: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mealTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  mealTypeTextActive: {
    color: colors.white,
  },
  measurementTypeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  measurementTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: spacing.xs,
  },
  measurementTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  measurementTypeText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  measurementTypeTextActive: {
    color: colors.white,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  unitButtonTextActive: {
    color: colors.white,
  },
  servingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  servingInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  servingInput: {
    fontSize: 48,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  servingUnitLabel: {
    fontSize: typography.sizes.xl,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  quickServings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  quickButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  quickButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  servingsCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.lg,
  },
  servingsAdjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsInputContainer: {
    alignItems: 'center',
  },
  servingsInput: {
    fontSize: 36,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  servingsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  quickServingsCount: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  calorieHighlight: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: typography.weights.bold as any,
    color: colors.white,
  },
  calorieLabel: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.9,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
  saveButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
});

export default EditEntryScreen;
