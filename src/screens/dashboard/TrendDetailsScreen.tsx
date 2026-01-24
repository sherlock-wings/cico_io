import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardStackScreenProps } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

const TrendDetailsScreen: React.FC<DashboardStackScreenProps<'TrendDetails'>> = ({ route }) => {
  const { type } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Trends
        </Text>
        <Text style={styles.placeholder}>
          Detailed {type} trend analysis will be displayed here.
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

export default TrendDetailsScreen;
