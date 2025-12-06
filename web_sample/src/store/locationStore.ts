import * as Location from 'expo-location';
import { create } from 'zustand';
import { locationsApi } from '../api';
import type { NearbyActivity, NearbyUser, UserLocation } from '../types';

interface LocationState {
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
  } | null;
  serverLocation: UserLocation | null;
  nearbyUsers: NearbyUser[];
  nearbyActivities: NearbyActivity[];
  isLoading: boolean;
  error: string | null;
  locationPermission: 'granted' | 'denied' | 'undetermined';

  // Actions
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  updateServerLocation: (currentActivity?: string) => Promise<void>;
  fetchNearbyUsers: (radiusKm?: number) => Promise<void>;
  fetchNearbyActivities: (radiusKm?: number) => Promise<void>;
  startWatchingLocation: () => Promise<Location.LocationSubscription | null>;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  serverLocation: null,
  nearbyUsers: [],
  nearbyActivities: [],
  isLoading: false,
  error: null,
  locationPermission: 'undetermined',

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      set({ locationPermission: granted ? 'granted' : 'denied' });
      return granted;
    } catch (error) {
      set({ error: 'Failed to request location permission' });
      return false;
    }
  },

  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ error: 'Location permission not granted', isLoading: false });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({
        currentLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          altitude: location.coords.altitude ?? undefined,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to get location', isLoading: false });
    }
  },

  updateServerLocation: async (currentActivity?: string) => {
    const { currentLocation } = get();
    if (!currentLocation) {
      await get().getCurrentLocation();
    }

    const location = get().currentLocation;
    if (!location) {
      set({ error: 'No location available' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const serverLocation = await locationsApi.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        altitude: location.altitude,
        current_activity: currentActivity,
      });
      set({ serverLocation, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update location', isLoading: false });
    }
  },

  fetchNearbyUsers: async (radiusKm = 10) => {
    const { currentLocation } = get();
    if (!currentLocation) {
      await get().getCurrentLocation();
    }

    const location = get().currentLocation;
    if (!location) return;

    set({ isLoading: true });
    try {
      const nearbyUsers = await locationsApi.getNearbyUsers(
        location.latitude,
        location.longitude,
        radiusKm
      );
      set({ nearbyUsers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch nearby users', isLoading: false });
    }
  },

  fetchNearbyActivities: async (radiusKm = 10) => {
    const { currentLocation } = get();
    if (!currentLocation) {
      await get().getCurrentLocation();
    }

    const location = get().currentLocation;
    if (!location) return;

    set({ isLoading: true });
    try {
      const nearbyActivities = await locationsApi.getNearbyActivities(
        location.latitude,
        location.longitude,
        radiusKm
      );
      set({ nearbyActivities, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch nearby activities', isLoading: false });
    }
  },

  startWatchingLocation: async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      set({ error: 'Location permission not granted' });
      return null;
    }

    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // Update every 30 seconds
        distanceInterval: 50, // Or when moved 50 meters
      },
      (location) => {
        set({
          currentLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
          },
        });
      }
    );
  },

  clearError: () => set({ error: null }),
}));

export default useLocationStore;
