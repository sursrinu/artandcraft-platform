import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/cart_provider_new.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  String? _couponCode;
  String? _couponError;

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
        elevation: 1,
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
          // cartData is a Cart object
          List items = [];
          double subtotal = 0;
          double tax = 0;
          double total = 0;
          
          // Handle Cart object from provider
          if (cartData != null) {
            try {
              // Cart object properties
              final cart = cartData as dynamic;
              List<dynamic>? cartItems;
              
              // Try to access items
              if (cart.items is List) {
                cartItems = cart.items;
              } else if (cart.CartItems is List) {
                cartItems = cart.CartItems;
              }
              
              if (cartItems is List && cartItems.isNotEmpty) {
                items = cartItems.map((item) {
                  // Convert each CartItem to a map for UI handling
                  if (item is Map) {
                    double price = 0.0;
                    if (item['price'] != null) {
                      price = item['price'] is num ? (item['price'] as num).toDouble() : double.tryParse(item['price'].toString()) ?? 0.0;
                    } else if (item['Product']?['price'] != null) {
                      price = item['Product']['price'] is num ? (item['Product']['price'] as num).toDouble() : double.tryParse(item['Product']['price'].toString()) ?? 0.0;
                    }
                    
                    return {
                      'id': item['id'] ?? 0,
                      'productId': item['productId'] ?? 0,
                      'productName': item['productName'] ?? item['Product']?['name'] ?? '',
                      'price': price,
                      'quantity': item['quantity'] ?? 1,
                      'productImage': item['productImage'],
                    };
                  } else {
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
                      'productImage': (item as dynamic).productImage,
                    };
                  }
                }).toList();
              }
              
              // Parse totals - use property access instead of []
              final rawSubtotal = cart.subtotal;
              subtotal = rawSubtotal is double ? rawSubtotal : (rawSubtotal is num ? (rawSubtotal as num).toDouble() : double.tryParse(rawSubtotal?.toString() ?? '0') ?? 0.0);
              final rawTax = cart.tax;
              tax = rawTax is double ? rawTax : (rawTax is num ? (rawTax as num).toDouble() : double.tryParse(rawTax?.toString() ?? '0') ?? 0.0);
              final rawTotal = cart.total;
              total = rawTotal is double ? rawTotal : (rawTotal as num?)?.toDouble() ?? 0.0;
            } catch (e) {
              // Error handling - keep defaults
              debugPrint('Error parsing cart data: $e');
            }
          }

          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty'),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Continue Shopping'),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: items.length,
                  itemBuilder: (context, index) => _CartItemCard(
                    item: items[index],
                    onUpdateQuantity: (quantity) {
                      ref.read(updateCartItemProvider((
                        items[index]['id'] as int,
                        quantity,
                      )).future).then((_) {
                        ref.invalidate(cartProvider);
                      });
                    },
                    onRemove: () {
                      ref.read(removeFromCartProvider(items[index]['id'] as int).future).then((_) {
                        ref.invalidate(cartProvider);
                      });
                    },
                  ),
                ),
              ),
              _buildCartSummary(context, subtotal, tax, total),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCartSummary(BuildContext context, double subtotal, double tax, double total) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
        color: Colors.grey[50],
      ),
      child: Column(
        children: [
          // Coupon Input
          Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (value) => _couponCode = value,
                  decoration: InputDecoration(
                    hintText: 'Enter coupon code',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(4)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _couponCode != null && _couponCode!.isNotEmpty
                    ? () => _applyCoupon()
                    : null,
                child: const Text('Apply'),
              ),
            ],
          ),
          if (_couponError != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                _couponError!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.red),
              ),
            ),
          const SizedBox(height: 16),
          // Totals
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
          Divider(color: Colors.grey[300]),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total:',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              Text(
                '\$${total.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.of(context).pushNamed('/checkout'),
              child: const Text('Proceed to Checkout'),
            ),
          ),
        ],
      ),
    );
  }

  void _applyCoupon() {
    ref.read(applyCouponProvider(_couponCode!).future).then((_) {
      setState(() => _couponError = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Coupon applied successfully')),
      );
    }).catchError((error) {
      setState(() => _couponError = error.toString());
    });
  }
}

class _CartItemCard extends StatelessWidget {
  final dynamic item;
  final Function(int) onUpdateQuantity;
  final VoidCallback onRemove;

  const _CartItemCard({
    required this.item,
    required this.onUpdateQuantity,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    String name = item['productName'] ?? item['name'] ?? 'Unknown';
    
    // Parse price - it comes as a string from the API
    double price = 0.0;
    final priceValue = item['price'];
    if (priceValue != null) {
      if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else if (priceValue is num) {
        price = priceValue.toDouble();
      }
    }
    
    int quantity = item['quantity'] ?? 1;
    double itemTotal = price * quantity;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Icon(Icons.image, color: Colors.grey[400]),
            ),
            const SizedBox(width: 12),
            // Product Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 8),
                  // Quantity Control
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove, size: 16),
                          onPressed: quantity > 1
                              ? () => onUpdateQuantity(quantity - 1)
                              : null,
                          iconSize: 16,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        ),
                        Text(quantity.toString()),
                        IconButton(
                          icon: const Icon(Icons.add, size: 16),
                          onPressed: () => onUpdateQuantity(quantity + 1),
                          iconSize: 16,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Price and Delete
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '\$${itemTotal.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: onRemove,
                  iconSize: 20,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
