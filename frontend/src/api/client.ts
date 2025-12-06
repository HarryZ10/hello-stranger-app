// Simple API client for connecting to Django backend
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Allow override from env at build time (Expo env vars must be prefixed with EXPO_PUBLIC_)
const ENV_BACKEND_HOST = process.env.EXPO_PUBLIC_BACKEND_HOST;
const ENV_BACKEND_PORT = process.env.EXPO_PUBLIC_BACKEND_PORT;

// Resolve host by priority: env → Expo dev host IP → platform fallback
const resolveHost = () => {
  console.log(`[API Client] ENV_BACKEND_HOST: ${ENV_BACKEND_HOST}`);
  console.log(`[API Client] Constants.expoConfig?.hostUri: ${Constants.expoConfig?.hostUri}`);
  
  if (ENV_BACKEND_HOST) {
    console.log(`[API Client] Using EXPO_PUBLIC_BACKEND_HOST: ${ENV_BACKEND_HOST}`);
    return ENV_BACKEND_HOST;
  }

  // In Expo dev, hostUri looks like "192.168.x.x:19000"; use that IP so devices can reach the backend.
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (expoHost) {
    console.log(`[API Client] Using Expo hostUri: ${expoHost}`);
    return expoHost;
  }

  if (Platform.OS === 'android') {
    console.log(`[API Client] Using Android emulator host: 10.0.2.2`);
    return '10.0.2.2';
  }
  if (Platform.OS === 'ios') {
    console.log(`[API Client] Using iOS simulator fallback: 192.168.0.245`);
    return '192.168.0.245';
  }
  console.log(`[API Client] Using default localhost`);
  return '127.0.0.1';
};

const resolvePort = () => {
  if (ENV_BACKEND_PORT) return Number(ENV_BACKEND_PORT);
  return 8000;
};

// For iOS simulator: use your Mac's local network IP
// For Android emulator: use 10.0.2.2 (which maps to host machine)
// For physical device: use your computer's actual IP
const getAPIBaseURL = () => {
  const port = resolvePort();
  const host = resolveHost();
  return `http://${host}:${port}/api`;
};

const API_BASE_URL = getAPIBaseURL();

console.log(`[API Client Initialized] Using API URL: ${API_BASE_URL}`);

interface ApiResponse<T> {
  data?: T;
  error?: string | Record<string, any>;
  statusCode: number;
}

export class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`[API GET] ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log(`[API GET Response] Status: ${response.status}`);
      const data = await response.json();
      console.log(`[API GET Data]`, data);
      
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : (data.detail || data || 'Error occurred'),
        statusCode: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error(`[API GET ERROR]`, errorMessage, error);
      return {
        error: errorMessage,
        statusCode: 0,
      };
    }
  }

  async post<T>(endpoint: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`[API POST] Calling: ${url}`, body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      console.log(`[API POST Response] ${response.status}`, data);
      
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : (data.detail || data || 'Error occurred'),
        statusCode: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error(`[API POST ERROR] Failed to reach ${API_BASE_URL}${endpoint}:`, errorMessage);
      return {
        error: errorMessage,
        statusCode: 0,
      };
    }
  }

  async put<T>(endpoint: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.detail || 'Error occurred',
        statusCode: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = response.status !== 204 ? await response.json() : null;
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data?.detail || 'Error occurred',
        statusCode: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
