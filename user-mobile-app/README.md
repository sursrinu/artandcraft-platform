# Art & Craft User Mobile App

Flutter-based mobile application for customers to browse and purchase products on the Art & Craft e-commerce platform.

## Features

- User registration & authentication
- Product browsing with search & filters
- Product details & vendor information
- Shopping cart functionality
- Secure checkout & payment
- Order tracking
- Order history
- User profile management
- Push notifications
- Wishlist functionality
- Product reviews & ratings

## Tech Stack

- **Framework**: Flutter 3.x
- **State Management**: Provider/Riverpod
- **Local Storage**: Hive, SharedPreferences
- **HTTP Client**: Dio
- **Payment**: Stripe Flutter
- **Notifications**: Firebase Cloud Messaging
- **Image Cache**: Cached Network Image

## Quick Start

### Prerequisites

- Flutter SDK 3.x
- Dart SDK
- Xcode (iOS development)
- Android Studio (Android development)

### Installation

```bash
flutter pub get
```

### Configuration

1. Create Firebase project and add:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

2. Update API configuration:
   - Edit `lib/config/api_config.dart`
   - Set API base URL

3. Configure Stripe:
   - Add Stripe keys in environment

### Run Application

**Android:**
```bash
flutter run
```

**iOS:**
```bash
flutter run
```

**Development (Hot Reload):**
```bash
flutter run -v
```

## Project Structure

```
lib/
├── config/              # Configuration files
├── constants/           # App constants
├── models/              # Data models
├── providers/           # State management
├── screens/             # UI screens
│   ├── auth/
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   └── profile/
├── services/            # API & external services
├── utils/               # Utility functions
├── widgets/             # Reusable widgets
└── main.dart            # App entry point

assets/
├── images/
├── icons/
└── animations/
```

## Key Features Implementation

### Authentication

- JWT token-based authentication
- Secure token storage using Hive
- Auto-refresh token mechanism
- Logout functionality

### Product Catalog

- Infinite scroll pagination
- Advanced filtering (price, rating, category)
- Full-text search
- Image caching
- Wishlist management

### Shopping Cart

- Add/remove products
- Quantity management
- Persistent storage
- Real-time price calculation

### Checkout

- Shipping address management
- Payment method selection
- Order summary
- Payment processing via Stripe

### Order Management

- Order history
- Order status tracking
- Order details view
- Cancellation & returns

## Dependencies

See `pubspec.yaml` for complete list:

Key packages:
- `provider` - State management
- `dio` - HTTP client
- `hive` - Local storage
- `firebase_core` - Firebase integration
- `stripe_flutter` - Payment processing
- `google_fonts` - Custom fonts
- `go_router` - Navigation

## Building & Deployment

### Android Build

```bash
flutter build apk
flutter build appbundle  # For Play Store
```

### iOS Build

```bash
flutter build ios
flutter build ipa        # For App Store
```

### Release Build

```bash
flutter build --release
```

## Testing

```bash
flutter test
flutter test --coverage
```

## Code Analysis

```bash
flutter analyze
flutter format lib/
```

## Debugging

Enable verbose logging:
```bash
flutter run -v
```

Use DevTools:
```bash
flutter pub global activate devtools
devtools
```

## Common Issues

### Firebase Integration Issues

- Ensure `google-services.json` is properly placed
- Check Firebase project configuration
- Verify package name matches Firebase project

### API Connection Issues

- Check API URL in configuration
- Verify network permissions in Android manifest
- Check iOS network configuration

## Best Practices

- Use Provider for state management
- Implement proper error handling
- Cache images and API responses
- Use async/await for async operations
- Follow Flutter code style guidelines
- Add proper logging for debugging

## Performance Optimization

- Lazy load screens
- Cache API responses
- Optimize image loading
- Use const constructors
- Implement pagination

## Security

- Store tokens securely
- Validate user inputs
- Use HTTPS for API calls
- Implement certificate pinning
- Protect sensitive data

## License

MIT
