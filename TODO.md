# 📋 Implementation TODO List

> Detailed task list for completing the Social Activity Finder MVP

---

## 🎯 Priority Legend

- 🔴 **P0** - Critical for MVP demo
- 🟠 **P1** - Important for user experience
- 🟡 **P2** - Nice to have
- 🟢 **P3** - Future enhancement

---

## 📱 Frontend (Expo/React Native)

### Authentication & Onboarding

- [ ] 🔴 **P0** Create login screen with email/password form
- [ ] 🔴 **P0** Create registration screen with form validation
- [ ] 🔴 **P0** Implement auth flow (redirect to login if not authenticated)
- [ ] 🔴 **P0** Add logout functionality in profile/settings
- [ ] 🟠 **P1** Create onboarding flow for new users (personality traits selection)
- [ ] 🟠 **P1** Add "Forgot Password" flow
- [ ] 🟡 **P2** Social login (Google, Apple Sign-In)
- [ ] 🟡 **P2** Email verification screen

### Map & Location Features

- [ ] 🔴 **P0** Integrate `react-native-maps` with MapView
- [ ] 🔴 **P0** Show user's current location on map
- [ ] 🔴 **P0** Display activity markers on map with category-colored pins
- [ ] 🔴 **P0** Implement location permission request flow
- [ ] 🟠 **P1** Add map clustering for nearby activities
- [ ] 🟠 **P1** Create custom map marker components with activity preview
- [ ] 🟠 **P1** Add "Center on my location" button
- [ ] 🟡 **P2** Implement map search/geocoding
- [ ] 🟡 **P2** Add activity radius visualization on map

### Activity Features

- [ ] 🔴 **P0** Create "Create Activity" screen with form
  - [ ] Title, description, category selection
  - [ ] Date/time picker for start time
  - [ ] Location picker (tap on map or search)
  - [ ] Max participants slider
  - [ ] Visibility selector (public/friends/invite)
- [ ] 🔴 **P0** Create Activity Detail screen
  - [ ] Show full activity info
  - [ ] List of participants with avatars
  - [ ] Join/Leave button
  - [ ] Comments section
  - [ ] Share activity button
- [ ] 🔴 **P0** Connect activity list to real API (replace mock data)
- [ ] 🟠 **P1** Add activity filtering (date, distance, category)
- [ ] 🟠 **P1** Implement activity search
- [ ] 🟠 **P1** Add "My Activities" screen (created & joined)
- [ ] 🟠 **P1** Implement activity edit/delete for creators
- [ ] 🟠 **P1** Add check-in/check-out functionality
- [ ] 🟡 **P2** Activity image upload
- [ ] 🟡 **P2** Activity invite system
- [ ] 🟢 **P3** Recurring activities

### Social Features

- [ ] 🔴 **P0** Connect friends list to real API
- [ ] 🔴 **P0** Implement send friend request
- [ ] 🔴 **P0** Implement accept/decline friend request
- [ ] 🟠 **P1** Create user profile view screen
- [ ] 🟠 **P1** Implement direct messaging
  - [ ] Conversation list
  - [ ] Chat screen with message input
  - [ ] Real-time updates (polling or WebSocket)
- [ ] 🟠 **P1** Add "Discover People" with nearby users
- [ ] 🟡 **P2** Block/unblock user functionality
- [ ] 🟡 **P2** User search
- [ ] 🟢 **P3** Push notifications for messages

### Profile & Settings

- [ ] 🔴 **P0** Create Profile screen
  - [ ] Display user info (name, bio, avatar)
  - [ ] Trust score display
  - [ ] Personality traits display
  - [ ] Edit profile button
- [ ] 🔴 **P0** Create Edit Profile screen
  - [ ] Update name, bio
  - [ ] Avatar upload
  - [ ] Personality traits management
- [ ] 🟠 **P1** Create Settings screen
  - [ ] Notification preferences
  - [ ] Privacy settings (location visibility)
  - [ ] Discovery preferences (radius, age range)
- [ ] 🟠 **P1** Add emergency contacts management
- [ ] 🟡 **P2** Account deletion
- [ ] 🟡 **P2** Data export

### Safety Features

- [ ] 🟠 **P1** Create review/rating screen after activity ends
- [ ] 🟠 **P1** Display reviews on user profiles
- [ ] 🟠 **P1** Implement report user flow
- [ ] 🟡 **P2** SOS button with emergency contact notification
- [ ] 🟡 **P2** ID verification flow
- [ ] 🟢 **P3** Safety score visualization

### UI/UX Polish

- [ ] 🟠 **P1** Add loading states/skeletons for all screens
- [ ] 🟠 **P1** Add pull-to-refresh on all lists
- [ ] 🟠 **P1** Implement proper error handling with user-friendly messages
- [ ] 🟠 **P1** Add empty states for all lists
- [ ] 🟡 **P2** Add haptic feedback on interactions
- [ ] 🟡 **P2** Implement dark/light mode toggle
- [ ] 🟡 **P2** Add animations for transitions
- [ ] 🟢 **P3** Accessibility improvements (VoiceOver, TalkBack)

