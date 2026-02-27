import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/payment_service.dart';
import '../services/api_client.dart';

final apiClientProvider = Provider((ref) => ApiClient());

final paymentServiceProvider = Provider((ref) {
  return PaymentService();
});

// Get user's payment methods
final paymentMethodsProvider = FutureProvider<dynamic>((ref) async {
  final paymentService = ref.watch(paymentServiceProvider);
  return await paymentService.getPaymentMethods();
});

// Get payment status
final paymentStatusProvider = FutureProvider.family<dynamic, String>((
  ref,
  paymentId,
) async {
  final paymentService = ref.watch(paymentServiceProvider);
  return await paymentService.getPaymentStatus(paymentId);
});

// Save payment method state notifier
class SavePaymentMethodNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  SavePaymentMethodNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> savePaymentMethod({
    required String cardNumber,
    required String expiryMonth,
    required String expiryYear,
    required String cvv,
    required String cardholderName,
    bool setAsDefault = false,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.savePaymentMethod(
        cardNumber: cardNumber,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvv: cvv,
        cardholderName: cardholderName,
        setAsDefault: setAsDefault,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final savePaymentMethodProvider =
    StateNotifierProvider.autoDispose<SavePaymentMethodNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return SavePaymentMethodNotifier(paymentService);
});

// Delete payment method state notifier
class DeletePaymentMethodNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  DeletePaymentMethodNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> deletePaymentMethod(String paymentMethodId) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.deletePaymentMethod(paymentMethodId);
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final deletePaymentMethodProvider =
    StateNotifierProvider.autoDispose<DeletePaymentMethodNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return DeletePaymentMethodNotifier(paymentService);
});

// Set default payment method state notifier
class SetDefaultPaymentNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  SetDefaultPaymentNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> setDefault(String paymentMethodId) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.setDefaultPaymentMethod(paymentMethodId);
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final setDefaultPaymentProvider =
    StateNotifierProvider.autoDispose<SetDefaultPaymentNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return SetDefaultPaymentNotifier(paymentService);
});

// Create payment intent state notifier
class CreatePaymentIntentNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  CreatePaymentIntentNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> createPaymentIntent({
    required double amount,
    required String currency,
    String? description,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.createPaymentIntent(
        amount: amount,
        currency: currency,
        description: description,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final createPaymentIntentProvider =
    StateNotifierProvider.autoDispose<CreatePaymentIntentNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return CreatePaymentIntentNotifier(paymentService);
});

// Confirm payment state notifier
class ConfirmPaymentNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  ConfirmPaymentNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> confirmPayment({
    required String paymentIntentId,
    required String paymentMethodId,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.confirmPayment(
        paymentIntentId,
        paymentMethodId,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final confirmPaymentProvider =
    StateNotifierProvider.autoDispose<ConfirmPaymentNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return ConfirmPaymentNotifier(paymentService);
});

// Refund payment state notifier
class RefundPaymentNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final PaymentService _paymentService;

  RefundPaymentNotifier(this._paymentService) : super(const AsyncValue.loading());

  Future<void> refundPayment({
    required String paymentId,
    double? amount,
    String? reason,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.refundPayment(
        paymentId,
        amount: amount,
        reason: reason,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final refundPaymentProvider =
    StateNotifierProvider.autoDispose<RefundPaymentNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return RefundPaymentNotifier(paymentService);
});
