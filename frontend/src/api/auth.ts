// Authentication service
import { apiClient } from './client';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
}

export const authService = {
  async register(data: RegisterData) {
    return apiClient.post<UserProfile>('/auth/register/', data);
  },

  async login(data: LoginData) {
    const response = await apiClient.post<TokenResponse>('/auth/login/', data);
    
    if (response.data?.access) {
      apiClient.setAccessToken(response.data.access);
    }
    
    return response;
  },

  async getProfile() {
    return apiClient.get<UserProfile>('/users/me/');
  },

  async updateProfile(data: Partial<UserProfile>) {
    return apiClient.put<UserProfile>('/users/me/', data);
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<TokenResponse>('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    if (response.data?.access) {
      apiClient.setAccessToken(response.data.access);
    }
    
    return response;
  },

  logout() {
    apiClient.setAccessToken('');
  },
};
