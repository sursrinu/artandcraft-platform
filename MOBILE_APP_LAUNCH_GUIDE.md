# Quick Start Guide: Running Mobile App with Backend API

## ✅ Backend API Status
- **Status**: Running
- **URL**: `http://localhost:7777`
- **Health**: ✅ Verified
- **Database**: ✅ Synchronized
- **Test User Created**: ✅ testuser@example.com

## 🚀 Steps to Test Mobile App

### Option 1: Android Emulator

#### 1. Start Backend (Already Running)
```bash
cd backend-api
# API is already running on port 7777
curl http://localhost:7777/api/v1/health
```

#### 2. Prepare Mobile App
```bash
cd user-mobile-app

# Install dependencies
flutter pub get

# Launch Android emulator
emulator -avd <your_emulator_name> &

# Wait for emulator to start, then run app
flutter run -d emulator-5554
```

#### 3. Update API URL for Android (if needed)
Edit `lib/config/app_config.dart`:
```dart
// Change this line for Android emulator:
static const String apiBaseUrl = 'http://10.0.2.2:7777/api/v1';
```

**Important**: Android emulator cannot access `localhost:7777`. Use `10.0.2.2` to refer to host machine's localhost.

---

### Option 2: iOS Simulator

#### 1. Start Backend (Already Running)
```bash
cd backend-api
# API is already running on port 7777
```

#### 2. Prepare Mobile App
```bash
cd user-mobile-app

# Install dependencies
flutter pub get

# Open iOS project (optional)
open ios/Runner.xcworkspace

# Run on iOS simulator
flutter run -d iPhone-simulator
# Or with specific device:
flutter run -d "iPhone 15 Pro"
```

**Note**: iOS simulator can use `localhost:7777` directly (already configured).

---

### Option 3: Physical Android Device

#### 1. Find Your Machine's IP
```bash
# On Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Output example: inet 192.168.1.100 netmask...
```

#### 2. Update API URL
Edit `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'http://192.168.1.100:7777/api/v1';
// Replace 192.168.1.100 with your actual IP
```

#### 3. Connect Device & Run
```bash
cd user-mobile-app

# List connected devices
flutter devices

# Run on device
flutter run -d <device_id>
```

**Important**: Device must be on same WiFi network as development machine.

---

### Option 4: Physical iOS Device

#### 1. Find Your Machine's IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### 2. Update API URL
Edit `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'http://192.168.1.100:7777/api/v1';
// Replace with your actual IP
```

#### 3. Run on Device
```bash
cd user-mobile-app
flutter run -d <device_id>
```

---

## 🧪 Test Flows in the App

### Login Screen
1. Tap "Don't have an account? Register"
2. Enter:
   - Email: `test2@example.com`
   - Password: `Test@12345`
   - Name: `Test User 2`
3. Tap Register
4. ✅ Should see success message and return to login

### Or Login with Existing User
1. Email: `testuser@example.com`
2. Password: `Test@12345`
3. Tap Login
4. ✅ Should navigate to Home screen

### Products Screen
1. After login, tap "Products" tab
2. ✅ Should show empty list (no products in DB)
3. No errors should appear

### Cart Screen
1. Tap "Cart" tab
2. ✅ Should show empty cart
3. No API errors

---

## 🔍 Monitoring API Calls

### Option 1: View Backend Logs (Terminal)
```bash
tail -f /tmp/server.log
```

### Option 2: Network Monitoring in Flutter
- Open Android Studio / VS Code
- Run app with:
```bash
flutter run -v  # Verbose mode
```
- Look for HTTP request logs from Dio client

### Option 3: Watch Backend Console
Keep a terminal open watching:
```bash
cd backend-api
node src/index.js
# You'll see all API requests logged
```

---

## 🛠 Troubleshooting

### Issue: "Cannot reach API"
```bash
# Check if backend is running
curl http://localhost:7777/api/v1/health
# Should return JSON with status: OK

# Check port
lsof -i :7777
# Should show: node src/index.js listening
```

