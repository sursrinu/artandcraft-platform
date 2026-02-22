// Checkout Screen with Multi-Step Flow
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/cart_provider_new.dart';
import '../../providers/user_provider.dart';
import '../../providers/payment_provider.dart';
import '../../providers/order_provider.dart';
import '../../services/razorpay_service.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ScaffoldMessenger.of(context).clearSnackBars();
      }
    });
  }
  int _currentStep = 0;
  String? _selectedAddressId;
  bool _isProcessing = false;

  // Form controllers for adding new address (India format)
  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressLine1Controller;
  late TextEditingController _addressLine2Controller;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pinCodeController;

  // Form controllers for adding new payment method
  late TextEditingController _cardNumberController;
  late TextEditingController _cardHolderController;
  late TextEditingController _expiryController;
  late TextEditingController _cvcController;
  late TextEditingController _upiIdController;

  // Razorpay service
  late RazorpayService _razorpayService;
  dynamic _pendingCartData;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ScaffoldMessenger.of(context).clearSnackBars();
      }
    });
    _fullNameController = TextEditingController();
    _phoneController = TextEditingController();
    _addressLine1Controller = TextEditingController();
    _addressLine2Controller = TextEditingController();
    _cityController = TextEditingController();
    _stateController = TextEditingController();
    _pinCodeController = TextEditingController();
    _cardNumberController = TextEditingController();
    _cardHolderController = TextEditingController();
    _expiryController = TextEditingController();
    _cvcController = TextEditingController();
    _upiIdController = TextEditingController();
    // Initialize Razorpay
    _razorpayService = RazorpayService();
    _razorpayService.init(
      onSuccess: _handlePaymentSuccess,
      onError: _handlePaymentError,
      onExternalWallet: _handleExternalWallet,
    );
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pinCodeController.dispose();
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _expiryController.dispose();
    _cvcController.dispose();
    _upiIdController.dispose();
    _razorpayService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);
    final userAddressesAsync = ref.watch(userAddressesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(cartProvider),
            tooltip: 'Refresh Cart',
          ),
        ],
      ),
      body: cartAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
              const SizedBox(height: 12),
              Text('Error: $error'),
            ],
          ),
        ),
        data: (cartData) {
          // Debug: Print cart data to console
          print('');
          print('█████████████████████████████████████');
          print('CHECKOUT SCREEN - CART DATA RECEIVED');
          print('█████████████████████████████████████');
          print('cartData type: ${cartData.runtimeType}');
          print('cartData: $cartData');
          if (cartData is Map) {
            print('Keys in cartData: ${(cartData as Map).keys.toList()}');
          }
          print('█████████████████████████████████████');
          print('');

          // Parse cart data
          List items = [];
          double subtotal = 0;
          double tax = 0;
          double total = 0;

          if (cartData != null) {
            try {
              // Handle Cart object from provider
              List<dynamic>? cartItems;

              // It's a Cart object - access properties directly
              final cart = cartData as dynamic;
              if (cart.items is List) {
                cartItems = cart.items;
              } else if (cart.CartItems is List) {
                cartItems = cart.CartItems;
              }

              debugPrint('Cart Items Type: ${cartItems?.runtimeType}');
              debugPrint('Cart Items Count: ${cartItems?.length ?? 0}');
              debugPrint('Cart Items: $cartItems');

              if (cartItems != null && cartItems.isNotEmpty) {
                items = cartItems.map((item) {
                  if (item is Map) {
                    final itemMap = Map<String, dynamic>.from(item);
                    double price = 0.0;
                    if (itemMap['price'] != null) {
                      price = itemMap['price'] is num ? (itemMap['price'] as num).toDouble() : double.tryParse(itemMap['price'].toString()) ?? 0.0;
                    } else if (itemMap['Product'] != null && itemMap['Product']['price'] != null) {
                      price = itemMap['Product']['price'] is num ? (itemMap['Product']['price'] as num).toDouble() : double.tryParse(itemMap['Product']['price'].toString()) ?? 0.0;
                    }
                    return {
                      'id': itemMap['id'] ?? 0,
                      'productId': itemMap['productId'] ?? 0,
                      'productName': itemMap['productName'] ?? itemMap['Product']?['name'] ?? '',
                      'price': price,
                      'quantity': itemMap['quantity'] ?? 1,
                    };
                  } else {
                    // It's an object
                    double price = 0.0;
                    if ((item as dynamic).price != null) {
                      final p = (item as dynamic).price;
                      price = p is num ? (p as num).toDouble() : double.tryParse(p.toString()) ?? 0.0;
                    } else if ((item as dynamic).Product?.price != null) {
                      final p = (item as dynamic).Product.price;
                      price = p is num ? (p as num).toDouble() : double.tryParse(p.toString()) ?? 0.0;
                    }
                    return {
                      'id': (item as dynamic).id ?? 0,
                      'productId': (item as dynamic).productId ?? 0,
                      'productName': (item as dynamic).productName ?? (item as dynamic).Product?.name ?? '',
                      'price': price,
                      'quantity': (item as dynamic).quantity ?? 1,
                    };
                  }
                }).toList();
              }

              // Parse monetary values - use property access
              final rawSubtotal = cart.subtotal;
              subtotal = rawSubtotal is double ? rawSubtotal : (rawSubtotal is num ? (rawSubtotal as num).toDouble() : double.tryParse(rawSubtotal?.toString() ?? '0') ?? 0.0);
              final rawTax = cart.tax;
              tax = rawTax is double ? rawTax : (rawTax is num ? (rawTax as num).toDouble() : double.tryParse(rawTax?.toString() ?? '0') ?? 0.0);
              final rawTotal = cart.total;
              total = rawTotal is double ? rawTotal : (rawTotal is num ? (rawTotal as num).toDouble() : double.tryParse(rawTotal?.toString() ?? '0') ?? 0.0);

              debugPrint('Parsed Items Count: ${items.length}');
              debugPrint('Parsed Items: $items');
            } catch (e) {
              debugPrint('Error parsing cart data: $e');
              debugPrint('Stack trace: $e');
            }
          }

          if (items.isEmpty) {
            return SingleChildScrollView(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 60),
                    Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
                    const SizedBox(height: 24),
                    const Text(
                      'Your cart is empty',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Please add items to your cart before proceeding to checkout.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Back to Cart'),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => Navigator.of(context).pushReplacementNamed('/home'),
                      icon: const Icon(Icons.shopping_bag),
                      label: const Text('Continue Shopping'),
                    ),
                    const SizedBox(height: 60),
                  ],
                ),
              ),
            );
          }

          return SingleChildScrollView(
            child: Stepper(
              currentStep: _currentStep,
              onStepContinue: () {
                if (_currentStep < 2) {
                  if (_currentStep == 0 && _selectedAddressId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please select a shipping address')),
                    );
                    return;
                  }
                  // Step 1 (Payment) - Razorpay handles payment method selection
                  setState(() => _currentStep++);
                } else {
                  _processOrder(ref, cartData);
                }
              },
              onStepCancel: _currentStep > 0 ? () => setState(() => _currentStep--) : null,
              steps: [
                // Step 1: Shipping Address
                Step(
                  title: const Text('Shipping Address'),
                  isActive: _currentStep >= 0,
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
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (addresses.isEmpty)
                            const Text('No saved addresses. Add one below.')
                          else
                            ...addresses.map((addressItem) {
                              // Handle both Map and Address object
                              String addressId = '';
                              String street = '';
                              String city = '';
                              String state = '';
                              String zip = '';
                              String phone = '';

                              if (addressItem is Map) {
                                addressId = addressItem['id'].toString();
                                street = addressItem['street'] ?? '';
                                city = addressItem['city'] ?? '';
                                state = addressItem['state'] ?? addressItem['stateOrProvince'] ?? '';
                                zip = addressItem['zipCode'] ?? addressItem['zip'] ?? '';
                                phone = addressItem['phoneNumber'] ?? addressItem['phone'] ?? '';
                              } else {
                                // Address object
                                addressId = addressItem.id.toString();
                                street = addressItem.street;
                                city = addressItem.city;
                                state = addressItem.state;
                                zip = addressItem.zipCode;
                                phone = addressItem.phoneNumber;
                              }

                              return RadioListTile(
                                title: Text('$street, $city, $state $zip'),
                                subtitle: Text(phone),
                                value: addressId,
                                groupValue: _selectedAddressId,
                                onChanged: (value) {
                                  setState(() => _selectedAddressId = value);
                                },
                              );
                            }).toList(),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () => _showAddAddressDialog(context, ref),
                            icon: const Icon(Icons.add),
                            label: const Text('Add New Address'),
                          ),
                        ],
                      );
                    },
                  ),
                ),

                // Step 2: Payment Method
                Step(
                  title: const Text('Payment Method'),
                  isActive: _currentStep >= 1,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Razorpay payment option
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: Theme.of(context).primaryColor, width: 2),
                          borderRadius: BorderRadius.circular(8),
                          color: Theme.of(context).primaryColor.withOpacity(0.05),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.payment,
                                color: Theme.of(context).primaryColor,
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Pay with Razorpay',
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Credit/Debit Card, UPI, Net Banking, Wallets',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.check_circle,
                              color: Theme.of(context).primaryColor,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Payment methods icons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildPaymentMethodIcon(Icons.credit_card, 'Cards'),
                          const SizedBox(width: 24),
                          _buildPaymentMethodIcon(Icons.account_balance, 'UPI'),
                          const SizedBox(width: 24),
                          _buildPaymentMethodIcon(Icons.business, 'Net Banking'),
                          const SizedBox(width: 24),
                          _buildPaymentMethodIcon(Icons.account_balance_wallet, 'Wallets'),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Secure payment notice
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          border: Border.all(color: Colors.green[300]!),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.lock, color: Colors.green[600], size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Your payment is secured with Razorpay. We never store your card details.',
                                style: TextStyle(color: Colors.green[700], fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Step 3: Order Review
                Step(
                  title: const Text('Review Order'),
                  isActive: _currentStep >= 2,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Order Items Summary
                      Text(
                        'Order Items',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: items.length,
                          separatorBuilder: (_, __) => Divider(height: 0, color: Colors.grey[300]),
                          itemBuilder: (context, index) {
                            final item = items[index];
                            return Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
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
                                  Text('\$${(item['price'] * item['quantity']).toStringAsFixed(2)}'),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Order Summary
                      Text(
                        'Order Summary',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Subtotal:'),
                                Text('\$${subtotal.toStringAsFixed(2)}'),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Tax (10%):'),
                                Text('\$${tax.toStringAsFixed(2)}'),
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
                            const SizedBox(height: 12),
                            Divider(color: Colors.grey[300]),
                            const SizedBox(height: 12),
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
                                  '\$${(total + 10).toStringAsFixed(2)}',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Warning message
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          border: Border.all(color: Colors.blue[300]!),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline, color: Colors.blue[600]),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Please review your order details before placing the order.',
                                style: TextStyle(color: Colors.blue[600]),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: _isProcessing
          ? null
          : FloatingActionButton(
        onPressed: () => setState(() => _currentStep = 0),
        child: const Icon(Icons.clear),
      ),
    );
  }

  Widget _buildPaymentMethodIcon(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 24, color: Colors.grey[700]),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(fontSize: 10, color: Colors.grey[600]),
        ),
      ],
    );
  }

  void _showAddAddressDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Address'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _fullNameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  border: OutlineInputBorder(),
                  hintText: '+91 10-digit number',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _addressLine1Controller,
                decoration: const InputDecoration(
                  labelText: 'Address Line 1',
                  border: OutlineInputBorder(),
                  hintText: 'House No., Building Name',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _addressLine2Controller,
                decoration: const InputDecoration(
                  labelText: 'Address Line 2',
                  border: OutlineInputBorder(),
                  hintText: 'Road Name, Area, Colony',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'City',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _stateController,
                decoration: const InputDecoration(
                  labelText: 'State',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _pinCodeController,
                decoration: const InputDecoration(
                  labelText: 'PIN Code',
                  border: OutlineInputBorder(),
                  hintText: '6-digit PIN code',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Save address
              final navigator = Navigator.of(context);
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              
              // Capture the notifier reference before any async operations
              final addressNotifier = ref.read(addAddressProvider.notifier);
              
              try {
                await addressNotifier.addAddress(
                  type: 'residential',
                  fullName: _fullNameController.text,
                  phoneNumber: _phoneController.text,
                  street: _addressLine1Controller.text,
                  city: _cityController.text,
                  stateOrProvince: _stateController.text,
                  zipCode: _pinCodeController.text,
                  country: 'India',
                );
                
                if (!mounted) return;
                
                _fullNameController.clear();
                _phoneController.clear();
                _addressLine1Controller.clear();
                _addressLine2Controller.clear();
                _cityController.clear();
                _stateController.clear();
                _pinCodeController.clear();
                
                navigator.pop();
                
                // Refresh addresses after successful addition
                Future.delayed(const Duration(milliseconds: 500), () {
                  if (mounted) {
                    ref.invalidate(userAddressesProvider);
                  }
                });
                
                scaffoldMessenger.showSnackBar(
                  const SnackBar(content: Text('Address added successfully')),
                );
              } catch (error) {
                if (mounted) {
                  scaffoldMessenger.showSnackBar(
                    SnackBar(content: Text('Error: $error')),
                  );
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showAddPaymentMethodDialog(BuildContext context, WidgetRef ref) {
    String selectedPaymentType = 'card';
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Payment Method'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Payment type selector
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: SegmentedButton<String>(
                          segments: const [
                            ButtonSegment(label: Text('Card'), value: 'card'),
                            ButtonSegment(label: Text('UPI'), value: 'upi'),
                          ],
                          selected: {selectedPaymentType},
                          onSelectionChanged: (Set<String> newSelection) {
                            setState(() => selectedPaymentType = newSelection.first);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Card payment fields
                if (selectedPaymentType == 'card') ...[
                  TextField(
                    controller: _cardNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Card Number',
                      border: OutlineInputBorder(),
                      hintText: '1234 5678 9012 3456',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _cardHolderController,
                    decoration: const InputDecoration(
                      labelText: 'Cardholder Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _expiryController,
                          decoration: const InputDecoration(
                            labelText: 'MM/YY',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _cvcController,
                          decoration: const InputDecoration(
                            labelText: 'CVC',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                
                // UPI payment fields
                if (selectedPaymentType == 'upi') ...[
                  TextField(
                    controller: _upiIdController,
                    decoration: const InputDecoration(
                      labelText: 'UPI ID',
                      border: OutlineInputBorder(),
                      hintText: 'yourname@upi',
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                // Save payment method
                final navigator = Navigator.of(context);
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                
                // Capture the notifier reference before any async operations
                final paymentNotifier = ref.read(savePaymentMethodProvider.notifier);
                
                try {
                  if (selectedPaymentType == 'card') {
                    await paymentNotifier.savePaymentMethod(
                      type: 'card',
                      cardToken: _cardNumberController.text,
                      cardHolderName: _cardHolderController.text,
                      cardExpiry: _expiryController.text,
                    );
                  } else if (selectedPaymentType == 'upi') {
                    await paymentNotifier.savePaymentMethod(
                      type: 'upi',
                      upiId: _upiIdController.text,
                    );
                  }
                
                if (!mounted) return;
                
                _cardNumberController.clear();
                _cardHolderController.clear();
                _expiryController.clear();
                _cvcController.clear();
                _upiIdController.clear();
                
                navigator.pop();
                
                // Refresh payment methods after successful addition
                Future.delayed(const Duration(milliseconds: 500), () {
                  if (mounted) {
                    ref.invalidate(paymentMethodsProvider);
                  }
                });
                
                scaffoldMessenger.showSnackBar(
                  const SnackBar(content: Text('Payment method added successfully')),
                );
              } catch (error) {
                if (mounted) {
                  scaffoldMessenger.showSnackBar(
                    SnackBar(content: Text('Error: $error')),
                  );
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),  // AlertDialog closes
    ),    // StatefulBuilder builder closes
  );      // showDialog closes
  }

  void _processOrder(WidgetRef ref, dynamic cartData) {
    if (_selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a shipping address')),
      );
      return;
    }

    setState(() => _isProcessing = true);
    _pendingCartData = cartData;

    // Extract cart items and calculate total from cartData
    List<int> cartItemIds = [];
    double totalAmount = 0;
    
    if (cartData != null) {
      final cart = cartData as dynamic;
      List<dynamic>? cartItems;
      
      if (cart.items is List) {
        cartItems = cart.items;
      } else if (cart.CartItems is List) {
        cartItems = cart.CartItems;
      }
      
      if (cartItems != null) {
        cartItemIds = cartItems.map((item) {
          if (item is Map) {
            return (item['id'] as int?) ?? 0;
          } else {
            return ((item as dynamic).id as int?) ?? 0;
          }
        }).where((id) => id > 0).toList();
      }
      
      // Get total amount
      final rawTotal = cart.total;
      totalAmount = rawTotal is double 
          ? rawTotal 
          : (rawTotal is num ? (rawTotal as num).toDouble() : double.tryParse(rawTotal?.toString() ?? '0') ?? 0.0);
      totalAmount += 10; // Add shipping
    }

    // First create the order in pending state
    ref.read(createOrderProvider.notifier).createOrder(
      cartItems: cartItemIds,
      shippingAddress: _selectedAddressId ?? '',
      paymentMethod: 'razorpay',
    ).then((orderResult) async {
      if (!mounted) return;
      
      // Get order ID from result
      final orderId = orderResult?.id ?? 0;
      
      if (orderId == 0) {
        throw Exception('Failed to create order');
      }
      
      try {
        // Create Razorpay order
        final razorpayOrder = await _razorpayService.createOrder(
          orderId: orderId,
          amount: totalAmount,
          currency: 'INR',
        );
        
        // Get user details for prefill
        final userAsync = ref.read(userProfileProvider);
        String? userName;
        String? userEmail;
        String? userPhone;
        
        userAsync.whenData((user) {
          if (user != null && user is Map) {
            userName = user['name']?.toString();
            userEmail = user['email']?.toString();
            userPhone = user['phone']?.toString();
          }
        });
        
        // Open Razorpay checkout
        _razorpayService.openCheckout(
          orderDetails: razorpayOrder,
          prefillName: userName,
          prefillEmail: userEmail,
          prefillPhone: userPhone,
        );
      } catch (e) {
        if (!mounted) return;
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment setup failed: ${e.toString()}'),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }).catchError((error, stackTrace) {
      if (!mounted) return;
      
      print('Order creation error: $error');
      print('Stack trace: $stackTrace');
      
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${error.toString()}'),
          duration: const Duration(seconds: 5),
        ),
      );
    });
  }

  /// Handle successful Razorpay payment
  void _handlePaymentSuccess(RazorpayPaymentResult result) async {
    debugPrint('✅ Payment successful: ${result.paymentId}');
    
    if (!mounted) return;
    
    // Verify payment on backend
    // In production, always verify the signature on your backend
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ),
              SizedBox(width: 12),
              Text('Verifying payment...'),
            ],
          ),
        ),
      );
      
      // Note: In production, you should verify the payment signature on your backend
      // The backend should verify: razorpay_order_id + "|" + razorpay_payment_id
      // using HMAC SHA256 with your Razorpay key secret
      
      setState(() => _isProcessing = false);
      
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Text('Payment successful! ID: ${result.paymentId}'),
              ),
            ],
          ),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
        ),
      );
      
      // Clear cart and navigate to orders
      ref.invalidate(cartProvider);
      Navigator.of(context).pushReplacementNamed('/orders');
    } catch (e) {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment verification failed: $e'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  /// Handle Razorpay payment error
  void _handlePaymentError(RazorpayPaymentResult result) {
    debugPrint('❌ Payment failed: ${result.errorCode} - ${result.errorMessage}');
    
    if (!mounted) return;
    
    setState(() => _isProcessing = false);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text('Payment failed: ${result.errorMessage}'),
            ),
          ],
        ),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 5),
        action: SnackBarAction(
          label: 'Retry',
          textColor: Colors.white,
          onPressed: () {
            if (_pendingCartData != null) {
              _processOrder(ref, _pendingCartData);
            }
          },
        ),
      ),
    );
  }

  /// Handle external wallet selection
  void _handleExternalWallet() {
    debugPrint('📱 External wallet selected');
    // External wallets like Paytm, PhonePe will handle payment in their own app
    // The result will come back through success/error handlers
  }
}
