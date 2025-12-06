# API Documentation - Social Activity Finder

> Complete REST API reference for the location-based social networking application

**Version:** 1.0  
**Authentication:** JWT Bearer Token (except registration & login)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Users API](#users-api)
4. [Activities API](#activities-api)
5. [Location API](#location-api)
6. [Social API](#social-api)
7. [Safety API](#safety-api)
8. [Error Handling](#error-handling)

---

## Overview

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Pagination
List endpoints return paginated responses:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

### Response Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

### Register New User

**POST** `/auth/register/`

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "",
  "avatar": null,
  "date_joined": "2025-12-06T10:30:00Z"
}
```

---

### Login (Obtain Token)

**POST** `/auth/login/`

**Public endpoint**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Token Expiry:**
- Access Token: 5 minutes
- Refresh Token: 1 day

---

### Refresh Token

**POST** `/auth/refresh/`

**Public endpoint**

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Verify Token

**POST** `/auth/verify/`

**Public endpoint**

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK` (empty body if valid) or `401 Unauthorized`

---

## Users API

### Get Current User Profile

**GET** `/users/me/`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Love exploring new places!",
  "avatar": "http://localhost:8000/media/avatars/profile.jpg",
  "date_joined": "2025-12-06T10:30:00Z"
}
```

---

### Update Current User Profile

**PUT/PATCH** `/users/me/`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "bio": "Adventure seeker",
  "avatar": "<multipart/form-data file upload>"
}
```

**Response:** `200 OK` (updated user object)

---

### Get User Public Profile

**GET** `/users/{id}/`

**Response:** `200 OK`
```json
{
  "id": 2,
  "username": "janedoe",
  "bio": "Coffee enthusiast",
  "avatar": "http://localhost:8000/media/avatars/jane.jpg"
}
```

---

### List All Users (Admin Only)

**GET** `/users/`

**Permissions:** Admin users only

**Response:** `200 OK`
```json
{
  "count": 50,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "bio": "...",
      "avatar": "...",
      "date_joined": "2025-12-06T10:30:00Z"
    }
  ]
}
```

---

### Find Nearby Users

**GET** `/users/nearby/`

**Query Parameters:**
- `radius` (optional, default: 10) - Search radius in kilometers
- `latitude` (required if no current location) - User's latitude
- `longitude` (required if no current location) - User's longitude

**Response:** `200 OK`
```json
[
  {
    "user": {
      "id": 2,
      "username": "janedoe",
      "bio": "Coffee enthusiast",
      "avatar": "..."
    },
    "distance_km": 2.5,
    "current_activity": "Looking for coffee"
  },
  {
    "user": {
      "id": 3,
      "username": "bobsmith",
      "bio": "Fitness lover",
      "avatar": "..."
    },
    "distance_km": 4.8,
    "current_activity": ""
  }
]
```

---

## Activities API

### List Activity Categories

**GET** `/activities/categories/`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Sports",
    "icon": "⚽",
    "color": "#22c55e",
    "description": "Sports and fitness activities",
    "is_active": true
  },
  {
    "id": 2,
    "name": "Food & Dining",
    "icon": "🍕",
    "color": "#f59e0b",
    "description": "Restaurants, cafes, food events",
    "is_active": true
  }
]
```

---

### List Activities

**GET** `/activities/`

**Query Parameters:**
- `category` - Filter by category ID
- `status` - Filter by status (`active`, `completed`, `cancelled`, `full`)
- `visibility` - Filter by visibility (`public`, `private`, `friends`, `invite`)
- `start_date` - Filter activities starting after this date (ISO 8601)
- `end_date` - Filter activities starting before this date

**Response:** `200 OK`
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/activities/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "creator": {
        "id": 1,
        "username": "johndoe",
        "avatar": "..."
      },
      "title": "Evening Basketball Game",
      "description": "Casual pickup game at the park",
      "category": {
        "id": 1,
        "name": "Sports",
        "icon": "⚽",
        "color": "#22c55e"
      },
      "latitude": "40.712776",
      "longitude": "-74.005974",
      "location_name": "Central Park",
      "address": "New York, NY 10024",
      "start_time": "2025-12-06T18:00:00Z",
      "end_time": "2025-12-06T20:00:00Z",
      "max_participants": 10,
      "current_participants_count": 5,
      "spots_left": 5,
      "visibility": "public",
      "status": "active",
      "min_age": null,
      "min_trust_score": "0.00",
      "requirements": "",
      "cover_image": null,
      "is_full": false,
      "is_active": true,
      "created_at": "2025-12-05T12:00:00Z",
      "updated_at": "2025-12-05T12:00:00Z"
    }
  ]
}
```

---

### Create Activity

**POST** `/activities/`

**Request Body:**
```json
{
  "title": "Morning Coffee Meetup",
  "description": "Let's grab coffee and chat",
  "category": 2,
  "latitude": "40.712776",
  "longitude": "-74.005974",
  "location_name": "Starbucks Downtown",
  "address": "123 Main St, New York, NY",
  "start_time": "2025-12-07T09:00:00Z",
  "end_time": "2025-12-07T10:30:00Z",
  "max_participants": 4,
  "visibility": "public",
  "min_age": 18,
  "requirements": "Bring your own mug if possible"
}
```

**Response:** `201 Created`
```json
{
  "id": 15,
  "creator": {
    "id": 1,
    "username": "johndoe",
    "avatar": "..."
  },
  "title": "Morning Coffee Meetup",
  "description": "Let's grab coffee and chat",
  // ... full activity object
}
```

---

### Get Activity Details

**GET** `/activities/{id}/`

**Response:** `200 OK`
```json
{
  "id": 1,
  "creator": { /* user object */ },
  "title": "Evening Basketball Game",
  "description": "...",
  "category": { /* category object */ },
  "participants": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "janedoe",
        "avatar": "..."
      },
      "status": "accepted",
      "joined_at": "2025-12-05T14:00:00Z",
      "checked_in_at": null
    }
  ],
  // ... rest of activity fields
}
```

---

### Update Activity

**PUT/PATCH** `/activities/{id}/`

**Permissions:** Only the creator can update

**Request Body:** (any fields to update)
```json
{
  "title": "Updated Title",
  "max_participants": 12
}
```

**Response:** `200 OK` (updated activity object)

---

### Delete Activity

**DELETE** `/activities/{id}/`

**Permissions:** Only the creator can delete

**Response:** `204 No Content`

---

### Get My Created Activities

**GET** `/activities/mine/`

**Response:** `200 OK` (paginated list of activities created by current user)

---

### Get My Participations

**GET** `/activities/participating/`

**Response:** `200 OK` (paginated list of activities where user is a participant)

```json
{
  "count": 3,
  "results": [
    {
      "activity": { /* full activity object */ },
      "participation": {
        "id": 5,
        "status": "accepted",
        "joined_at": "2025-12-05T14:00:00Z",
        "checked_in_at": null,
        "checked_out_at": null
      }
    }
  ]
}
```

---

### Find Nearby Activities

**GET** `/activities/nearby/`

**Query Parameters:**
- `latitude` (required) - Center latitude
- `longitude` (required) - Center longitude
- `radius` (optional, default: 10) - Search radius in kilometers
- `category` (optional) - Filter by category ID

**Response:** `200 OK`
```json
[
  {
    "activity": { /* full activity object */ },
    "distance_km": 1.2
  },
  {
    "activity": { /* full activity object */ },
    "distance_km": 3.5
  }
]
```

---

### Join Activity

**POST** `/activities/{activity_id}/join/`

**Response:** `201 Created`
```json
{
  "id": 8,
  "activity": 1,
  "user": {
    "id": 3,
    "username": "bobsmith"
  },
  "status": "accepted",
  "joined_at": "2025-12-06T15:30:00Z",
  "checked_in_at": null
}
```

**Error Cases:**
- `400` - Activity is full
- `400` - User already joined
- `403` - Activity is private/invite-only

---

### Leave Activity

**DELETE** `/activities/{activity_id}/leave/`

**Response:** `204 No Content`

**Error Cases:**
- `404` - User is not a participant

---

### Check In to Activity

**POST** `/activities/{activity_id}/checkin/`

**Permissions:** User must be an accepted participant

**Response:** `200 OK`
```json
{
  "id": 8,
  "status": "checked_in",
  "checked_in_at": "2025-12-06T18:05:00Z"
}
```

---

### List Activity Comments

**GET** `/activities/{activity_id}/comments/`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "janedoe",
      "avatar": "..."
    },
    "content": "Can't wait for this!",
    "parent": null,
    "replies": [
      {
        "id": 2,
        "user": {
          "id": 1,
          "username": "johndoe",
          "avatar": "..."
        },
        "content": "Me too!",
        "parent": 1,
        "created_at": "2025-12-05T14:30:00Z"
      }
    ],
    "created_at": "2025-12-05T14:00:00Z",
    "updated_at": "2025-12-05T14:00:00Z"
  }
]
```

---

### Create Activity Comment

**POST** `/activities/{activity_id}/comments/`

**Request Body:**
```json
{
  "content": "Looking forward to it!",
  "parent": null
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "user": { /* current user object */ },
  "content": "Looking forward to it!",
  "parent": null,
  "created_at": "2025-12-06T10:00:00Z",
  "updated_at": "2025-12-06T10:00:00Z"
}
```

---

## Location API

### Update Location

**POST** `/location/update/`

**Request Body:**
```json
{
  "latitude": "40.712776",
  "longitude": "-74.005974",
  "accuracy": 10.5,
  "altitude": 15.0,
  "current_activity": "Looking for lunch",
  "is_visible": true
}
```

**Response:** `201 Created`
```json
{
  "id": 42,
  "user": 1,
  "latitude": "40.712776",
  "longitude": "-74.005974",
  "accuracy": 10.5,
  "altitude": 15.0,
  "is_current": true,
  "is_visible": true,
  "current_activity": "Looking for lunch",
  "timestamp": "2025-12-06T12:30:00Z"
}
```

---

### Get Current Location

**GET** `/location/current/`

**Response:** `200 OK`
```json
{
  "id": 42,
  "user": 1,
  "latitude": "40.712776",
  "longitude": "-74.005974",
  "accuracy": 10.5,
  "altitude": 15.0,
  "is_current": true,
  "is_visible": true,
  "current_activity": "Looking for lunch",
  "timestamp": "2025-12-06T12:30:00Z"
}
```

**Error Cases:**
- `404` - No current location found

---

### Get Location History

**GET** `/location/history/`

**Query Parameters:**
- `limit` (optional, default: 50) - Number of records to return

**Response:** `200 OK`
```json
{
  "count": 150,
  "results": [
    {
      "id": 42,
      "latitude": "40.712776",
      "longitude": "-74.005974",
      "accuracy": 10.5,
      "is_current": false,
      "timestamp": "2025-12-06T12:30:00Z"
    }
  ]
}
```

---

## Social API

### Connections

#### List All Connections

**GET** `/social/connections/`

**Query Parameters:**
- `status` (optional) - Filter by status (`pending`, `accepted`, `declined`, `blocked`)

**Response:** `200 OK`
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "from_user": {
        "id": 1,
        "username": "johndoe",
        "avatar": "..."
      },
      "to_user": {
        "id": 2,
        "username": "janedoe",
        "avatar": "..."
      },
      "status": "accepted",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-01T10:30:00Z"
    }
  ]
}
```

