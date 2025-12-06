import type { AuthTokens, LoginResponse, RegisterRequest, User } from '../../types';
import apiClient, { tokenStorage } from '../client';

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/users/register/', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/users/login/', {
      email,
      password,
    });

    // Store tokens
    await tokenStorage.setTokens(response.data.access, response.data.refresh);

    return response.data;
  },

  /**
   * Logout - clear tokens
   */
  async logout(): Promise<void> {
    await tokenStorage.clearTokens();
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/users/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile/');
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/users/profile/', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};

export default authApi;
