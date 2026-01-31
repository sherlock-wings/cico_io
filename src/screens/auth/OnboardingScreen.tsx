import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps, GoalType, ActivityLevel, UnitSystem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, typography } from '@/constants/theme';
import {
  calculateRecommendedCalories,
  canCalculateCalories,
  CalorieCalculatorResult,
} from '@/utils/calorieCalculator';

// Unit conversion helpers
const lbToKg = (lb: number) => lb * 0.453592;
const kgToLb = (kg: number) => kg / 0.453592;
const ftInToCm = (ft: number, inches: number) => (ft * 12 + inches) * 2.54;
const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
};

const OnboardingScreen: React.FC<AuthStackScreenProps<'Onboarding'>> = ({ navigation }) => {
  const { createLocalUser, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [goalType, setGoalType] = useState<GoalType>('maintain_weight');
  const [calorieGoal, setCalorieGoal] = useState('2000');

  const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
    { value: 'lightly_active', label: 'Light', description: 'Exercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderate', description: 'Exercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Exercise 6-7 days/week' },
    { value: 'extra_active', label: 'Extra Active', description: 'Very hard exercise daily' },
  ];

  const goals: { value: GoalType; label: string; emoji: string }[] = [
    { value: 'lose_weight', label: 'Lose Weight', emoji: '⬇️' },
    { value: 'maintain_weight', label: 'Maintain Weight', emoji: '⚖️' },
    { value: 'gain_weight', label: 'Gain Weight', emoji: '⬆️' },
  ];

  // Helper to get weight in kg
  const getWeightInKg = (): number | undefined => {
    if (!weight) return undefined;
    const weightNum = parseFloat(weight);
    return unitSystem === 'imperial' ? lbToKg(weightNum) : weightNum;
  };

  // Helper to get height in cm
  const getHeightInCm = (): number | undefined => {
    if (unitSystem === 'imperial') {
      if (!heightFt && !heightIn) return undefined;
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      return ftInToCm(ft, inches);
    } else {
      if (!height) return undefined;
      return parseFloat(height);
    }
  };

  // Calculate recommended calories based on user data
  const calorieRecommendation = useMemo((): CalorieCalculatorResult | null => {
    const weightKg = getWeightInKg();
    const heightCm = getHeightInCm();
    const ageNum = parseInt(age);

    if (!canCalculateCalories({ weight: weightKg, height: heightCm, age: ageNum, gender })) {
      return null;
    }

    return calculateRecommendedCalories({
      weight: weightKg!,
      height: heightCm!,
      age: ageNum,
      gender,
      activityLevel,
      goalType,
    });
  }, [weight, height, heightFt, heightIn, age, gender, activityLevel, goalType, unitSystem]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // First create the local user
      await createLocalUser(name || 'User');
      
      // Convert weight to kg if imperial
      let weightInKg: number | undefined;
      if (weight) {
        const weightNum = parseFloat(weight);
        weightInKg = unitSystem === 'imperial' ? lbToKg(weightNum) : weightNum;
      }
      
      // Convert height to cm
      let heightInCm: number | undefined;
      if (unitSystem === 'imperial' && (heightFt || heightIn)) {
        const ft = parseFloat(heightFt) || 0;
        const inches = parseFloat(heightIn) || 0;
        heightInCm = ftInToCm(ft, inches);
      } else if (height) {
        heightInCm = parseFloat(height);
      }
      
      // Then update their profile with onboarding data
      await updateProfile({
        age: parseInt(age) || undefined,
        weight: weightInKg,
        height: heightInCm,
        gender,
        activityLevel,
        goalType,
        dailyCalorieGoal: parseInt(calorieGoal) || 2000,
        unitSystem,
      });
      // Navigation to Main will happen automatically via AuthContext
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Let's get started!</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age (optional)</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preferred Units</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[styles.optionButton, styles.unitButton, unitSystem === 'imperial' && styles.optionButtonActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[styles.optionText, unitSystem === 'imperial' && styles.optionTextActive]}>Imperial</Text>
            <Text style={[styles.unitSubtext, unitSystem === 'imperial' && styles.optionTextActive]}>lb, ft/in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.unitButton, unitSystem === 'metric' && styles.optionButtonActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[styles.optionText, unitSystem === 'metric' && styles.optionTextActive]}>Metric</Text>
            <Text style={[styles.unitSubtext, unitSystem === 'metric' && styles.optionTextActive]}>kg, cm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight in {unitSystem === 'imperial' ? 'lb' : 'kg'} (optional)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder={`Enter your weight in ${unitSystem === 'imperial' ? 'pounds' : 'kilograms'}`}
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
        />
      </View>

      {unitSystem === 'imperial' ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (optional)</Text>
          <View style={styles.heightRow}>
            <View style={styles.heightInputContainer}>
              <TextInput
                style={styles.heightInput}
                value={heightFt}
                onChangeText={setHeightFt}
                placeholder="Feet"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.heightUnit}>ft</Text>
            </View>
            <View style={styles.heightInputContainer}>
              <TextInput
                style={styles.heightInput}
                value={heightIn}
                onChangeText={setHeightIn}
                placeholder="Inches"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.heightUnit}>in</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height in cm (optional)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter your height in centimeters"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender (optional)</Text>
        <View style={styles.optionRow}>
          {(['male', 'female', 'other'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionButton, gender === g && styles.optionButtonActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your goal?</Text>
      <Text style={styles.stepSubtitle}>We'll adjust your calorie target accordingly</Text>

      <View style={styles.goalList}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.value}
            style={[styles.goalCard, goalType === goal.value && styles.goalCardActive]}
            onPress={() => setGoalType(goal.value)}
          >
            <Text style={styles.goalEmoji}>{goal.emoji}</Text>
            <Text style={[styles.goalLabel, goalType === goal.value && styles.goalLabelActive]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.label}>Activity Level</Text>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[styles.activityCard, activityLevel === level.value && styles.activityCardActive]}
            onPress={() => setActivityLevel(level.value)}
          >
            <Text style={[styles.activityLabel, activityLevel === level.value && styles.activityLabelActive]}>
              {level.label}
            </Text>
            <Text style={styles.activityDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set your daily goal</Text>
      <Text style={styles.stepSubtitle}>You can always change this later</Text>

      {calorieRecommendation && (
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>📊 Personalized Recommendation</Text>
          <Text style={styles.recommendedCalories}>
            {calorieRecommendation.recommendedCalories.toLocaleString()}
          </Text>
          <Text style={styles.recommendedLabel}>calories/day</Text>
          
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Metabolism (BMR)</Text>
              <Text style={styles.breakdownValue}>{calorieRecommendation.bmr.toLocaleString()} cal</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Daily Activity (TDEE)</Text>
              <Text style={styles.breakdownValue}>{calorieRecommendation.tdee.toLocaleString()} cal</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Goal Adjustment</Text>
              <Text style={[styles.breakdownValue, calorieRecommendation.deficit < 0 ? styles.deficitText : calorieRecommendation.deficit > 0 ? styles.surplusText : null]}>
                {calorieRecommendation.deficit > 0 ? '+' : ''}{calorieRecommendation.deficit} cal
              </Text>
            </View>
          </View>
          
          <Text style={styles.goalDescriptionText}>{calorieRecommendation.goalDescription}</Text>
          
          <TouchableOpacity
            style={styles.useRecommendationButton}
            onPress={() => setCalorieGoal(calorieRecommendation.recommendedCalories.toString())}
          >
            <Text style={styles.useRecommendationText}>Use This Recommendation</Text>
          </TouchableOpacity>
        </View>
      )}

      {!calorieRecommendation && (
        <View style={styles.noRecommendationCard}>
          <Text style={styles.noRecommendationText}>
            💡 Fill in your age, weight, and height on step 1 to get a personalized calorie recommendation!
          </Text>
        </View>
      )}

      <View style={styles.manualInputSection}>
        <Text style={styles.manualInputLabel}>
          {calorieRecommendation ? 'Or set your own goal:' : 'Set your daily goal:'}
        </Text>
        <View style={styles.calorieGoalContainer}>
          <TextInput
            style={styles.calorieInput}
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
          />
          <Text style={styles.calorieUnit}>calories/day</Text>
        </View>
      </View>

      <View style={styles.presetContainer}>
        <Text style={styles.presetLabel}>Quick select:</Text>
        <View style={styles.presetRow}>
          {['1500', '1800', '2000', '2200', '2500'].map((cal) => (
            <TouchableOpacity
              key={cal}
              style={[styles.presetButton, calorieGoal === cal && styles.presetButtonActive]}
              onPress={() => setCalorieGoal(cal)}
            >
              <Text style={[styles.presetText, calorieGoal === cal && styles.presetTextActive]}>
                {cal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.progressDot, s <= step && styles.progressDotActive]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Get Started' : 'Next'}
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  stepContent: {
    paddingTop: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
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
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold as any,
  },
  unitButton: {
    paddingVertical: spacing.sm,
  },
  unitSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heightRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heightInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heightUnit: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    width: 24,
  },
  goalList: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  goalCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  goalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  goalLabelActive: {
    color: colors.primary,
  },
  activitySection: {
    marginTop: spacing.md,
  },
  activityCard: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  activityLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  activityLabelActive: {
    color: colors.primary,
  },
  activityDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calorieGoalContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  calorieInput: {
    fontSize: 48,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    textAlign: 'center',
    minWidth: 150,
  },
  calorieUnit: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  presetContainer: {
    marginTop: spacing.lg,
  },
  presetLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  presetTextActive: {
    color: colors.white,
  },
  // Recommendation card styles
  recommendationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  recommendedCalories: {
    fontSize: 48,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  recommendedLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  breakdownContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  deficitText: {
    color: colors.success,
  },
  surplusText: {
    color: colors.warning,
  },
  goalDescriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  useRecommendationButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  useRecommendationText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  noRecommendationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  noRecommendationText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  manualInputSection: {
    marginTop: spacing.md,
  },
  manualInputLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
});

export default OnboardingScreen;
