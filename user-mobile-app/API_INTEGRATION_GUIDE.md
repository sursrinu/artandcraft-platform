# Mobile App API Integration Guide

## Overview
This guide explains how to integrate the Flutter mobile app with the Art & Craft Platform backend API.

## Architecture

```
┌─────────────────────────────────────┐
│     Flutter Mobile App              │
├─────────────────────────────────────┤
│  Screens (UI Layer)                 │
│  ├── auth/                          │
│  ├── home/                          │
│  ├── product/                       │
│  ├── cart/                          │
│  ├── orders/                        │
│  └── profile/                       │
├─────────────────────────────────────┤
│  Providers (State Management)       │
│  ├── auth_provider.dart             │
│  ├── product_provider.dart          │
│  ├── cart_provider.dart             │
│  └── order_provider.dart            │
├─────────────────────────────────────┤
│  Services (Business Logic)          │
│  ├── api_client.dart                │
│  ├── auth_service.dart              │
│  ├── product_service.dart           │
│  ├── cart_service.dart              │
│  ├── order_service.dart             │
│  ├── review_service.dart            │
│  ├── user_service.dart              │
│  └── payment_service.dart           │
├─────────────────────────────────────┤
│  Configuration                      │
│  └── config/app_config.dart         │
├─────────────────────────────────────┤
│  Models                             │
│  ├── models/api_models.dart         │
│  └── services/*.dart (data models)  │
└─────────────────────────────────────┘
          ↓
    HTTP Client (Dio)
          ↓
┌─────────────────────────────────────┐
│   Backend API Server                │
│   (Node.js/Express)                 │
│   http://localhost:5000/api/v1      │
└─────────────────────────────────────┘
```

## API Client Setup

### 1. Configuration
Update `lib/config/app_config.dart`:

```dart
class AppConfig {
  // Development (local)
  static const String apiBaseUrl = 'http://localhost:5000/api/v1';
  
  // For physical devices (Android emulator uses 10.0.2.2)
  static const String apiBaseUrl = 'http://10.0.2.2:5000/api/v1';
  
  // For iOS simulator
  static const String apiBaseUrl = 'http://localhost:5000/api/v1';
  
  // Production
  static const String apiBaseUrl = 'https://api.artandcraft.com/api/v1';
}
```

### 2. API Client Initialization
In your main.dart:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API client
  final apiClient = ApiClient();
  await apiClient.initialize();
  
  runApp(const MyApp());
}
```

## Services Structure

### AuthService
Handles authentication operations:

```dart
final authService = AuthService();

// Login
final response = await authService.login(
  email: 'user@example.com',
  password: 'password123',
);

// Register
final response = await authService.register(
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  userType: 'customer',
);

// Logout
await authService.logout();
```

### ProductService
Handles product operations:

```dart
final productService = ProductService();

// Get all products
final response = await productService.getProducts(
  page: 1,
  perPage: 20,
  search: 'crafts',
  categoryId: 5,
);

// Get product by ID
final product = await productService.getProductById(123);

// Search products
final results = await productService.searchProducts(query: 'handmade');

// Get featured products
final featured = await productService.getFeaturedProducts();

// Get products by category
final categoryProducts = await productService.getProductsByCategory(
  categoryId: 5,
);

// Get similar products
final similar = await productService.getSimilarProducts(productId);
```

### CartService
Handles cart operations:

```dart
final cartService = CartService();

// Get cart
final cart = await cartService.getCart();

// Add to cart
final updatedCart = await cartService.addToCart(
  productId: 123,
  quantity: 2,
);

// Update cart item
final updatedCart = await cartService.updateCartItem(
  itemId: 456,
  quantity: 3,
);

// Remove from cart
final updatedCart = await cartService.removeFromCart(itemId);

// Clear cart
await cartService.clearCart();

// Apply coupon
final updatedCart = await cartService.applyCoupon('SAVE20');

