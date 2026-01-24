import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDisplayDate, addDays, getTodayDate, isToday, isYesterday } from '@/utils/date';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const today = getTodayDate();
  
  // Generate dates for the past 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));

  const getDateLabel = (date: string) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date: string) => {
    return new Date(date).getDate();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onDateChange(addDays(selectedDate, -1))}
      >
        <Icon name="chevron-back" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.map((date) => {
          const isSelected = date === selectedDate;
          const isTodayDate = isToday(date);

          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateItem, isSelected && styles.dateItemSelected]}
              onPress={() => onDateChange(date)}
            >
              <Text style={[styles.dayLabel, isSelected && styles.textSelected]}>
                {getDateLabel(date)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.textSelected,
                isTodayDate && !isSelected && styles.todayText,
              ]}>
                {getDayNumber(date)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => {
          const nextDate = addDays(selectedDate, 1);
          if (nextDate <= today) {
            onDateChange(nextDate);
          }
        }}
        disabled={selectedDate >= today}
      >
        <Icon
          name="chevron-forward"
          size={20}
          color={selectedDate >= today ? colors.border : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  arrowButton: {
    padding: spacing.sm,
  },
  datesContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 12,
    minWidth: 50,
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  textSelected: {
    color: colors.white,
  },
  todayText: {
    color: colors.primary,
  },
});
