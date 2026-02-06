// Payment Service - Handles payment operations
import 'package:dio/dio.dart';
import '../services/api_client.dart';

class PaymentMethod {
  final int id;
  final String type; // 'card', 'upi', 'netbanking', 'wallet'
  final String? cardToken;
  final String? cardLastFour;
  final String? cardHolderName;
  final String? cardExpiry;
  final String? upiId;
  final String? bankName;
  final String? walletProvider;
  final bool isDefault;

  PaymentMethod({
    required this.id,
    required this.type,
    this.cardToken,
    this.cardLastFour,
    this.cardHolderName,
    this.cardExpiry,
    this.upiId,
    this.bankName,
    this.walletProvider,
    this.isDefault = false,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] ?? 0,
      type: json['type'] ?? 'card',
      cardToken: json['cardToken'],
      cardLastFour: json['cardLastFour'],
      cardHolderName: json['cardHolderName'],
      cardExpiry: json['cardExpiry'],
      upiId: json['upiId'],
      bankName: json['bankName'],
      walletProvider: json['walletProvider'],
      isDefault: json['isDefault'] ?? false,
    );
  }
}

class PaymentIntent {
  final String id;
  final String clientSecret;
  final double amount;
  final String status;

  PaymentIntent({
    required this.id,
    required this.clientSecret,
    required this.amount,
    required this.status,
  });

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    double amount = 0.0;
    final amountValue = json['amount'];
    if (amountValue != null) {
      if (amountValue is String) {
        amount = double.tryParse(amountValue) ?? 0.0;
      } else if (amountValue is num) {
        amount = amountValue.toDouble();
      }
    }

    return PaymentIntent(
      id: json['id'] ?? '',
      clientSecret: json['clientSecret'] ?? '',
      amount: amount,
      status: json['status'] ?? 'incomplete',
    );
  }
}

class PaymentService {
  final ApiClient _apiClient = ApiClient();

  // Get payment methods
  Future<List<PaymentMethod>> getPaymentMethods() async {
    try {
      final response = await _apiClient.get('/users/payment-methods');
      final responseData = response.data['data'] ?? response.data ?? [];
      
      List<dynamic> items = [];
      if (responseData is List) {
        items = responseData;
      } else if (responseData is Map && responseData['items'] is List) {
        items = responseData['items'];
      }
      
      return items
          .map((item) => PaymentMethod.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Save payment method
  Future<PaymentMethod> savePaymentMethod({
    required String type,
    String? cardToken,
    String? cardHolderName,
    String? cardExpiry,
    String? upiId,
    String? bankName,
    String? walletProvider,
    bool isDefault = false,
  }) async {
    try {
      final data = <String, dynamic>{
        'type': type,
        'isDefault': isDefault,
      };
      
      // Add type-specific fields
      if (type == 'card') {
        if (cardToken != null) data['cardToken'] = cardToken;
        if (cardHolderName != null) data['cardHolderName'] = cardHolderName;
        if (cardExpiry != null) data['cardExpiry'] = cardExpiry;
      } else if (type == 'upi') {
        if (upiId != null) data['upiId'] = upiId;
      } else if (type == 'netbanking') {
        if (bankName != null) data['bankName'] = bankName;
      } else if (type == 'wallet') {
        if (walletProvider != null) data['walletProvider'] = walletProvider;
      }

      final response = await _apiClient.post(
        '/users/payment-methods',
        data: data,
      );
      return PaymentMethod.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Delete payment method
  Future<void> deletePaymentMethod(int methodId) async {
    try {
      await _apiClient.delete('/payments/methods/$methodId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Set default payment method
  Future<PaymentMethod> setDefaultPaymentMethod(int methodId) async {
    try {
      final response = await _apiClient.put(
        '/payments/methods/$methodId/default',
      );
      return PaymentMethod.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Create payment intent (for Stripe)
  Future<PaymentIntent> createPaymentIntent({
    required int orderId,
    required double amount,
    String? paymentMethodId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/payments/intent',
        data: {
          'orderId': orderId,
          'amount': amount,
          if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
        },
      );
      return PaymentIntent.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Confirm payment
  Future<Map<String, dynamic>> confirmPayment({
    required String paymentIntentId,
    String? paymentMethodId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/payments/confirm',
        data: {
          'paymentIntentId': paymentIntentId,
          if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get payment status
  Future<Map<String, dynamic>> getPaymentStatus(String paymentIntentId) async {
    try {
      final response = await _apiClient.get(
        '/payments/$paymentIntentId/status',
      );
      return response.data['data'] ?? {};
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Refund payment
  Future<Map<String, dynamic>> refundPayment({
    required int orderId,
    String? reason,
  }) async {
    try {
      final response = await _apiClient.post(
        '/payments/refund',
        data: {
          'orderId': orderId,
          if (reason != null) 'reason': reason,
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
          'Payment operation failed';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
