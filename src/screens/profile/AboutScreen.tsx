import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileStackScreenProps } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

const AboutScreen: React.FC<ProfileStackScreenProps<'About'>> = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍎</Text>
          <Text style={styles.appName}>CICO</Text>
          <Text style={styles.tagline}>Calories In, Calories Out</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2026.01.24</Text>
          </View>
        </View>

        <Text style={styles.description}>
          CICO is a simple calorie tracking app designed to help you maintain a healthy lifestyle 
          by monitoring your daily food intake and nutritional goals.
        </Text>

        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2026 CICO App. All rights reserved.
        </Text>
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  linksSection: {
    width: '100%',
  },
  linkButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  copyright: {
    position: 'absolute',
    bottom: spacing.xl,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

export default AboutScreen;
