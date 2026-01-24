import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  current,
  goal,
  unit,
  color,
}) => {
  const progress = Math.min(current / goal, 1);
  const isOverGoal = current > goal;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.values, isOverGoal && styles.overGoal]}>
          {Math.round(current * 10) / 10}{unit} / {goal}{unit}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isOverGoal ? colors.error : color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  values: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  overGoal: {
    color: colors.error,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
