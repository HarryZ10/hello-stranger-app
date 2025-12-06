import UserAvatar from '@/components/UserAvatar';
import { theme } from '@/constants/theme';
import activitiesApi from '@/src/api/endpoints/activities';
import { useAuth } from '@/src/hooks/useAuth';
import type { Activity } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, isAuthenticated } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const activityId = Number(id);
        console.log('Fetching activity:', activityId);
        const data = await activitiesApi.getActivity(activityId);
        console.log('Activity fetched:', data);
        setActivity(data);
      } catch (err: any) {
        console.error('Failed to fetch activity:', err);
        setError(err.response?.data?.detail || 'Failed to load activity');
        Alert.alert('Error', 'Failed to load activity. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to join activities', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setIsJoining(true);
    try {
      // TODO: Call API to join
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'You have joined this activity!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join activity');
    }
    setIsJoining(false);
  };

  const handleShare = () => {
    // TODO: Implement share
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{ 
            color: isDark ? theme.colors.text.dark : theme.colors.text.light,
            marginTop: 12
          }}
        >
          Loading activity...
        </Text>
      </View>
    );
  }

  if (error || !activity) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
      >
        <FontAwesome name="exclamation-circle" size={48} color={theme.colors.error} />
        <Text
          style={{ 
            color: isDark ? theme.colors.text.dark : theme.colors.text.light,
            marginTop: 12,
            textAlign: 'center',
            paddingHorizontal: 32
          }}
        >
          {error || 'Activity not found'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { date, time } = formatDateTime(activity.start_time);
  const isCreator = user?.id === activity.creator.id;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare}>
              <FontAwesome
                name="share"
                size={20}
                color={isDark ? theme.colors.text.dark : theme.colors.text.light}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
        contentContainerStyle={styles.content}
      >
        {/* Hero Image Placeholder */}
        <View
          style={[
            styles.hero,
            { backgroundColor: activity.category?.color || theme.colors.primary },
          ]}
        >
          <Text style={styles.heroEmoji}>{activity.category?.icon || '📍'}</Text>
        </View>

        {/* Category & Status */}
        <View style={styles.badges}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: activity.category?.color || theme.colors.primary },
            ]}
          >
            <Text style={styles.categoryIcon}>{activity.category?.icon}</Text>
            <Text style={styles.categoryText}>{activity.category?.name}</Text>
          </View>
          {activity.is_full && (
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.gray[500] }]}>
              <Text style={styles.statusText}>Full</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
          ]}
        >
          {activity.title}
        </Text>

        {/* Creator */}
        <TouchableOpacity style={styles.creatorRow}>
          <UserAvatar user={activity.creator} size="sm" showBadge />
          <View style={styles.creatorInfo}>
            <Text
              style={[
                styles.creatorName,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              {activity.creator.display_name || activity.creator.username}
            </Text>
            <View style={styles.creatorMeta}>
              <FontAwesome name="star" size={12} color={theme.colors.warning} />
              <Text
                style={[
                  styles.creatorMetaText,
                  {
                    color: isDark
                      ? theme.colors.text.muted.dark
                      : theme.colors.text.muted.light,
                  },
                ]}
              >
                {activity.creator.trust_score ? activity.creator.trust_score.toFixed(1) : 'N/A'} • {activity.creator.total_reviews || 0} reviews
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[50],
              },
            ]}
          >
            <FontAwesome name="calendar" size={20} color={theme.colors.primary} />
            <View>
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
              >
                {date}
              </Text>
              <Text
                style={[
                  styles.infoCardSubtitle,
                  {
                    color: isDark
                      ? theme.colors.text.muted.dark
                      : theme.colors.text.muted.light,
                  },
                ]}
              >
                {time}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[50],
              },
            ]}
          >
            <FontAwesome name="map-marker" size={20} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
                numberOfLines={1}
              >
                {activity.location_name}
              </Text>
              <Text
                style={[
                  styles.infoCardSubtitle,
                  {
                    color: isDark
                      ? theme.colors.text.muted.dark
                      : theme.colors.text.muted.light,
                  },
                ]}
                numberOfLines={1}
              >
                {activity.address || 'Tap for directions'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[50],
              },
            ]}
          >
            <FontAwesome name="users" size={20} color={theme.colors.secondary} />
            <View>
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
              >
                {activity.current_participants_count} / {activity.max_participants} attending
              </Text>
              <Text
                style={[
                  styles.infoCardSubtitle,
                  {
                    color: isDark
                      ? theme.colors.text.muted.dark
                      : theme.colors.text.muted.light,
                  },
                ]}
              >
                {activity.spots_left} spots left
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
            ]}
          >
            About
          </Text>
          <Text
            style={[
              styles.description,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            {activity.description}
          </Text>
        </View>

        {/* Requirements */}
        {activity.requirements && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              What to Bring
            </Text>
            <Text
              style={[
                styles.description,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              {activity.requirements}
            </Text>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {!isCreator && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark
                ? theme.colors.background.dark
                : theme.colors.background.light,
              borderTopColor: isDark
                ? theme.colors.border.dark
                : theme.colors.border.light,
            },
          ]}
        >
          <View style={styles.priceInfo}>
            <Text
              style={[
                styles.spotsText,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              {activity.spots_left} spots left
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              activity.is_full && styles.joinButtonDisabled,
            ]}
            onPress={handleJoin}
            disabled={activity.is_full || isJoining}
          >
            <Text style={styles.joinButtonText}>
              {isJoining ? 'Joining...' : activity.is_full ? 'Full' : 'Join Activity'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  badges: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  creatorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  creatorMetaText: {
    fontSize: theme.fontSize.sm,
  },
  infoCards: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  infoCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  infoCardSubtitle: {
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.md,
    borderTopWidth: 1,
  },
  priceInfo: {},
  spotsText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  joinButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  joinButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
