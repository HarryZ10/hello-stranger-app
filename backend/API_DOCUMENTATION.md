# 🌍 Social Activity Finder - API Documentation

> A location-based social networking application that connects people based on real-time activities happening nearby, with personality matching and safety features.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Complete User Journey Example](#complete-user-journey-example)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

---

## Overview

### Base URL
```
http://localhost:8000/api/
```

### Authentication
All endpoints (except registration and login) require JWT Bearer token authentication.

```
Authorization: Bearer <access_token>
```

### Response Format
All responses are JSON. Paginated lists include:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Authentication Flow

### Step 1: Register a New User

**Endpoint:** `POST /api/auth/register/`

**Request:**
```json
{
  "email": "sarah@example.com",
  "username": "sarah_jane",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "Sarah",
  "last_name": "Jane",
  "display_name": "Sarah-Jane"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "sarah@example.com",
  "username": "sarah_jane",
  "first_name": "Sarah",
  "last_name": "Jane",
  "display_name": "Sarah-Jane"
}
```

---

### Step 2: Login to Get JWT Tokens

**Endpoint:** `POST /api/auth/login/`

**Request:**
```json
{
  "email": "sarah@example.com",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 💡 **Important:** Save the `access` token for API requests. Use `refresh` token to get a new access token when it expires.

---

### Step 3: Refresh Token (When Access Token Expires)

**Endpoint:** `POST /api/auth/refresh/`

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Complete User Journey Example

### 🎭 Scenario: Sarah Wants to Find People for a Picnic

Sarah just moved to San Francisco and wants to meet new people. She's looking for friendly, outgoing people to have a picnic with in Golden Gate Park.

---

### Journey Step 1: Sarah Sets Up Her Profile

#### 1.1 Get Current Profile
**Endpoint:** `GET /api/users/me/`

**Response:**
```json
{
  "id": 1,
  "email": "sarah@example.com",
  "username": "sarah_jane",
  "first_name": "Sarah",
  "last_name": "Jane",
  "display_name": "Sarah-Jane",
  "bio": "",
  "avatar": null,
  "date_of_birth": null,
  "phone_number": "",
  "trust_score": "0.00",
  "total_reviews": 0,
  "is_verified": false,
  "is_email_verified": false,
  "is_phone_verified": false,
  "share_location": true,
  "location_visibility": "approximate",
  "personality_traits_list": [],
  "preferences": null,
  "date_joined": "2025-12-05T20:00:00Z"
}
```

#### 1.2 Update Profile with Bio and Info
**Endpoint:** `PATCH /api/users/me/`

**Request:**
```json
{
  "bio": "Just moved to SF! Love hiking, picnics, and meeting new friends 🌸",
  "display_name": "Sarah-Jane",
  "date_of_birth": "1995-06-15",
  "location_visibility": "approximate"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "bio": "Just moved to SF! Love hiking, picnics, and meeting new friends 🌸",
  "display_name": "Sarah-Jane",
  ...
}
```

---

### Journey Step 2: Sarah Adds Personality Traits

#### 2.1 View Available Personality Traits
**Endpoint:** `GET /api/traits/`

**Response:**
```json
{
  "count": 12,
  "results": [
    {"id": 1, "name": "Friendly", "icon": "😊", "color": "#22c55e", "description": "Warm and welcoming to new people"},
    {"id": 2, "name": "Nerdy", "icon": "🤓", "color": "#8b5cf6", "description": "Loves learning and intellectual discussions"},
    {"id": 3, "name": "Athletic", "icon": "💪", "color": "#ef4444", "description": "Active and sporty lifestyle"},
    {"id": 4, "name": "Creative", "icon": "🎨", "color": "#f59e0b", "description": "Artistic and imaginative"},
    {"id": 5, "name": "Adventurous", "icon": "🏔️", "color": "#06b6d4", "description": "Loves exploring and trying new things"},
    {"id": 6, "name": "Foodie", "icon": "🍕", "color": "#ec4899", "description": "Passionate about food and culinary experiences"},
    {"id": 7, "name": "Chill", "icon": "😌", "color": "#6366f1", "description": "Relaxed and easy-going personality"},
    {"id": 8, "name": "Outgoing", "icon": "🎉", "color": "#f97316", "description": "Social and loves meeting new people"},
    {"id": 9, "name": "Bookworm", "icon": "📚", "color": "#84cc16", "description": "Loves reading and literature"},
    {"id": 10, "name": "Gamer", "icon": "🎮", "color": "#a855f7", "description": "Passionate about video games"},
    {"id": 11, "name": "Music Lover", "icon": "🎵", "color": "#14b8a6", "description": "Lives and breathes music"},
    {"id": 12, "name": "Nature Lover", "icon": "🌿", "color": "#22c55e", "description": "Enjoys the outdoors and nature"}
  ]
}
```

#### 2.2 Add Personality Traits to Profile
**Endpoint:** `POST /api/users/me/traits/`

**Request (Add "Friendly" with high prominence):**
```json
{
  "trait_id": 1,
  "prominence_score": 5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "trait": {
    "id": 1,
    "name": "Friendly",
    "icon": "😊",
    "color": "#22c55e",
    "description": "Warm and welcoming to new people"
  },
  "prominence_score": 5
}
```

> 💡 **Tip:** Repeat this to add more traits like "Outgoing" (id: 8) and "Foodie" (id: 6)

---

### Journey Step 3: Sarah Updates Her Location

#### 3.1 Share Current Location
**Endpoint:** `POST /api/location/update/`

**Request:**
```json
{
  "latitude": 37.7694,
  "longitude": -122.4862,
  "accuracy": 10.5,
  "current_activity": "Looking for picnic buddies!",
  "is_visible": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "latitude": "37.769400",
  "longitude": "-122.486200",
  "accuracy": 10.5,
  "altitude": null,
  "is_current": true,
  "is_visible": true,
  "current_activity": "Looking for picnic buddies!",
  "timestamp": "2025-12-05T14:30:00Z"
}
```

---

### Journey Step 4: Sarah Creates a Picnic Activity

#### 4.1 View Activity Categories
**Endpoint:** `GET /api/activities/categories/`

**Response:**
```json
{
  "count": 12,
  "results": [
    {"id": 1, "name": "Sports & Fitness", "icon": "⚽", "color": "#ef4444", "description": "Physical activities and sports"},
    {"id": 2, "name": "Food & Dining", "icon": "🍽️", "color": "#f59e0b", "description": "Restaurants, cafes, and food experiences"},
    {"id": 3, "name": "Outdoor Adventures", "icon": "🏕️", "color": "#22c55e", "description": "Hiking, camping, and nature activities"},
    {"id": 4, "name": "Social & Meetups", "icon": "👥", "color": "#3b82f6", "description": "General social gatherings"},
    ...
  ]
}
```

#### 4.2 Create the Picnic Activity
**Endpoint:** `POST /api/activities/`

**Request:**
```json
{
  "title": "Sunset Picnic at Golden Gate Park 🌅",
  "description": "Hey everyone! I'm new to SF and would love to meet some friendly people for a chill picnic. Bringing homemade sandwiches and lemonade. All are welcome - just bring your good vibes and maybe a blanket!",
  "category_id": 4,
  "latitude": 37.7694,
  "longitude": -122.4862,
  "location_name": "Golden Gate Park - Hippie Hill",
  "address": "Golden Gate Park, San Francisco, CA",
  "start_time": "2025-12-07T16:00:00Z",
  "end_time": "2025-12-07T19:00:00Z",
  "max_participants": 10,
  "visibility": "public",
  "min_trust_score": 0,
  "requirements": "Bring something to share if you can! No pressure though 😊"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Sunset Picnic at Golden Gate Park 🌅",
  "description": "Hey everyone! I'm new to SF...",
  "category": {
    "id": 4,
    "name": "Social & Meetups",
    "icon": "👥",
    "color": "#3b82f6"
  },
  "latitude": "37.769400",
  "longitude": "-122.486200",
  "location_name": "Golden Gate Park - Hippie Hill",
  "address": "Golden Gate Park, San Francisco, CA",
  "start_time": "2025-12-07T16:00:00Z",
  "end_time": "2025-12-07T19:00:00Z",
  "max_participants": 10,
  "current_participants_count": 0,
  "spots_left": 10,
  "visibility": "public",
  "status": "active",
  "creator": 1,
  "creator_display_name": "Sarah-Jane",
  "creator_avatar": null,
  "created_at": "2025-12-05T14:35:00Z"
}
```

---

### Journey Step 5: Matthew Discovers Sarah's Activity

Matthew is another user who lives nearby. He opens the app to find activities.

#### 5.1 Matthew Updates His Location
**Endpoint:** `POST /api/location/update/`

**Request:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "current_activity": "Free this weekend!",
  "is_visible": true
}
```

#### 5.2 Matthew Finds Nearby Activities
**Endpoint:** `GET /api/activities/nearby/`

**Response:**
```json
[
  {
    "activity": {
      "id": 1,
      "title": "Sunset Picnic at Golden Gate Park 🌅",
      "category": {
        "id": 4,
        "name": "Social & Meetups",
        "icon": "👥"
      },
      "latitude": "37.769400",
      "longitude": "-122.486200",
      "location_name": "Golden Gate Park - Hippie Hill",
      "start_time": "2025-12-07T16:00:00Z",
      "max_participants": 10,
      "current_participants_count": 0,
      "spots_left": 10,
      "creator_display_name": "Sarah-Jane",
      "creator_avatar": null
    },
    "distance_km": 2.45
  }
]
```

#### 5.3 Matthew Views Activity Details
**Endpoint:** `GET /api/activities/1/`

**Response:**
```json
{
  "id": 1,
  "title": "Sunset Picnic at Golden Gate Park 🌅",
  "description": "Hey everyone! I'm new to SF and would love to meet some friendly people...",
  "category": {
    "id": 4,
    "name": "Social & Meetups",
    "icon": "👥",
    "color": "#3b82f6"
  },
  "latitude": "37.769400",
  "longitude": "-122.486200",
  "location_name": "Golden Gate Park - Hippie Hill",
  "address": "Golden Gate Park, San Francisco, CA",
  "start_time": "2025-12-07T16:00:00Z",
  "end_time": "2025-12-07T19:00:00Z",
  "max_participants": 10,
  "current_participants_count": 0,
  "spots_left": 10,
  "is_full": false,
  "visibility": "public",
  "status": "active",
  "min_age": null,
  "min_trust_score": "0.00",
  "requirements": "Bring something to share if you can! No pressure though 😊",
  "creator": 1,
  "creator_display_name": "Sarah-Jane",
  "creator_avatar": null,
  "creator_trust_score": "0.00",
  "participants": [],
  "comments": [],
  "user_participation": null,
  "created_at": "2025-12-05T14:35:00Z"
}
```

#### 5.4 Matthew Joins the Activity
**Endpoint:** `POST /api/activities/1/join/`

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 2,
  "user_display_name": "Matthew",
  "user_avatar": null,
  "user_trust_score": "4.50",
  "status": "accepted",
  "joined_at": "2025-12-05T15:00:00Z",
  "checked_in_at": null
}
```

#### 5.5 Matthew Comments on the Activity
**Endpoint:** `POST /api/activities/1/comments/`

**Request:**
```json
{
  "content": "This sounds awesome! I'll bring some chips and guac 🥑"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 2,
  "user_display_name": "Matthew",
  "user_avatar": null,
  "content": "This sounds awesome! I'll bring some chips and guac 🥑",
  "parent": null,
  "replies": [],
  "created_at": "2025-12-05T15:05:00Z"
}
```

---

### Journey Step 6: Matthew Sends Sarah a Friend Request

#### 6.1 View Sarah's Public Profile
**Endpoint:** `GET /api/users/1/`

**Response:**
```json
{
  "id": 1,
  "username": "sarah_jane",
  "display_name": "Sarah-Jane",
  "bio": "Just moved to SF! Love hiking, picnics, and meeting new friends 🌸",
  "avatar": null,
  "trust_score": "0.00",
  "total_reviews": 0,
  "is_verified": false,
  "personality_traits_list": [
    {
      "id": 1,
      "trait": {"id": 1, "name": "Friendly", "icon": "😊", "color": "#22c55e"},
      "prominence_score": 5
    },
    {
      "id": 2,
      "trait": {"id": 8, "name": "Outgoing", "icon": "🎉", "color": "#f97316"},
      "prominence_score": 4
    },
    {
      "id": 3,
      "trait": {"id": 6, "name": "Foodie", "icon": "🍕", "color": "#ec4899"},
      "prominence_score": 3
    }
  ]
}
```

#### 6.2 Send Connection Request
**Endpoint:** `POST /api/social/connections/request/`

**Request:**
```json
{
  "to_user_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "from_user": 2,
  "to_user": 1,
  "from_user_detail": {
    "id": 2,
    "username": "matthew_m",
    "display_name": "Matthew",
    "trust_score": "4.50"
  },
  "to_user_detail": {
    "id": 1,
    "username": "sarah_jane",
    "display_name": "Sarah-Jane"
  },
  "status": "pending",
  "created_at": "2025-12-05T15:10:00Z"
}
```

---

### Journey Step 7: Sarah Accepts the Friend Request

#### 7.1 View Pending Requests
**Endpoint:** `GET /api/social/connections/pending/`

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "from_user": 2,
      "to_user": 1,
      "from_user_detail": {
        "id": 2,
        "username": "matthew_m",
        "display_name": "Matthew",
        "bio": "Bay Area native, love board games and outdoor adventures",
        "trust_score": "4.50",
        "personality_traits_list": [
          {"trait": {"name": "Nerdy", "icon": "🤓"}},
          {"trait": {"name": "Friendly", "icon": "😊"}}
        ]
      },
      "status": "pending",
      "created_at": "2025-12-05T15:10:00Z"
    }
  ]
}
```

