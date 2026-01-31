import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackScreenProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { dataExportService } from '@/services/dataExport';
import { colors, spacing, typography } from '@/constants/theme';

const WelcomeScreen: React.FC<AuthStackScreenProps<'Welcome'>> = ({ navigation }) => {
  const { createLocalUser } = useAuth();
  const [isImporting, setIsImporting] = useState(false);

  const handleStartFresh = () => {
    // Navigate to onboarding to set up profile
    navigation.navigate('Onboarding');
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const result = await dataExportService.importData();
      
      if (result.success) {
        Alert.alert(
          'Welcome Back! 🎉',
          result.message,
          [
            {
              text: 'Continue',
              onPress: async () => {
                // Create local user session from imported data
                await createLocalUser();
              },
            },
          ]
        );
      } else if (result.message !== 'Import cancelled') {
        Alert.alert('Import Failed', result.message);
      }
    } catch (error: any) {
      Alert.alert('Import Failed', error.message || 'An error occurred while importing your data.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍎</Text>
          <Text style={styles.appName}>CICO</Text>
          <Text style={styles.tagline}>Calories In, Calories Out</Text>
        </View>

        <View style={styles.featureList}>
          <FeatureItem emoji="📊" text="Track your daily calories" />
          <FeatureItem emoji="🎯" text="Set personalized goals" />
          <FeatureItem emoji="📈" text="Monitor your progress" />
          <FeatureItem emoji="🔒" text="Your data stays on your device" />
        </View>

        <View style={styles.privacyNote}>
          <Icon name="shield-checkmark-outline" size={20} color={colors.success} />
          <Text style={styles.privacyText}>
            No account needed. No cloud storage. Your data is private and stays on your device.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartFresh}
        >
          <Icon name="add-circle-outline" size={22} color={colors.white} />
          <Text style={styles.primaryButtonText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleImportData}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Icon name="cloud-download-outline" size={22} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>I have existing data</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.helperText}>
          If you've used CICO before, import your backup file to restore your data
        </Text>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem: React.FC<{ emoji: string; text: string }> = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featureList: {
    marginTop: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
  helperText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});

export default WelcomeScreen;
