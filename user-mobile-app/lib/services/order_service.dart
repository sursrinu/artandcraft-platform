// Order Service - Handles order endpoints
import 'package:dio/dio.dart';
import '../services/api_client.dart';
import '../models/api_models.dart';

class OrderItem {
  final int id;
  final int productId;
  final String productName;
  final double price;
  final int quantity;
  final double subtotal;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    double price = 0.0;
    final priceValue = json['price'];
    if (priceValue != null) {
      if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else if (priceValue is num) {
        price = priceValue.toDouble();
      }
    }

    double subtotal = 0.0;
    final subtotalValue = json['subtotal'];
    if (subtotalValue != null) {
      if (subtotalValue is String) {
        subtotal = double.tryParse(subtotalValue) ?? 0.0;
      } else if (subtotalValue is num) {
        subtotal = subtotalValue.toDouble();
      }
    }

    return OrderItem(
      id: json['id'] ?? 0,
      productId: json['productId'] ?? 0,
      productName: json['productName'] ?? '',
      price: price,
      quantity: json['quantity'] ?? 1,
      subtotal: subtotal,
    );
  }
}

class Order {
  final int id;
  final String orderNumber;
  final List<OrderItem> items;
  final String status;
  final double subtotal;
  final double tax;
  final double shipping;
  final double total;
  final String paymentStatus;
  final String paymentMethod;
  final String shippingAddress;
  final DateTime createdAt;
  final DateTime? estimatedDelivery;

  Order({
    required this.id,
    required this.orderNumber,
    required this.items,
    required this.status,
    required this.subtotal,
    required this.tax,
    required this.shipping,
    required this.total,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.shippingAddress,
    required this.createdAt,
    this.estimatedDelivery,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    try {
    // Handle subtotal - can come from 'subtotal' or calculate from totalAmount
    double subtotal = 0.0;
    final subtotalValue = json['subtotal'];
    if (subtotalValue != null) {
      if (subtotalValue is String) {
        subtotal = double.tryParse(subtotalValue) ?? 0.0;
      } else if (subtotalValue is num) {
        subtotal = subtotalValue.toDouble();
      }
    }

    // Handle tax - comes from 'tax' or 'taxAmount'
    double tax = 0.0;
    final taxValue = json['tax'] ?? json['taxAmount'];
    if (taxValue != null) {
      if (taxValue is String) {
        tax = double.tryParse(taxValue) ?? 0.0;
      } else if (taxValue is num) {
        tax = taxValue.toDouble();
      }
    }

    // Handle shipping - comes from 'shipping' or 'shippingAmount'
    double shipping = 0.0;
    final shippingValue = json['shipping'] ?? json['shippingAmount'];
    if (shippingValue != null) {
      if (shippingValue is String) {
        shipping = double.tryParse(shippingValue) ?? 0.0;
      } else if (shippingValue is num) {
        shipping = shippingValue.toDouble();
      }
    }

    // Handle total - comes from 'total' or 'totalAmount'
    double total = 0.0;
    final totalValue = json['total'] ?? json['totalAmount'];
    if (totalValue != null) {
      if (totalValue is String) {
        total = double.tryParse(totalValue) ?? 0.0;
      } else if (totalValue is num) {
        total = totalValue.toDouble();
      }
    }
    
    // If subtotal is 0, calculate it from total minus taxes and shipping
    if (subtotal == 0.0 && total > 0) {
      subtotal = total - tax - shipping;
    }

    final List<dynamic> itemsList = json['items'] ?? json['OrderItems'] ?? [];
    
    // Convert payment method ID to readable string
    String paymentMethodStr = 'card';
    final paymentMethodValue = json['paymentMethod'];
    if (paymentMethodValue != null) {
      if (paymentMethodValue is String) {
        paymentMethodStr = paymentMethodValue;
      } else if (paymentMethodValue is int) {
        // Map payment method IDs to readable names
        switch (paymentMethodValue) {
          case 1:
            paymentMethodStr = 'credit_card';
            break;
          case 2:
            paymentMethodStr = 'debit_card';
            break;
          case 3:
            paymentMethodStr = 'upi';
            break;
          case 4:
            paymentMethodStr = 'wallet';
            break;
          case 5:
            paymentMethodStr = 'net_banking';
            break;
          default:
            paymentMethodStr = 'card';
        }
      }
    }
    
    final order = Order(
      id: json['id'] ?? 0,
      orderNumber: json['orderNumber'] ?? '',
      items: itemsList
          .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      status: json['status'] ?? 'pending',
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      paymentStatus: json['paymentStatus'] ?? 'pending',
      paymentMethod: paymentMethodStr,
      shippingAddress: json['shippingAddress']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      estimatedDelivery: json['estimatedDelivery'] != null
          ? DateTime.tryParse(json['estimatedDelivery'])
          : null,
    );
    
    return order;
    } catch (e) {
      rethrow;
    }
  }
}

class OrderService {
  final ApiClient _apiClient = ApiClient();

