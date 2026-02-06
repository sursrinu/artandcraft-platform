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
    required String type,
    String? cardToken,
    String? cardHolderName,
    String? cardExpiry,
    String? upiId,
    String? bankName,
    String? walletProvider,
    bool isDefault = false,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _paymentService.savePaymentMethod(
        type: type,
        cardToken: cardToken,
        cardHolderName: cardHolderName,
        cardExpiry: cardExpiry,
        upiId: upiId,
        bankName: bankName,
        walletProvider: walletProvider,
        isDefault: isDefault,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final savePaymentMethodProvider =
    StateNotifierProvider<SavePaymentMethodNotifier, AsyncValue<dynamic>>((ref) {
  final paymentService = ref.watch(paymentServiceProvider);
  return SavePaymentMethodNotifier(paymentService);
});
