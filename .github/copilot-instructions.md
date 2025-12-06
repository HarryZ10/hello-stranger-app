# GitHub Copilot Instructions - Social Activity Finder

## Project Overview

**Social Activity Finder** is a location-based social networking app connecting people through real-time activities. Built with Django REST Framework backend + Expo React Native frontend.

- **Backend**: Django 5.0.9, DRF, JWT auth, PostgreSQL/SQLite
- **Frontend**: Expo Router (file-based routing), Zustand state management, React Query, TypeScript
- **Key Features**: Activity creation/discovery, friend connections, personality matching, safety features, real-time location tracking

## Architecture

### Monorepo Structure
```
mlh-project/
├── backend/         # Django REST API
│   ├── config/      # Django settings (settings.py, urls.py)
│   └── apps/        # 5 Django apps (users, activities, locations, social, safety)
├── sample/          # Sample Expo frontend
└── frontend/        # Primary Expo app to be developed after sample
```

### Backend: 5 Django Apps Pattern

Each app follows the same structure with clear separation of concerns:
- `models.py` - Database models
- `serializers.py` - DRF serializers for API responses
- `views.py` - Class-based views (generics.ListAPIView, APIView)
- `urls.py` - App-specific URL patterns
- `admin.py` - Django admin configuration

**Apps & Their Responsibilities:**
1. **users** - Custom User model (email auth), personality traits, preferences, nearby user discovery
2. **activities** - Activity CRUD, categories, participants, comments, check-in/out
3. **locations** - User location tracking with PostGIS support
4. **social** - Friend connections (pending/accepted/blocked), direct messaging
5. **safety** - User reviews, reports, emergency contacts, verification

### Frontend: Expo Router File-Based Routing

```
sample/app/
├── _layout.tsx           # Root layout with auth protection
├── login.tsx             # Auth screens (not in tabs)
├── register.tsx
├── (tabs)/              # Tab navigation group
│   ├── _layout.tsx      # Bottom tabs config
│   ├── index.tsx        # Home/Map screen
│   ├── activities.tsx   # Activity list
│   └── profile.tsx      # User profile
└── activity/[id].tsx    # Dynamic route for activity details
```

**Key Pattern**: `useProtectedRoute()` in `_layout.tsx` redirects unauthenticated users to `/login` automatically.

### State Management

- **Zustand stores** in `sample/src/store/`:
  - `authStore.ts` - User auth state, login/logout, token management
  - Each store is simple: state + actions, no complex middleware
  
- **React Query** for server state:
  - API calls in `sample/src/api/` (e.g., `authApi.ts`, `activitiesApi.ts`)
  - Queries/mutations managed per screen, not in stores

### API Client Pattern

`sample/src/api/client.ts` provides:
- Axios instance with JWT token interceptor
- Automatic token refresh on 401 errors with request queue
- Platform-aware storage (SecureStore on native, localStorage on web)
- Base URL: `http://localhost:8000/api/v1`

**Example usage:**
```typescript
// In any API file
import { apiClient } from './client';

export const activitiesApi = {
  getActivities: () => apiClient.get('/activities/'),
  createActivity: (data) => apiClient.post('/activities/', data),
};
```

## Development Workflows

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000
```

**Seed initial data:**
```python
python manage.py shell
>>> exec(open('seed_data.py').read())
>>> seed_all()
```

**Key environment variables** (`.env`):
- `DEBUG=True` for development
- `USE_POSTGRES=False` to use SQLite locally
- `CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000`

### Frontend Setup

```bash
cd sample
npm install
npx expo start
# Press 'i' for iOS simulator, 'a' for Android emulator, 'w' for web
```

**Clear cache if dependencies change:**
```bash
npx expo start --clear
```

### Testing API

- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/docs/ (DRF Spectacular)
- **Manual Testing**: Use Postman/curl with JWT tokens from login response

## Code Conventions

### Backend

**ViewSets vs Class-Based Views**: This project uses **class-based generic views** (not ViewSets).
- List: `generics.ListAPIView`
- Create: `generics.CreateAPIView`
- Retrieve/Update: `generics.RetrieveUpdateAPIView`
- Custom logic: `APIView` with explicit methods

**Example from `backend/apps/activities/views.py`:**
```python
class ActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActivityCreateSerializer
        return ActivityListSerializer
```

**URL patterns** are nested under `/api/v1/` in `config/urls.py`:
```python
urlpatterns = [
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/activities/', include('apps.activities.urls')),
    # ...
]
```

### Frontend

**Import aliases** configured in `tsconfig.json`:
```typescript
import { useAuthStore } from '@/src/store/authStore';  // @ = root
import Colors from '@/constants/Colors';
```

**Component patterns**:
- Use functional components with TypeScript
- Extract reusable components to `components/` (e.g., `ActivityCard.tsx`)
- Keep screen logic in `app/` route files

**Styling**: Uses React Native Paper for UI components + inline StyleSheet.create

## Critical Integration Points

### Authentication Flow
1. User registers → `POST /api/v1/auth/register/`
2. User logs in → `POST /api/v1/auth/login/` returns `{access, refresh}` tokens
3. Tokens stored via `tokenStorage.setTokens()` (SecureStore/localStorage)
4. `apiClient` adds `Authorization: Bearer <token>` to all requests
5. On 401, auto-refresh token, retry request, or logout if refresh fails

### Location Tracking
- `expo-location` requests permissions on first use
- Current location stored in Zustand, sent to `POST /api/v1/locations/update-location/`
- Backend uses PostGIS (optional) or lat/lon fields for spatial queries

### Activity Discovery
- Home screen (`(tabs)/index.tsx`) shows map with activity markers
- Filters: category, distance radius, date range via query params
- Join activity: `POST /api/v1/activities/{id}/join/`
- Leave: `DELETE /api/v1/activities/{id}/leave/`

## Common Gotchas

- **API URL mismatch**: Frontend uses `http://localhost:8000/api/v1`, ensure backend CORS allows it
- **Token expiry**: Access tokens expire in 5 minutes, refresh tokens in 1 day (see `config/settings.py` JWT config)
- **Expo Router**: File moves require Metro cache clear (`npx expo start --clear`)
- **SecureStore on web**: Falls back to localStorage, may lose session on refresh in dev
- **Migration conflicts**: Run `python manage.py migrate --fake` if seed data conflicts with existing DB

## Documentation References

- **Backend API**: `backend/API_DOCUMENTATION.md` - Full endpoint reference with examples
- **Database Models**: `backend/MODELS_DOCUMENTATION.md` - Complete schema with relationships
- **Expo Setup**: `EXPO_SETUP.md` - Initial project creation steps
- **TODO List**: `TODO.md` - Prioritized feature backlog (P0 = critical for MVP)

## Adding New Features

### Backend: New API Endpoint
1. Define model in `apps/<app>/models.py`
2. Create serializer in `serializers.py`
3. Add view in `views.py` (use appropriate generic class)
4. Register URL in `urls.py`
5. Run `python manage.py makemigrations && python manage.py migrate`

### Frontend: New Screen
1. Create file in `app/` (e.g., `app/settings.tsx` for `/settings` route)
2. Add navigation link in appropriate tab layout or component
3. Create API functions in `src/api/` if server calls needed
4. Use React Query for data fetching: `useQuery(['key'], apiCall)`

---

**When in doubt**: Check existing patterns in similar components. This codebase prioritizes consistency over cleverness.