### Issue: "Connection refused" on emulator
```dart
// Make sure you're using correct URL for Android:
static const String apiBaseUrl = 'http://10.0.2.2:7777/api/v1';
// NOT localhost, use 10.0.2.2
```

### Issue: "Connection refused" on physical device
```dart
// Make sure you're using your machine's IP:
static const String apiBaseUrl = 'http://192.168.1.100:7777/api/v1';
// Replace with actual IP from `ifconfig`

// Check WiFi:
// Device must be on SAME network as development machine
```

### Issue: Flutter dependencies not found
```bash
cd user-mobile-app
flutter pub get
flutter clean
flutter pub get
```

---

## 📋 Verification Checklist

Before launching the app:

- [ ] Backend is running: `curl http://localhost:7777/api/v1/health` returns OK
- [ ] Flutter is installed: `flutter --version` shows version info
- [ ] Dependencies installed: `flutter pub get` completed without errors
- [ ] Emulator/device ready: `flutter devices` shows your device
- [ ] API URL correctly set in `app_config.dart`
- [ ] For Android: Using `10.0.2.2:7777` (not `localhost`)
- [ ] For Physical Device: Using your machine's IP and same WiFi network
- [ ] No firewall blocking port 7777

---

## 🎯 Expected App Behavior

### On First Launch
1. ✅ Splash screen appears briefly
2. ✅ Navigates to Auth/Login screen
3. ✅ No connection errors

### Login Screen
1. ✅ Can tap Register to create new user
2. ✅ Can enter email, password, name
3. ✅ Submit button is active

### After Registration
1. ✅ Success message appears
2. ✅ Returns to login screen
3. ✅ Can login with new credentials

### After Login
1. ✅ Navigates to Home screen
2. ✅ Shows Products (empty list)
3. ✅ Navigation tabs visible at bottom
4. ✅ Can navigate between screens

### Products Screen
1. ✅ Shows "No products" message or empty list
2. ✅ No error messages
3. ✅ Loading state briefly shows

---

## 📝 Sample Test Cases

### Test Case 1: Register New User
**Steps**:
1. Launch app
2. Go to Register
3. Enter email: `newuser@test.com`
4. Enter password: `Test@12345`
5. Enter name: `New User`
6. Tap Register

**Expected Result**: ✅ User created, tokens saved, redirect to login

**API Call**: `POST /api/v1/auth/register`

---

### Test Case 2: Login with Credentials
**Steps**:
1. Go to Login
2. Enter email: `testuser@example.com`
3. Enter password: `Test@12345`
4. Tap Login

**Expected Result**: ✅ Login successful, navigate to home

**API Call**: `POST /api/v1/auth/login`

---

### Test Case 3: View Products
**Steps**:
1. After login, go to Products tab
2. Observe product list

**Expected Result**: ✅ Shows empty product list

**API Call**: `GET /api/v1/products`

---

### Test Case 4: Add to Cart (if implemented)
**Steps**:
1. From products, select a product
2. Tap "Add to Cart"
3. Go to Cart tab

**Expected Result**: ✅ Item appears in cart

**API Call**: `POST /api/v1/carts/items`

---

## 🌐 API Reference for Debugging

### Health Check
```bash
curl http://localhost:7777/api/v1/health
```

### Register User
```bash
curl -X POST http://localhost:7777/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Name",
    "email": "user@example.com",
    "password": "Pass@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:7777/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass@123"
  }'
```

### Get Products
```bash
curl http://localhost:7777/api/v1/products
```

---

## 📚 Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Riverpod State Management](https://riverpod.dev)
- [Dio HTTP Client](https://pub.dev/packages/dio)
- [Backend API Documentation](../backend-api/API_DOCUMENTATION.md)

---

## ✅ Summary

**Backend**: ✅ Running on port 7777
**Database**: ✅ Synchronized with test user
**Mobile App**: ✅ Configured and ready
**Test Credentials**: ✅ testuser@example.com / Test@12345

You're all set! Launch the Flutter app and test the integration.