// Remove coupon
final updatedCart = await cartService.removeCoupon();
```

### OrderService
Handles order operations:

```dart
final orderService = OrderService();

// Get user orders
final response = await orderService.getOrders(
  page: 1,
  perPage: 20,
  status: 'completed',
);

// Get order by ID
final order = await orderService.getOrderById(123);

// Create order
final newOrder = await orderService.createOrder(
  cartItems: [1, 2, 3],
  shippingAddress: '123 Main St, New York, NY 10001',
  paymentMethod: 'card',
  notes: 'Please deliver before 5 PM',
);

// Cancel order
await orderService.cancelOrder(
  orderId: 123,
  reason: 'Changed my mind',
);

// Get order tracking
final tracking = await orderService.getOrderTracking(123);

// Request return
await orderService.requestReturn(
  orderId: 123,
  reason: 'Defective product',
  description: 'The handle is broken',
);
```

### ReviewService
Handles review operations:

```dart
final reviewService = ReviewService();

// Get product reviews
final response = await reviewService.getProductReviews(
  productId: 123,
  page: 1,
  perPage: 20,
);

// Get user reviews
final userReviews = await reviewService.getUserReviews(
  page: 1,
  perPage: 20,
);

// Create review
final review = await reviewService.createReview(
  productId: 123,
  rating: 4.5,
  title: 'Great product!',
  content: 'Very happy with this purchase',
  images: ['url1', 'url2'],
);

// Update review
final updated = await reviewService.updateReview(
  reviewId: 456,
  rating: 5.0,
  title: 'Excellent!',
  content: 'Changed my mind, it is excellent',
);

// Delete review
await reviewService.deleteReview(456);

// Mark review as helpful
await reviewService.markHelpful(456);

// Get review statistics
final stats = await reviewService.getReviewStats(123);
```

### UserProfileService
Handles user profile operations:

```dart
final userService = UserProfileService();

// Get profile
final profile = await userService.getProfile();

// Update profile
final updated = await userService.updateProfile(
  name: 'Jane Doe',
  phone: '+1234567890',
  bio: 'Loves art and crafts',
);

// Change password
await userService.changePassword(
  currentPassword: 'oldpass123',
  newPassword: 'newpass456',
);

// Get addresses
final addresses = await userService.getAddresses();

// Add address
final newAddress = await userService.addAddress(
  type: 'home',
  fullName: 'Jane Doe',
  phoneNumber: '+1234567890',
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
);

// Update address
final updated = await userService.updateAddress(
  addressId: 789,
  street: '456 Oak Ave',
  city: 'Boston',
);

// Delete address
await userService.deleteAddress(789);

// Get wishlist
final wishlist = await userService.getWishlist(); // Returns list of product IDs

// Add to wishlist
await userService.addToWishlist(123);

// Remove from wishlist
await userService.removeFromWishlist(123);
```

### PaymentService
Handles payment operations:

```dart
final paymentService = PaymentService();

// Get payment methods
final methods = await paymentService.getPaymentMethods();

// Save payment method
final method = await paymentService.savePaymentMethod(
  type: 'card',
  token: 'stripe_token',
  isDefault: true,
);

// Create payment intent
final intent = await paymentService.createPaymentIntent(
  orderId: 123,
  amount: 99.99,
);

// Confirm payment
final result = await paymentService.confirmPayment(
  paymentIntentId: intent.id,
  paymentMethodId: methodId,
);

// Refund payment
await paymentService.refundPayment(
  orderId: 123,
  reason: 'Customer requested',
);
```

## Riverpod Providers

### Authentication Provider
```dart
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);

// Usage in widgets
@override
Widget build(BuildContext context, WidgetRef ref) {
  final authState = ref.watch(authProvider);
  
  return authState.isLoading
      ? const CircularProgressIndicator()
      : Text(authState.user?['name'] ?? 'Guest');
}

// Login
ref.read(authProvider.notifier).login(
  email: 'user@example.com',
  password: 'password123',
);

