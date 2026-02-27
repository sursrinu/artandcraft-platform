// App Configuration
class AppConfig {
  static const String appName = 'Art & Craft Store';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  // For local development: 'http://localhost:7777/api/v1'
  // For Railway production:
  static const String apiBaseUrl = 'https://artandcraft-platform-production.up.railway.app/api/v1';
  // For physical devices local: 'http://10.0.2.2:7777/api/v1'
  // For iOS simulator local: 'http://localhost:7777/api/v1'
  
  static const Duration apiTimeout = Duration(seconds: 30);
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Features
  static const bool enableNotifications = true;
  static const bool enablePayments = true;
  
  // Stripe Configuration (if using Stripe)
  static const String stripePublishableKey = 'pk_test_your_key_here';
  static const String stripeMerchantId = 'merchant_id_here';
  
  // Firebase Configuration
  static const String firebaseProjectId = 'artandcraft-project-id';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // App Environment
  static const String environment = 'development'; // 'development', 'staging', 'production'
  
  // Enable/Disable features
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  
  // API Endpoints (for reference)
  static const String baseUrl = '$apiBaseUrl';
  static const String authEndpoint = '$baseUrl/auth';
  static const String productsEndpoint = '$baseUrl/products';
  static const String cartEndpoint = '$baseUrl/cart';
  static const String ordersEndpoint = '$baseUrl/orders';
  static const String reviewsEndpoint = '$baseUrl/reviews';
  static const String usersEndpoint = '$baseUrl/users';
  static const String paymentsEndpoint = '$baseUrl/payments';
}
