import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileStackScreenProps } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

const EditProfileScreen: React.FC<ProfileStackScreenProps<'EditProfile'>> = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Edit Profile form will be here</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});

export default EditProfileScreen;