#### 7.2 Accept the Request
**Endpoint:** `POST /api/social/connections/1/accept/`

**Response (200 OK):**
```json
{
  "id": 1,
  "from_user": 2,
  "to_user": 1,
  "status": "accepted",
  "created_at": "2025-12-05T15:10:00Z",
  "updated_at": "2025-12-05T15:15:00Z"
}
```

---

### Journey Step 8: Sarah Messages Matthew

#### 8.1 Send a Direct Message
**Endpoint:** `POST /api/social/messages/send/`

**Request:**
```json
{
  "recipient": 2,
  "content": "Hey Matthew! Thanks for joining the picnic! Looking forward to meeting you 😊"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "sender": 1,
  "sender_display_name": "Sarah-Jane",
  "sender_avatar": null,
  "recipient": 2,
  "content": "Hey Matthew! Thanks for joining the picnic! Looking forward to meeting you 😊",
  "related_activity": null,
  "is_read": false,
  "read_at": null,
  "sent_at": "2025-12-05T15:20:00Z"
}
```

#### 8.2 Matthew Checks His Conversations
**Endpoint:** `GET /api/social/messages/`

**Response:**
```json
[
  {
    "partner": {
      "id": 1,
      "username": "sarah_jane",
      "display_name": "Sarah-Jane",
      "avatar": null,
      "trust_score": "0.00"
    },
    "last_message": {
      "id": 1,
      "content": "Hey Matthew! Thanks for joining the picnic! Looking forward to meeting you 😊",
      "is_read": false,
      "sent_at": "2025-12-05T15:20:00Z"
    },
    "unread_count": 1
  }
]
```

