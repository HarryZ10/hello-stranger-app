# 👋 Hello Stranger App

> **MVP Status**: Early development phase - Core features implemented, security enhancements planned

## 🎯 Inspiration

For the introverts who want to be extroverts. **Hello Stranger** is a safe space to connect with others in the real world while cutting down on the pressure to make the first move. We believe meaningful connections shouldn't require uncomfortable cold approaches.

## ✨ What It Does

Hello Stranger empowers users to:
- 🔍 **Discover** local events and activities in their area
- 🤝 **Connect** with like-minded people through shared interests
- 📍 **Join** activities without the awkwardness of traditional introductions
- 🗺️ **Explore** interactive maps showing nearby social opportunities

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HELLO STRANGER APP                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  REACT NATIVE    │◄───────►│   DJANGO REST    │◄───────►│  DIGITAL OCEAN   │
│    FRONTEND      │  HTTP   │   FRAMEWORK      │   SQL   │   POSTGRESQL     │
│                  │  REST   │                  │  Query  │                  │
│  - Expo Router   │         │  - API Endpoints │         │  - Managed DB    │
│  - Maps UI       │         │  - Auth System   │         │  - Scalable      │
│  - Activity Feed │         │  - ORM Models    │         │  - Session Pool  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                             │
        │                            │                             │
        ▼                            ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ TypeScript       │         │ Python 3.x       │         │ PostgreSQL 14+   │
│ Expo SDK         │         │ Django 4.x       │         │ Premium Hardware │
│ React Navigation │         │ Django REST FW   │         │ Auto-backups     │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

## 📂 Project Structure

```
mlh-project/
│
├── 📱 frontend/                 # React Native + Expo
│   ├── app/
│   │   ├── (tabs)/             # Tab-based navigation
│   │   │   ├── index.tsx       # Home/Activity feed
│   │   │   └── map.tsx         # Interactive map view
│   │   └── _layout.tsx         # Root layout
│   ├── components/
│   │   ├── map/                # Map-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── src/
│   │   ├── api/                # API client & endpoints
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript definitions
│   └── package.json
│
├── 🐍 backend/                  # Django REST API
│   ├── apps/
│   │   ├── activities/         # Event & activity models
│   │   ├── locations/          # Geographic data
│   │   ├── safety/             # Safety features
│   │   ├── social/             # Social interactions
│   │   └── users/              # User management
│   ├── config/
│   │   └── settings.py         # Django configuration
│   ├── requirements.txt
│   └── manage.py
│
└── 📚 documentation/
    ├── API_DOCUMENTATION.md
    └── MODELS_DOCUMENTATION.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context/Redux (planned)
- **Maps**: React Native Maps
- **Deployment**: Vercel (web preview)

### Backend
- **Framework**: Django 4.x
- **API**: Django REST Framework
- **Language**: Python 3.x
- **Authentication**: Django Auth (JWT planned)
- **Database ORM**: Django ORM

### Database
- **Platform**: Digital Ocean Managed PostgreSQL
- **Features**: 
  - Session pooling for optimal performance
  - Premium hardware for scalability
  - Automated backups & high availability
  - Easy horizontal scaling

### Infrastructure
- **Version Control**: Git
- **Database Hosting**: Digital Ocean
- **Frontend Hosting**: Vercel (web)
- **Mobile**: Expo EAS (planned)

## 🚧 Challenges We Overcame

### Database Connection Issues
**Challenge**: Initial PostgreSQL integration with Django proved difficult due to connection pooling configurations.

**Solution**: 
1. Researched session pooling vs. direct connection strategies
2. Initially attempted Supabase integration
3. Migrated to Digital Ocean Managed Databases for superior hardware and scalability
4. Configured proper connection pooling in Django settings

**Outcome**: Stable, performant database layer with room to scale.

## 🎉 Accomplishments

- ✅ **Seamless Frontend Development**: React Native implementation exceeded expectations
- ✅ **Full-Stack Integration**: Successfully connected mobile app to backend API
- ✅ **Database Architecture**: Robust PostgreSQL setup with proper pooling
- ✅ **MVP Complete**: Core functionality working end-to-end
- ✅ **Developer Experience**: Clean project structure and documentation

## 📚 What We Learned

- **Database Management**: Deep dive into PostgreSQL connection pooling and managed database services
- **Mobile Development**: Hands-on experience with React Native and Expo ecosystem
- **API Design**: RESTful principles and Django REST Framework best practices
- **Team Collaboration**: Effective division of frontend/backend responsibilities
- **DevOps**: Database hosting, environment management, and deployment strategies

## 🚀 What's Next

### Security & Safety (Priority)
- [ ] Implement user verification system
- [ ] Add reporting mechanisms for inappropriate behavior
- [ ] Create safety guidelines and user agreements
- [ ] Integrate emergency contact features
- [ ] Add location sharing controls

### Features
- [ ] Real-time chat functionality
- [ ] User profile customization
- [ ] Activity recommendations based on interests
- [ ] Rating system for events and users
- [ ] Push notifications for activity updates

### Technical Improvements
- [ ] Implement JWT authentication
- [ ] Add comprehensive error handling
- [ ] Set up CI/CD pipeline
- [ ] Write unit and integration tests
- [ ] Optimize API response times
- [ ] Add caching layer (Redis)

### UX Enhancements
- [ ] Onboarding flow for new users
- [ ] Dark mode support
- [ ] Accessibility improvements
- [ ] Offline mode capabilities

---

## 🏃 Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

## 📄 License

[Add your license here]

## 👥 Team

Built with ❤️ at [MLH Hackathon Name]

---

**Note**: This is an MVP (Minimum Viable Product). We're actively working on security features and user safety measures before public launch.
