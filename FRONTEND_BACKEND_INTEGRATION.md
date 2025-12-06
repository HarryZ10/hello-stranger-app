# Frontend-Backend Integration Guide

This guide will help you connect your React Native/Expo frontend to the Django backend.

## 📁 File Structure

I've created API client files in `/src/api/`:

```
frontend/src/api/
├── client.ts      # Base HTTP client with GET, POST, PUT, DELETE
├── auth.ts        # Authentication endpoints (login, register, profile)
├── activities.ts  # Activities endpoints (list, create, join)
└── users.ts       # Users endpoints (profile, nearby users, traits)
```

## 🚀 Step 1: Start Backend

In a terminal, navigate to the backend folder and run:

```bash
cd backend
python manage.py runserver
```

Your backend will be at `http://localhost:8000/api`

## 🔐 Step 2: Set Up Authentication

### In your app component (e.g., landing page or onboarding):

```tsx
import { authService } from "@/src/api/auth";

// Register new user
const handleRegister = async () => {
  const response = await authService.register({
    email: "user@example.com",
    password: "securepassword123",
    first_name: "John",
    last_name: "Doe",
  });

  if (response.data?.id) {
    console.log("User registered:", response.data);
  } else {
    console.error("Registration failed:", response.error);
  }
};

// Login user
const handleLogin = async () => {
  const response = await authService.login({
    email: "user@example.com",
    password: "securepassword123",
  });

  if (response.data?.access) {
    console.log("Logged in! Token:", response.data.access);
    // Now you can make authenticated requests
  } else {
    console.error("Login failed:", response.error);
  }
};

// Get current user profile
const handleGetProfile = async () => {
  const response = await authService.getProfile();
  console.log("Current user:", response.data);
};
```

## 📍 Step 3: Load Nearby Activities

Update your map screen to fetch real activities from backend:

```tsx
import { activitiesService, type Activity } from '@/src/api/activities';
import { useState, useEffect } from 'react';

export default function MapScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyActivities = async (latitude: number, longitude: number) => {
    setLoading(true);
    const response = await activitiesService.listNearby(latitude, longitude, radius: 10);

    if (response.data?.results) {
      setActivities(response.data.results);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch activities when component mounts
    fetchNearbyActivities(37.7749, -122.4194); // Example: San Francisco
  }, []);

  // Use activities state to populate map pins
  return (
    // ... your map with activities as pins
  );
}
```

## 🎯 Step 4: Create New Activities

Replace your form submission with API call:

```tsx
import { activitiesService } from "@/src/api/activities";

const handleCreateActivity = async () => {
  const response = await activitiesService.createActivity({
    title: "Basketball Game",
    description: "Looking for people to play basketball",
    category: "sports",
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
  });

  if (response.data?.id) {
    console.log("Activity created:", response.data);
    // Refresh activities list
  } else {
    console.error("Failed to create activity:", response.error);
  }
};
```

## 👥 Step 5: Get Nearby Users

```tsx
import { usersService } from '@/src/api/users';

const handleGetNearbyUsers = async () => {
  const response = await usersService.getNearbyUsers(
    userLocation.latitude,
    userLocation.longitude,
    radius: 5
  );

  if (response.data?.results) {
    console.log('Nearby users:', response.data.results);
  }
};
```

## 🔄 Common Patterns

### Error Handling

```tsx
const response = await authService.login({ email, password });

if (response.statusCode === 401) {
  console.error("Invalid credentials");
} else if (response.statusCode === 404) {
  console.error("User not found");
} else if (response.error) {
  console.error("Error:", response.error);
} else {
  console.log("Success:", response.data);
}
```

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    const response = await activitiesService.listNearby(lat, lng);
    // Handle response
  } finally {
    setIsLoading(false);
  }
};

return <ActivityIndicator animating={isLoading} />;
```

### Storing Tokens (Optional)

For now, tokens are stored in memory. To persist them:

```tsx
// Install: npm install expo-secure-store
import * as SecureStore from "expo-secure-store";

const handleLogin = async () => {
  const response = await authService.login({ email, password });

  if (response.data?.access) {
    await SecureStore.setItemAsync("accessToken", response.data.access);
    await SecureStore.setItemAsync("refreshToken", response.data.refresh);
  }
};

// On app start, restore token:
useEffect(() => {
  const restoreToken = async () => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      apiClient.setAccessToken(token);
    }
  };
  restoreToken();
}, []);
```

## 📚 API Endpoints Available

### Authentication

- `POST /api/auth/register/` - Create new user account
- `POST /api/auth/login/` - Get access and refresh tokens
- `POST /api/auth/refresh/` - Get new access token
- `POST /api/auth/verify/` - Verify token validity

### Users

- `GET /api/users/me/` - Get your profile
- `PUT /api/users/me/` - Update your profile
- `GET /api/users/nearby/` - Get nearby users
- `GET /api/users/{id}/` - Get another user's profile

### Activities

- `GET /api/activities/` - List activities (with filters)
- `POST /api/activities/` - Create new activity
- `GET /api/activities/{id}/` - Get activity details
- `POST /api/activities/{id}/join/` - Join an activity
- `POST /api/activities/{id}/leave/` - Leave an activity

### More Endpoints

Check the backend documentation at: http://localhost:8000/api/docs/

## ⚠️ Important Notes

1. **Backend must be running** at `localhost:8000` for API calls to work
2. **CORS might block requests** - Backend is configured to allow `localhost:19000` (Expo)
3. **Tokens expire** - Implement token refresh logic for production
4. **Test API** - Visit http://localhost:8000/api/docs/ to test endpoints directly
5. **Database** - Backend uses SQLite by default, data persists between restarts

## 🧪 Testing the Connection

### Quick Test in any screen:

```tsx
import { authService } from "@/src/api/auth";

export default function TestScreen() {
  const handleTest = async () => {
    const response = await authService.login({
      email: "test@example.com",
      password: "test",
    });
    console.log("Response:", response);
  };

  return (
    <TouchableOpacity onPress={handleTest}>
      <ThemedText>Test API Connection</ThemedText>
    </TouchableOpacity>
  );
}
```

## 📖 Next Steps

1. Create a login screen using `authService`
2. Add activity creation form that calls `activitiesService.createActivity()`
3. Replace mock data in map with real API responses
4. Implement token persistence with SecureStore
5. Add error handling and loading states throughout
6. Test on actual device with `npm run ios` or `npm run android`

## 💡 Tips

- Start with authentication first - everything else depends on valid tokens
- Use the backend API docs (`/api/docs/`) to test endpoints directly
- Check browser console for network errors (XHR requests)
- Use React DevTools to inspect component state during API calls
- Keep API client functions simple and focused on one endpoint each

Need help with specific parts? Let me know!
