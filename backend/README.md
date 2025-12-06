# Django Backend - MLH Project

Modern Django 5.0+ REST API backend with DRF, JWT authentication, and production-ready configuration.

## Tech Stack

- **Django 5.0.9** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **JWT** - Authentication
- **Docker** - Containerization
- **Gunicorn** - WSGI server
- **WhiteNoise** - Static file serving

## Project Structure

```
backend/
├── config/              # Django settings and configuration
│   ├── settings.py     # Main settings (dev + prod)
│   ├── urls.py         # Root URL configuration
│   ├── wsgi.py         # WSGI entry point
│   └── asgi.py         # ASGI entry point
├── apps/
│   ├── users/          # Custom user model and auth
│   └── api/            # API routing
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
└── docker-compose.yml  # Local development setup
```

## Quick Start

### 1. Setup Development Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 2. Confiure Environment

Edit `.env` for development (SQLite):

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
USE_POSTGRES=False
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Start Development Server

```bash
python manage.py runserver
```

The API will be available at:
- **API**: http://:8000/api/
- **Admin**: http://:8000/admin/
- **API Docs**: http://:8000/api/docs/

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/verify/` - Verify token

### Users
- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/me/` - Update current user profile
- `GET /api/users/` - List all users (admin only)

## Docker Development

Run with Docker Compose (includes PostgreSQL):

```bash
# Build and start services
docker-compose up --build

# Run migrations in container
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Production Setup - Digital Ocean PostgreSQL

### 1. Configure Environment

Edit `.env` for production:

```env
SECRET_KEY=generate-strong-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
USE_POSTGRES=True

# Digital Ocean Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_db_name
DB_USER=doadmin
DB_PASSWORD=your_db_password
DB_HOST=your-db-cluster.db.ondigitalocean.com
DB_PORT=25060

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2. Digital Ocean Droplet Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3-pip python3-venv postgresql-client nginx -y

# Clone repository
git clone <your-repo-url>
cd mlh-project/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
```

### 3. Setup Gunicorn Service

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/path/to/backend/gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 4. Configure Nginx

Create `/etc/nginx/sites-available/backend`:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
    
    location /media/ {
        alias /path/to/backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/path/to/backend/gunicorn.sock;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

## Development Tools

### Code Formatting

```bash
# Format code with Black
black .

# Sort imports
isort .

# Lint with flake8
flake8
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps
```

### Create New App

```bash
python manage.py startapp app_name apps/app_name
```

## Connecting Frontend (React Native)

Update your frontend API configuration:

```javascript
// Development
const API_URL = 'http://localhost:8000/api';

// Production
const API_URL = 'https://api.your-domain.com/api';
```

### Authentication Flow

```javascript
// Register
POST /api/auth/register/
Body: { email, username, password, password_confirm }

// Login
POST /api/auth/login/
Body: { email, password }
Response: { access, refresh }

// Authenticated requests
Headers: { Authorization: 'Bearer <access_token>' }
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h your-db-host -p 25060 -U doadmin -d your_db_name
```

### Static Files Not Loading

```bash
python manage.py collectstatic --clear
```

### CORS Errors

Check `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL.

## Monitoring & Logs

```bash
# View Gunicorn logs
sudo journalctl -u gunicorn -f

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Set `DEBUG=False` in production
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Enable SSL/HTTPS
- [ ] Set up firewall (UFW)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use strong database passwords
- [ ] Enable Digital Ocean database connection pooling

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)
- [Digital Ocean Docs](https://docs.digitalocean.com/)
