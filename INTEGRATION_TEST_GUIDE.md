# Integration Testing Guide: Mobile App + Backend API

## Status
- ✅ **Backend API**: Running on `http://localhost:7777`
- ✅ **Health Endpoint**: `http://localhost:7777/api/v1/health` (HTTP 200)
- ✅ **Mobile App Configuration**: Updated to use port 7777
- ✅ **Database**: MySQL initialized with 16 tables

## Quick Start Testing

### 1. Verify Backend is Running
```bash
curl -s http://localhost:7777/api/v1/health | jq .
# Expected response:
# {
#   "status": "OK",
#   "message": "API is healthy",
#   "timestamp": "2026-01-31T06:45:15.974Z"
# }
```

### 2. Launch Flutter Mobile App

#### Option A: Android Emulator
```bash
cd user-mobile-app
flutter pub get
flutter run -d emulator-5554
```

**Important**: Update `lib/config/app_config.dart` for Android:
```dart
static const String apiBaseUrl = 'http://10.0.2.2:7777/api/v1';
```

#### Option B: iOS Simulator
```bash
cd user-mobile-app
flutter pub get
flutter run -d iPhone-simulator
```

**Configuration in `lib/config/app_config.dart`** (already set):
```dart
static const String apiBaseUrl = 'http://localhost:7777/api/v1';
```

#### Option C: Physical Device
```bash
cd user-mobile-app
flutter pub get
flutter run -d <device_id>
```

Update the API URL to your machine's IP:
```dart
// Replace with your machine's IP (e.g., 192.168.1.100)
static const String apiBaseUrl = 'http://<YOUR_IP>:7777/api/v1';
```

### 3. Test the App Flow

#### Test 1: Splash & Home Screen
- ✅ App should launch and show splash screen
- ✅ Should transition to Home screen or Login screen
- ✅ No crashes related to API connectivity

#### Test 2: Product Listing (No Auth Required)
- ✅ Navigate to Products tab
- ✅ App fetches products from `/api/v1/products`
- ✅ Shows empty list (database has no products yet)
- ✅ Verify in logs: `GET /api/v1/products` returns 200 with empty data

#### Test 3: User Registration
1. Go to Register screen
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@123456`
   - Name: `Test User`
3. Tap Register button
4. Expected: User created, token received, redirect to home
5. Backend log should show: `POST /api/v1/auth/register` → HTTP 200

#### Test 4: User Login
1. Go to Login screen
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@123456`
3. Tap Login button
4. Expected: Login successful, token stored, redirect to home
5. Backend log should show: `POST /api/v1/auth/login` → HTTP 200

#### Test 5: Profile Access (Requires Auth)
1. After login, navigate to Profile
2. Should display user information
3. Verify API call: `GET /api/v1/users/profile` with Bearer token
4. Backend should respond with user data

### 4. Backend API Endpoints to Test

#### Available Endpoints:
```
# Products
GET  /api/v1/products
GET  /api/v1/products/:id
GET  /api/v1/categories

# Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

# User Profile
GET  /api/v1/users/profile (requires auth)
PUT  /api/v1/users/profile (requires auth)

# Cart
GET  /api/v1/carts (requires auth)
POST /api/v1/carts/items (requires auth)
GET  /api/v1/carts/items (requires auth)

# Orders
GET  /api/v1/orders (requires auth)
POST /api/v1/orders (requires auth)
```

### 5. Monitor API Calls

#### In Terminal (Backend):
```bash
# Watch backend logs in real-time
tail -f /tmp/server.log

# Or restart backend with verbose output:
cd backend-api
node src/index.js
```

#### In Flutter App:
- Check console output (Ctrl+\ in Android Studio / Cmd+\ in Xcode)
- Riverpod DevTools will show state changes
- Network requests logged by Dio interceptor

### 6. Known Issues & Troubleshooting

#### Issue: Connection Refused
- **Symptom**: App shows "Connection refused" error
- **Solution**: 
  - Verify backend is running: `curl http://localhost:7777/api/v1/health`
  - For emulator, use `10.0.2.2:7777` instead of `localhost:7777`
  - Check firewall settings

#### Issue: 404 Not Found
- **Symptom**: API returns 404 even though endpoint exists
- **Solution**: 
  - Verify endpoint path matches exactly (case-sensitive)
  - Check route registration in `backend-api/src/routes/`
  - Ensure `apiBaseUrl` includes `/api/v1` prefix

#### Issue: Unauthorized (401)
- **Symptom**: Protected endpoints return 401 after login
- **Solution**:
  - Verify token is being stored correctly in SharedPreferences
  - Check Bearer token format in API request headers
  - Ensure JWT secret in `.env` matches backend

#### Issue: CORS Errors
- **Symptom**: Browser/app shows CORS policy errors
- **Solution**:
  - Check `CORS_ORIGIN` in `backend-api/.env`
  - Add app domain/IP to allowed origins
  - Verify `Access-Control-Allow-*` headers

### 7. Test Data Creation

#### Create Test Products (via MySQL):
```sql
-- Connect to MySQL
mysql -u root -proot123 artandcraft

-- Insert test category
INSERT INTO categories (name, slug, description, isActive, createdAt, updatedAt) 
VALUES ('Paintings', 'paintings', 'Beautiful paintings', 1, NOW(), NOW());

-- Insert test product
INSERT INTO products (name, slug, description, price, stock, categoryId, vendorId, isActive, createdAt, updatedAt) 
VALUES ('Abstract Art', 'abstract-art', 'Beautiful abstract painting', 500, 10, 1, 1, 1, NOW(), NOW());
```

#### Or use API (if vendor endpoints implemented):
```bash
POST /api/v1/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Test Product",
  "description": "Test description",
  "price": 99.99,
  "categoryId": 1,
  "stock": 50
}
```

## Success Criteria

- ✅ App launches without crashes
- ✅ Can fetch products list
- ✅ Can register new user
- ✅ Can login with credentials
- ✅ Can view user profile
- ✅ Can add items to cart
- ✅ Can view orders
- ✅ All API responses have correct status codes
- ✅ No unhandled exceptions in console
- ✅ Authentication tokens work correctly

## Next Steps

1. **Load Test Data**: Add sample products/categories to database
2. **Test Payment Flow**: Integrate with Stripe (if needed)
3. **Test Notifications**: Firebase push notifications (if needed)
4. **Performance Testing**: Load test with multiple concurrent users
5. **Production Deployment**: Deploy to TestFlight/Play Store

---

**Current Stack**:
- Backend: Node.js/Express on port 7777
- Database: MySQL 8.0 (localhost:3306)
- Mobile: Flutter 3.0+ with Riverpod
- State Management: Riverpod
- HTTP Client: Dio 5.3.0