#### 8.3 Matthew Views the Full Conversation
**Endpoint:** `GET /api/social/messages/1/`

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "sender": 1,
      "sender_display_name": "Sarah-Jane",
      "content": "Hey Matthew! Thanks for joining the picnic! Looking forward to meeting you 😊",
      "is_read": true,
      "sent_at": "2025-12-05T15:20:00Z"
    }
  ]
}
```

---

### Journey Step 9: Day of the Picnic - Check In

#### 9.1 Matthew Checks In to the Activity
**Endpoint:** `POST /api/activities/1/checkin/`

**Response (200 OK):**
```json
{
  "id": 1,
  "user": 2,
  "user_display_name": "Matthew",
  "status": "checked_in",
  "joined_at": "2025-12-05T15:00:00Z",
  "checked_in_at": "2025-12-07T16:05:00Z"
}
```

---

### Journey Step 10: After the Picnic - Leave a Review

#### 10.1 Matthew Reviews Sarah
**Endpoint:** `POST /api/safety/reviews/create/`

**Request:**
```json
{
  "reviewed_user": 1,
  "activity": 1,
  "rating": 5,
  "safety_rating": 5,
  "friendliness_rating": 5,
  "reliability_rating": 5,
  "comment": "Sarah was amazing! Super welcoming and made everyone feel included. The sandwiches were delicious too! Would definitely hang out again."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "reviewer": 2,
  "reviewer_detail": {
    "id": 2,
    "display_name": "Matthew"
  },
  "reviewed_user": 1,
  "activity": 1,
  "rating": 5,
  "safety_rating": 5,
  "friendliness_rating": 5,
  "reliability_rating": 5,
  "comment": "Sarah was amazing! Super welcoming and made everyone feel included...",
  "created_at": "2025-12-07T20:00:00Z"
}
```

> 💡 **Note:** Sarah's `trust_score` will automatically update to 5.00 based on this review!

---

## API Endpoints Reference

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, get JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/verify/` | Verify token validity |

