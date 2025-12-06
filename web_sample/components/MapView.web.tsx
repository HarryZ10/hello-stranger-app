import { theme } from '@/constants/theme';
import type { Activity } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

// Dynamic imports for client-side only
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let useMap: any;
let L: any;

// Component to control map viewport
function MapController({ 
  center, 
  activities, 
  userLocation 
}: { 
  center: [number, number]; 
  activities: Activity[];
  userLocation?: { latitude: number; longitude: number };
}) {
  const map = useMap();
  const hasSetInitialView = useRef(false);

  useEffect(() => {
    if (!hasSetInitialView.current && (activities.length > 0 || userLocation)) {
      const bounds = L.latLngBounds([]);
      
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      activities.forEach((activity) => {
        bounds.extend([activity.latitude, activity.longitude]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        hasSetInitialView.current = true;
      }
    }
  }, [map, activities, userLocation]);

  return null;
}

// Web version using React Leaflet
export default function ActivityMapView({
  activities,
  userLocation,
  onActivityPress,
  loading = false,
}: ActivityMapViewProps) {
  const mapRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapLibsLoaded, setMapLibsLoaded] = useState(false);
  
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [37.7749, -122.4194];

  // Load map libraries only on client side
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      Promise.all([
        import('react-leaflet'),
        import('leaflet'),
        import('leaflet/dist/leaflet.css'),
      ]).then(([reactLeaflet, leaflet]) => {
        MapContainer = reactLeaflet.MapContainer;
        TileLayer = reactLeaflet.TileLayer;
        Marker = reactLeaflet.Marker;
        Popup = reactLeaflet.Popup;
        useMap = reactLeaflet.useMap;
        L = leaflet.default;
        setMapLibsLoaded(true);
      });
    }
  }, []);

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
    }
  };

  const fitToActivities = () => {
    if (mapRef.current && (activities.length > 0 || userLocation)) {
      const bounds = L.latLngBounds([]);
      
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      activities.forEach((activity) => {
        bounds.extend([activity.latitude, activity.longitude]);
      });

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  // Create custom icons for activities
  // Don't render map on server or if libs not loaded
  if (!isClient || !mapLibsLoaded || !L) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  const createActivityIcon = (activity: Activity) => {
    return L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: ${activity.category.color || theme.colors.primary};
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${activity.category.icon}
          ${activity.is_full ? '<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background-color: #22c55e; border: 2px solid white;"></div>' : ''}
        </div>
      `,
      className: 'custom-activity-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${theme.colors.primary};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <View style={styles.container}>
      <div style={{ width: '100%', height: '100%' }}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            center={defaultCenter} 
            activities={activities}
            userLocation={userLocation}
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserIcon()}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Activity Markers */}
          {activities.map((activity) => (
            <Marker
              key={activity.id}
              position={[activity.latitude, activity.longitude]}
              icon={createActivityIcon(activity)}
              eventHandlers={{
                click: () => onActivityPress?.(activity),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {activity.title}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    📍 {activity.location_name || 'Location not specified'}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    👥 {activity.current_participants_count}/{activity.max_participants} participants
                    {activity.is_full && ' • FULL'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.light,
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
    zIndex: 1000,
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
    zIndex: 2000,
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
    zIndex: 1000,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.light,
  },
});
