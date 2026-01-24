import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeStackScreenProps, ServingUnit, NutritionInfo } from '@/types';
import { useFoodLog } from '@/context/FoodLogContext';
import { colors, spacing, typography } from '@/constants/theme';

const servingUnits: ServingUnit[] = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'];

const CustomFoodScreen: React.FC<HomeStackScreenProps<'CustomFood'>> = ({ navigation, route }) => {
  const { mealType, date } = route.params;
  const { addCustomFood, addEntry } = useFoodLog();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState<ServingUnit>('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    if (!calories) {
      Alert.alert('Error', 'Please enter calorie amount');
      return;
    }

    setIsLoading(true);
    try {
      const nutrition: NutritionInfo = {
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbohydrates: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      };

      const customFood = await addCustomFood({
        name: name.trim(),
        brand: brand.trim() || undefined,
        servingSize: parseFloat(servingSize) || 100,
        servingUnit,
        nutrition,
      });

      // Ask if they want to add to current meal
      Alert.alert(
        'Food Created',
        'Would you like to add this food to your log?',
        [
          {
            text: 'No, Just Save',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Yes, Add It',
            onPress: async () => {
              await addEntry(customFood, 1, mealType, date);
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Homemade Pasta"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand (optional)</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g., Mom's Recipe"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Serving Size</Text>
            
            <View style={styles.servingRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={servingSize}
                  onChangeText={setServingSize}
                  placeholder="100"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
                <Text style={styles.label}>Unit</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.unitScroll}
                >
                  {servingUnits.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.unitChip, servingUnit === unit && styles.unitChipActive]}
                      onPress={() => setServingUnit(unit)}
                    >
                      <Text style={[styles.unitText, servingUnit === unit && styles.unitTextActive]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
            
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.label}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  value={fat}
                  onChangeText={setFat}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Food</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  servingRow: {
    flexDirection: 'row',
  },
  unitScroll: {
    marginTop: spacing.xs,
  },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  unitTextActive: {
    color: colors.white,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  nutritionItem: {
    width: '47%',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
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

export default CustomFoodScreen;
