# Art & Craft Vendor Mobile App

Flutter-based mobile application for vendors to manage products, inventory, and orders on the Art & Craft e-commerce platform.

## Features

- Vendor registration & verification
- Product listing & management
- Inventory & stock management
- Order dashboard & management
- Sales tracking & analytics
- Push notifications
- Performance metrics
- Vendor profile management
- Product image management

## Tech Stack

- **Framework**: Flutter 3.x
- **State Management**: Provider/Riverpod
- **Local Storage**: Hive, SharedPreferences
- **HTTP Client**: Dio
- **Charts**: FL Chart, Charts Flutter
- **Notifications**: Firebase Cloud Messaging
- **Image Handling**: Image Picker, Image Cropper

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

3. Configure image upload:
   - Setup Cloudinary credentials

### Run Application

**Android:**
```bash
flutter run
```

**iOS:**
```bash
flutter run
```

**Development:**
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
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   ├── analytics/
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

## Key Features

### Vendor Authentication

- Registration with business details
- Email verification
- Profile completion
- Document upload for verification
- JWT token-based authentication

### Product Management

- Create, read, update, delete products
- Bulk product upload
- Category management
- Product variants
- Image management with cropping
- Automatic image compression

### Inventory Management

- Real-time stock tracking
- Low stock alerts
- Inventory history
- Bulk inventory updates
- Stock management by warehouse

### Order Management

- Order dashboard with filters
- Order details view
- Order status updates
- Shipping management
- Order history

### Analytics & Reports

- Sales overview
- Revenue tracking
- Top selling products
- Order metrics
- Performance charts
- Custom date range reports

### Notifications

- New order alerts
- Payment confirmations
- System notifications
- Custom push messages

## Dependencies

See `pubspec.yaml` for complete list:

Key packages:
- `provider` - State management
- `dio` - HTTP client
- `hive` - Local storage
- `firebase_core` - Firebase integration
- `image_picker` - Image selection
- `image_cropper` - Image editing
- `charts_flutter` - Analytics charts
- `google_fonts` - Custom fonts

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

Enable verbose mode:
```bash
flutter run -v
```

Access DevTools:
```bash
flutter pub global activate devtools
devtools
```

## Performance Optimization

- Implement pagination for product lists
- Cache API responses
- Optimize image loading
- Use lazy loading
- Implement proper memory management

## Security

- Secure token storage
- Input validation
- HTTPS for all API calls
- Certificate pinning
- Protect sensitive data
- Secure logout mechanism

## Common Issues

### Image Picker Issues

- Check iOS permissions in Info.plist
- Verify Android manifest permissions
- Test on physical device

### Firebase Setup

- Ensure correct package names
- Download correct config files
- Verify Firebase project settings

## Best Practices

- Use Provider for state management
- Implement proper error handling
- Add comprehensive logging
- Follow Flutter style guidelines
- Test on multiple devices
- Use const constructors

## Analytics Integration

- Firebase Analytics enabled
- Event tracking
- User journey analysis
- Crash reporting

## License

MIT
