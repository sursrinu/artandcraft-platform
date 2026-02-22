import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/app_config.dart';
import 'services/api_client.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/product/product_detail_screen.dart';
import 'screens/cart/cart_screen.dart';
import 'screens/cart/checkout_screen.dart';
import 'screens/orders/orders_screen.dart';
import 'screens/orders/order_detail_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/add_address_screen.dart';
import 'screens/profile/edit_address_screen.dart';

import 'screens/auth/otp_verification_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await ApiClient().initialize();
  } catch (e) {
    debugPrint('ApiClient initialization error: $e');
  }
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          elevation: 0,
          centerTitle: true,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      ),
      home: const SplashScreen(),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home': (_) => const HomeScreen(),
        '/cart': (_) => const CartScreen(),
        '/checkout': (_) => const CheckoutScreen(),
        '/orders': (_) => const OrdersScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/add-address': (_) => const AddAddressScreen(),
      },
      onGenerateRoute: (settings) {
        // Handle product detail route: /product/{id}
        if (settings.name?.startsWith('/product/') ?? false) {
          final parts = settings.name!.split('/');
          if (parts.length >= 3) {
            try {
              final productId = int.parse(parts[2]);
              return MaterialPageRoute(
                builder: (_) => ProductDetailScreen(productId: productId),
              );
            } catch (e) {
              debugPrint('Error parsing product ID: $e');
            }
          }
        }

        // Handle order detail route: /order/{id}
        if (settings.name?.startsWith('/order/') ?? false) {
          final parts = settings.name!.split('/');
          if (parts.length >= 3) {
            try {
              final orderId = int.parse(parts[2]);
              return MaterialPageRoute(
                builder: (_) => OrderDetailScreen(orderId: orderId),
              );
            } catch (e) {
              debugPrint('Error parsing order ID: $e');
            }
          }
        }

        // Handle edit address route: /edit-address/{id}
        if (settings.name?.startsWith('/edit-address') ?? false) {
          final addressId = settings.arguments as int?;
          if (addressId != null) {
            return MaterialPageRoute(
              builder: (_) => EditAddressScreen(addressId: addressId),
            );
          }
        }

        return null;
      },
    );
  }
}

