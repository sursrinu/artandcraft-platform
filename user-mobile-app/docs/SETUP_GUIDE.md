Development Setup Guide
=======================

Follow these steps to set up the development environment for all components.

## 1. System Requirements

### Common Requirements
- Git
- VS Code or Android Studio
- Postman or Insomnia (for API testing)

### For Flutter Apps (User & Vendor)
- Flutter SDK 3.x
- Dart SDK
- Android Studio (with Android SDK)
- Xcode (for iOS on macOS)
- CocoaPods (for iOS dependencies)

### For Node.js Backend API
- Node.js 18+
- npm or yarn
- MySQL Server
- Redis Server

### For Laravel Admin Panel
- PHP 8.1+
- Composer
- MySQL Server
- Node.js (for asset compilation)

## 2. Clone Repository

```bash
git clone <repository-url>
cd artandcraft-platform
```

## 3. Backend API Setup

### Install Dependencies
```bash
cd backend-api
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

### Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE artandcraft;
EXIT;

# Run migrations (when ready)
npm run migrate
```

### Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## 4. Laravel Admin Panel Setup

### Install Dependencies
```bash
cd admin-web-app
composer install
npm install
```

### Configuration
```bash
cp .env.example .env
php artisan key:generate
# Edit .env with database credentials
```

### Database Setup
```bash
php artisan migrate
php artisan db:seed
```

### Start Development Server
```bash
php artisan serve
npm run dev  # In another terminal for assets
```

Application will be available at `http://localhost:8000`

## 5. Flutter User App Setup

### Install Dependencies
```bash
cd user-mobile-app
flutter pub get
```

### Configuration
1. Create Firebase project
2. Add `google-services.json` in `android/app/`
3. Add `GoogleService-Info.plist` in `ios/Runner/`
4. Update API endpoint in `lib/config/api_config.dart`

### Run Application
```bash
# Android
flutter run

# iOS
flutter run -d iPhone
```

## 6. Flutter Vendor App Setup

### Install Dependencies
```bash
cd vendor-mobile-app
flutter pub get
```

### Configuration
1. Create Firebase project
2. Add `google-services.json` in `android/app/`
3. Add `GoogleService-Info.plist` in `ios/Runner/`
4. Update API endpoint in `lib/config/api_config.dart`

### Run Application
```bash
# Android
flutter run

# iOS
flutter run -d iPhone
```

## 7. Docker Setup (Optional)

### Docker Compose Services
```bash
docker-compose up -d
```

This starts:
- MySQL database
- Redis cache
- Node.js API
- Laravel application

### Docker Compose File
Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: artandcraft
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: ./backend-api
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    environment:
      DB_HOST: mysql
      REDIS_HOST: redis

  admin:
    build:
      context: ./admin-web-app
    ports:
      - "8000:8000"
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
```

## 8. Environment Variables

### Backend API (.env)
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=artandcraft
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

### Admin Panel (.env)
```
APP_ENV=local
APP_DEBUG=true
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=artandcraft_admin
API_BASE_URL=http://localhost:3000/api/v1
```

## 9. Testing the Application

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test user registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password"}'
```

### Admin Panel
1. Navigate to `http://localhost:8000`
2. Login with default credentials (from seeders)
3. Access dashboard

### Mobile Apps
1. Run on physical device or emulator
2. Ensure API URL is correctly configured
3. Test authentication flow

## 10. Development Workflow

### Creating Features

1. **Backend API**
   ```bash
   cd backend-api
   # Create route, controller, service
   npm run dev
   ```

2. **Admin Panel**
   ```bash
   cd admin-web-app
   php artisan make:controller YourController
   php artisan serve
   npm run dev
   ```

3. **Mobile Apps**
   ```bash
   cd user-mobile-app
   flutter pub get
   flutter run
   ```

## 11. Code Quality

### Linting & Formatting

**Backend API:**
```bash
npm run lint
npm run lint:fix
```

**Admin Panel:**
```bash
php artisan pint
```

**Flutter:**
```bash
flutter format lib/
flutter analyze
```

## 12. Database Management

### MySQL Commands
```bash
# Connect to database
mysql -u root -p artandcraft

# View tables
SHOW TABLES;

# View table structure
DESC users;

# Export database
mysqldump -u root -p artandcraft > backup.sql

# Import database
mysql -u root -p artandcraft < backup.sql
```

## 13. API Documentation

- Visit `http://localhost:3000/api/v1/docs` for API documentation
- Check [API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) for endpoints
- Use Postman to test API endpoints

## 14. Common Issues & Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -h localhost

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

### Flutter Build Issues
```bash
flutter clean
flutter pub get
flutter run
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## 15. Useful Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Laravel Documentation](https://laravel.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Project Architecture](./docs/ARCHITECTURE.md)
- [API Specification](./docs/API_SPECIFICATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
