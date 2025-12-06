# GitHub Copilot Instructions - Social Activity Finder Backend

## Project Overview

**Social Activity Finder** is a location-based social networking Django REST API backend for connecting people through real-time activities.

- **Stack**: Django 5.0.9, DRF 3.15, JWT auth (simplejwt), PostgreSQL/SQLite
- **Architecture**: Monorepo with 5 Django apps following single-responsibility pattern
- **Key Features**: Activity CRUD, friend connections, location tracking, safety/reviews, real-time messaging

## Architecture Overview

### 5-App Domain Model

**Critical**: Each app owns ONE domain concept with strict boundaries:

1. **users** (`apps/users/`) - Custom User model (email auth), user discovery
2. **activities** (`apps/activities/`) - Activity lifecycle, categories, participants, comments
3. **locations** (`apps/locations/`) - User location tracking with PostGIS support
4. **social** (`apps/social/`) - Friend connections (pending/accepted/blocked), direct messaging
5. **safety** (`apps/safety/`) - User reviews, reports, emergency contacts, verification

**Standard app structure** (strictly followed):
```
apps/<domain>/
├── models.py       # Django ORM models
├── serializers.py  # DRF serializers (validation + API representation)
├── views.py        # Class-based views (NOT ViewSets)
├── urls.py         # App-specific URL patterns
└── admin.py        # Django admin registration
```

### URL Routing Pattern

**All API endpoints** nest under `/api/` via `apps/api/urls.py`:

```python
# config/urls.py → apps/api/urls.py → apps/<domain>/urls.py
# Result: /api/activities/, /api/social/friends/, etc.
```

**Example**: Activity endpoints in `apps/activities/urls.py`:
- `/api/activities/` → ActivityListCreateView
- `/api/activities/<id>/` → ActivityDetailView
- `/api/activities/<id>/join/` → custom action view

**Auth endpoints** live in `apps/api/urls.py` directly:
- `/api/auth/login/` → TokenObtainPairView (simplejwt)
- `/api/auth/register/` → UserRegistrationView

## Development Workflows

### Initial Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### Environment Configuration

Create `.env` in `backend/` (required for settings.py):
```env
SECRET_KEY=your-secret-key
DEBUG=True
USE_POSTGRES=False  # True for PostgreSQL, False for SQLite
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000
```

**Database switching**: `USE_POSTGRES=False` uses SQLite (`db.sqlite3`), no setup needed.

### Seeding Data

**Must run AFTER migrations**:
```bash
python manage.py shell
>>> exec(open('seed_data.py').read())
>>> seed_all()  # Creates ActivityCategories
```

**Verify**: Check `http://localhost:8000/admin/` → Activity Categories

### Running Development Server

```bash
python manage.py runserver  # http://localhost:8000
```

**Key URLs**:
- Admin: `http://localhost:8000/admin/`
- API Docs (Swagger): `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

### Testing Workflow

**Pytest configured** in `conftest.py` with fixtures:
```bash
pytest                    # Run all tests
pytest apps/users/        # Test specific app
pytest -v --tb=short      # Verbose with short tracebacks
```

**Common fixture** (`conftest.py`):
```python
@pytest.fixture
def create_user(db, user_data):
    def make_user(**kwargs):
        return User.objects.create_user(**kwargs)
    return make_user
```

## Code Conventions

### Views: Generic Class-Based Views (NOT ViewSets)

**Critical**: This project uses **DRF generic views**, NOT `ModelViewSet` or `ViewSet`.

**Pattern**: Use generic base classes for standard CRUD:
```python
from rest_framework import generics, permissions

class ActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        # Dynamic serializer based on request method
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivityListSerializer
    
    def get_queryset(self):
        # Custom filtering logic
        return Activity.objects.filter(status='active')
```

**For custom actions**, use `APIView`:
```python
class ActivityJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        # Custom logic here
        return Response(data, status=status.HTTP_200_OK)
```

### Model Patterns

**User model** (`apps/users/models.py`) extends `AbstractUser`:
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    USERNAME_FIELD = 'email'  # Login with email, not username
    REQUIRED_FIELDS = ['username']
```

**Foreign key pattern** - Always use `settings.AUTH_USER_MODEL`:
```python
from django.conf import settings

creator = models.ForeignKey(
    settings.AUTH_USER_MODEL,  # NOT 'User' directly
    on_delete=models.CASCADE,
    related_name='created_activities'
)
```

**Choice fields** - Use `TextChoices`:
```python
class StatusChoices(models.TextChoices):
    ACTIVE = 'active', 'Active'
    COMPLETED = 'completed', 'Completed'

status = models.CharField(
    max_length=20,
    choices=StatusChoices.choices,
    default=StatusChoices.ACTIVE
)
```