---

#### Get Friends List

**GET** `/social/connections/friends/`

**Response:** `200 OK`
```json
{
  "count": 15,
  "results": [
    {
      "id": 2,
      "username": "janedoe",
      "bio": "Coffee enthusiast",
      "avatar": "...",
      "friendship_since": "2025-12-01T10:30:00Z"
    }
  ]
}
```

---

#### Get Pending Connection Requests

**GET** `/social/connections/pending/`

**Response:** `200 OK`
```json
{
  "sent": [
    {
      "id": 5,
      "to_user": {
        "id": 10,
        "username": "newuser",
        "avatar": "..."
      },
      "status": "pending",
      "created_at": "2025-12-06T09:00:00Z"
    }
  ],
  "received": [
    {
      "id": 6,
      "from_user": {
        "id": 11,
        "username": "anotheruser",
        "avatar": "..."
      },
      "status": "pending",
      "created_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

---

#### Send Connection Request

**POST** `/social/connections/request/`

**Request Body:**
```json
{
  "to_user": 10
}
```

**Response:** `201 Created`
```json
{
  "id": 7,
  "from_user": {
    "id": 1,
    "username": "johndoe"
  },
  "to_user": {
    "id": 10,
    "username": "newuser"
  },
  "status": "pending",
  "created_at": "2025-12-06T12:00:00Z"
}
```

**Error Cases:**
- `400` - Connection already exists
- `400` - Cannot send request to self
- `400` - User is blocked

---

#### Accept Connection Request

**POST** `/social/connections/{connection_id}/accept/`

**Response:** `200 OK`
```json
{
  "id": 6,
  "status": "accepted",
  "updated_at": "2025-12-06T12:30:00Z"
}
```

**Error Cases:**
- `403` - Can only accept requests sent to you
- `404` - Connection not found

---

#### Decline Connection Request

**POST** `/social/connections/{connection_id}/decline/`

**Response:** `200 OK`
```json
{
  "id": 6,
  "status": "declined",
  "updated_at": "2025-12-06T12:30:00Z"
}
```

---

#### Remove Connection (Unfriend)

**DELETE** `/social/connections/{connection_id}/`

**Response:** `204 No Content`

---

#### Block User

**POST** `/social/block/{user_id}/`

**Response:** `201 Created` or `200 OK`
```json
{
  "id": 8,
  "to_user": 12,
  "status": "blocked",
  "created_at": "2025-12-06T13:00:00Z"
}
```

---

### Messages

#### List Conversations

**GET** `/social/messages/`

**Response:** `200 OK`
```json
{
  "count": 5,
  "results": [
    {
      "partner": {
        "id": 2,
        "username": "janedoe",
        "avatar": "..."
      },
      "last_message": {
        "id": 45,
        "sender": 2,
        "content": "See you tomorrow!",
        "sent_at": "2025-12-06T11:00:00Z",
        "is_read": true
      },
      "unread_count": 0
    }
  ]
}
```

---

#### Get Conversation with User

**GET** `/social/messages/{user_id}/`

**Query Parameters:**
- `page` (optional) - Page number for pagination

**Response:** `200 OK`
```json
{
  "count": 50,
  "results": [
    {
      "id": 44,
      "sender": {
        "id": 1,
        "username": "johndoe"
      },
      "recipient": {
        "id": 2,
        "username": "janedoe"
      },
      "content": "Hey, how are you?",
      "related_activity": null,
      "is_read": true,
      "read_at": "2025-12-06T10:30:00Z",
      "sent_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

---

#### Send Message

**POST** `/social/messages/send/`

**Request Body:**
```json
{
  "recipient": 2,
  "content": "Hey! Want to join the basketball game?",
  "related_activity": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 51,
  "sender": {
    "id": 1,
    "username": "johndoe"
  },
  "recipient": {
    "id": 2,
    "username": "janedoe"
  },
  "content": "Hey! Want to join the basketball game?",
  "related_activity": 1,
  "is_read": false,
  "read_at": null,
  "sent_at": "2025-12-06T13:00:00Z"
}
```

---

#### Mark Messages as Read

**POST** `/social/messages/{user_id}/read/`

**Response:** `200 OK`
```json
{
  "marked_read": 3
}
```

---

## Safety API

### Reviews

#### Get My Received Reviews

**GET** `/safety/reviews/`

**Response:** `200 OK`
```json
{
  "count": 8,
  "average_rating": 4.5,
  "results": [
    {
      "id": 1,
      "reviewer": {
        "id": 2,
        "username": "janedoe",
        "avatar": "..."
      },
      "activity": {
        "id": 5,
        "title": "Evening Basketball Game"
      },
      "rating": 5,
      "safety_rating": 5,
      "friendliness_rating": 5,
      "reliability_rating": 4,
      "comment": "Great person to hang out with!",
      "created_at": "2025-12-05T20:00:00Z"
    }
  ]
}
```

---

#### Get Reviews for a User

**GET** `/safety/reviews/user/{user_id}/`

**Response:** `200 OK` (same format as above)

---

#### Create Review

**POST** `/safety/reviews/create/`

**Request Body:**
```json
{
  "reviewed_user": 2,
  "activity": 5,
  "rating": 5,
  "safety_rating": 5,
  "friendliness_rating": 5,
  "reliability_rating": 4,
  "comment": "Great experience!"
}
```

**Response:** `201 Created`
```json
{
  "id": 12,
  "reviewer": { /* current user */ },
  "reviewed_user": { /* user object */ },
  "activity": { /* activity object */ },
  "rating": 5,
  "safety_rating": 5,
  "friendliness_rating": 5,
  "reliability_rating": 4,
  "comment": "Great experience!",
  "created_at": "2025-12-06T15:00:00Z"
}
```

**Error Cases:**
- `400` - Cannot review yourself
- `400` - Already reviewed this user for this activity

---

### Reports

#### Get My Submitted Reports

**GET** `/safety/reports/`

**Response:** `200 OK`
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "reported_user": {
        "id": 15,
        "username": "baduser"
      },
      "reported_activity": {
        "id": 20,
        "title": "Suspicious Activity"
      },
      "reason": "harassment",
      "description": "User was being inappropriate",
      "status": "reviewing",
      "created_at": "2025-12-05T16:00:00Z",
      "updated_at": "2025-12-05T18:00:00Z"
    }
  ]
}
```

---

#### Create Report

**POST** `/safety/reports/create/`

**Request Body:**
```json
{
  "reported_user": 15,
  "reported_activity": 20,
  "reason": "harassment",
  "description": "Detailed description of the incident..."
}
```

**Reason Options:**
- `harassment`
- `inappropriate`
- `spam`
- `fake`
- `safety`
- `scam`
- `other`

**Response:** `201 Created`
```json
{
  "id": 5,
  "reporter": { /* current user */ },
  "reported_user": { /* user object */ },
  "reported_activity": { /* activity object */ },
  "reason": "harassment",
  "description": "Detailed description of the incident...",
  "status": "pending",
  "created_at": "2025-12-06T15:30:00Z"
}
```

---

### Verifications

#### Get My Verifications

**GET** `/safety/verifications/`

**Response:** `200 OK`
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "verification_type": "email",
      "status": "verified",
      "verified_at": "2025-12-01T10:00:00Z",
      "created_at": "2025-12-01T09:30:00Z"
    },
    {
      "id": 2,
      "verification_type": "phone",
      "status": "pending",
      "verified_at": null,
      "expires_at": "2025-12-06T16:00:00Z",
      "created_at": "2025-12-06T15:00:00Z"
    }
  ]
}
```

