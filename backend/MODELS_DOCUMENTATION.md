# 📊 Database Models Documentation

> Complete reference for all Django models in the Social Activity Finder application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Users App Models](#users-app-models)
4. [Activities App Models](#activities-app-models)
5. [Locations App Models](#locations-app-models)
6. [Social App Models](#social-app-models)
7. [Safety App Models](#safety-app-models)

---

## Overview

The application uses **5 Django apps** with **13 models** total:

| App | Models | Purpose |
|-----|--------|---------|
| `users` | 4 | User profiles, personality traits, preferences |
| `activities` | 4 | Activities, categories, participants, comments |
| `locations` | 1 | User location tracking |
| `social` | 2 | Friend connections, direct messages |
| `safety` | 4 | Reviews, reports, verifications, emergency contacts |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    USERS APP                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐      M:M      ┌────────────────────┐                      │
│  │       User       │◄────────────►│  PersonalityTrait   │                      │
│  └────────┬─────────┘    through    └────────────────────┘                      │
│           │              UserPersonalityTrait                                    │
│           │                                                                      │
│           │ 1:1                                                                  │
│           ▼                                                                      │
│  ┌──────────────────┐                                                           │
│  │  UserPreferences │                                                           │
│  └──────────────────┘                                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 ACTIVITIES APP                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐       1:M      ┌──────────────────┐                       │
│  │ ActivityCategory │◄──────────────│     Activity      │                       │
│  └──────────────────┘                └────────┬─────────┘                       │
│                                               │                                  │
│                              ┌────────────────┼────────────────┐                │
│                              │ 1:M            │ 1:M            │ 1:M            │
│                              ▼                ▼                ▼                │
│                 ┌─────────────────┐  ┌───────────────┐  ┌─────────────┐         │
│                 │ActivityParticipant│  │ActivityComment│  │   (User)   │         │
│                 └─────────────────┘  └───────────────┘  └─────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 LOCATIONS APP                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐                                                           │
│  │   UserLocation   │◄──────────── User (1:M)                                   │
│  └──────────────────┘                                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  SOCIAL APP                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐                   ┌──────────────────┐                    │
│  │    Connection    │                   │     Message      │                    │
│  │  (from_user →    │                   │  (sender →       │                    │
│  │   to_user)       │                   │   recipient)     │                    │
│  └──────────────────┘                   └──────────────────┘                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  SAFETY APP                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │    UserReview    │  │      Report      │  │   Verification   │              │
│  │ (reviewer →      │  │ (reporter →      │  │                  │              │
│  │  reviewed_user)  │  │  reported_user)  │  │                  │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
│  ┌──────────────────┐                                                           │
│  │ EmergencyContact │◄──────────── User (1:M)                                   │
│  └──────────────────┘                                                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Users App Models

### 📦 `PersonalityTrait`

Personality traits that users can add to their profiles (e.g., Friendly, Nerdy, Athletic).

**Database Table:** `personality_traits`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `name` | CharField(50) | Unique | Trait name (e.g., "Friendly") |
| `icon` | CharField(50) | Optional | Emoji or icon name (e.g., "😊") |
| `color` | CharField(7) | Default: `#6366f1` | Hex color code for UI |
| `description` | TextField | Optional | Description of the trait |

**Example Data:**
```json
{
  "id": 1,
  "name": "Friendly",
  "icon": "😊",
  "color": "#22c55e",
  "description": "Warm and welcoming to new people"
}
```

---

### 📦 `User`

Extended Django user model with social features.

**Database Table:** `users`

**Extends:** `django.contrib.auth.models.AbstractUser`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `email` | EmailField | Unique, Required | Primary login identifier |
| `username` | CharField(150) | Unique, Required | Username |
| `first_name` | CharField(150) | Optional | First name |
| `last_name` | CharField(150) | Optional | Last name |
| `password` | CharField(128) | Required | Hashed password |
| `bio` | TextField(500) | Optional | User biography |
| `avatar` | ImageField | Optional | Profile picture (uploads to `avatars/`) |
| `display_name` | CharField(100) | Optional | Public display name |
| `date_of_birth` | DateField | Optional | Birth date |
| `phone_number` | CharField(20) | Optional | Phone number |
| `trust_score` | DecimalField(3,2) | Default: 0.00, Range: 0-5 | Average rating from reviews |
| `total_reviews` | PositiveIntegerField | Default: 0 | Count of reviews received |
| `is_verified` | BooleanField | Default: False | Overall verification status |
| `is_phone_verified` | BooleanField | Default: False | Phone verification status |
| `is_email_verified` | BooleanField | Default: False | Email verification status |
| `share_location` | BooleanField | Default: True | Whether to share location |
| `location_visibility` | CharField(20) | Choices, Default: `approximate` | Location precision level |
| `is_active` | BooleanField | Default: True | Account active status |
| `is_staff` | BooleanField | Default: False | Admin access |
| `date_joined` | DateTimeField | Auto | Registration timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Location Visibility Choices:**
| Value | Display |
|-------|---------|
| `exact` | Exact Location |
| `approximate` | Approximate (within 1km) |
| `hidden` | Hidden |

**Relationships:**
- `personality_traits` → ManyToMany to `PersonalityTrait` through `UserPersonalityTrait`

**Methods:**
- `update_trust_score()` - Recalculates trust_score based on UserReview ratings

---

### 📦 `UserPersonalityTrait`

Junction table linking users to their personality traits with prominence scores.

**Database Table:** `user_personality_traits`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `user` | ForeignKey | → User, CASCADE | The user |
| `personality_trait` | ForeignKey | → PersonalityTrait, CASCADE | The trait |
| `prominence_score` | PositiveIntegerField | Range: 1-5, Default: 1 | How prominently to display (5 = most prominent) |

**Unique Constraint:** `(user, personality_trait)`

---

### 📦 `UserPreferences`

User preferences for discovery, notifications, and privacy.

**Database Table:** `user_preferences`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `user` | OneToOneField | → User, CASCADE | The user |
| `discovery_radius_km` | PositiveIntegerField | Default: 10 | Search radius in kilometers |
| `age_range_min` | PositiveIntegerField | Default: 18 | Minimum age for matches |
| `age_range_max` | PositiveIntegerField | Default: 99 | Maximum age for matches |
| `min_trust_score` | DecimalField(3,2) | Default: 0.00, Range: 0-5 | Minimum trust score filter |
| `notify_nearby_activities` | BooleanField | Default: True | Notify about nearby activities |
| `notify_activity_invites` | BooleanField | Default: True | Notify about invites |
| `notify_messages` | BooleanField | Default: True | Notify about messages |
| `notify_friend_activities` | BooleanField | Default: True | Notify about friend activities |
| `show_online_status` | BooleanField | Default: True | Show online status |
| `allow_friend_requests` | BooleanField | Default: True | Allow friend requests |

---

## Activities App Models

### 📦 `ActivityCategory`

Categories for organizing activities.

**Database Table:** `activity_categories`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `name` | CharField(50) | Unique | Category name |
| `icon` | CharField(50) | Required | Emoji/icon for category |
| `color` | CharField(7) | Default: `#6366f1` | Hex color code |
| `description` | TextField | Optional | Category description |
| `is_active` | BooleanField | Default: True | Whether category is available |

**Example Data:**
```json
{
  "id": 1,
  "name": "Sports & Fitness",
  "icon": "⚽",
  "color": "#ef4444",
  "description": "Physical activities and sports"
}
```

**Default Categories:**
- Sports & Fitness ⚽
- Food & Dining 🍽️
- Outdoor Adventures 🏕️
- Social & Meetups 👥
- Games & Entertainment 🎮
- Arts & Culture 🎭
- Learning & Education 📖
- Tech & Gaming 💻
- Music & Concerts 🎵
- Movies & TV 🎬
- Wellness & Mindfulness 🧘
- Pets & Animals 🐕

---

### 📦 `Activity`

Main model for user-created activities/events.

**Database Table:** `activities`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `creator` | ForeignKey | → User, CASCADE | Activity creator |
| `title` | CharField(200) | Required | Activity title |
| `description` | TextField | Optional | Detailed description |
| `category` | ForeignKey | → ActivityCategory, SET_NULL | Activity category |
| `latitude` | DecimalField(9,6) | Required | Location latitude |
| `longitude` | DecimalField(9,6) | Required | Location longitude |
| `location_name` | CharField(255) | Optional | Human-readable location |
| `address` | CharField(500) | Optional | Full address |
| `start_time` | DateTimeField | Required | When activity starts |
| `end_time` | DateTimeField | Optional | When activity ends |
| `max_participants` | PositiveIntegerField | Default: 10 | Maximum attendees |
| `current_participants_count` | PositiveIntegerField | Default: 0 | Current attendee count |
| `visibility` | CharField(20) | Choices, Default: `public` | Who can see/join |
| `status` | CharField(20) | Choices, Default: `active` | Activity status |
| `min_age` | PositiveIntegerField | Optional | Minimum age requirement |
| `min_trust_score` | DecimalField(3,2) | Default: 0.00 | Minimum trust score to join |
| `requirements` | TextField | Optional | Additional requirements |
| `cover_image` | ImageField | Optional | Cover image |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Visibility Choices:**
| Value | Display | Description |
|-------|---------|-------------|
| `public` | Public | Anyone can see and join |
| `private` | Private | Only creator can see |
| `friends` | Friends Only | Only friends can see/join |
| `invite` | Invite Only | Must be invited to join |

**Status Choices:**
| Value | Display | Description |
|-------|---------|-------------|
| `active` | Active | Activity is open |
| `completed` | Completed | Activity has ended |
| `cancelled` | Cancelled | Activity was cancelled |
| `full` | Full | No more spots available |

**Indexes:**
- `(latitude, longitude)` - Geospatial queries
- `(start_time)` - Time-based sorting
- `(status)` - Status filtering
- `(category)` - Category filtering

**Computed Properties:**
- `is_full` → Boolean: `current_participants_count >= max_participants`
- `spots_left` → Integer: `max_participants - current_participants_count`
- `is_active` → Boolean: status is active AND start_time > now

**Methods:**
- `update_participant_count()` - Syncs participant count and updates status

---

### 📦 `ActivityParticipant`

Junction table for activity participants with participation status.

**Database Table:** `activity_participants`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `activity` | ForeignKey | → Activity, CASCADE | The activity |
| `user` | ForeignKey | → User, CASCADE | The participant |
| `status` | CharField(20) | Choices, Default: `requested` | Participation status |
| `invited_by` | ForeignKey | → User, SET_NULL, Optional | Who invited this user |
| `joined_at` | DateTimeField | Auto | When user requested/was invited |
| `checked_in_at` | DateTimeField | Optional | When user checked in |
| `checked_out_at` | DateTimeField | Optional | When user checked out |

**Status Choices:**
| Value | Display | Description |
|-------|---------|-------------|
| `invited` | Invited | User was invited |
| `requested` | Requested to Join | User requested to join |
| `accepted` | Accepted | User is confirmed |
| `declined` | Declined | User declined/was rejected |
| `checked_in` | Checked In | User is at the activity |
| `left` | Left | User left the activity |

**Unique Constraint:** `(activity, user)`

**Lifecycle Hooks:**
- On save/delete: Calls `activity.update_participant_count()`

---

### 📦 `ActivityComment`

Comments on activities with optional threading.

**Database Table:** `activity_comments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `activity` | ForeignKey | → Activity, CASCADE | The activity |
| `user` | ForeignKey | → User, CASCADE | Comment author |
| `content` | TextField(1000) | Required | Comment content |
| `parent` | ForeignKey | → self, CASCADE, Optional | Parent comment (for replies) |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

---

## Locations App Models

### 📦 `UserLocation`

Stores user location data for nearby discovery features.

**Database Table:** `user_locations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `user` | ForeignKey | → User, CASCADE | The user |
| `latitude` | DecimalField(9,6) | Required | Location latitude |
| `longitude` | DecimalField(9,6) | Required | Location longitude |
| `accuracy` | FloatField | Optional | GPS accuracy in meters |
| `altitude` | FloatField | Optional | Altitude in meters |
| `is_current` | BooleanField | Default: True | Is this the current location |
| `is_visible` | BooleanField | Default: True | Is location visible to others |
| `current_activity` | CharField(200) | Optional | What user is currently doing |
| `timestamp` | DateTimeField | Auto | When location was recorded |

**Indexes:**
- `(latitude, longitude)` - Geospatial queries
- `(is_current, is_visible)` - Filtering active locations
- `(-timestamp)` - Time-based sorting

**Lifecycle Hooks:**
- On save with `is_current=True`: Sets all other user locations to `is_current=False`

**Static Methods:**
- `haversine_distance(lat1, lon1, lat2, lon2)` → Float (km)
  - Calculates great-circle distance between two coordinates

**Class Methods:**
- `get_nearby_users(latitude, longitude, radius_km=10, exclude_user=None)`
  - Returns list of `{user, location, distance_km}` within radius
  
- `get_nearby_activities(latitude, longitude, radius_km=10)`
  - Returns list of `{activity, distance_km}` within radius

---

## Social App Models

### 📦 `Connection`

Friend/follower connections between users.

**Database Table:** `connections`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `from_user` | ForeignKey | → User, CASCADE | User who sent request |
| `to_user` | ForeignKey | → User, CASCADE | User who received request |
| `status` | CharField(20) | Choices, Default: `pending` | Connection status |
| `created_at` | DateTimeField | Auto | When connection was created |
| `updated_at` | DateTimeField | Auto | Last status change |

**Status Choices:**
| Value | Display | Description |
|-------|---------|-------------|
| `pending` | Pending | Request awaiting response |
| `accepted` | Accepted | Users are friends |
| `declined` | Declined | Request was rejected |
| `blocked` | Blocked | User is blocked |

**Unique Constraint:** `(from_user, to_user)`

**Class Methods:**
- `are_friends(user1, user2)` → Boolean
  - Checks if two users have an accepted connection
  
- `get_friends(user)` → QuerySet[User]
  - Returns all users with accepted connections to given user
  
- `is_blocked(user1, user2)` → Boolean
  - Checks if either user has blocked the other

---

### 📦 `Message`

Direct messages between users.

**Database Table:** `messages`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `sender` | ForeignKey | → User, CASCADE | Message sender |
| `recipient` | ForeignKey | → User, CASCADE | Message recipient |
| `content` | TextField(5000) | Required | Message content |
| `related_activity` | ForeignKey | → Activity, SET_NULL, Optional | Related activity context |
| `is_read` | BooleanField | Default: False | Whether message was read |
| `read_at` | DateTimeField | Optional | When message was read |
| `sent_at` | DateTimeField | Auto | When message was sent |

**Indexes:**
- `(sender, recipient)` - Conversation queries
- `(-sent_at)` - Time-based sorting

**Class Methods:**
- `get_conversation(user1, user2)` → QuerySet[Message]
  - Returns all messages between two users, ordered by sent_at
  
- `get_conversations_for_user(user)` → List[dict]
  - Returns list of `{partner_id, last_message, unread_count}` for all conversations

---

## Safety App Models

### 📦 `UserReview`

Reviews and ratings between users after activities.

**Database Table:** `user_reviews`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `reviewer` | ForeignKey | → User, CASCADE | User giving the review |
| `reviewed_user` | ForeignKey | → User, CASCADE | User being reviewed |
| `activity` | ForeignKey | → Activity, SET_NULL, Optional | Activity context |
| `rating` | PositiveIntegerField | Range: 1-5, Required | Overall rating |
| `safety_rating` | PositiveIntegerField | Range: 1-5, Optional | Safety rating |
| `friendliness_rating` | PositiveIntegerField | Range: 1-5, Optional | Friendliness rating |
| `reliability_rating` | PositiveIntegerField | Range: 1-5, Optional | Reliability rating |
| `comment` | TextField(1000) | Optional | Review comment |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Unique Constraint:** `(reviewer, reviewed_user, activity)`

**Lifecycle Hooks:**
- On save: Calls `reviewed_user.update_trust_score()` to recalculate trust score

---

### 📦 `Report`

Safety reports for violations or concerns.

**Database Table:** `reports`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `reporter` | ForeignKey | → User, CASCADE | User submitting report |
| `reported_user` | ForeignKey | → User, CASCADE | User being reported |
| `reported_activity` | ForeignKey | → Activity, SET_NULL, Optional | Related activity |
| `reason` | CharField(20) | Choices, Required | Report category |
| `description` | TextField | Required | Detailed description |
| `status` | CharField(20) | Choices, Default: `pending` | Report status |
| `admin_notes` | TextField | Optional | Admin internal notes |
| `resolved_by` | ForeignKey | → User, SET_NULL, Optional | Admin who resolved |
| `resolved_at` | DateTimeField | Optional | Resolution timestamp |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Reason Choices:**
| Value | Display |
|-------|---------|
| `harassment` | Harassment |
| `inappropriate` | Inappropriate Behavior |
| `spam` | Spam |
| `fake` | Fake Profile |
| `safety` | Safety Concern |
| `scam` | Scam/Fraud |
| `other` | Other |

**Status Choices:**
| Value | Display |
|-------|---------|
| `pending` | Pending Review |
| `reviewing` | Under Review |
| `resolved` | Resolved |
| `dismissed` | Dismissed |

---

### 📦 `Verification`

User verification records for email, phone, ID verification.

**Database Table:** `verifications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `user` | ForeignKey | → User, CASCADE | User being verified |
| `verification_type` | CharField(20) | Choices, Required | Type of verification |
| `status` | CharField(20) | Choices, Default: `pending` | Verification status |
| `verification_code` | CharField(20) | Optional | Verification code (for email/phone) |
| `expires_at` | DateTimeField | Optional | Code expiration time |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `verified_at` | DateTimeField | Optional | Verification timestamp |

**Type Choices:**
| Value | Display |
|-------|---------|
| `email` | Email Verification |
| `phone` | Phone Verification |
| `id` | ID Verification |
| `photo` | Photo Verification |

**Status Choices:**
| Value | Display |
|-------|---------|
| `pending` | Pending |
| `verified` | Verified |
| `rejected` | Rejected |
| `expired` | Expired |

**Lifecycle Hooks:**
- On save with `status=verified`:
  - Updates `user.is_email_verified` or `user.is_phone_verified`
  - Sets `user.is_verified = True` if both email and phone are verified

---

### 📦 `EmergencyContact`

Emergency contacts for safety features.

**Database Table:** `emergency_contacts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, Auto | Primary key |
| `user` | ForeignKey | → User, CASCADE | User who added contact |
| `name` | CharField(100) | Required | Contact name |
| `phone_number` | CharField(20) | Required | Contact phone number |
| `relationship` | CharField(50) | Optional | Relationship (e.g., "Mom", "Friend") |
| `notify_on_checkin` | BooleanField | Default: False | Notify when user checks in |
| `notify_on_activity_join` | BooleanField | Default: False | Notify when user joins activity |
| `created_at` | DateTimeField | Auto | Creation timestamp |

---

## Quick Reference: All Tables

| Table Name | Model | App |
|------------|-------|-----|
| `users` | User | users |
| `personality_traits` | PersonalityTrait | users |
| `user_personality_traits` | UserPersonalityTrait | users |
| `user_preferences` | UserPreferences | users |
| `activity_categories` | ActivityCategory | activities |
| `activities` | Activity | activities |
| `activity_participants` | ActivityParticipant | activities |
| `activity_comments` | ActivityComment | activities |
| `user_locations` | UserLocation | locations |
| `connections` | Connection | social |
| `messages` | Message | social |
| `user_reviews` | UserReview | safety |
| `reports` | Report | safety |
| `verifications` | Verification | safety |
| `emergency_contacts` | EmergencyContact | safety |