### Serializer Patterns

**Dynamic serializers**: Different serializers for list vs detail:
```python
# List view - minimal fields
class ActivityListSerializer(serializers.ModelSerializer):
    creator = UserPublicSerializer(read_only=True)
    participant_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'title', 'creator', 'participant_count']

# Create/Update - validation + writable fields
class ActivityCreateSerializer(serializers.ModelSerializer):
    def validate_max_participants(self, value):
        if value < 2:
            raise serializers.ValidationError("Must allow at least 2 participants")
        return value
```

**Nested writes**: Set creator from request user:
```python
def perform_create(self, serializer):
    serializer.save(creator=self.request.user)
```

## Critical Integration Points

### Authentication Flow

**JWT tokens** via `djangorestframework-simplejwt`:
1. Login: `POST /api/auth/login/` → `{access: "...", refresh: "..."}`
2. Requests: `Authorization: Bearer <access_token>` header
3. Refresh: `POST /api/auth/refresh/` with `{refresh: "..."}` → new access token
4. Verify: `POST /api/auth/verify/` with `{token: "..."}`

**Token expiry** (from `config/settings.py`):
- Access tokens: 5 minutes
- Refresh tokens: 1 day

**Protected endpoints**: Add `permission_classes = [permissions.IsAuthenticated]`

### Location Tracking Architecture

**Pattern**: Frontend periodically POSTs location → Backend stores in `UserLocation` model
- Update: `POST /api/location/update-location/` with `{latitude, longitude}`
- Nearby users: Haversine formula query in `apps/locations/models.py`
- **PostGIS optional**: Falls back to simple lat/lon decimal fields

### Activity Participation Flow

**Join activity**:
1. `POST /api/activities/<id>/join/` creates `ActivityParticipant` record
2. View checks: activity not full, not already joined, not creator
3. Updates activity status to 'full' if max_participants reached

**Leave activity**:
1. `DELETE /api/activities/<id>/leave/` removes participant
2. Updates status back to 'active' if was 'full'

## Common Gotchas & Solutions

### Migration Issues
- **Conflict after seed**: `python manage.py migrate --fake-zero <app>` then `migrate` again
- **SQLite locked**: Close all Django shell sessions before migrating
- **Fresh start**: Delete `db.sqlite3` + all `*/migrations/` (except `__init__.py`)

### CORS Configuration
- **Frontend connection fails**: Check `CORS_ALLOWED_ORIGINS` in `.env` includes frontend URL
- **Default**: `http://localhost:8081,http://localhost:19000` (Expo dev server ports)

### Authentication Debugging
- **401 errors**: Check token in request: `curl -H "Authorization: Bearer <token>" <url>`
- **Token expired**: Tokens expire fast in dev - use refresh endpoint
- **Admin login**: Superuser uses username, API uses email

### Query Performance
- **N+1 queries**: Use `select_related()` for ForeignKey, `prefetch_related()` for ManyToMany
- **Example**: `Activity.objects.select_related('creator', 'category').all()`
- **Debug**: Enable `django-debug-toolbar` in dev (already in `INSTALLED_APPS` if `DEBUG=True`)

## Adding New Features

### Backend: New API Endpoint
1. Define model in `apps/<app>/models.py`
2. Create serializer in `serializers.py` with appropriate fields
3. Add view in `views.py` using generic class (ListAPIView, CreateAPIView, etc.)
4. Register URL pattern in `urls.py` with descriptive name
5. Run `python manage.py makemigrations && python manage.py migrate`
6. Test via admin panel or API docs at `/api/docs/`

**Example workflow**:
```bash
# 1. Add model field
python manage.py makemigrations apps.activities
python manage.py migrate

# 2. Update serializer to expose new field
# 3. Test in Django shell
python manage.py shell
>>> from apps.activities.models import Activity
>>> Activity.objects.all()

# 4. Verify in API docs
open http://localhost:8000/api/docs/
```

## Reference Documentation

- **API Endpoints**: `backend/API_DOCUMENTATION.md` - Complete endpoint reference with request/response examples
- **Database Schema**: `backend/MODELS_DOCUMENTATION.md` - All models, fields, and relationships
- **Feature Backlog**: `TODO.md` - Prioritized tasks (P0 = MVP critical, P1 = important, P2/P3 = future)

---

**Philosophy**: This codebase prioritizes **explicit over implicit** and **consistency over cleverness**. When implementing new features, follow existing patterns in similar components rather than introducing new approaches.