// Logout
ref.read(authProvider.notifier).logout();
```

### Products Provider
```dart
// Get featured products
final featured = ref.watch(featuredProductsProvider);

// Get products (with pagination)
final products = ref.watch(productsProvider(
  (page: 1, perPage: 20, search: null, categoryId: null),
));

// Get product by ID
final product = ref.watch(productByIdProvider(123));

// Search products
final results = ref.watch(searchProductsProvider('crafts'));

// Get products by category
final category = ref.watch(productsByCategoryProvider(5));

// Get similar products
final similar = ref.watch(similarProductsProvider(123));
```

### Cart Provider
```dart
// Get cart
final cart = ref.watch(cartProvider);

// Add to cart
await ref.read(addToCartProvider((productId: 123, quantity: 2)).future);

// Remove from cart
await ref.read(removeFromCartProvider(itemId).future);

// Update cart item
await ref.read(updateCartItemProvider((itemId, quantity)).future);

// Apply coupon
await ref.read(applyCouponProvider('SAVE20').future);
```

## Error Handling

All services handle errors consistently:

```dart
try {
  final product = await productService.getProductById(123);
} catch (e) {
  // Handle error
  print('Error: $e');
  
  // Show error message to user
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(e.toString())),
  );
}
```

## Token Management

Token is automatically handled by ApiClient:

```dart
// Token is automatically added to requests
// Set token after login
final apiClient = ApiClient();
await apiClient.setToken(
  'jwt_token_here',
  refreshToken: 'refresh_token_here',
);

// Token refresh is automatic on 401 responses
// Clear token on logout
await apiClient.clearToken();
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

Paginated responses:

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Testing Integration

### 1. Test Login
```dart
testWidgets('Test Login', (WidgetTester tester) async {
  final authService = AuthService();
  
  final response = await authService.login(
    email: 'test@example.com',
    password: 'password123',
  );
  
  expect(response['success'], true);
  expect(response['data']['token'], isNotEmpty);
});
```

### 2. Test Product Fetch
```dart
testWidgets('Test Product Fetch', (WidgetTester tester) async {
  final productService = ProductService();
  
  final response = await productService.getProducts(
    page: 1,
    perPage: 20,
  );
  
  expect(response.items, isNotEmpty);
  expect(response.pagination.total, greaterThan(0));
});
```

## Production Deployment

### 1. Update API Base URL
Update `lib/config/app_config.dart`:

```dart
static const String apiBaseUrl = 'https://api.artandcraft.com/api/v1';
```

### 2. Enable Crash Reporting
```dart
static const bool enableCrashReporting = true;
```

### 3. Update Environment
```dart
static const String environment = 'production';
```

### 4. Build Release APK/IPA
```bash
flutter build apk --release
flutter build ios --release
```

## Common Issues & Solutions

### Issue: Connection Refused
**Solution:** Check backend server is running and API URL is correct

```dart
// Development
static const String apiBaseUrl = 'http://localhost:5000/api/v1';

// Android emulator
static const String apiBaseUrl = 'http://10.0.2.2:5000/api/v1';
```

### Issue: 401 Unauthorized
**Solution:** Token is missing or expired. Token refresh is automatic.

### Issue: CORS Error
**Solution:** Backend needs CORS configuration enabled

```javascript
// In backend (already configured)
cors: {
  origin: '*',
  credentials: true,
}
```

### Issue: Slow API Response
**Solution:** Check network connectivity and API timeout settings

```dart
static const Duration apiTimeout = Duration(seconds: 30);
```

## Dependencies

Make sure pubspec.yaml includes:

```yaml
dependencies:
  dio: ^5.3.0              # HTTP client
  flutter_riverpod: ^2.4.0 # State management
  shared_preferences: ^2.2.0 # Token storage
```

## Further Documentation

- See `../backend-api/` for backend API documentation
- See individual service files for detailed method documentation
- See providers files for Riverpod usage examples

---

**Version:** 1.0
**Status:** Complete
**Last Updated:** 2024
