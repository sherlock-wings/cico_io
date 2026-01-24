import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardStackScreenProps } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

const WeeklyReportScreen: React.FC<DashboardStackScreenProps<'WeeklyReport'>> = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Weekly Report</Text>
        <Text style={styles.placeholder}>
          Detailed weekly analytics will be displayed here.
        </Text>
      </ScrollView>
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
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});

export default WeeklyReportScreen;
