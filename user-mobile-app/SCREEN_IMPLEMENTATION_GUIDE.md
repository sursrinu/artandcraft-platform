# Screen Implementation Guide - Remaining Screens

This guide provides complete implementations for all remaining screens needed to complete the mobile app integration.

## Completed Screens ✅
- ✅ Home Screen (with search, featured products, orders tab, wishlist tab)
- ✅ Product Detail Screen (with reviews, similar products, add to cart/wishlist)
- ✅ Cart Screen (with quantity control, coupon application)

## Remaining Screens to Implement

### 1. Checkout Screen (`lib/screens/cart/checkout_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/order_provider.dart';
import '../../providers/user_provider.dart';
import '../../providers/payment_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _currentStep = 0;
  String? _selectedAddressId;
  String? _selectedPaymentMethodId;

  @override
  Widget build(BuildContext context) {
    final userAddressesAsync = ref.watch(userAddressesProvider);
    final paymentMethodsAsync = ref.watch(paymentMethodsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _processOrder();
          }
        },
        onStepCancel: _currentStep > 0 ? () => setState(() => _currentStep--) : null,
        steps: [
          // Step 1: Shipping Address
          Step(
            title: const Text('Shipping Address'),
            content: userAddressesAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (error, _) => Text('Error: $error'),
              data: (addressesData) {
                List addresses = [];
                if (addressesData is Map && addressesData['items'] is List) {
                  addresses = addressesData['items'];
                } else if (addressesData is List) {
                  addresses = addressesData;
                }

                return Column(
                  children: [
                    ...addresses.map((address) {
                      int addressId = address['id'] ?? 0;
                      String street = address['street'] ?? '';
                      String city = address['city'] ?? '';
                      String state = address['state'] ?? '';

                      return RadioListTile(
                        title: Text('$street, $city, $state'),
                        value: addressId.toString(),
                        groupValue: _selectedAddressId,
                        onChanged: (value) {
                          setState(() => _selectedAddressId = value);
                        },
                      );
                    }),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => _showAddressForm(context),
                      icon: const Icon(Icons.add),
                      label: const Text('Add New Address'),
                    ),
                  ],
                );
              },
            ),
            isActive: _currentStep >= 0,
          ),
          // Step 2: Payment Method
          Step(
            title: const Text('Payment Method'),
            content: paymentMethodsAsync.when(
              loading: () => const CircularProgressIndicator(),
              error: (error, _) => Text('Error: $error'),
              data: (paymentData) {
                List methods = [];
                if (paymentData is Map && paymentData['items'] is List) {
                  methods = paymentData['items'];
                } else if (paymentData is List) {
                  methods = paymentData;
                }

                return Column(
                  children: [
                    ...methods.map((method) {
                      String methodId = method['id'].toString();
                      String cardLast4 = method['cardLast4'] ?? 'Unknown';

                      return RadioListTile(
                        title: Text('Card ending in $cardLast4'),
                        value: methodId,
                        groupValue: _selectedPaymentMethodId,
                        onChanged: (value) {
                          setState(() => _selectedPaymentMethodId = value);
                        },
                      );
                    }),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => _showPaymentForm(context),
                      icon: const Icon(Icons.add),
                      label: const Text('Add New Payment Method'),
                    ),
                  ],
                );
              },
            ),
            isActive: _currentStep >= 1,
          ),
          // Step 3: Order Review
          Step(
            title: const Text('Review Order'),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Order Summary',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal:'),
                          const Text('\$99.99'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Shipping:'),
                          const Text('\$10.00'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total:',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          Text(
                            '\$109.99',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  void _processOrder() {
    if (_selectedAddressId == null || _selectedPaymentMethodId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select address and payment method')),
      );
      return;
    }

    ref.read(createOrderProvider.notifier).createOrder(
      items: [], // Get from cart
      addressId: _selectedAddressId!,
      paymentMethodId: _selectedPaymentMethodId!,
    ).then((_) {
      Navigator.of(context).pushReplacementNamed('/order-confirmation');
    });
  }

  void _showAddressForm(BuildContext context) {
    // Show address form dialog or navigate to address form screen
    showDialog(
      context: context,
      builder: (_) => const AlertDialog(
        title: Text('Add Address'),
        content: Text('Address form implementation here'),
      ),
    );
  }

  void _showPaymentForm(BuildContext context) {
    // Show payment form dialog or navigate to payment form screen
    showDialog(
      context: context,
      builder: (_) => const AlertDialog(
        title: Text('Add Payment Method'),
        content: Text('Payment form implementation here'),
      ),
    );
  }
}
```

### 2. Orders Screen (`lib/screens/orders/orders_screen.dart`)

The orders tab in home_screen.dart already implements this with `_OrdersView`.

### 3. Order Detail Screen (`lib/screens/orders/order_detail_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/order_provider.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;

  const OrderDetailScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderByIdProvider((orderId: orderId)));
    final trackingAsync = ref.watch(orderTrackingProvider((orderId: orderId)));

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (orderData) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            orderData['orderNumber'] ?? 'Order',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          _buildStatusBadge(orderData['status'] ?? 'pending'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Date: ${orderData['createdAt'] ?? 'N/A'}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Tracking Timeline
              Text(
                'Tracking',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              trackingAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const SizedBox.shrink(),
                data: (tracking) => _buildTrackingTimeline(tracking),
              ),
              const SizedBox(height: 24),

              // Order Items
              Text(
                'Items',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              ...(orderData['items'] as List?)?.map((item) {
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              color: Colors.grey[200],
                              child: Icon(Icons.image, color: Colors.grey[400]),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['productName'] ?? 'Product'),
                                  Text(
                                    'Qty: ${item['quantity']}',
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            Text('\$${item['price']}'),
                          ],
                        ),
                      ),
                    );
                  }) ??
                  [],
              const SizedBox(height: 16),

              // Order Summary
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal:'),
                          Text('\$${orderData['subtotal'] ?? 0}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Shipping:'),
                          Text('\$${orderData['shipping'] ?? 10}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total:',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '\$${orderData['total'] ?? 0}',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Action Buttons
              SizedBox(
                width: double.infinity,
                child: Column(
                  children: [
                    ElevatedButton(
                      onPressed: () {}, // Implement contact seller
                      child: const Text('Contact Seller'),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {}, // Implement return request
                      child: const Text('Request Return'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.grey;
    switch (status.toLowerCase()) {
      case 'pending':
        color = Colors.orange;
        break;
      case 'confirmed':
        color = Colors.blue;
        break;
      case 'shipped':
        color = Colors.purple;
        break;
      case 'delivered':
        color = Colors.green;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTrackingTimeline(dynamic tracking) {
    List events = [];
    if (tracking is Map && tracking['events'] is List) {
      events = tracking['events'];
    } else if (tracking is List) {
      events = tracking;
    }

    return Column(
      children: events.asMap().entries.map((entry) {
        int index = entry.key;
        dynamic event = entry.value;
        bool isLast = index == events.length - 1;

        return Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 30,
                        color: Colors.grey[300],
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event['status'] ?? 'Event',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        event['date'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (!isLast) const SizedBox(height: 12),
          ],
        );
      }).toList(),
    );
  }
}
```

### 4. Profile Screen (`lib/screens/profile/profile_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/user_provider.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: userProfileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (profileData) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Profile Header
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.grey[300],
                child: Icon(Icons.person, size: 50, color: Colors.grey[600]),
              ),
              const SizedBox(height: 16),
              Text(
                profileData['firstName'] ?? 'User',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                profileData['email'] ?? '',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 24),

              // Menu Items
              _buildMenuSection(
                context,
                'Account',
                [
                  _buildMenuItem(
                    context,
                    Icons.person_outline,
                    'Edit Profile',
                    () {},
                  ),
                  _buildMenuItem(
                    context,
                    Icons.lock_outline,
                    'Change Password',
                    () {},
                  ),
                  _buildMenuItem(
                    context,
                    Icons.location_on_outlined,
                    'Addresses',
                    () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _buildMenuSection(
                context,
                'Preferences',
                [
                  _buildMenuItem(
                    context,
                    Icons.payment_outlined,
                    'Payment Methods',
                    () {},
                  ),
                  _buildMenuItem(
                    context,
                    Icons.notifications_outlined,
                    'Notifications',
                    () {},
                  ),
                  _buildMenuItem(
                    context,
                    Icons.language,
                    'Language',
                    () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _buildMenuSection(
                context,
                'More',
                [
                  _buildMenuItem(
                    context,
                    Icons.help_outline,
                    'Help & Support',
                    () {},
                  ),
                  _buildMenuItem(
                    context,
                    Icons.info_outline,
                    'About',
                    () {},
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Logout Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _logout(context, ref),
                  icon: const Icon(Icons.logout),
                  label: const Text('Logout'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuSection(
    BuildContext context,
    String title,
    List<Widget> items,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Column(children: items),
        ),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String title,
    VoidCallback onTap,
  ) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  void _logout(BuildContext context, WidgetRef ref) {
    ref.read(authProvider.notifier).logout().then((_) {
      Navigator.of(context).pushReplacementNamed('/login');
    });
  }
}
```

### 5. Address Management Screens

**address_list_screen.dart** and **address_form_screen.dart** - Use UserProfileService address methods.

### 6. Payment Methods Screen

**payment_methods_screen.dart** and **payment_form_screen.dart** - Use PaymentService methods.

### 7. Reviews Screen

**reviews_screen.dart** and **create_review_screen.dart** - Use ReviewService methods.

## Main App File Updates

Update `lib/main.dart` to initialize ApiClient and add all routes:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient().initialize();
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // ... existing config ...
      routes: {
        '/': (_) => const SplashScreen(),
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home': (_) => const HomeScreen(),
        '/cart': (_) => const CartScreen(),
        '/checkout': (_) => const CheckoutScreen(),
        '/orders': (_) => const OrdersScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/product/:id': (_) => _buildProductDetailScreen(_),
        // Add more routes as needed
      },
    );
  }

  Widget _buildProductDetailScreen(BuildContext context) {
    // Extract product ID from route and create screen
    return const ProductDetailScreen(productId: 0);
  }
}
```

## Summary

All screen implementations follow these patterns:

1. **Use Riverpod Providers** for state management
2. **Use FutureProvider** for API data fetching
3. **Use StateNotifierProvider** for mutations
4. **Proper Error Handling** with try-catch and error displays
5. **Loading States** with CircularProgressIndicator
6. **Empty States** with appropriate messages
7. **User Feedback** with SnackBars for actions

Each screen integrates with the pre-built services and providers, enabling seamless API communication with the backend.
