import { theme } from '@/constants/theme';
import type { Activity } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
  distance?: number;
}

export default function ActivityCard({
  activity,
  onPress,
  distance,
}: ActivityCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCategoryColor = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      'Sports & Fitness': theme.colors.categories.sports,
      'Food & Dining': theme.colors.categories.food,
      'Outdoor Adventures': theme.colors.categories.outdoor,
      'Social & Meetups': theme.colors.categories.social,
      'Games & Entertainment': theme.colors.categories.games,
      'Arts & Culture': theme.colors.categories.arts,
      'Learning & Education': theme.colors.categories.learning,
      'Tech & Gaming': theme.colors.categories.tech,
      'Music & Concerts': theme.colors.categories.music,
      'Movies & TV': theme.colors.categories.movies,
      'Wellness & Mindfulness': theme.colors.categories.wellness,
      'Pets & Animals': theme.colors.categories.pets,
    };
    return colorMap[categoryName] || theme.colors.primary;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const categoryColor = activity.category
    ? getCategoryColor(activity.category.name)
    : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.card.dark
            : theme.colors.card.light,
          borderColor: isDark
            ? theme.colors.border.dark
            : theme.colors.border.light,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryIcon}>{activity.category?.icon || '📍'}</Text>
        <Text style={styles.categoryText}>
          {activity.category?.name || 'Activity'}
        </Text>
      </View>

      {/* Title & Description */}
      <Text
        style={[
          styles.title,
          {
            color: isDark ? theme.colors.text.dark : theme.colors.text.light,
          },
        ]}
        numberOfLines={2}
      >
        {activity.title}
      </Text>

      {activity.description && (
        <Text
          style={[
            styles.description,
            {
              color: isDark
                ? theme.colors.text.muted.dark
                : theme.colors.text.muted.light,
            },
          ]}
          numberOfLines={2}
        >
          {activity.description}
        </Text>
      )}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <FontAwesome
            name="clock-o"
            size={14}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
          <Text
            style={[
              styles.infoText,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            {formatDate(activity.start_time)} • {formatTime(activity.start_time)}
          </Text>
        </View>

        {distance !== undefined && (
          <View style={styles.infoItem}>
            <FontAwesome
              name="map-marker"
              size={14}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
            />
            <Text
              style={[
                styles.infoText,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      {/* Participants */}
      <View style={styles.footer}>
        <View style={styles.participants}>
          <FontAwesome
            name="users"
            size={14}
            color={categoryColor}
          />
          <Text
            style={[
              styles.participantsText,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            {activity.current_participants_count}/{activity.max_participants} joined
          </Text>
        </View>

        {activity.spots_left <= 3 && activity.spots_left > 0 && (
          <View style={styles.spotsLeftBadge}>
            <Text style={styles.spotsLeftText}>
              {activity.spots_left} spot{activity.spots_left !== 1 ? 's' : ''} left!
            </Text>
          </View>
        )}

        {activity.is_full && (
          <View style={[styles.spotsLeftBadge, { backgroundColor: theme.colors.gray[500] }]}>
            <Text style={styles.spotsLeftText}>Full</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {activity.location_name && (
        <View style={styles.locationRow}>
          <FontAwesome
            name="map-marker"
            size={12}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
          <Text
            style={[
              styles.locationText,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
            numberOfLines={1}
          >
            {activity.location_name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadow.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: theme.fontSize.sm,
  },
  spotsLeftBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  spotsLeftText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: 6,
  },
  locationText: {
    fontSize: theme.fontSize.xs,
    flex: 1,
  },
});