### 👤 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/` | Get current user profile |
| PATCH | `/api/users/me/` | Update current user profile |
| GET | `/api/users/{id}/` | Get public profile of a user |
| GET | `/api/users/me/preferences/` | Get user preferences |
| PATCH | `/api/users/me/preferences/` | Update user preferences |
| GET | `/api/users/me/traits/` | Get user's personality traits |
| POST | `/api/users/me/traits/` | Add personality trait |
| DELETE | `/api/users/me/traits/{trait_id}/` | Remove personality trait |
| GET | `/api/users/nearby/` | Find nearby users |
| GET | `/api/traits/` | List all personality traits |

### 📍 Location

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/location/update/` | Update current location |
| GET | `/api/location/current/` | Get current location |
| GET | `/api/location/history/` | Get location history |

### 🎯 Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities/categories/` | List activity categories |
| GET | `/api/activities/` | List all activities |
| POST | `/api/activities/` | Create new activity |
| GET | `/api/activities/{id}/` | Get activity details |
| PATCH | `/api/activities/{id}/` | Update activity (creator only) |
| DELETE | `/api/activities/{id}/` | Delete activity (creator only) |
| GET | `/api/activities/mine/` | List my created activities |
| GET | `/api/activities/participating/` | List activities I'm participating in |
| GET | `/api/activities/nearby/` | Find nearby activities |
| POST | `/api/activities/{id}/join/` | Join an activity |
| POST | `/api/activities/{id}/leave/` | Leave an activity |
| POST | `/api/activities/{id}/checkin/` | Check in to activity |
| GET | `/api/activities/{id}/comments/` | Get activity comments |
| POST | `/api/activities/{id}/comments/` | Add comment to activity |