---

## 🔧 Backend (Django)

### API Improvements

- [ ] 🔴 **P0** Test all endpoints with frontend integration
- [ ] 🟠 **P1** Add pagination to all list endpoints
- [ ] 🟠 **P1** Implement activity filtering (by category, date, distance)
- [ ] 🟠 **P1** Add nearby activities endpoint with haversine filtering
- [ ] 🟠 **P1** Add nearby users endpoint
- [ ] 🟡 **P2** Implement full-text search for activities
- [ ] 🟡 **P2** Add rate limiting to sensitive endpoints

### Real-time Features

- [ ] 🟠 **P1** Set up Django Channels for WebSocket support
- [ ] 🟠 **P1** Implement real-time messaging
- [ ] 🟡 **P2** Real-time activity updates
- [ ] 🟡 **P2** Real-time location sharing for friends

### Notifications

- [ ] 🟠 **P1** Set up push notification service (Firebase/Expo)
- [ ] 🟠 **P1** Notification for new messages
- [ ] 🟠 **P1** Notification for friend requests
- [ ] 🟠 **P1** Notification for activity invites
- [ ] 🟡 **P2** Notification for nearby activities
- [ ] 🟡 **P2** Notification preferences API

### Safety & Moderation

- [ ] 🟠 **P1** Email verification implementation
- [ ] 🟠 **P1** Phone verification (Twilio/similar)
- [ ] 🟡 **P2** Content moderation for activity descriptions
- [ ] 🟡 **P2** Automated spam detection
- [ ] 🟢 **P3** Admin dashboard for report management

### Production Readiness

- [ ] 🟠 **P1** Switch to PostgreSQL with PostGIS for production
- [ ] 🟠 **P1** Set up proper environment variables
- [ ] 🟠 **P1** Configure CORS for production domains
- [ ] 🟠 **P1** Set up file storage (S3/Cloudinary) for images
- [ ] 🟡 **P2** Add comprehensive logging
- [ ] 🟡 **P2** Set up error monitoring (Sentry)
- [ ] 🟡 **P2** Performance optimization (caching, query optimization)
- [ ] 🟢 **P3** Load testing

---

## 🧪 Testing

### Frontend Tests

- [ ] 🟠 **P1** Unit tests for API client functions
- [ ] 🟠 **P1** Unit tests for Zustand stores
- [ ] 🟡 **P2** Component tests for key components
- [ ] 🟡 **P2** E2E tests for critical flows (login, create activity)

### Backend Tests

- [ ] 🟠 **P1** Unit tests for models
- [ ] 🟠 **P1** API tests for all endpoints
- [ ] 🟡 **P2** Integration tests
- [ ] 🟡 **P2** Load testing for location queries

---

## 📚 Documentation

- [ ] 🔴 **P0** ~~API documentation~~ ✅ Done
- [ ] 🔴 **P0** ~~Models documentation~~ ✅ Done
- [ ] 🟠 **P1** Setup/installation guide for new developers
- [ ] 🟠 **P1** Environment variables documentation
- [ ] 🟡 **P2** Architecture decision records (ADRs)
- [ ] 🟡 **P2** Contributing guidelines

---

## 🚀 Deployment

### Backend Deployment

- [ ] 🟠 **P1** Dockerize the backend for deployment
- [ ] 🟠 **P1** Set up CI/CD pipeline
- [ ] 🟡 **P2** Deploy to cloud (Railway, Render, or AWS)
- [ ] 🟡 **P2** Set up staging environment

### Frontend Deployment

- [ ] 🟠 **P1** Configure EAS Build for iOS/Android
- [ ] 🟡 **P2** Set up OTA updates with EAS Update
- [ ] 🟡 **P2** App Store / Play Store submission prep

---

## 🎪 Hackathon Demo Priorities

For the hackathon demo, focus on these features in order:

### Must Have for Demo (Day 1-2)
1. [ ] Login/Registration working with backend
2. [ ] Map showing with current location
3. [ ] Activities displayed on map and in list
4. [ ] Create a new activity
5. [ ] View activity details
6. [ ] Join an activity

### Should Have for Demo (Day 2-3)
7. [ ] User profile with personality traits
8. [ ] Friends list working
9. [ ] Basic messaging
10. [ ] Categories filtering

### Nice to Have for Demo (If Time Permits)
11. [ ] Reviews after activity
12. [ ] Discover nearby users
13. [ ] Activity check-in
14. [ ] Pretty animations

---

## 📝 Quick Start Tasks

Start with these tasks to get the frontend connected to the backend:

```bash
# 1. Make sure backend is running
cd backend && python manage.py runserver 0.0.0.0:8000

# 2. Update API URL in frontend (for device testing)
# Edit sample/src/api/client.ts and set your local IP
# const API_BASE_URL = 'http://192.168.x.x:8000/api/v1';

# 3. Start frontend
cd sample && npx expo start
```

### First Integration Tasks:
1. Test registration from app → backend
2. Test login and token storage
3. Fetch and display real categories from backend
4. Fetch and display real activities from backend

---

*Last Updated: December 5, 2025*
