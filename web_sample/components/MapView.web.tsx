import { theme } from '@/constants/theme';
import type { Activity } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivityMapViewProps {
  activities: Activity[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onActivityPress?: (activity: Activity) => void;
  onMapPress?: () => void;
  loading?: boolean;
}

// Simplified web version - displays activities in a list format
// For a full map experience, integrate with a web mapping library like Leaflet or Mapbox
export default function ActivityMapView({
  activities,
  userLocation,
  onActivityPress,
  loading = false,
}: ActivityMapViewProps) {
  const centerOnUser = () => {
    // Placeholder for web implementation
    console.log('Center on user:', userLocation);
  };

  const fitToActivities = () => {
    // Placeholder for web implementation
    console.log('Fit to activities');
  };

  return (
    <View style={styles.container}>
      <View style={styles.webNotice}>
        <FontAwesome name="info-circle" size={20} color={theme.colors.primary} />
        <Text style={styles.noticeText}>
          Web map view coming soon! For now, here's a list of activities:
        </Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="map-marker" size={48} color={theme.colors.gray[400]} />
            <Text style={styles.emptyText}>No activities to display</Text>
          </View>
        ) : (
          activities.map((activity, index) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => onActivityPress?.(activity)}
            >
              <View
                style={[
                  styles.activityMarker,
                  { backgroundColor: activity.category.color || theme.colors.primary },
                ]}
              >
                <Text style={styles.markerEmoji}>{activity.category.icon}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityLocation}>
                  <FontAwesome name="map-marker" size={12} color={theme.colors.gray[500]} />{' '}
                  {activity.location_name || 'Location not specified'}
                </Text>
                <Text style={styles.activityMeta}>
                  {activity.current_participants_count}/{activity.max_participants} participants
                  {activity.is_full && ' • FULL'}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Map Controls - Disabled for web */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.disabledButton]}
          onPress={centerOnUser}
          disabled={true}
        >
          <FontAwesome name="location-arrow" size={20} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.disabledButton]}
          onPress={fitToActivities}
          disabled={true}
        >
          <FontAwesome name="compress" size={20} color={theme.colors.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Activity Count Badge */}
      {activities.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.primaryLight + '20',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.light,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.gray[500],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  activityMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  markerEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.light,
  },
  activityLocation: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  activityMeta: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.light,
  },
});
