# Database Models Documentation

> Complete database schema reference for Social Activity Finder

**Django Version:** 5.0.9  
**Database:** PostgreSQL (production) / SQLite (development)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Users App](#users-app)
4. [Activities App](#activities-app)
5. [Locations App](#locations-app)
6. [Social App](#social-app)
7. [Safety App](#safety-app)
8. [Relationships Diagram](#relationships-diagram)
9. [Indexes & Performance](#indexes--performance)

---

## Overview

The application uses a **5-app architecture** following Django best practices:

| App | Models | Purpose |
|-----|--------|---------|
| `users` | 1 | User authentication and profiles |
| `activities` | 4 | Activity creation, participation, comments, categories |
| `locations` | 1 | Real-time location tracking and nearby discovery |
| `social` | 2 | Friend connections and direct messaging |
| `safety` | 4 | Reviews, reports, verifications, emergency contacts |

**Total Models:** 12

---

## Architecture

### Design Principles

1. **Separation of Concerns**: Each app handles a distinct domain
2. **Consistent Patterns**: All models use `created_at`/`updated_at` where applicable
3. **Soft Relationships**: Foreign keys use `SET_NULL` where data retention is important
4. **Audit Trail**: Status fields track state changes over time
5. **Scalability**: Indexed fields for common query patterns

### Common Field Patterns

**Timestamps:**
```python
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
```

**User References:**
```python
user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name='...'
)
```

**Choice Fields:**
```python
class StatusChoices(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'

status = models.CharField(
    max_length=20,
    choices=StatusChoices.choices,
    default=StatusChoices.ACTIVE
)
```

---

## Users App

**Location:** `backend/apps/users/`

### User Model

**Table:** `users`

Custom user model extending Django's `AbstractUser`. Uses email as primary authentication.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `email` | EmailField | Unique, Required | Primary authentication identifier |
| `username` | CharField(150) | Unique, Required | Display username |
| `first_name` | CharField(150) | Optional | User's first name |
| `last_name` | CharField(150) | Optional | User's last name |
| `password` | CharField | Required | Hashed password |
| `bio` | TextField(500) | Optional | User biography |
| `avatar` | ImageField | Optional | Profile picture (uploaded to `avatars/`) |
| `is_active` | BooleanField | Default: True | Account active status |
| `is_staff` | BooleanField | Default: False | Staff status for admin access |
| `is_superuser` | BooleanField | Default: False | Superuser status |
| `date_joined` | DateTimeField | Auto | Account creation timestamp |
| `last_login` | DateTimeField | Nullable | Last login timestamp |

**Authentication:**
- `USERNAME_FIELD = 'email'`
- `REQUIRED_FIELDS = ['username']`

**Meta Options:**
```python
db_table = 'users'
verbose_name = 'User'
verbose_name_plural = 'Users'
ordering = ['-date_joined']
```

**Methods:**
- `__str__()`: Returns email
- Inherits all `AbstractUser` methods (password hashing, permissions, etc.)

**Related Names:**
- `created_activities` - Activities created by user
- `activity_participations` - Activity participations
- `activity_comments` - Comments on activities
- `connections_sent` - Connection requests sent
- `connections_received` - Connection requests received
- `sent_messages` - Messages sent
- `received_messages` - Messages received
- `locations` - Location history
- `reviews_given` - Reviews written
- `reviews_received` - Reviews received
- `reports_submitted` - Reports filed
- `reports_against` - Reports against user
- `verifications` - Verification records
- `emergency_contacts` - Emergency contacts

---

## Activities App

**Location:** `backend/apps/activities/`

### ActivityCategory Model

**Table:** `activity_categories`

Predefined categories for organizing activities.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `name` | CharField(50) | Unique, Required | Category name (e.g., "Sports", "Food") |
| `icon` | CharField(50) | Required | Icon/emoji for UI display |
| `color` | CharField(7) | Default: "#6366f1" | Hex color code for UI |
| `description` | TextField | Optional | Category description |
| `is_active` | BooleanField | Default: True | Whether category is active |

**Meta:**
```python
db_table = 'activity_categories'
ordering = ['name']
```

**Related Names:**
- `activities` - Activities in this category

---

### Activity Model

**Table:** `activities`

Main model for user-created activities/events.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `creator` | ForeignKey(User) | Required, CASCADE | Activity creator |
| `title` | CharField(200) | Required | Activity title |
| `description` | TextField | Optional | Detailed description |
| `category` | ForeignKey(ActivityCategory) | Nullable, SET_NULL | Activity category |
| `latitude` | DecimalField(9,6) | Required | Location latitude |
| `longitude` | DecimalField(9,6) | Required | Location longitude |
| `location_name` | CharField(255) | Optional | Human-readable location |
| `address` | CharField(500) | Optional | Full address |
| `start_time` | DateTimeField | Required | Activity start time |
| `end_time` | DateTimeField | Nullable | Activity end time |
| `max_participants` | PositiveIntegerField | Default: 10 | Maximum participants |
| `current_participants_count` | PositiveIntegerField | Default: 0 | Current participant count |
| `visibility` | CharField(20) | Choices, Default: 'public' | Access control |
| `status` | CharField(20) | Choices, Default: 'active' | Activity status |
| `min_age` | PositiveIntegerField | Nullable | Minimum age requirement |
| `min_trust_score` | DecimalField(3,2) | Default: 0.00 | Min trust score (0-5) |
| `requirements` | TextField | Optional | Additional requirements |
| `cover_image` | ImageField | Nullable | Cover photo |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**Choices:**

**VisibilityChoices:**
- `public` - Public (anyone can see and join)
- `private` - Private (hidden, invite only)
- `friends` - Friends Only (only friends can see)
- `invite` - Invite Only (visible but requires invitation)

**StatusChoices:**
- `active` - Active (accepting participants)
- `completed` - Completed (activity finished)
- `cancelled` - Cancelled (activity cancelled)
- `full` - Full (max participants reached)

**Meta:**
```python
db_table = 'activities'
ordering = ['-start_time']
indexes = [
    Index(fields=['latitude', 'longitude']),
    Index(fields=['start_time']),
    Index(fields=['status']),
    Index(fields=['category']),
]
```

**Properties:**
- `is_full` - Returns True if at capacity
- `spots_left` - Returns remaining spots
- `is_active` - Returns True if active and future

**Methods:**
- `update_participant_count()` - Recalculates participant count

**Related Names:**
- `participants` - ActivityParticipant records
- `comments` - Activity comments
- `user_reviews` - Reviews related to this activity
- `reports` - Reports related to this activity
- `related_messages` - Messages referencing this activity

---

### ActivityParticipant Model

**Table:** `activity_participants`

Through table managing activity participation.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `activity` | ForeignKey(Activity) | Required, CASCADE | Related activity |
| `user` | ForeignKey(User) | Required, CASCADE | Participant user |
| `status` | CharField(20) | Choices, Default: 'requested' | Participation status |
| `invited_by` | ForeignKey(User) | Nullable, SET_NULL | User who sent invite |
| `joined_at` | DateTimeField | Auto | When user joined/requested |
| `checked_in_at` | DateTimeField | Nullable | Check-in timestamp |
| `checked_out_at` | DateTimeField | Nullable | Check-out timestamp |

**StatusChoices:**
- `invited` - Invited (not yet responded)
- `requested` - Requested to Join (awaiting approval)
- `accepted` - Accepted (confirmed participant)
- `declined` - Declined (invitation rejected)
- `checked_in` - Checked In (physically present)
- `left` - Left (withdrew from activity)

**Meta:**
```python
db_table = 'activity_participants'
unique_together = ['activity', 'user']
ordering = ['-joined_at']
```

**Hooks:**
- `save()` - Updates activity participant count
- `delete()` - Updates activity participant count

**Related Names:**
- From Activity: `participants`
- From User: `activity_participations`
- From invited_by: `sent_activity_invites`

---

### ActivityComment Model

**Table:** `activity_comments`

Comments and replies on activities.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `activity` | ForeignKey(Activity) | Required, CASCADE | Related activity |
| `user` | ForeignKey(User) | Required, CASCADE | Comment author |
| `content` | TextField(1000) | Required | Comment text |
| `parent` | ForeignKey(Self) | Nullable, CASCADE | Parent comment (for replies) |
| `created_at` | DateTimeField | Auto | Creation timestamp |
| `updated_at` | DateTimeField | Auto | Last edit timestamp |

**Meta:**
```python
db_table = 'activity_comments'
ordering = ['created_at']
```

**Related Names:**
- From Activity: `comments`
- From User: `activity_comments`
- Self-referencing: `replies`

---

## Locations App

**Location:** `backend/apps/locations/`

### UserLocation Model

**Table:** `user_locations`

Tracks user location history for nearby discovery.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `user` | ForeignKey(User) | Required, CASCADE | User |
| `latitude` | DecimalField(9,6) | Required | Location latitude |
| `longitude` | DecimalField(9,6) | Required | Location longitude |
| `accuracy` | FloatField | Nullable | GPS accuracy in meters |
| `altitude` | FloatField | Nullable | Altitude |
| `is_current` | BooleanField | Default: True | Is current location |
| `is_visible` | BooleanField | Default: True | Share location with others |
| `current_activity` | CharField(200) | Optional | What user is doing |
| `timestamp` | DateTimeField | Auto | Location timestamp |

**Meta:**
```python
db_table = 'user_locations'
ordering = ['-timestamp']
indexes = [
    Index(fields=['latitude', 'longitude']),
    Index(fields=['is_current', 'is_visible']),
    Index(fields=['-timestamp']),
]
```

**Hooks:**
- `save()` - Sets all other user locations as `is_current=False`

**Class Methods:**
- `haversine_distance(lat1, lon1, lat2, lon2)` - Calculate distance in km
- `get_nearby_users(latitude, longitude, radius_km=10, exclude_user=None)` - Find nearby users
- `get_nearby_activities(latitude, longitude, radius_km=10)` - Find nearby activities

**Related Names:**
- From User: `locations`

**Notes:**
- For production, consider using PostGIS for spatial queries
- Current implementation uses Haversine formula in Python

---

## Social App

**Location:** `backend/apps/social/`

### Connection Model

**Table:** `connections`

Friend/connection system between users.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `from_user` | ForeignKey(User) | Required, CASCADE | User sending request |
| `to_user` | ForeignKey(User) | Required, CASCADE | User receiving request |
| `status` | CharField(20) | Choices, Default: 'pending' | Connection status |
| `created_at` | DateTimeField | Auto | Request sent timestamp |
| `updated_at` | DateTimeField | Auto | Status change timestamp |

**StatusChoices:**
- `pending` - Pending (awaiting response)
- `accepted` - Accepted (friends)
- `declined` - Declined (request rejected)
- `blocked` - Blocked (user blocked)

**Meta:**
```python
db_table = 'connections'
unique_together = ['from_user', 'to_user']
ordering = ['-created_at']
```

**Class Methods:**
- `are_friends(user1, user2)` - Check if two users are friends
- `get_friends(user)` - Get all friends of a user
- `is_blocked(user1, user2)` - Check if either user blocked the other

**Related Names:**
- From User (from_user): `connections_sent`
- From User (to_user): `connections_received`

---

### Message Model

**Table:** `messages`

Direct messages between users.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `sender` | ForeignKey(User) | Required, CASCADE | Message sender |
| `recipient` | ForeignKey(User) | Required, CASCADE | Message recipient |
| `content` | TextField(5000) | Required | Message content |
| `related_activity` | ForeignKey(Activity) | Nullable, SET_NULL | Optional activity context |
| `is_read` | BooleanField | Default: False | Read status |
| `read_at` | DateTimeField | Nullable | When message was read |
| `sent_at` | DateTimeField | Auto | Message sent timestamp |

**Meta:**
```python
db_table = 'messages'
ordering = ['sent_at']
indexes = [
    Index(fields=['sender', 'recipient']),
    Index(fields=['-sent_at']),
]
```

**Class Methods:**
- `get_conversation(user1, user2)` - Get all messages between two users
- `get_conversations_for_user(user)` - Get list of conversations with last message and unread count

**Related Names:**
- From User (sender): `sent_messages`
- From User (recipient): `received_messages`
- From Activity: `related_messages`

---

## Safety App

**Location:** `backend/apps/safety/`

### UserReview Model

**Table:** `user_reviews`

User reviews and ratings after activities.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `reviewer` | ForeignKey(User) | Required, CASCADE | User writing review |
| `reviewed_user` | ForeignKey(User) | Required, CASCADE | User being reviewed |
| `activity` | ForeignKey(Activity) | Nullable, SET_NULL | Related activity |
| `rating` | PositiveIntegerField | Required, 1-5 | Overall rating |
| `safety_rating` | PositiveIntegerField | Nullable, 1-5 | Safety rating |
| `friendliness_rating` | PositiveIntegerField | Nullable, 1-5 | Friendliness rating |
| `reliability_rating` | PositiveIntegerField | Nullable, 1-5 | Reliability rating |
| `comment` | TextField(1000) | Optional | Written review |
| `created_at` | DateTimeField | Auto | Review timestamp |
| `updated_at` | DateTimeField | Auto | Last edit timestamp |

**Meta:**
```python
db_table = 'user_reviews'
unique_together = ['reviewer', 'reviewed_user', 'activity']
ordering = ['-created_at']
```

**Hooks:**
- `save()` - Updates reviewed user's trust score (if implemented)

**Related Names:**
- From User (reviewer): `reviews_given`
- From User (reviewed_user): `reviews_received`
- From Activity: `user_reviews`

---

### Report Model

**Table:** `reports`

Safety reports and violations.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `reporter` | ForeignKey(User) | Required, CASCADE | User filing report |
| `reported_user` | ForeignKey(User) | Required, CASCADE | User being reported |
| `reported_activity` | ForeignKey(Activity) | Nullable, SET_NULL | Related activity |
| `reason` | CharField(20) | Choices, Required | Report reason |
| `description` | TextField | Required | Detailed description |
| `status` | CharField(20) | Choices, Default: 'pending' | Review status |
| `admin_notes` | TextField | Optional | Admin response notes |
| `resolved_by` | ForeignKey(User) | Nullable, SET_NULL | Admin who resolved |
| `resolved_at` | DateTimeField | Nullable | Resolution timestamp |
| `created_at` | DateTimeField | Auto | Report timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

**ReasonChoices:**
- `harassment` - Harassment
- `inappropriate` - Inappropriate Behavior
- `spam` - Spam
- `fake` - Fake Profile
- `safety` - Safety Concern
- `scam` - Scam/Fraud
- `other` - Other

**StatusChoices:**
- `pending` - Pending Review
- `reviewing` - Under Review
- `resolved` - Resolved
- `dismissed` - Dismissed

**Meta:**
```python
db_table = 'reports'
ordering = ['-created_at']
```

**Related Names:**
- From User (reporter): `reports_submitted`
- From User (reported_user): `reports_against`
- From User (resolved_by): `resolved_reports`
- From Activity: `reports`

---

### Verification Model

**Table:** `verifications`

User verification records (email, phone, ID, photo).

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `user` | ForeignKey(User) | Required, CASCADE | User being verified |
| `verification_type` | CharField(20) | Choices, Required | Type of verification |
| `status` | CharField(20) | Choices, Default: 'pending' | Verification status |
| `verification_code` | CharField(20) | Optional | Code for email/phone |
| `expires_at` | DateTimeField | Nullable | Code expiration |
| `created_at` | DateTimeField | Auto | Request timestamp |
| `verified_at` | DateTimeField | Nullable | Verification timestamp |

**TypeChoices:**
- `email` - Email Verification
- `phone` - Phone Verification
- `id` - ID Verification
- `photo` - Photo Verification

**StatusChoices:**
- `pending` - Pending
- `verified` - Verified
- `rejected` - Rejected
- `expired` - Expired

**Meta:**
```python
db_table = 'verifications'
ordering = ['-created_at']
```

**Hooks:**
- `save()` - Updates user verification flags (requires additional User fields)

**Related Names:**
- From User: `verifications`

**Note:** Current User model doesn't have `is_email_verified`, `is_phone_verified` fields yet.

---

### EmergencyContact Model

**Table:** `emergency_contacts`

User's emergency contacts for safety features.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Primary key |
| `user` | ForeignKey(User) | Required, CASCADE | Contact owner |
| `name` | CharField(100) | Required | Contact name |
| `phone_number` | CharField(20) | Required | Contact phone |
| `relationship` | CharField(50) | Optional | Relationship to user |
| `notify_on_checkin` | BooleanField | Default: False | Auto-notify on check-in |
| `notify_on_activity_join` | BooleanField | Default: False | Auto-notify on activity join |
| `created_at` | DateTimeField | Auto | Creation timestamp |

**Meta:**
```python
db_table = 'emergency_contacts'
ordering = ['name']
```

**Related Names:**
- From User: `emergency_contacts`

---

## Relationships Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                            USER                                   │
│  - email (unique)                                                 │
│  - username                                                       │
│  - bio, avatar                                                    │
└──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────────┘
       │      │      │      │      │      │      │
       │      │      │      │      │      │      └─────────┐
       │      │      │      │      │      │                │
       ▼      ▼      ▼      ▼      ▼      ▼                ▼
   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      ┌──────────────┐
   │ACT │ │LOC │ │CON │ │MSG │ │REV │ │REP │      │  EMERGENCY   │
   │    │ │    │ │    │ │    │ │    │ │    │      │   CONTACT    │
   └─┬──┘ └────┘ └────┘ └────┘ └────┘ └────┘      └──────────────┘
     │
     ├─────┬──────────┬─────────────┐
     ▼     ▼          ▼             ▼
  ┌────┐ ┌────┐  ┌────────┐  ┌──────────┐
  │CAT │ │PAR │  │COMMENT │  │VERIF     │
  └────┘ └────┘  └────────┘  └──────────┘
```

**Legend:**
- ACT = Activity
- LOC = UserLocation
- CON = Connection
- MSG = Message
- REV = UserReview
- REP = Report
- CAT = ActivityCategory
- PAR = ActivityParticipant
- VERIF = Verification

---

## Indexes & Performance

### Spatial Indexes

**Activities:**
```python
Index(fields=['latitude', 'longitude'])  # Nearby activities search
```

**UserLocation:**
```python
Index(fields=['latitude', 'longitude'])  # Nearby users search
Index(fields=['is_current', 'is_visible'])  # Filter current visible locations
```

### Temporal Indexes

**Activities:**
```python
Index(fields=['start_time'])  # Filter upcoming activities
Index(fields=['status'])  # Filter by status
```

**UserLocation:**
```python
Index(fields=['-timestamp'])  # Recent locations first
```

**Messages:**
```python
Index(fields=['-sent_at'])  # Recent messages first
Index(fields=['sender', 'recipient'])  # Conversation queries
```

### Recommendations for Production

1. **PostGIS Extension**: Use PostgreSQL with PostGIS for efficient spatial queries
   ```python
   # Install: apt-get install postgis postgresql-contrib
   # In settings.py:
   INSTALLED_APPS += ['django.contrib.gis']
   
   # Change location fields to:
   from django.contrib.gis.db.models import PointField
   location = PointField(geography=True)
   ```

2. **Database Indexes**: Current indexes cover basic queries, but consider:
   - Composite indexes for common filter combinations
   - Partial indexes for filtered queries (e.g., `WHERE status='active'`)
   - GIN indexes for full-text search on descriptions

3. **Caching**: Use Redis for:
   - User location cache (expire after 5 minutes)
   - Nearby users/activities (invalidate on location update)
   - Connection status (invalidate on status change)

4. **Query Optimization**:
   - Use `select_related()` for foreign keys
   - Use `prefetch_related()` for reverse foreign keys and M2M
   - Implement pagination on all list views

---

## Future Enhancements

### Planned Models (Currently Commented Out)

**PersonalityTrait**
- Predefined personality traits (e.g., "Adventurous", "Social")
- M2M relationship with User through UserPersonalityTrait
- Used for personality matching

**UserPreferences**
- One-to-one with User
- Discovery settings (radius, age range, min trust score)
- Notification preferences
- Privacy settings

### Additional User Fields (Planned)

```python
# Add to User model:
is_email_verified = models.BooleanField(default=False)
is_phone_verified = models.BooleanField(default=False)
is_verified = models.BooleanField(default=False)
trust_score = models.DecimalField(max_digits=3, decimal_places=2, default=3.00)
phone_number = models.CharField(max_length=20, blank=True)
date_of_birth = models.DateField(null=True, blank=True)
```

---

## Migration History

**Current State:**
- All models migrated and functional
- Database uses `db.sqlite3` in development
- Ready for PostgreSQL/PostGIS in production

**Pending Migrations:**
- None (all apps migrated)

**Rolling Back:**
```bash
# Rollback specific app
python manage.py migrate activities 0001

# Reset entire database
python manage.py flush
python manage.py migrate
```

---

## Seeding Data

Use `seed_data.py` to populate development database:

```python
python manage.py shell
>>> exec(open('seed_data.py').read())
>>> seed_all()
```

This creates:
- Activity categories
- Sample users
- Sample activities
- Sample locations
- Sample connections

---

**Last Updated:** December 6, 2025  
**Schema Version:** 1.0
