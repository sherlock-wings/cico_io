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
import { HomeStackScreenProps } from '@/types';
import { useFoodLog } from '@/context/FoodLogContext';
import { NutritionLabel } from '@/components/NutritionLabel';
import { colors, spacing, typography } from '@/constants/theme';

const FoodDetailScreen: React.FC<HomeStackScreenProps<'FoodDetail'>> = ({ navigation, route }) => {
  const { foodItem, mealType, date } = route.params;
  const { addEntry } = useFoodLog();
  
  const [servings, setServings] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  const servingNum = parseFloat(servings) || 0;
  const scaledNutrition = {
    calories: Math.round(foodItem.nutrition.calories * servingNum),
    protein: Math.round(foodItem.nutrition.protein * servingNum * 10) / 10,
    carbohydrates: Math.round(foodItem.nutrition.carbohydrates * servingNum * 10) / 10,
    fat: Math.round(foodItem.nutrition.fat * servingNum * 10) / 10,
    fiber: foodItem.nutrition.fiber ? Math.round(foodItem.nutrition.fiber * servingNum * 10) / 10 : undefined,
    sugar: foodItem.nutrition.sugar ? Math.round(foodItem.nutrition.sugar * servingNum * 10) / 10 : undefined,
    sodium: foodItem.nutrition.sodium ? Math.round(foodItem.nutrition.sodium * servingNum) : undefined,
  };

  const handleAddFood = async () => {
    if (servingNum <= 0) {
      Alert.alert('Invalid Servings', 'Please enter a valid serving amount');
      return;
    }

    setIsLoading(true);
    try {
      await addEntry(foodItem, servingNum, mealType, date);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustServings = (delta: number) => {
    const current = parseFloat(servings) || 0;
    const newValue = Math.max(0.25, current + delta);
    setServings(newValue.toString());
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.foodName}>{foodItem.name}</Text>
          {foodItem.brand && (
            <Text style={styles.brandName}>{foodItem.brand}</Text>
          )}
          {foodItem.isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          )}
        </View>

        <View style={styles.servingSection}>
          <Text style={styles.sectionTitle}>Serving Size</Text>
          <View style={styles.servingCard}>
            <Text style={styles.servingInfo}>
              {foodItem.servingSize} {foodItem.servingUnit}
            </Text>
            
            <View style={styles.servingControls}>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => adjustServings(-0.5)}
              >
                <Icon name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.servingInput}
                value={servings}
                onChangeText={setServings}
                keyboardType="decimal-pad"
                textAlign="center"
              />
              
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => adjustServings(0.5)}
              >
                <Icon name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.servingsLabel}>servings</Text>
          </View>
        </View>

        <View style={styles.calorieHighlight}>
          <Text style={styles.calorieValue}>{scaledNutrition.calories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>

        <NutritionLabel nutrition={scaledNutrition} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={handleAddFood}
          disabled={isLoading}
        >
          <Icon name="add-circle-outline" size={24} color={colors.white} />
          <Text style={styles.addButtonText}>
            Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </Text>
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
  customBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  customBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  servingSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  servingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  servingInfo: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  servingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  servingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingInput: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    minWidth: 60,
  },
  servingsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
});

export default FoodDetailScreen;
