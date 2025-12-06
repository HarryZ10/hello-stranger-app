import type { NearbyActivity, NearbyUser, UserLocation } from '../../types';
import apiClient from '../client';

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  current_activity?: string;
}

export const locationsApi = {
  /**
   * Update current location
   */
  async updateLocation(data: UpdateLocationData): Promise<UserLocation> {
    const response = await apiClient.post<UserLocation>('/locations/', data);
    return response.data;
  },

  /**
   * Get my location history
   */
  async getMyLocations(): Promise<UserLocation[]> {
    const response = await apiClient.get<UserLocation[]>('/locations/');
    return response.data;
  },

  /**
   * Get my current location
   */
  async getCurrentLocation(): Promise<UserLocation | null> {
    const response = await apiClient.get<UserLocation>('/locations/current/');
    return response.data;
  },

  /**
   * Get nearby users
   */
  async getNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<NearbyUser[]> {
    const response = await apiClient.get<NearbyUser[]>('/locations/nearby/users/', {
      params: { latitude, longitude, radius_km: radiusKm },
    });
    return response.data;
  },

  /**
   * Get nearby activities
   */
  async getNearbyActivities(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<NearbyActivity[]> {
    const response = await apiClient.get<NearbyActivity[]>('/locations/nearby/activities/', {
      params: { latitude, longitude, radius_km: radiusKm },
    });
    return response.data;
  },

  /**
   * Toggle location visibility
   */
  async setLocationVisibility(visible: boolean): Promise<void> {
    await apiClient.patch('/users/profile/', {
      share_location: visible,
    });
  },

  /**
   * Delete location history
   */
  async clearLocationHistory(): Promise<void> {
    await apiClient.delete('/locations/history/');
  },
};

export default locationsApi;
