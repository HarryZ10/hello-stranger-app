import type { Connection, Conversation, Message, PaginatedResponse, User } from '../../types';
import apiClient from '../client';

export const socialApi = {
  // Connections / Friends

  /**
   * Get all connections
   */
  async getConnections(status?: 'pending' | 'accepted' | 'declined' | 'blocked'): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>('/social/connections/', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  /**
   * Get friends (accepted connections)
   */
  async getFriends(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/social/friends/');
    return response.data;
  },

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>('/social/connections/pending/');
    return response.data;
  },

  /**
   * Get sent friend requests
   */
  async getSentRequests(): Promise<Connection[]> {
    const response = await apiClient.get<Connection[]>('/social/connections/sent/');
    return response.data;
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: number): Promise<Connection> {
    const response = await apiClient.post<Connection>('/social/connections/', {
      to_user_id: userId,
    });
    return response.data;
  },

  /**
   * Accept friend request
   */
  async acceptRequest(connectionId: number): Promise<Connection> {
    const response = await apiClient.post<Connection>(
      `/social/connections/${connectionId}/accept/`
    );
    return response.data;
  },

  /**
   * Decline friend request
   */
  async declineRequest(connectionId: number): Promise<Connection> {
    const response = await apiClient.post<Connection>(
      `/social/connections/${connectionId}/decline/`
    );
    return response.data;
  },

  /**
   * Block user
   */
  async blockUser(userId: number): Promise<Connection> {
    const response = await apiClient.post<Connection>('/social/connections/block/', {
      user_id: userId,
    });
    return response.data;
  },

  /**
   * Unblock user
   */
  async unblockUser(connectionId: number): Promise<void> {
    await apiClient.delete(`/social/connections/${connectionId}/`);
  },

  /**
   * Remove friend
   */
  async removeFriend(connectionId: number): Promise<void> {
    await apiClient.delete(`/social/connections/${connectionId}/`);
  },

  // Messages

  /**
   * Get all conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/social/messages/conversations/');
    return response.data;
  },

  /**
   * Get messages with a specific user
   */
  async getConversation(userId: number, page: number = 1): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `/social/messages/conversation/${userId}/`,
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Send message to user
   */
  async sendMessage(
    recipientId: number,
    content: string,
    relatedActivityId?: number
  ): Promise<Message> {
    const response = await apiClient.post<Message>('/social/messages/', {
      recipient_id: recipientId,
      content,
      related_activity_id: relatedActivityId,
    });
    return response.data;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number): Promise<void> {
    await apiClient.post(`/social/messages/${messageId}/read/`);
  },

  /**
   * Mark all messages from user as read
   */
  async markConversationAsRead(userId: number): Promise<void> {
    await apiClient.post(`/social/messages/conversation/${userId}/read/`);
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/social/messages/${messageId}/`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/social/messages/unread-count/');
    return response.data.count;
  },
};

export default socialApi;
