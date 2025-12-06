import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ActivityCard from '@/components/ActivityCard';
import BottomSheetMenu, { BottomSheetMenuRef } from '@/components/BottomSheetMenu';
import CategoryChip from '@/components/CategoryChip';
import { theme } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useLocation } from '@/src/hooks/useLocation';
import type { Activity, ActivityCategory } from '@/src/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data for demo
const mockCategories: ActivityCategory[] = [
  { id: 1, name: 'Sports & Fitness', icon: '⚽', color: '#ef4444' },
  { id: 2, name: 'Food & Dining', icon: '🍽️', color: '#f97316' },
  { id: 3, name: 'Outdoor Adventures', icon: '🏕️', color: '#22c55e' },
  { id: 4, name: 'Social & Meetups', icon: '👥', color: '#3b82f6' },
  { id: 5, name: 'Games & Entertainment', icon: '🎮', color: '#8b5cf6' },
  { id: 6, name: 'Arts & Culture', icon: '🎭', color: '#ec4899' },
];

const mockActivities: Activity[] = [
  {
    id: 1,
    creator: { id: 1, email: 'john@example.com', username: 'john', trust_score: 4.5, total_reviews: 12, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
    title: 'Morning Yoga in the Park',
    description: 'Join us for a relaxing morning yoga session. All levels welcome! Bring your own mat.',
    category: { id: 1, name: 'Sports & Fitness', icon: '⚽', color: '#ef4444' },
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: 'Golden Gate Park',
    start_time: new Date(Date.now() + 3600000).toISOString(),
    max_participants: 15,
    current_participants_count: 8,
    visibility: 'public',
    status: 'active',
    min_trust_score: 0,
    is_full: false,
    spots_left: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    creator: { id: 2, email: 'jane@example.com', username: 'jane', trust_score: 4.8, total_reviews: 25, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'exact', personality_traits: [] },
    title: 'Coffee & Board Games',
    description: 'Let\'s grab coffee and play some board games! I\'ll bring Catan and Ticket to Ride.',
    category: { id: 5, name: 'Games & Entertainment', icon: '🎮', color: '#8b5cf6' },
    latitude: 37.7849,
    longitude: -122.4094,
    location_name: 'The Game Parlour',
    start_time: new Date(Date.now() + 7200000).toISOString(),
    max_participants: 6,
    current_participants_count: 4,
    visibility: 'public',
    status: 'active',
    min_trust_score: 0,
    is_full: false,
    spots_left: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    creator: { id: 3, email: 'mike@example.com', username: 'mike', trust_score: 4.2, total_reviews: 8, is_verified: false, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
    title: 'Hiking Trip to Twin Peaks',
    description: 'Beautiful views await! Moderate difficulty, about 2 hours round trip.',
    category: { id: 3, name: 'Outdoor Adventures', icon: '🏕️', color: '#22c55e' },
    latitude: 37.7544,
    longitude: -122.4477,
    location_name: 'Twin Peaks Summit',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    max_participants: 10,
    current_participants_count: 6,
    visibility: 'public',
    status: 'active',
    min_trust_score: 0,
    is_full: false,
    spots_left: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bottomSheetRef = useRef<BottomSheetMenuRef>(null);

  const { isAuthenticated, user } = useAuth();
  const { currentLocation, requestPermission, getCurrentLocation } = useLocation({
    autoFetch: true,
  });

  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [categories, setCategories] = useState<ActivityCategory[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // In production, fetch real data
      // const [activitiesData, categoriesData] = await Promise.all([
      //   activitiesApi.getActivities(),
      //   activitiesApi.getCategories(),
      // ]);
      // setActivities(activitiesData.results);
      // setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
    setRefreshing(false);
  }, []);

  const filteredActivities = selectedCategory
    ? activities.filter((a) => a.category?.id === selectedCategory)
    : activities;

  const handleActivityPress = (activity: Activity) => {
    // Navigate to activity detail
    console.log('Activity pressed:', activity.id);
  };

  const handleCreateActivity = () => {
    // Navigate to create activity
    console.log('Create activity');
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              {isAuthenticated ? `Hey, ${user?.display_name || user?.username || 'there'}!` : 'Welcome!'}
            </Text>
            <Text
              style={[
                styles.title,
                {
                  color: isDark ? theme.colors.text.dark : theme.colors.text.light,
                },
              ]}
            >
              What's happening nearby?
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[100],
              },
            ]}
            onPress={() => router.push('/modal')}
          >
            <FontAwesome
              name="user"
              size={20}
              color={isDark ? theme.colors.text.dark : theme.colors.text.light}
            />
          </TouchableOpacity>
        </View>

        {/* Location Status */}
        {currentLocation && (
          <View style={styles.locationStatus}>
            <FontAwesome name="map-marker" size={14} color={theme.colors.accent} />
            <Text
              style={[
                styles.locationText,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              Location active • Showing nearby activities
            </Text>
          </View>
        )}

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.allCategoryChip,
              {
                backgroundColor:
                  selectedCategory === null
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                borderColor:
                  selectedCategory === null
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.allCategoryText,
                {
                  color:
                    selectedCategory === null
                      ? theme.colors.white
                      : isDark
                      ? theme.colors.text.dark
                      : theme.colors.text.light,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              selected={selectedCategory === category.id}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )
              }
            />
          ))}
        </ScrollView>

        {/* Main content area - shows map or placeholder */}
        <View style={styles.mapPlaceholder}>
          <FontAwesome
            name="map"
            size={48}
            color={isDark ? theme.colors.gray[600] : theme.colors.gray[300]}
          />
          <Text
            style={[
              styles.mapPlaceholderText,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            Map View
          </Text>
          <Text
            style={[
              styles.mapPlaceholderSubtext,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            Pull up to see activities
          </Text>
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateActivity}
          activeOpacity={0.8}
        >
          <FontAwesome name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Bottom Sheet Menu - starts at 60% */}
        <BottomSheetMenu
          ref={bottomSheetRef}
          title="Nearby Activities"
          initialSnapPoint={0}
        >
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredActivities.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome
                  name="search"
                  size={48}
                  color={isDark ? theme.colors.gray[600] : theme.colors.gray[300]}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    {
                      color: isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    },
                  ]}
                >
                  No activities found
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtext,
                    {
                      color: isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    },
                  ]}
                >
                  Try selecting a different category or create one!
                </Text>
              </View>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() => handleActivityPress(activity)}
                  distance={1.2}
                />
              ))
            )}
          </ScrollView>
        </BottomSheetMenu>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSize.xs,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: theme.spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  allCategoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
  },
  allCategoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.4, // Offset for bottom sheet
  },
  mapPlaceholderText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.md,
  },
  mapPlaceholderSubtext: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: SCREEN_HEIGHT * 0.65, // Above the bottom sheet
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.lg,
    zIndex: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
