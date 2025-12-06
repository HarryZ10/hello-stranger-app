import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to access auth state and actions
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    initialize,
    login,
    register,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };
}

export default useAuth;
