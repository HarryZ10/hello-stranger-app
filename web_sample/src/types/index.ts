// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
  date_of_birth?: string;
  phone_number?: string;
  trust_score: number;
  total_reviews: number;
  is_verified: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  share_location: boolean;
  location_visibility: 'exact' | 'approximate' | 'hidden';
  personality_traits: UserPersonalityTrait[];
}

export interface PersonalityTrait {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface UserPersonalityTrait {
  id: number;
  personality_trait: PersonalityTrait;
  prominence_score: number;
}

export interface UserPreferences {
  id: number;
  discovery_radius_km: number;
  age_range_min: number;
  age_range_max: number;
  min_trust_score: number;
  notify_nearby_activities: boolean;
  notify_activity_invites: boolean;
  notify_messages: boolean;
  notify_friend_activities: boolean;
  show_online_status: boolean;
  allow_friend_requests: boolean;
}

// Activity Types
export interface ActivityCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Activity {
  id: number;
  creator: User;
  title: string;
  description?: string;
  category: ActivityCategory;
  latitude: number;
  longitude: number;
  location_name?: string;
  address?: string;
  start_time: string;
  end_time?: string;
  max_participants: number;
  current_participants_count: number;
  visibility: 'public' | 'private' | 'friends' | 'invite';
  status: 'active' | 'completed' | 'cancelled' | 'full';
  min_age?: number;
  min_trust_score: number;
  requirements?: string;
  cover_image?: string;
  is_full: boolean;
  spots_left: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: number;
  activity: number;
  user: User;
  status: 'invited' | 'requested' | 'accepted' | 'declined' | 'checked_in' | 'left';
  invited_by?: User;
  joined_at: string;
  checked_in_at?: string;
  checked_out_at?: string;
}

export interface ActivityComment {
  id: number;
  activity: number;
  user: User;
  content: string;
  parent?: number;
  created_at: string;
  updated_at: string;
}

// Location Types
export interface UserLocation {
  id: number;
  user: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  is_current: boolean;
  is_visible: boolean;
  current_activity?: string;
  timestamp: string;
}

export interface NearbyUser {
  user: User;
  location: UserLocation;
  distance_km: number;
}

export interface NearbyActivity {
  activity: Activity;
  distance_km: number;
}

// Social Types
export interface Connection {
  id: number;
  from_user: User;
  to_user: User;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  related_activity?: Activity;
  is_read: boolean;
  read_at?: string;
  sent_at: string;
}

export interface Conversation {
  partner: User;
  last_message: Message;
  unread_count: number;
}

// Safety Types
export interface UserReview {
  id: number;
  reviewer: User;
  reviewed_user: number;
  activity?: Activity;
  rating: number;
  safety_rating?: number;
  friendliness_rating?: number;
  reliability_rating?: number;
  comment?: string;
  created_at: string;
}

export interface Report {
  id: number;
  reporter: number;
  reported_user: User;
  reported_activity?: Activity;
  reason: 'harassment' | 'inappropriate' | 'spam' | 'fake' | 'safety' | 'scam' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Verification {
  id: number;
  user: number;
  verification_type: 'email' | 'phone' | 'id' | 'photo';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  created_at: string;
  verified_at?: string;
}

export interface EmergencyContact {
  id: number;
  user: number;
  name: string;
  phone_number: string;
  relationship?: string;
  notify_on_checkin: boolean;
  notify_on_activity_join: boolean;
}

// Auth Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
