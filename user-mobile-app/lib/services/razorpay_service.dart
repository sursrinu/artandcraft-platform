// Razorpay Payment Service
import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:dio/dio.dart';
import './api_client.dart';

/// Configuration for Razorpay
class RazorpayConfig {
  // TODO: Replace with your actual Razorpay Key ID from dashboard
  // Test Key for development - replace with live key for production
  static const String keyId = 'rzp_test_YOUR_KEY_ID';
  
  // Company/App name shown in Razorpay checkout
  static const String companyName = 'Art & Craft Store';
  
  // App description
  static const String description = 'Payment for your order';
  
  // Theme color (hex without #)
  static const int themeColor = 0xFF6200EE;
  
  // Timeout in seconds
  static const int timeout = 180;
}

/// Order details for creating a Razorpay order
class RazorpayOrderDetails {
  final String orderId;        // Your internal order ID
  final String razorpayOrderId; // Razorpay order ID from backend
  final int amountInPaise;     // Amount in smallest currency unit (paise for INR)
  final String currency;
  final String receipt;
  final String? customerName;
  final String? customerEmail;
  final String? customerPhone;

  RazorpayOrderDetails({
    required this.orderId,
    required this.razorpayOrderId,
    required this.amountInPaise,
    this.currency = 'INR',
    required this.receipt,
    this.customerName,
    this.customerEmail,
    this.customerPhone,
  });

  factory RazorpayOrderDetails.fromJson(Map<String, dynamic> json) {
    return RazorpayOrderDetails(
      orderId: json['orderId']?.toString() ?? '',
      razorpayOrderId: json['razorpayOrderId'] ?? json['id'] ?? '',
      amountInPaise: json['amount'] ?? 0,
      currency: json['currency'] ?? 'INR',
      receipt: json['receipt'] ?? '',
      customerName: json['customerName'],
      customerEmail: json['customerEmail'],
      customerPhone: json['customerPhone'],
    );
  }
}

/// Result of a payment attempt
class RazorpayPaymentResult {
  final bool success;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? errorCode;
  final String? errorMessage;

  RazorpayPaymentResult({
    required this.success,
    this.paymentId,
    this.orderId,
    this.signature,
    this.errorCode,
    this.errorMessage,
  });

  factory RazorpayPaymentResult.success({
    required String paymentId,
    required String orderId,
    required String signature,
  }) {
    return RazorpayPaymentResult(
      success: true,
      paymentId: paymentId,
      orderId: orderId,
      signature: signature,
    );
  }

  factory RazorpayPaymentResult.failure({
    required String errorCode,
    required String errorMessage,
  }) {
    return RazorpayPaymentResult(
      success: false,
      errorCode: errorCode,
      errorMessage: errorMessage,
    );
  }
}

/// Service to handle Razorpay payments
class RazorpayService {
  final ApiClient _apiClient = ApiClient();
  Razorpay? _razorpay;
  
  // Callbacks
  Function(RazorpayPaymentResult)? _onPaymentSuccess;
  Function(RazorpayPaymentResult)? _onPaymentError;
  Function()? _onExternalWallet;

  /// Initialize the Razorpay instance
  void init({
    required Function(RazorpayPaymentResult) onSuccess,
    required Function(RazorpayPaymentResult) onError,
    Function()? onExternalWallet,
  }) {
    _razorpay = Razorpay();
    _onPaymentSuccess = onSuccess;
    _onPaymentError = onError;
    _onExternalWallet = onExternalWallet;

    _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  /// Dispose Razorpay instance - call this when done
  void dispose() {
    _razorpay?.clear();
    _razorpay = null;
  }

  /// Create a Razorpay order on the backend
  /// The backend should create a Razorpay order using Razorpay API and return the order details
  Future<RazorpayOrderDetails> createOrder({
    required int orderId,
    required double amount,
    String currency = 'INR',
  }) async {
    try {
      // Convert to paise (smallest currency unit for INR)
      final amountInPaise = (amount * 100).round();
      
      final response = await _apiClient.post(
        '/payments/razorpay/create-order',
        data: {
          'orderId': orderId,
          'amount': amountInPaise,
          'currency': currency,
        },
      );

      final data = response.data['data'] ?? response.data;
      return RazorpayOrderDetails.fromJson({
        ...data,
        'orderId': orderId.toString(),
      });
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Open Razorpay checkout with given order details
  void openCheckout({
    required RazorpayOrderDetails orderDetails,
    String? prefillName,
    String? prefillEmail,
    String? prefillPhone,
  }) {
    if (_razorpay == null) {
      throw Exception('Razorpay not initialized. Call init() first.');
    }

    final options = {
      'key': RazorpayConfig.keyId,
      'amount': orderDetails.amountInPaise,
      'currency': orderDetails.currency,
      'name': RazorpayConfig.companyName,
      'description': RazorpayConfig.description,
      'order_id': orderDetails.razorpayOrderId,
      'timeout': RazorpayConfig.timeout,
      'prefill': {
        'name': prefillName ?? orderDetails.customerName ?? '',
        'email': prefillEmail ?? orderDetails.customerEmail ?? '',
        'contact': prefillPhone ?? orderDetails.customerPhone ?? '',
      },
      'theme': {
        'color': '#${RazorpayConfig.themeColor.toRadixString(16).substring(2)}',
      },
      'retry': {
        'enabled': true,
        'max_count': 3,
      },
      // Enable all payment methods
      'method': {
        'netbanking': true,
        'card': true,
        'upi': true,
        'wallet': true,
      },
    };

    try {
      _razorpay!.open(options);
    } catch (e) {
      debugPrint('Error opening Razorpay checkout: $e');
      rethrow;
    }
  }

  /// Verify payment signature on backend
  Future<bool> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    required int orderId,
  }) async {
    try {
      final response = await _apiClient.post(
        '/payments/razorpay/verify',
        data: {
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_signature': razorpaySignature,
          'order_id': orderId,
        },
      );

      return response.data['success'] == true;
    } on DioException catch (e) {
      debugPrint('Payment verification error: $e');
      return false;
    }
  }

  /// Handle successful payment
  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    debugPrint('✅ Payment Success: ${response.paymentId}');
    
    final result = RazorpayPaymentResult.success(
      paymentId: response.paymentId ?? '',
      orderId: response.orderId ?? '',
      signature: response.signature ?? '',
    );

    _onPaymentSuccess?.call(result);
  }

  /// Handle payment error
  void _handlePaymentError(PaymentFailureResponse response) {
    debugPrint('❌ Payment Error: ${response.code} - ${response.message}');
    
    final result = RazorpayPaymentResult.failure(
      errorCode: response.code.toString(),
      errorMessage: response.message ?? 'Payment failed',
    );

    _onPaymentError?.call(result);
  }

  /// Handle external wallet selection (Paytm, PhonePe, etc.)
  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('📱 External Wallet: ${response.walletName}');
    _onExternalWallet?.call();
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