### 👥 Social (Connections & Messages)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/social/connections/` | List all connections |
| GET | `/api/social/connections/friends/` | List accepted friends |
| GET | `/api/social/connections/pending/` | List pending requests |
| POST | `/api/social/connections/request/` | Send friend request |
| POST | `/api/social/connections/{id}/accept/` | Accept friend request |
| POST | `/api/social/connections/{id}/decline/` | Decline friend request |
| DELETE | `/api/social/connections/{id}/` | Remove connection |
| POST | `/api/social/block/{user_id}/` | Block a user |
| GET | `/api/social/messages/` | List conversations |
| POST | `/api/social/messages/send/` | Send a message |
| GET | `/api/social/messages/{user_id}/` | Get conversation with user |
| POST | `/api/social/messages/{user_id}/read/` | Mark messages as read |

### 🛡️ Safety

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/safety/reviews/` | Get my received reviews |
| GET | `/api/safety/reviews/user/{user_id}/` | Get reviews for a user |
| POST | `/api/safety/reviews/create/` | Create a review |
| GET | `/api/safety/reports/` | List my submitted reports |
| POST | `/api/safety/reports/create/` | Submit a report |
| GET | `/api/safety/verifications/` | List my verifications |
| POST | `/api/safety/verifications/request/` | Request verification |
| POST | `/api/safety/verifications/{id}/verify/` | Submit verification code |
| GET | `/api/safety/emergency-contacts/` | List emergency contacts |
| POST | `/api/safety/emergency-contacts/` | Add emergency contact |
| GET | `/api/safety/emergency-contacts/{id}/` | Get emergency contact |
| PATCH | `/api/safety/emergency-contacts/{id}/` | Update emergency contact |
| DELETE | `/api/safety/emergency-contacts/{id}/` | Delete emergency contact |

---

## Data Models

### User
```json
{
  "id": "integer",
  "email": "string",
  "username": "string",
  "display_name": "string",
  "bio": "string (max 500 chars)",
  "avatar": "url",
  "date_of_birth": "date",
  "phone_number": "string",
  "trust_score": "decimal (0.00-5.00)",
  "total_reviews": "integer",
  "is_verified": "boolean",
  "is_email_verified": "boolean",
  "is_phone_verified": "boolean",
  "share_location": "boolean",
  "location_visibility": "exact | approximate | hidden",
  "personality_traits_list": "array",
  "date_joined": "datetime"
}
```

### Activity
```json
{
  "id": "integer",
  "title": "string (max 200 chars)",
  "description": "string",
  "category": "ActivityCategory object",
  "latitude": "decimal",
  "longitude": "decimal",
  "location_name": "string",
  "address": "string",
  "start_time": "datetime",
  "end_time": "datetime (optional)",
  "max_participants": "integer",
  "current_participants_count": "integer",
  "spots_left": "integer",
  "is_full": "boolean",
  "visibility": "public | private | friends | invite",
  "status": "active | completed | cancelled | full",
  "min_age": "integer (optional)",
  "min_trust_score": "decimal (0.00-5.00)",
  "requirements": "string",
  "cover_image": "url (optional)",
  "creator": "integer (user id)",
  "created_at": "datetime"
}
```

### Connection
```json
{
  "id": "integer",
  "from_user": "integer",
  "to_user": "integer",
  "status": "pending | accepted | declined | blocked",
  "created_at": "datetime"
}
```

### UserReview
```json
{
  "id": "integer",
  "reviewer": "integer (user id)",
  "reviewed_user": "integer (user id)",
  "activity": "integer (optional)",
  "rating": "integer (1-5)",
  "safety_rating": "integer (1-5, optional)",
  "friendliness_rating": "integer (1-5, optional)",
  "reliability_rating": "integer (1-5, optional)",
  "comment": "string (max 1000 chars)",
  "created_at": "datetime"
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
  "error": "Only the creator can edit this activity"
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

**400 Bad Request:**
```json
{
  "email": ["User with this email already exists."],
  "password": ["This field is required."]
}
```

---

## Testing with cURL

### Quick Test Commands

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test1234","password_confirm":"test1234"}'

# 2. Login (save the access token)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# 3. Use the token for authenticated requests
TOKEN="your_access_token_here"

curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:8000/api/activities/categories/ \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:8000/api/traits/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Interactive API Documentation

Visit `http://localhost:8000/api/docs/` for the interactive Swagger UI where you can:
1. Try all endpoints
2. Authenticate with JWT tokens
3. See request/response schemas
4. Test the complete user flow
