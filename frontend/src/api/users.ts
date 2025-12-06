// Users service
import { apiClient } from './client';

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance in km for nearby users
}

export interface PersonalityTrait {
  id: number;
  name: string;
  emoji: string;
}

export const usersService = {
  async getProfile() {
    return apiClient.get<UserProfile>('/users/me/');
  },

  async updateProfile(data: Partial<UserProfile>) {
    return apiClient.put<UserProfile>('/users/me/', data);
  },

  async getNearbyUsers(latitude: number, longitude: number, radius: number = 5) {
    return apiClient.get<{ results: UserProfile[] }>(
      `/users/nearby/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  },

  async getUserProfile(userId: number) {
    return apiClient.get<UserProfile>(`/users/${userId}/`);
  },

  async getPersonalityTraits() {
    return apiClient.get<{ results: PersonalityTrait[] }>('/traits/');
  },

  async addPersonalityTrait(traitId: number) {
    return apiClient.post(`/users/me/traits/`, { trait_id: traitId });
  },

  async removePersonalityTrait(traitId: number) {
    return apiClient.delete(`/users/me/traits/${traitId}/`);
  },

  async updatePreferences(data: {
    min_age?: number;
    max_age?: number;
    preferred_radius?: number;
    interests?: string[];
  }) {
    return apiClient.put('/users/me/preferences/', data);
  },
};