  // Get user orders
  Future<PaginatedResponse<Order>> getOrders({
    int page = 1,
    int perPage = 20,
    String? status,
  }) async {
    try {
      print('🔵 [OrderService] Calling API: /orders?page=$page&per_page=$perPage');
      final response = await _apiClient.get(
        '/orders',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (status != null) 'status': status,
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Orders request timed out after 10 seconds'),
      );
      
      print('🟢 [OrderService] API Response status: ${response.statusCode}');
      print('🟢 [OrderService] Response data keys: ${response.data.keys}');
      
      final dataObj = response.data['data'] as Map<String, dynamic>? ?? {};
      print('🟢 [OrderService] Data object: $dataObj');
      
      final result = PaginatedResponse.fromJson(dataObj, Order.fromJson);
      print('✅ [OrderService] Parsed ${result.items.length} orders');
      
      return result;
    } on DioException catch (e) {
      print('❌ [OrderService] DioException: ${e.message}');
      print('❌ [OrderService] Response data: ${e.response?.data}');
      throw _handleError(e);
    } catch (e) {
      print('❌ [OrderService] Exception: $e');
      rethrow;
    }
  }

  // Get order by ID
  Future<Order> getOrderById(int orderId) async {
    try {
      final response = await _apiClient.get('/orders/$orderId');
      return Order.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Create order
  Future<Order> createOrder({
    required List<int> cartItems,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/orders',
        data: {
          'items': cartItems,
          'shippingAddress': shippingAddress,
          'paymentMethod': paymentMethod,
          if (notes != null) 'notes': notes,
        },
      );
      
      // Backend returns { orders: [...], totalAmount, message }
      // Get the first order from the array
      final responseDataRaw = response.data['data'] ?? {};
      final Map<String, dynamic> responseData = responseDataRaw is Map<String, dynamic>
          ? responseDataRaw
          : Map<String, dynamic>.from(responseDataRaw);
      final List<dynamic> orders = responseData['orders'] ?? [];

      if (orders.isNotEmpty) {
        return Order.fromJson(orders[0] as Map<String, dynamic>);
      } else {
        // If no orders, create a minimal order from response
        return Order.fromJson(responseData);
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Cancel order
  Future<Map<String, dynamic>> cancelOrder({
    required int orderId,
    String? reason,
  }) async {
    try {
      final response = await _apiClient.put(
        '/orders/$orderId/cancel',
        data: {
          if (reason != null) 'reason': reason,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get order tracking
  Future<Map<String, dynamic>> getOrderTracking(int orderId) async {
    try {
      final response = await _apiClient.get('/orders/$orderId/tracking');
      return response.data['data'] ?? {};
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Request return
  Future<Map<String, dynamic>> requestReturn({
    required int orderId,
    required String reason,
    String? description,
  }) async {
    try {
      final response = await _apiClient.post(
        '/orders/$orderId/return',
        data: {
          'reason': reason,
          if (description != null) 'description': description,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final errorMessage = error.response?.data['message'] ??
          error.response?.data['error']?['message'] ??
          'Order operation failed';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
