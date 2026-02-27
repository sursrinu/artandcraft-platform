import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/order_service.dart';
import '../models/api_models.dart';

final orderServiceProvider = Provider((ref) {
  return OrderService();
});

// Get all orders with pagination and filtering
final ordersProvider = FutureProvider.autoDispose.family<PaginatedResponse<Order>, Map<String, dynamic>>((
  ref,
  params,
) async {
  print('🔵 [OrdersProvider] Called with params: $params');
  
  final orderService = ref.watch(orderServiceProvider);
  final page = params['page'] ?? 1;
  final perPage = params['perPage'] ?? 20;
  final status = params['status'];

  try {
    print('🔵 [OrdersProvider] Calling orderService.getOrders()');
    final result = await orderService.getOrders(
      page: page,
      perPage: perPage,
      status: status,
    );
    print('✅ [OrdersProvider] Got ${result.items.length} orders');
    return result;
  } catch (e) {
    print('❌ [OrdersProvider] Exception: $e');
    rethrow;
  }
});

// Get single order by ID
final orderByIdProvider = FutureProvider.family<dynamic, int>((
  ref,
  orderId,
) async {
  final orderService = ref.watch(orderServiceProvider);
  return await orderService.getOrderById(orderId);
});

// Get order tracking information
final orderTrackingProvider = FutureProvider.family<dynamic, int>((
  ref,
  orderId,
) async {
  final orderService = ref.watch(orderServiceProvider);
  return await orderService.getOrderTracking(orderId);
});

// Create order state notifier
class CreateOrderNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final OrderService _orderService;

  CreateOrderNotifier(this._orderService) : super(const AsyncValue.loading());

  Future<dynamic> createOrder({
    required List<int> cartItems,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _orderService.createOrder(
        cartItems: cartItems,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      // Only update state if notifier hasn't been disposed
      if (mounted) {
        state = AsyncValue.data(result);
      }
      return result; // Return the order for caller to use
    } catch (error, stackTrace) {
      // Only update state if notifier hasn't been disposed
      if (mounted) {
        state = AsyncValue.error(error, stackTrace);
      }
      rethrow; // Rethrow so caller can catch
    }
  }
}

final createOrderProvider =
    StateNotifierProvider.autoDispose<CreateOrderNotifier, AsyncValue<dynamic>>((ref) {
  final orderService = ref.watch(orderServiceProvider);
  return CreateOrderNotifier(orderService);
});

// Cancel order state notifier
class CancelOrderNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final OrderService _orderService;

  CancelOrderNotifier(this._orderService) : super(const AsyncValue.loading());

  Future<void> cancelOrder({
    required int orderId,
    required String reason,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _orderService.cancelOrder(
        orderId: orderId,
        reason: reason,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final cancelOrderProvider =
    StateNotifierProvider.autoDispose<CancelOrderNotifier, AsyncValue<dynamic>>((ref) {
  final orderService = ref.watch(orderServiceProvider);
  return CancelOrderNotifier(orderService);
});

// Request return state notifier
class RequestReturnNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final OrderService _orderService;

  RequestReturnNotifier(this._orderService) : super(const AsyncValue.loading());

  Future<void> requestReturn({
    required int orderId,
    required String reason,
    String? description,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _orderService.requestReturn(
        orderId: orderId,
        reason: reason,
        description: description,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final requestReturnProvider =
    StateNotifierProvider.autoDispose<RequestReturnNotifier, AsyncValue<dynamic>>((ref) {
  final orderService = ref.watch(orderServiceProvider);
  return RequestReturnNotifier(orderService);
});
