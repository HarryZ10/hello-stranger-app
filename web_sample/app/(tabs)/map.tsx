import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
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
import ActivityMapView from '@/components/MapView';
import { theme } from '@/constants/theme';
import { activitiesApi } from '@/src/api/endpoints/activities';
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
    creator: { id: 2, email: 'sarah@example.com', username: 'sarah', trust_score: 4.8, total_reviews: 25, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
    title: 'Coffee & Code Meetup',
    description: 'Working on a coding project? Join us for coffee and collaborative coding!',
    category: { id: 4, name: 'Social & Meetups', icon: '👥', color: '#3b82f6' },
    latitude: 37.7849,
    longitude: -122.4084,
    location_name: 'Blue Bottle Coffee',
    start_time: new Date(Date.now() + 7200000).toISOString(),
    max_participants: 10,
    current_participants_count: 5,
    visibility: 'public',
    status: 'active',
    min_trust_score: 0,
    is_full: false,
    spots_left: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    creator: { id: 3, email: 'mike@example.com', username: 'mike', trust_score: 4.2, total_reviews: 8, is_verified: false, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
    title: 'Sunset Hike at Twin Peaks',
    description: 'Let\'s catch the sunset from the best viewpoint in SF! Moderate difficulty.',
    category: { id: 3, name: 'Outdoor Adventures', icon: '🏕️', color: '#22c55e' },
    latitude: 37.7544,
    longitude: -122.4477,
    location_name: 'Twin Peaks',
    start_time: new Date(Date.now() + 14400000).toISOString(),
    max_participants: 8,
    current_participants_count: 8,
    visibility: 'public',
    status: 'full',
    min_trust_score: 0,
    is_full: true,
    spots_left: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocation();
  const bottomSheetRef = useRef<BottomSheetMenuRef>(null);

  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivities();
    }
  }, [isAuthenticated, selectedCategory]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (currentLocation) {
        params.latitude = currentLocation.latitude;
        params.longitude = currentLocation.longitude;
        params.radius_km = 10;
      }

      const response = await activitiesApi.getActivities(params);
      setActivities(response.results || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Use mock data on error
      setActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity);
    bottomSheetRef.current?.expand();
  };

  const handleMapPress = () => {
    if (selectedActivity) {
      setSelectedActivity(null);
      bottomSheetRef.current?.close();
    }
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleViewDetails = () => {
    if (selectedActivity) {
      bottomSheetRef.current?.close();
      router.push(`/activity/${selectedActivity.id}`);
    }
  };

  const filteredActivities = selectedCategory
    ? activities.filter((activity) => activity.category.id === selectedCategory)
    : activities;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: isDark ? '#fff' : theme.colors.text.light }]}>
              Map View
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/create-activity')}
            >
              <FontAwesome name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Categories Filter */}
          <View style={styles.categoriesContainer}>
            <CategoryChip
              category={{ id: 0, name: 'All', icon: '🌟', color: theme.colors.primary }}
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {mockCategories.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                selected={selectedCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </View>
        </View>

        {/* Map */}
        <ActivityMapView
          activities={filteredActivities}
          userLocation={currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : undefined}
          onActivityPress={handleActivityPress}
          onMapPress={handleMapPress}
          loading={loading}
        />

        {/* Bottom Sheet */}
        {selectedActivity && (
          <BottomSheetMenu
            ref={bottomSheetRef}
          >
            <View style={styles.bottomSheetContent}>
              <ActivityCard
                activity={selectedActivity}
                onPress={handleViewDetails}
              />
            </View>
          </BottomSheetMenu>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
});
