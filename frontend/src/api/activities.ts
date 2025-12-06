// Activities service
import { apiClient } from './client';

export interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  created_at: string;
  participants_count: number;
  created_by: number;
  is_participant?: boolean;
}

export interface ActivityCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const activitiesService = {
  async listNearby(latitude: number, longitude: number, radius: number = 5) {
    return apiClient.get<{ results: Activity[] }>(
      `/activities/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  },

  async getActivity(id: number) {
    return apiClient.get<Activity>(`/activities/${id}/`);
  },

  async createActivity(data: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
  }) {
    return apiClient.post<Activity>('/activities/', data);
  },

  async joinActivity(id: number) {
    return apiClient.post(`/activities/${id}/join/`);
  },

  async leaveActivity(id: number) {
    return apiClient.post(`/activities/${id}/leave/`);
  },

  async getCategories() {
    return apiClient.get<{ results: ActivityCategory[] }>(
      '/activities/categories/'
    );
  },
};
