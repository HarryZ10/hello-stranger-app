import type {
    Activity,
    ActivityCategory,
    ActivityComment,
    ActivityParticipant,
    PaginatedResponse,
} from '../../types';
import apiClient from '../client';

export interface CreateActivityData {
  title: string;
  description?: string;
  category_id: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  address?: string;
  start_time: string;
  end_time?: string;
  max_participants?: number;
  visibility?: 'public' | 'private' | 'friends' | 'invite';
  min_age?: number;
  min_trust_score?: number;
  requirements?: string;
}

export interface ActivityFilters {
  category?: number;
  status?: 'active' | 'completed' | 'cancelled' | 'full';
  visibility?: 'public' | 'private' | 'friends' | 'invite';
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_after?: string;
  start_before?: string;
  page?: number;
}

export const activitiesApi = {
  /**
   * Get all activity categories
   */
  async getCategories(): Promise<ActivityCategory[]> {
    const response = await apiClient.get<ActivityCategory[]>('/activities/categories/');
    return response.data;
  },

  /**
   * Get activities with optional filters
   */
  async getActivities(filters?: ActivityFilters): Promise<PaginatedResponse<Activity>> {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/activities/', {
      params: filters,
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
  ): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>('/activities/nearby/', {
      params: { latitude, longitude, radius_km: radiusKm },
    });
    return response.data;
  },

  /**
   * Get activity by ID
   */
  async getActivity(activityId: number): Promise<Activity> {
    const response = await apiClient.get<Activity>(`/activities/${activityId}/`);
    return response.data;
  },

  /**
   * Create new activity
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    const response = await apiClient.post<Activity>('/activities/', data);
    return response.data;
  },

  /**
   * Update activity
   */
  async updateActivity(activityId: number, data: Partial<CreateActivityData>): Promise<Activity> {
    const response = await apiClient.patch<Activity>(`/activities/${activityId}/`, data);
    return response.data;
  },

  /**
   * Delete activity
   */
  async deleteActivity(activityId: number): Promise<void> {
    await apiClient.delete(`/activities/${activityId}/`);
  },

  /**
   * Get my activities (created by me)
   */
  async getMyActivities(): Promise<PaginatedResponse<Activity>> {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/activities/my-activities/');
    return response.data;
  },

  /**
   * Get activities I'm participating in
   */
  async getJoinedActivities(): Promise<PaginatedResponse<Activity>> {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/activities/joined/');
    return response.data;
  },

  // Participants

  /**
   * Get activity participants
   */
  async getParticipants(activityId: number): Promise<ActivityParticipant[]> {
    const response = await apiClient.get<ActivityParticipant[]>(
      `/activities/${activityId}/participants/`
    );
    return response.data;
  },

  /**
   * Request to join activity
   */
  async requestToJoin(activityId: number): Promise<ActivityParticipant> {
    const response = await apiClient.post<ActivityParticipant>(
      `/activities/${activityId}/join/`
    );
    return response.data;
  },

  /**
   * Leave activity
   */
  async leaveActivity(activityId: number): Promise<void> {
    await apiClient.post(`/activities/${activityId}/leave/`);
  },

  /**
   * Accept participant (for activity creator)
   */
  async acceptParticipant(activityId: number, participantId: number): Promise<void> {
    await apiClient.post(`/activities/${activityId}/participants/${participantId}/accept/`);
  },

  /**
   * Decline participant (for activity creator)
   */
  async declineParticipant(activityId: number, participantId: number): Promise<void> {
    await apiClient.post(`/activities/${activityId}/participants/${participantId}/decline/`);
  },

  /**
   * Check in to activity
   */
  async checkIn(activityId: number): Promise<void> {
    await apiClient.post(`/activities/${activityId}/check-in/`);
  },

  /**
   * Check out of activity
   */
  async checkOut(activityId: number): Promise<void> {
    await apiClient.post(`/activities/${activityId}/check-out/`);
  },

  // Comments

  /**
   * Get activity comments
   */
  async getComments(activityId: number): Promise<ActivityComment[]> {
    const response = await apiClient.get<ActivityComment[]>(
      `/activities/${activityId}/comments/`
    );
    return response.data;
  },

  /**
   * Add comment to activity
   */
  async addComment(activityId: number, content: string, parentId?: number): Promise<ActivityComment> {
    const response = await apiClient.post<ActivityComment>(
      `/activities/${activityId}/comments/`,
      { content, parent_id: parentId }
    );
    return response.data;
  },

  /**
   * Delete comment
   */
  async deleteComment(activityId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/activities/${activityId}/comments/${commentId}/`);
  },
};

export default activitiesApi;
