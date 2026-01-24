import React, { useState } from 'react';
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
import { ProfileStackScreenProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, typography } from '@/constants/theme';

const GoalsScreen: React.FC<ProfileStackScreenProps<'Goals'>> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  
  const [calorieGoal, setCalorieGoal] = useState(
    user?.profile.dailyCalorieGoal?.toString() || '2000'
  );
  const [proteinGoal, setProteinGoal] = useState(
    user?.profile.dailyProteinGoal?.toString() || '50'
  );
  const [carbsGoal, setCarbsGoal] = useState(
    user?.profile.dailyCarbsGoal?.toString() || '250'
  );
  const [fatGoal, setFatGoal] = useState(
    user?.profile.dailyFatGoal?.toString() || '65'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        dailyCalorieGoal: parseInt(calorieGoal) || 2000,
        dailyProteinGoal: parseInt(proteinGoal) || 50,
        dailyCarbsGoal: parseInt(carbsGoal) || 250,
        dailyFatGoal: parseInt(fatGoal) || 65,
      });
      Alert.alert('Success', 'Your goals have been updated');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Daily Targets</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Calorie Goal</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.unit}>cal</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Protein Goal</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={proteinGoal}
              onChangeText={setProteinGoal}
              keyboardType="numeric"
              placeholder="50"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.unit}>g</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carbohydrate Goal</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={carbsGoal}
              onChangeText={setCarbsGoal}
              keyboardType="numeric"
              placeholder="250"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.unit}>g</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fat Goal</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={fatGoal}
              onChangeText={setFatGoal}
              keyboardType="numeric"
              placeholder="65"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.unit}>g</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>Save Goals</Text>
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
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unit: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    width: 30,
  },
  footer: {
    padding: spacing.lg,
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

export default GoalsScreen;
