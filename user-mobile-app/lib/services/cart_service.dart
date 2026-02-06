// Cart Service - Handles cart endpoints
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../services/api_client.dart';

class CartItem {
  final int id;
  final int productId;
  final String productName;
  final double price;
  final int quantity;
  final String? productImage;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.productImage,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // Get product data - could be nested under 'Product' (Sequelize) or 'product'
    final product = json['Product'] ?? json['product'];
    
    // Parse price - handle both string and numeric values
    double price = 0.0;
    final priceValue = json['price'] ?? product?['price'];
    if (priceValue != null) {
      if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else if (priceValue is num) {
        price = priceValue.toDouble();
      }
    }
    
    return CartItem(
      id: json['id'] ?? 0,
      productId: json['productId'] ?? 0,
      productName: json['productName'] ?? product?['name'] ?? '',
      price: price,
      quantity: json['quantity'] ?? 1,
      productImage: json['productImage'] ?? product?['image'],
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'quantity': quantity,
  };
}

class Cart {
  final int id;
  final List<CartItem> items;
  final double subtotal;
  final double tax;
  final double shipping;
  final double total;

  Cart({
    required this.id,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.shipping,
    required this.total,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    debugPrint('=== CART.fromJson START ===');
    debugPrint('JSON keys: ${json.keys}');
    debugPrint('Full JSON: $json');
    
    // Backend returns either 'items' or 'CartItems' depending on Sequelize serialization
    final List<dynamic> itemsList = json['items'] ?? json['CartItems'] ?? [];
    debugPrint('Items list found: ${itemsList.length} items');
    debugPrint('Items list: $itemsList');
    
    // Parse monetary values - handle both string and numeric values
    double subtotal = 0.0;
    final subtotalValue = json['subtotal'];
    if (subtotalValue != null) {
      if (subtotalValue is String) {
        subtotal = double.tryParse(subtotalValue) ?? 0.0;
      } else if (subtotalValue is num) {
        subtotal = subtotalValue.toDouble();
      }
    }
    debugPrint('Subtotal: $subtotal');

    double tax = 0.0;
    final taxValue = json['tax'];
    if (taxValue != null) {
      if (taxValue is String) {
        tax = double.tryParse(taxValue) ?? 0.0;
      } else if (taxValue is num) {
        tax = taxValue.toDouble();
      }
    }
    debugPrint('Tax: $tax');

    double shipping = 0.0;
    final shippingValue = json['shipping'];
    if (shippingValue != null) {
      if (shippingValue is String) {
        shipping = double.tryParse(shippingValue) ?? 0.0;
      } else if (shippingValue is num) {
        shipping = shippingValue.toDouble();
      }
    }
    debugPrint('Shipping: $shipping');

    double total = 0.0;
    final totalValue = json['total'];
    if (totalValue != null) {
      if (totalValue is String) {
        total = double.tryParse(totalValue) ?? 0.0;
      } else if (totalValue is num) {
        total = totalValue.toDouble();
      }
    }
    debugPrint('Total: $total');

    final cart = Cart(
      id: json['id'] ?? 0,
      items: itemsList
          .map((item) {
            if (item is Map<String, dynamic>) {
              return CartItem.fromJson(item);
            }
            return CartItem.fromJson({});
          })
          .toList(),
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
    );
    
    debugPrint('=== CART.fromJson END - Created cart with ${cart.items.length} items ===');
    return cart;
  }
}

class CartService {
  final ApiClient _apiClient = ApiClient();

  // Get cart
  Future<Cart> getCart() async {
    try {
      print('');
      print('◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆');
      print('CART SERVICE - CALLING GET /CART');
      print('◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆');
      
      final response = await _apiClient.get('/cart');
      
      print('CART RESPONSE RECEIVED:');
      print('Status: ${response.statusCode}');
      print('Data keys: ${response.data.keys.toList()}');
      print('Full response: ${response.data}');
      print('response.data["data"]: ${response.data['data']}');
      print('◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆');
      print('');
      
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      print('ERROR IN GET CART:');
      print('Error: $e');
      print('Response status: ${e.response?.statusCode}');
      print('Response data: ${e.response?.data}');
      throw _handleError(e);
    }
  }

  // Add to cart
  Future<Cart> addToCart({
    required int productId,
    required int quantity,
  }) async {
    try {
      final response = await _apiClient.post(
        '/cart/items',
        data: {
          'productId': productId,
          'quantity': quantity,
        },
      );
      
      // Check if response is successful
      if (response.statusCode != 200) {
        final errorMessage = response.data['message'] ?? 'Failed to add to cart';
        throw errorMessage;
      }
      
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Update cart item
  Future<Cart> updateCartItem({
    required int itemId,
    required int quantity,
  }) async {
    try {
      final response = await _apiClient.put(
        '/cart/items/$itemId',
        data: {'quantity': quantity},
      );
      
      // Check if response is successful
      if (response.statusCode != 200) {
        final errorMessage = response.data['message'] ?? 'Failed to update cart item';
        throw errorMessage;
      }
      
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Remove from cart
  Future<Cart> removeFromCart(int itemId) async {
    try {
      final response = await _apiClient.delete('/cart/items/$itemId');
      
      // Check if response is successful
      if (response.statusCode != 200) {
        final errorMessage = response.data['message'] ?? 'Failed to remove from cart';
        throw errorMessage;
      }
      
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Clear cart
  Future<void> clearCart() async {
    try {
      await _apiClient.delete('/cart');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Apply coupon
  Future<Cart> applyCoupon(String couponCode) async {
    try {
      final response = await _apiClient.post(
        '/cart/coupon',
        data: {'code': couponCode},
      );
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Remove coupon
  Future<Cart> removeCoupon() async {
    try {
      final response = await _apiClient.delete('/cart/coupon');
      return Cart.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final errorMessage = error.response?.data['message'] ??
          error.response?.data['error']?['message'] ??
          'Cart operation failed';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
