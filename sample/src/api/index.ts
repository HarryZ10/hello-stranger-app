// Export API client
export { default as apiClient, tokenStorage } from './client';

// Export all endpoint modules
export { activitiesApi } from './endpoints/activities';
export { authApi } from './endpoints/auth';
export { locationsApi } from './endpoints/locations';
export { safetyApi } from './endpoints/safety';
export { socialApi } from './endpoints/social';
export { usersApi } from './endpoints/users';

// Re-export types for convenience
export type {
    ActivityFilters, CreateActivityData
} from './endpoints/activities';

export type {
    UpdateLocationData
} from './endpoints/locations';

export type {
    CreateReportData, CreateReviewData, EmergencyContactData
} from './endpoints/safety';

