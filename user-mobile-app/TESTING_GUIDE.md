# Mobile App API Testing Guide

## Overview
Guide for testing the API integration in the Flutter mobile app.

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend-api
   npm install
   npm start
   # Server should be running on http://localhost:5000
   ```

2. **Database Setup**
   ```bash
   # Make sure MySQL is running and database is initialized
   ```

3. **Flutter Environment**
   ```bash
   flutter --version
   flutter pub get
   ```

## Test Environment Setup

### 1. For Android Emulator
The Android emulator uses `10.0.2.2` to refer to the host machine's localhost.

Update `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'http://10.0.2.2:5000/api/v1';
```

### 2. For iOS Simulator
iOS simulator can directly use `localhost`.

Update `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'http://localhost:5000/api/v1';
```

### 3. For Physical Device
Replace with your machine's IP address:

```bash
# Find your machine's IP
ifconfig | grep inet  # macOS/Linux
ipconfig               # Windows
```

Update `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'http://192.168.1.100:5000/api/v1';
```

## Unit Tests

### Test Authentication Service
File: `test/services/auth_service_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:art_and_craft_user/services/auth_service.dart';

void main() {
  group('AuthService', () {
    final authService = AuthService();

    test('Login with valid credentials', () async {
      final response = await authService.login(
        email: 'test@example.com',
        password: 'password123',
      );

      expect(response['success'], true);
      expect(response['data']['token'], isNotEmpty);
      expect(response['data']['user'], isNotNull);
    });

    test('Login with invalid credentials', () async {
      expect(
        () => authService.login(
          email: 'invalid@example.com',
          password: 'wrongpassword',
        ),
        throwsException,
      );
    });

    test('Register new user', () async {
      final response = await authService.register(
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
        userType: 'customer',
      );

      expect(response['success'], true);
    });
  });
}
```

### Test Product Service
File: `test/services/product_service_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:art_and_craft_user/services/product_service.dart';

void main() {
  group('ProductService', () {
    final productService = ProductService();

    test('Fetch all products', () async {
      final response = await productService.getProducts(
        page: 1,
        perPage: 20,
      );

      expect(response.items, isNotEmpty);
      expect(response.pagination.total, greaterThan(0));
    });

    test('Fetch product by ID', () async {
      final product = await productService.getProductById(1);

      expect(product.id, 1);
      expect(product.name, isNotEmpty);
      expect(product.price, greaterThan(0));
    });

    test('Search products', () async {
      final response = await productService.searchProducts(
        query: 'craft',
      );

      expect(response.items, isNotEmpty);
    });

    test('Get featured products', () async {
      final featured = await productService.getFeaturedProducts();

      expect(featured, isNotEmpty);
    });
  });
}
```

### Test Cart Service
File: `test/services/cart_service_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:art_and_craft_user/services/cart_service.dart';

void main() {
  group('CartService', () {
    final cartService = CartService();

    test('Get cart', () async {
      final cart = await cartService.getCart();

      expect(cart.id, isNotNull);
      expect(cart.items, isList);
    });

    test('Add to cart', () async {
      final cart = await cartService.addToCart(
        productId: 1,
        quantity: 2,
      );

      expect(cart.items, isNotEmpty);
      expect(cart.total, greaterThan(0));
    });

    test('Remove from cart', () async {
      // First add item
      await cartService.addToCart(productId: 1, quantity: 1);
      
      // Then remove it
      final cart = await cartService.removeFromCart(1);

      expect(cart.items, isEmpty);
    });
  });
}
```

## Widget Tests

### Test Login Screen
File: `test/screens/auth/login_screen_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:art_and_craft_user/screens/auth/login_screen.dart';

