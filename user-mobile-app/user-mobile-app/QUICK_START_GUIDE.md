# Quick Start - Screen Implementation Reference

## What's Been Done ✅

### Screens Fully Implemented (Ready to Use)
1. **Splash Screen** - App initialization and auth check
2. **Login Screen** - Email/password authentication
3. **Register Screen** - New user registration  
4. **Home Screen** - Featured products, search, orders tab, wishlist tab
5. **Product Detail** - Product info, reviews, similar products, add to cart/wishlist
6. **Cart Screen** - Item management, coupon codes, checkout
7. **Order Detail** - Order info, tracking timeline, actions
8. **Main App** - ApiClient initialization, dynamic routing

### Providers Created (7 Total)
- AuthProvider, ProductProvider, CartProvider, OrderProvider, ReviewProvider, UserProvider, PaymentProvider

### Services Available (7 Total)
- AuthService, ProductService, CartService, OrderService, ReviewService, UserProfileService, PaymentService

## How to Use These Screens

### 1. Testing Login Flow
```
1. Run app
2. See splash screen (2 seconds)
3. Land on login screen
4. Enter email/password
5. Tap login → navigates to home on success
```

### 2. Browsing Products
```
1. On home screen, featured products load automatically
2. Type in search box to filter products
3. Tap any product to see details
4. View reviews, similar products
5. Add to cart or wishlist
```

### 3. Shopping Cart
```
1. Tap cart icon from any screen
2. Adjust quantities with +/- buttons
3. Enter coupon code and tap Apply
4. Tap "Proceed to Checkout"
5. Follow checkout flow (address, payment, confirm)
```

### 4. Viewing Orders
```
1. On home screen, tap Orders tab
2. See list of user orders
3. Tap any order to see details
4. View order items, tracking, timeline
5. Request return or contact seller
```

### 5. User Profile
```
1. Tap profile icon from home screen
2. See profile information
3. Access account settings, addresses, payment methods
4. Tap logout to go back to login
```

## Key Implementation Patterns

### FutureProvider (For Data Fetching)
```dart
// In screens:
final productsAsync = ref.watch(productsProvider((page: 1, perPage: 20)));

productsAsync.when(
  loading: () => CircularProgressIndicator(),
  error: (err, stack) => Text('Error: $err'),
  data: (products) => ListView(...),
)
```

### StateNotifierProvider (For Actions)
```dart
// In screens:
ref.read(addToCartProvider.notifier).addToCart(productId, quantity)
  .then((_) => showSnackBar('Added to cart'))
  .catchError((e) => showSnackBar('Error: $e'));
```

### Error Handling (Consistent Across Screens)
```dart
error: (error, stack) => Center(
  child: Column(
    children: [
      Icon(Icons.error_outline, size: 48, color: Colors.red),
      SizedBox(height: 12),
      Text('Error: $error'),
    ],
  ),
)
```

### Loading States
```dart
loading: () => const Center(child: CircularProgressIndicator())
```

### Empty States
```dart
if (items.isEmpty) {
  return Center(
    child: Column(
      children: [
        Icon(Icons.shopping_bag_outlined, size: 64, color: Colors.grey),
        SizedBox(height: 12),
        Text('No products found'),
      ],
    ),
  );
}
```

## File Quick Reference

### To Test Authentication
- `lib/screens/auth/login_screen.dart`
- `lib/screens/auth/register_screen.dart`
- Check: AuthService methods in `lib/services/auth_service.dart`

### To Test Product Browsing
- `lib/screens/home/home_screen.dart` (Featured products)
- `lib/screens/product/product_detail_screen.dart`
- Check: ProductService methods

### To Test Shopping
- `lib/screens/cart/cart_screen.dart`
- Check: CartService methods
- Check: `addToCartProvider` in `lib/providers/cart_provider_new.dart`

### To Test Orders
- Home screen → Orders tab (list)
- `lib/screens/orders/order_detail_screen.dart` (details)
- Check: OrderService methods

### To Test User Profile
- `lib/screens/profile/profile_screen.dart`
- Check: UserProfileService methods

## Configuration

### Update API URL
File: `lib/config/app_config.dart`

```dart
// For localhost (backend on same machine)
static const String apiBaseUrl = 'http://localhost:5000/api/v1';

// For Android emulator (host machine)
static const String apiBaseUrl = 'http://10.0.2.2:5000/api/v1';

// For physical device on same network
static const String apiBaseUrl = 'http://192.168.1.100:5000/api/v1';
```

## Testing Your Backend Connection

### Step 1: Check Backend is Running
```bash
curl http://localhost:5000/health
# Should return: { "status": "ok" }
```

### Step 2: Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Step 3: Run App and Try Login
```bash
flutter run
# Enter test credentials
```

## Common Issues & Solutions

### Issue: "Connection refused" on login
**Solution:** Update API URL in `app_config.dart` to match your backend server

### Issue: "Unauthorized" errors
**Solution:** Check that AuthService token is being saved. Look at `api_client.dart` token management

### Issue: Products not loading
**Solution:** Verify backend has products in database. Test with:
```bash
curl http://localhost:5000/api/v1/products
```

### Issue: Cart not persisting
**Solution:** Cart is session-based. Make sure each item has unique ID and quantity updates are sent to backend

## Next Steps for Developer

### Phase 1: Test Core Flows (This Week)
- [ ] Test authentication (login/register)
- [ ] Test product browsing and search
- [ ] Test add to cart
- [ ] Test order viewing
- [ ] Test user profile

### Phase 2: Implement Remaining Screens (Next Week)
See `SCREEN_IMPLEMENTATION_GUIDE.md` for:
- Checkout flow with address/payment selection
- Address management
- Payment methods management
- Review management
- Search and category filtering

### Phase 3: Polish & Deploy (Following Week)
- Add product images
- Improve error messages
- Add loading skeletons
- Performance optimization
- Deploy to staging/production

## Helpful Commands

```bash
# Clean and rebuild
flutter clean && flutter pub get

# Run with verbose output (good for debugging)
flutter run -v

# Build for production
flutter build apk --release   # Android
flutter build ios --release   # iOS

# Run tests
flutter test

# Check for errors
flutter analyze
```

## Success Checklist

- [ ] App launches to splash screen
- [ ] Can login with valid credentials
- [ ] Home screen shows products
- [ ] Can search products
- [ ] Can add product to cart
- [ ] Can view cart and update quantities
- [ ] Can view orders
- [ ] Can view order details and tracking
- [ ] Can view user profile
- [ ] Can logout

✅ All screens are ready for testing!
