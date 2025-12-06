import type { LocationSubscription } from 'expo-location';
import { useEffect, useRef } from 'react';
import { useLocationStore } from '../store/locationStore';

interface UseLocationOptions {
  /** Auto-fetch location on mount */
  autoFetch?: boolean;
  /** Watch location changes */
  watch?: boolean;
  /** Auto-update server with new location */
  syncToServer?: boolean;
  /** Current activity to send with location update */
  currentActivity?: string;
}

/**
 * Hook to access location state and actions
 */
export function useLocation(options: UseLocationOptions = {}) {
  const {
    autoFetch = false,
    watch = false,
    syncToServer = false,
    currentActivity,
  } = options;

  const {
    currentLocation,
    serverLocation,
    nearbyUsers,
    nearbyActivities,
    isLoading,
    error,
    locationPermission,
    requestPermission,
    getCurrentLocation,
    updateServerLocation,
    fetchNearbyUsers,
    fetchNearbyActivities,
    startWatchingLocation,
    clearError,
  } = useLocationStore();

  const subscriptionRef = useRef<LocationSubscription | null>(null);

  // Auto-fetch location on mount
  useEffect(() => {
    if (autoFetch && locationPermission === 'granted') {
      getCurrentLocation();
    }
  }, [autoFetch, locationPermission]);

  // Watch location changes
  useEffect(() => {
    if (watch && locationPermission === 'granted') {
      startWatchingLocation().then((subscription) => {
        subscriptionRef.current = subscription;
      });

      return () => {
        subscriptionRef.current?.remove();
      };
    }
  }, [watch, locationPermission]);

  // Sync to server when location changes
  useEffect(() => {
    if (syncToServer && currentLocation) {
      updateServerLocation(currentActivity);
    }
  }, [syncToServer, currentLocation?.latitude, currentLocation?.longitude]);

  return {
    currentLocation,
    serverLocation,
    nearbyUsers,
    nearbyActivities,
    isLoading,
    error,
    locationPermission,
    requestPermission,
    getCurrentLocation,
    updateServerLocation,
    fetchNearbyUsers,
    fetchNearbyActivities,
    clearError,
  };
}

export default useLocation;