---

#### Request Verification

**POST** `/safety/verifications/request/`

**Request Body:**
```json
{
  "verification_type": "phone"
}
```

**Verification Types:**
- `email`
- `phone`
- `id`
- `photo`

**Response:** `201 Created`
```json
{
  "id": 3,
  "verification_type": "phone",
  "status": "pending",
  "expires_at": "2025-12-06T16:30:00Z",
  "created_at": "2025-12-06T15:30:00Z",
  "message": "Verification code sent to your phone"
}
```

---

#### Verify Code

**POST** `/safety/verifications/{verification_id}/verify/`

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "id": 3,
  "verification_type": "phone",
  "status": "verified",
  "verified_at": "2025-12-06T15:35:00Z"
}
```

**Error Cases:**
- `400` - Invalid or expired code
- `404` - Verification not found

---

### Emergency Contacts

#### List Emergency Contacts

**GET** `/safety/emergency-contacts/`

**Response:** `200 OK`
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "Mom",
      "phone_number": "+1234567890",
      "relationship": "Mother",
      "notify_on_checkin": true,
      "notify_on_activity_join": false,
      "created_at": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

#### Create Emergency Contact

**POST** `/safety/emergency-contacts/`

**Request Body:**
```json
{
  "name": "Dad",
  "phone_number": "+1987654321",
  "relationship": "Father",
  "notify_on_checkin": false,
  "notify_on_activity_join": true
}
```

**Response:** `201 Created`

---

#### Update Emergency Contact

**PUT/PATCH** `/safety/emergency-contacts/{id}/`

**Request Body:** (any fields to update)

**Response:** `200 OK` (updated contact object)

---

#### Delete Emergency Contact

**DELETE** `/safety/emergency-contacts/{id}/`

**Response:** `204 No Content`

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Validation Errors (400 Bad Request)

```json
{
  "field_name": [
    "Error message for this field"
  ],
  "another_field": [
    "Another error message"
  ]
}
```

### Common Error Messages

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

---

## Pagination

Default page size: 20 items

Custom page size (max 100):
```
GET /api/endpoint/?page_size=50
```

Navigate pages:
```
GET /api/endpoint/?page=2
```

---

## Filtering & Ordering

Most list endpoints support filtering and ordering via query parameters:

```
GET /api/activities/?category=1&status=active&ordering=-start_time
```

Common ordering fields:
- `-created_at` (newest first)
- `created_at` (oldest first)
- `-start_time` (activities)
- `distance_km` (nearby queries)

---

## Rate Limiting

*Not currently implemented - planned for production*

Future limits:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Webhooks

*Not currently available - planned for future versions*

---

**Last Updated:** December 6, 2025  
**API Version:** 1.0
