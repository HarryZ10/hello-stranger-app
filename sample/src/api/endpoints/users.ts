import type {
    PaginatedResponse,
    PersonalityTrait,
    User,
    UserPreferences,
} from '../../types';
import apiClient from '../client';

export const usersApi = {
  /**
   * Get all personality traits
   */
  async getPersonalityTraits(): Promise<PersonalityTrait[]> {
    const response = await apiClient.get<PersonalityTrait[]>('/users/traits/');
    return response.data;
  },

  /**
   * Get user's personality traits
   */
  async getMyTraits(): Promise<PersonalityTrait[]> {
    const response = await apiClient.get<PersonalityTrait[]>('/users/profile/traits/');
    return response.data;
  },

  /**
   * Add personality trait to user
   */
  async addTrait(traitId: number, prominenceScore: number = 1): Promise<void> {
    await apiClient.post('/users/profile/traits/', {
      personality_trait_id: traitId,
      prominence_score: prominenceScore,
    });
  },

  /**
   * Remove personality trait from user
   */
  async removeTrait(traitId: number): Promise<void> {
    await apiClient.delete(`/users/profile/traits/${traitId}/`);
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>('/users/preferences/');
    return response.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.patch<UserPreferences>('/users/preferences/', data);
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}/`);
    return response.data;
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users/', {
      params: { search: query },
    });
    return response.data;
  },
};

export default usersApi;
