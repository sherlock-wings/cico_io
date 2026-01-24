import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeStackScreenProps, FoodItem } from '@/types';
import { nutritionApiService } from '@/services/api';
import { useFoodLog } from '@/context/FoodLogContext';
import { FoodSearchItem } from '@/components/FoodSearchItem';
import { colors, spacing, typography } from '@/constants/theme';
import { debounce } from '@/utils/helpers';

const FoodSearchScreen: React.FC<HomeStackScreenProps<'FoodSearch'>> = ({ navigation, route }) => {
  const { mealType, date } = route.params;
  const { customFoods, recentFoods } = useFoodLog();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchFoods = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        // Search custom foods first
        const customResults = customFoods.filter(food =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Search external API
        const apiResults = await nutritionApiService.searchOpenFoodFacts(searchQuery);
        
        // Combine results with custom foods first
        setResults([...customResults, ...apiResults.items]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [customFoods]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    searchFoods(text);
  };

  const handleFoodSelect = (foodItem: FoodItem) => {
    navigation.navigate('FoodDetail', { foodItem, mealType, date });
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (hasSearched && results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search term</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CustomFood', { mealType, date })}
          >
            <Text style={styles.createButtonText}>Create Custom Food</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show recent foods when no search
    return (
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Foods</Text>
        {recentFoods.length > 0 ? (
          recentFoods.map((food) => (
            <FoodSearchItem
              key={food.id}
              food={food}
              onPress={() => handleFoodSelect(food)}
            />
          ))
        ) : (
          <Text style={styles.noRecentText}>No recent foods yet</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search foods..."
          placeholderTextColor={colors.textSecondary}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleQueryChange('')}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodSearchItem
            food={item}
            onPress={() => handleFoodSelect(item)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  createButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  recentSection: {
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  noRecentText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default FoodSearchScreen;
