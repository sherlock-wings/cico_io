import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionInfo } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface NutritionLabelProps {
  nutrition: NutritionInfo;
}

export const NutritionLabel: React.FC<NutritionLabelProps> = ({ nutrition }) => {
  const rows = [
    { label: 'Protein', value: `${nutrition.protein}g`, highlight: true },
    { label: 'Carbohydrates', value: `${nutrition.carbohydrates}g`, highlight: true },
    { label: 'Fat', value: `${nutrition.fat}g`, highlight: true },
    ...(nutrition.fiber !== undefined ? [{ label: 'Fiber', value: `${nutrition.fiber}g` }] : []),
    ...(nutrition.sugar !== undefined ? [{ label: 'Sugar', value: `${nutrition.sugar}g` }] : []),
    ...(nutrition.sodium !== undefined ? [{ label: 'Sodium', value: `${nutrition.sodium}mg` }] : []),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Facts</Text>
      <View style={styles.divider} />
      
      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={[styles.label, row.highlight && styles.labelBold]}>
              {row.label}
            </Text>
            <Text style={[styles.value, row.highlight && styles.valueBold]}>
              {row.value}
            </Text>
          </View>
          {index < rows.length - 1 && <View style={styles.rowDivider} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.text,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 8,
    backgroundColor: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  labelBold: {
    fontWeight: typography.weights.semibold as any,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  valueBold: {
    fontWeight: typography.weights.semibold as any,
  },
});
