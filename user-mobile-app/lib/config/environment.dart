// Environment Configuration
// Use this file to manage environment-specific settings

abstract class Environment {
  static const String appName = 'Art & Craft Store';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static const String apiBaseUrl;
  static const Duration apiTimeout;
  static const bool enableDebugLogging;
  
  // Feature Flags
  static const bool enableNotifications;
  static const bool enablePayments;
  static const bool enableAnalytics;
}

/// Development Environment
class DevelopmentEnvironment implements Environment {
  @override
  static const String appName = 'Art & Craft Store (Dev)';
  
  @override
  static const String apiBaseUrl = 'http://localhost:5000/api/v1';
  // For Android emulator: 'http://10.0.2.2:5000/api/v1'
  // For iOS simulator: 'http://localhost:5000/api/v1'
  // For physical device: 'http://192.168.x.x:5000/api/v1'
  
  @override
  static const Duration apiTimeout = Duration(seconds: 30);
  
  @override
  static const bool enableDebugLogging = true;
  
  @override
  static const bool enableNotifications = true;
  
  @override
  static const bool enablePayments = true;
  
  @override
  static const bool enableAnalytics = false;
}

/// Staging Environment
class StagingEnvironment implements Environment {
  @override
  static const String appName = 'Art & Craft Store (Staging)';
  
  @override
  static const String apiBaseUrl = 'https://staging-api.artandcraft.com/api/v1';
  
  @override
  static const Duration apiTimeout = Duration(seconds: 30);
  
  @override
  static const bool enableDebugLogging = true;
  
  @override
  static const bool enableNotifications = true;
  
  @override
  static const bool enablePayments = true;
  
  @override
  static const bool enableAnalytics = true;
}

/// Production Environment
class ProductionEnvironment implements Environment {
  @override
  static const String appName = 'Art & Craft Store';
  
  @override
  static const String apiBaseUrl = 'https://api.artandcraft.com/api/v1';
  
  @override
  static const Duration apiTimeout = Duration(seconds: 30);
  
  @override
  static const bool enableDebugLogging = false;
  
  @override
  static const bool enableNotifications = true;
  
  @override
  static const bool enablePayments = true;
  
  @override
  static const bool enableAnalytics = true;
}

/// Environment Manager
class EnvironmentManager {
  static const String _environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );
  
  static Environment get current {
    switch (_environment.toLowerCase()) {
      case 'production':
        return ProductionEnvironment() as Environment;
      case 'staging':
        return StagingEnvironment() as Environment;
      case 'development':
      default:
        return DevelopmentEnvironment() as Environment;
    }
  }
  
  static bool get isDevelopment => _environment == 'development';
  static bool get isStaging => _environment == 'staging';
  static bool get isProduction => _environment == 'production';
}
