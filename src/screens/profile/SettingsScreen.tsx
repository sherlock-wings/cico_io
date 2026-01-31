import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileStackScreenProps, FoodSearchLanguage, UnitSystem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, typography } from '@/constants/theme';

// Language options for food search
const languageOptions: { value: FoodSearchLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { value: 'pl', label: 'Polski', flag: '🇵🇱' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'all', label: 'All Languages', flag: '🌍' },
];

const SettingsScreen: React.FC<ProfileStackScreenProps<'Settings'>> = () => {
  const { user, updateProfile } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLanguage = user?.profile?.preferredLanguage || 'en';
  const currentUnitSystem = user?.profile?.unitSystem || 'imperial';

  const handleLanguageChange = async (language: FoodSearchLanguage) => {
    try {
      await updateProfile({ preferredLanguage: language });
      setShowLanguageModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update language preference');
    }
  };

  const handleUnitSystemChange = async (unitSystem: UnitSystem) => {
    try {
      await updateProfile({ unitSystem });
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit preference');
    }
  };

  const currentLangOption = languageOptions.find(l => l.value === currentLanguage);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Measurement System</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  currentUnitSystem === 'imperial' && styles.optionButtonActive,
                ]}
                onPress={() => handleUnitSystemChange('imperial')}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentUnitSystem === 'imperial' && styles.optionTextActive,
                  ]}
                >
                  Imperial
                </Text>
                <Text
                  style={[
                    styles.optionSubtext,
                    currentUnitSystem === 'imperial' && styles.optionTextActive,
                  ]}
                >
                  lb, ft/in
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  currentUnitSystem === 'metric' && styles.optionButtonActive,
                ]}
                onPress={() => handleUnitSystemChange('metric')}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentUnitSystem === 'metric' && styles.optionTextActive,
                  ]}
                >
                  Metric
                </Text>
                <Text
                  style={[
                    styles.optionSubtext,
                    currentUnitSystem === 'metric' && styles.optionTextActive,
                  ]}
                >
                  kg, cm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Search</Text>
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Search Language</Text>
                <Text style={styles.settingHint}>
                  Filter food results by language
                </Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>
                  {currentLangOption?.flag} {currentLangOption?.label}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.languageList}>
            <Text style={styles.languageModalHint}>
              Food search results will be filtered to show products with names in your selected language.
            </Text>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.languageOption,
                  currentLanguage === lang.value && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange(lang.value)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageLabel,
                    currentLanguage === lang.value && styles.languageLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
                {currentLanguage === lang.value && (
                  <Text style={styles.languageCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: typography.sizes.xl,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
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
  optionSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    flex: 1,
  },
  modalCloseButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalCloseText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  languageList: {
    flex: 1,
    padding: spacing.lg,
  },
  languageModalHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  languageLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  languageLabelActive: {
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
  languageCheckmark: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.bold as any,
  },
});

export default SettingsScreen;