void main() {
  group('LoginScreen', () {
    testWidgets('Login screen renders correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginScreen(),
        ),
      );

      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('Enter email and password', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginScreen(),
        ),
      );

      final emailField = find.byType(TextField).first;
      final passwordField = find.byType(TextField).last;

      await tester.enterText(emailField, 'test@example.com');
      await tester.enterText(passwordField, 'password123');

      expect(find.text('test@example.com'), findsOneWidget);
      expect(find.text('password123'), findsOneWidget);
    });

    testWidgets('Submit login form', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginScreen(),
        ),
      );

      await tester.enterText(
        find.byType(TextField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'password123',
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      // Verify loading indicator appears
      expect(find.byType(CircularProgressIndicator), findsWidgets);
    });
  });
}
```

## Integration Tests

### Test Complete Login Flow
File: `integration_test/auth_flow_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:art_and_craft_user/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('Complete login flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to login
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(
        find.byType(TextField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'password123',
      );

      // Submit
      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify logged in
      expect(find.text('Welcome'), findsOneWidget);
    });

    testWidgets('Complete registration flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to registration
      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Fill form
      await tester.enterText(find.byType(TextField).at(0), 'John Doe');
      await tester.enterText(find.byType(TextField).at(1), 'john@example.com');
      await tester.enterText(find.byType(TextField).at(2), 'password123');
      await tester.enterText(find.byType(TextField).at(3), 'password123');

      // Submit
      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify account created
      expect(find.text('Account created successfully'), findsOneWidget);
    });
  });
}
```

### Test Product & Cart Flow
File: `integration_test/shopping_flow_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:art_and_craft_user/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Shopping Flow', () {
    testWidgets('Browse products and add to cart', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Wait for products to load
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Tap on first product
      await tester.tap(find.byType(ProductCard).first);
      await tester.pumpAndSettle();

      // Verify product details
      expect(find.text('Add to Cart'), findsOneWidget);

      // Add to cart
      await tester.tap(find.text('Add to Cart'));
      await tester.pumpAndSettle();

      // Verify success message
      expect(find.text('Added to cart'), findsOneWidget);

      // Navigate to cart
      await tester.tap(find.byIcon(Icons.shopping_cart));
      await tester.pumpAndSettle();

      // Verify cart has item
      expect(find.text('1 item'), findsOneWidget);
    });

    testWidgets('Checkout flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Add item and navigate to cart
      // ... (previous steps)

      // Go to checkout
      await tester.tap(find.text('Checkout'));
      await tester.pumpAndSettle();

      // Enter shipping address
      await tester.enterText(find.byType(TextField).first, '123 Main St');
      // ... other fields

      // Select payment method
      await tester.tap(find.byType(RadioButton).first);
      await tester.pumpAndSettle();

      // Place order
      await tester.tap(find.text('Place Order'));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify order confirmation
      expect(find.text('Order Placed Successfully'), findsOneWidget);
    });
  });
}
```

## Manual Testing Checklist

### Authentication
- [ ] Register with email
- [ ] Verify email with code
- [ ] Login with credentials
- [ ] Logout
- [ ] Forgot password flow
- [ ] Token refresh on 401
- [ ] Session persistence on app restart

### Products
- [ ] Load all products with pagination
- [ ] Search products
- [ ] Filter by category
- [ ] View product details
- [ ] Load similar products
- [ ] View featured products
- [ ] Product images load correctly

### Cart
- [ ] Add item to cart
- [ ] Remove item from cart
- [ ] Update item quantity
- [ ] View cart total calculations
- [ ] Apply coupon code
- [ ] Clear cart

### Orders
- [ ] Create order from cart
- [ ] View order history
- [ ] View order details
- [ ] Track order status
- [ ] Cancel order
- [ ] Request return

### Reviews
- [ ] View product reviews
- [ ] Create new review
- [ ] Edit own review
- [ ] Delete own review
- [ ] Mark review as helpful
- [ ] Filter by rating

### Profile
- [ ] View profile information
- [ ] Update profile
- [ ] Change password
- [ ] Manage addresses
- [ ] View order history
- [ ] View wishlist

### Payments
- [ ] Save payment method
- [ ] Use saved payment
- [ ] Make payment
- [ ] Handle payment errors
- [ ] Refund process

## Performance Testing

### Load Time Benchmarks
```dart
test('Product list load time', () async {
  final stopwatch = Stopwatch()..start();
  
  final response = await productService.getProducts();
  
  stopwatch.stop();
  
  // Should load within 2 seconds
  expect(stopwatch.elapsedMilliseconds, lessThan(2000));
  expect(response.items, isNotEmpty);
});
```

### Memory Usage
Use Android Profiler or Xcode Instruments to monitor:
- Memory usage during app usage
- Memory leaks
- Garbage collection

### Network
Monitor with Charles Proxy or Burp Suite:
- Request size
- Response size
- Request/response time
- API latency

## Error Scenarios Testing

### Network Errors
- [ ] Offline mode
- [ ] Slow network
- [ ] Connection timeout
- [ ] Connection refused

### API Errors
- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 500 Server Error
- [ ] 503 Service Unavailable

### Data Validation
- [ ] Empty search results
- [ ] Invalid email format
- [ ] Password too short
- [ ] Duplicate email
- [ ] Invalid coupon code

## Running Tests

### Run all unit tests
```bash
flutter test
```

### Run specific test file
```bash
flutter test test/services/auth_service_test.dart
```

### Run integration tests
```bash
flutter drive --target=integration_test/auth_flow_test.dart
```

### Run with coverage
```bash
flutter test --coverage
```

## Debugging

### Enable verbose logging
```bash
flutter run -v
```

### Use debugPrint
```dart
debugPrint('Debug message');
```

### Set breakpoints
Use VS Code or Android Studio debugger to set breakpoints.

### Monitor network traffic
```dart
// Add in dio interceptor
_dio.interceptors.add(
  LoggingInterceptor(),
);
```

---

**Version:** 1.0
**Status:** Complete
**Last Updated:** 2024
