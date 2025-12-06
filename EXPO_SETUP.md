# 📱 Expo React Native Sample Setup

> Quick guide to create a sample Expo React Native project for the Social Activity Finder app.

---

## Prerequisites

Make sure you have the following installed:

```bash
# Node.js (v18 or later)
node --version

# npm or yarn
npm --version

# Expo CLI (install globally if not present)
npm install -g expo-cli
```

---

## Create Sample Project

### 1. Create New Expo Project

```bash
# Navigate to project root
cd /Users/harryzhu/code/mlh-project

# Create new Expo project with TypeScript template
npx create-expo-app@latest sample --template expo-template-blank-typescript

# Or use the tabs template for navigation
npx create-expo-app@latest sample --template tabs
```

### 2. Navigate to Sample Directory

```bash
cd sample
```

### 3. Install Core Dependencies

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State Management & Data Fetching
npm install @tanstack/react-query axios zustand

# UI Components
npm install react-native-paper
npx expo install react-native-gesture-handler react-native-reanimated

# Location Services
npx expo install expo-location

# Maps
npx expo install react-native-maps

# Storage
npx expo install @react-native-async-storage/async-storage

# Auth Token Storage
npx expo install expo-secure-store
```

### 4. Start Development Server

```bash
# Start Expo development server
npx expo start

# Or start with tunnel for testing on physical device
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

---

## Project Structure

After setup, your sample directory should look like:

```
sample/
├── app.json              # Expo configuration
├── App.tsx               # Entry point
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── babel.config.js       # Babel configuration
├── assets/               # Images, fonts, etc.
├── src/
│   ├── api/              # API client & endpoints
│   │   ├── client.ts     # Axios instance
│   │   └── endpoints/    # API endpoint functions
│   ├── components/       # Reusable components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation setup
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── app/                  # Expo Router (if using tabs template)
```

---

## Quick Start Files

### Create API Client (`src/api/client.ts`)

```bash
mkdir -p sample/src/api
cat > sample/src/api/client.ts << 'EOF'
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
EOF
```

### Create Auth Store (`src/store/authStore.ts`)

```bash
mkdir -p sample/src/store
cat > sample/src/store/authStore.ts << 'EOF'
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  username: string;
  display_name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/users/login/', { email, password });
      const { access, refresh, user } = response.data;
      
      await SecureStore.setItemAsync('accessToken', access);
      await SecureStore.setItemAsync('refreshToken', refresh);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/users/register/', data);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
EOF
```

---

## Running on Devices

### iOS Simulator

```bash
# Start iOS simulator
npx expo start --ios
```

### Android Emulator

```bash
# Start Android emulator
npx expo start --android
```

### Physical Device

1. Install **Expo Go** app from App Store or Play Store
2. Run `npx expo start`
3. Scan QR code with Expo Go (Android) or Camera app (iOS)

---

## Connecting to Backend

Make sure the Django backend is running:

```bash
# In another terminal
cd backend
python manage.py runserver 0.0.0.0:8000
```

For physical device testing, update `API_BASE_URL` in `src/api/client.ts`:

```typescript
// Use your computer's local IP address
const API_BASE_URL = 'http://192.168.x.x:8000/api/v1';
```

Find your IP:
```bash
# macOS
ipconfig getifaddr en0
```

---

## Useful Commands

```bash
# Check for issues
npx expo-doctor

# Install a specific Expo SDK package
npx expo install <package-name>

# Update Expo SDK
npx expo upgrade

# Build for production (requires EAS)
npx eas build --platform ios
npx eas build --platform android

# Run tests
npm test

# Lint code
npm run lint
```

---

## Environment Variables

Create `.env` file in sample directory:

```bash
cat > sample/.env << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
```

Access in code:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

*Created for MLH Hackathon 2025 - Social Activity Finder*
