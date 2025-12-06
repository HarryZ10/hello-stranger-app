import { theme } from '@/constants/theme';
import type { Activity } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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

export default function ActivityMapView({
  activities,
  userLocation,
  onActivityPress,
  onMapPress,
  loading = false,
}: ActivityMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: userLocation?.latitude || 37.7749,
    longitude: userLocation?.longitude || -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userLocation]);

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const fitToActivities = () => {
    if (activities.length > 0 && mapRef.current) {
      const coordinates = activities.map((activity) => ({
        latitude: activity.latitude,
        longitude: activity.longitude,
      }));
      
      if (userLocation) {
        coordinates.push(userLocation);
      }
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={onMapPress}
      >
        {/* Activity Markers */}
        {activities.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={{
              latitude: activity.latitude,
              longitude: activity.longitude,
            }}
            onPress={() => onActivityPress?.(activity)}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: activity.category.color || theme.colors.primary },
                ]}
              >
                <Text style={styles.markerEmoji}>{activity.category.icon}</Text>
              </View>
              {activity.is_full && (
                <View style={styles.fullBadge}>
                  <FontAwesome name="check" size={8} color="white" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
          disabled={!userLocation}
        >
          <FontAwesome name="location-arrow" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={fitToActivities}
          disabled={activities.length === 0}
        >
          <FontAwesome name="compress" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

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
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
  fullBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
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
} as const);
