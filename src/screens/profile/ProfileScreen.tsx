import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProfileStackScreenProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, typography } from '@/constants/theme';

const ProfileScreen: React.FC<ProfileStackScreenProps<'Profile'>> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'flag-outline',
      title: 'Daily Goals',
      subtitle: 'Set your calorie and macro targets',
      onPress: () => navigation.navigate('Goals'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Daily Goals</Text>
          <View style={styles.goalsRow}>
            <View style={styles.goalItem}>
              <Text style={styles.goalValue}>{user?.profile.dailyCalorieGoal || 2000}</Text>
              <Text style={styles.goalLabel}>Calories</Text>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalItem}>
              <Text style={styles.goalValue}>{user?.profile.dailyProteinGoal || 50}g</Text>
              <Text style={styles.goalLabel}>Protein</Text>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalItem}>
              <Text style={styles.goalValue}>{user?.profile.dailyCarbsGoal || 250}g</Text>
              <Text style={styles.goalLabel}>Carbs</Text>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalItem}>
              <Text style={styles.goalValue}>{user?.profile.dailyFatGoal || 65}g</Text>
              <Text style={styles.goalLabel}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Icon name={item.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.weights.bold as any,
    color: colors.white,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  goalsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalItem: {
    alignItems: 'center',
    flex: 1,
  },
  goalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  goalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.error,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ProfileScreen;
