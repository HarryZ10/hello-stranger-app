import type {
    EmergencyContact,
    PaginatedResponse,
    Report,
    UserReview,
    Verification,
} from '../../types';
import apiClient from '../client';

export interface CreateReviewData {
  reviewed_user_id: number;
  activity_id?: number;
  rating: number;
  safety_rating?: number;
  friendliness_rating?: number;
  reliability_rating?: number;
  comment?: string;
}

export interface CreateReportData {
  reported_user_id: number;
  reported_activity_id?: number;
  reason: 'harassment' | 'inappropriate' | 'spam' | 'fake' | 'safety' | 'scam' | 'other';
  description: string;
}

export interface EmergencyContactData {
  name: string;
  phone_number: string;
  relationship?: string;
  notify_on_checkin?: boolean;
  notify_on_activity_join?: boolean;
}

export const safetyApi = {
  // Reviews

  /**
   * Get reviews for a user
   */
  async getUserReviews(userId: number): Promise<PaginatedResponse<UserReview>> {
    const response = await apiClient.get<PaginatedResponse<UserReview>>(
      `/safety/reviews/user/${userId}/`
    );
    return response.data;
  },

  /**
   * Get my received reviews
   */
  async getMyReviews(): Promise<PaginatedResponse<UserReview>> {
    const response = await apiClient.get<PaginatedResponse<UserReview>>('/safety/reviews/received/');
    return response.data;
  },

  /**
   * Get reviews I've written
   */
  async getWrittenReviews(): Promise<PaginatedResponse<UserReview>> {
    const response = await apiClient.get<PaginatedResponse<UserReview>>('/safety/reviews/written/');
    return response.data;
  },

  /**
   * Create a review
   */
  async createReview(data: CreateReviewData): Promise<UserReview> {
    const response = await apiClient.post<UserReview>('/safety/reviews/', data);
    return response.data;
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: number, data: Partial<CreateReviewData>): Promise<UserReview> {
    const response = await apiClient.patch<UserReview>(`/safety/reviews/${reviewId}/`, data);
    return response.data;
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number): Promise<void> {
    await apiClient.delete(`/safety/reviews/${reviewId}/`);
  },

  // Reports

  /**
   * Create a report
   */
  async createReport(data: CreateReportData): Promise<Report> {
    const response = await apiClient.post<Report>('/safety/reports/', data);
    return response.data;
  },

  /**
   * Get my submitted reports
   */
  async getMyReports(): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get<PaginatedResponse<Report>>('/safety/reports/');
    return response.data;
  },

  // Verification

  /**
   * Request email verification
   */
  async requestEmailVerification(): Promise<Verification> {
    const response = await apiClient.post<Verification>('/safety/verifications/email/');
    return response.data;
  },

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<Verification> {
    const response = await apiClient.post<Verification>('/safety/verifications/email/verify/', {
      code,
    });
    return response.data;
  },

  /**
   * Request phone verification
   */
  async requestPhoneVerification(phoneNumber: string): Promise<Verification> {
    const response = await apiClient.post<Verification>('/safety/verifications/phone/', {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  /**
   * Verify phone with code
   */
  async verifyPhone(code: string): Promise<Verification> {
    const response = await apiClient.post<Verification>('/safety/verifications/phone/verify/', {
      code,
    });
    return response.data;
  },

  /**
   * Get my verification status
   */
  async getVerificationStatus(): Promise<Verification[]> {
    const response = await apiClient.get<Verification[]>('/safety/verifications/');
    return response.data;
  },

  // Emergency Contacts

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await apiClient.get<EmergencyContact[]>('/safety/emergency-contacts/');
    return response.data;
  },

  /**
   * Add emergency contact
   */
  async addEmergencyContact(data: EmergencyContactData): Promise<EmergencyContact> {
    const response = await apiClient.post<EmergencyContact>('/safety/emergency-contacts/', data);
    return response.data;
  },

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(
    contactId: number,
    data: Partial<EmergencyContactData>
  ): Promise<EmergencyContact> {
    const response = await apiClient.patch<EmergencyContact>(
      `/safety/emergency-contacts/${contactId}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(contactId: number): Promise<void> {
    await apiClient.delete(`/safety/emergency-contacts/${contactId}/`);
  },

  /**
   * Trigger SOS alert
   */
  async triggerSOS(latitude: number, longitude: number): Promise<void> {
    await apiClient.post('/safety/sos/', { latitude, longitude });
  },
};

export default safetyApi;
