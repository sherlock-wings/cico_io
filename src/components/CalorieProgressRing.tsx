import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '@/constants/theme';

interface CalorieProgressRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export const CalorieProgressRing: React.FC<CalorieProgressRingProps> = ({
  consumed,
  goal,
  size = 160,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(consumed / goal, 1.5); // Cap at 150% for visual
  const strokeDashoffset = circumference - progress * circumference;
  const percentage = Math.round((consumed / goal) * 100);
  const isOverGoal = consumed > goal;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOverGoal ? colors.error : colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.consumedText, isOverGoal && styles.overGoalText]}>
          {consumed}
        </Text>
        <Text style={styles.labelText}>of {goal} cal</Text>
        <Text style={[styles.percentageText, isOverGoal && styles.overGoalText]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  consumedText: {
    fontSize: 32,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  overGoalText: {
    color: colors.error,
  },
  labelText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  percentageText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
    marginTop: 4,
  },
});
