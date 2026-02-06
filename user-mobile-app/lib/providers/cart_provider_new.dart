// Cart Provider
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/cart_service.dart';

final cartServiceProvider = Provider((ref) => CartService());

// Get cart
final cartProvider = FutureProvider<Cart>(
  (ref) async {
    final service = ref.watch(cartServiceProvider);
    return service.getCart();
  },
);

// Add to cart
final addToCartProvider =
    FutureProvider.family<Cart, (int productId, int quantity)>(
  (ref, params) async {
    final service = ref.watch(cartServiceProvider);
    return await service.addToCart(
      productId: params.$1,
      quantity: params.$2,
    );
  },
);

// Update cart item
final updateCartItemProvider =
    FutureProvider.family<Cart, (int itemId, int quantity)>(
  (ref, params) async {
    final service = ref.watch(cartServiceProvider);
    return await service.updateCartItem(
      itemId: params.$1,
      quantity: params.$2,
    );
  },
);

// Remove from cart
final removeFromCartProvider = FutureProvider.family<Cart, int>(
  (ref, itemId) async {
    final service = ref.watch(cartServiceProvider);
    return await service.removeFromCart(itemId);
  },
);

// Apply coupon
final applyCouponProvider = FutureProvider.family<Cart, String>(
  (ref, couponCode) async {
    final service = ref.watch(cartServiceProvider);
    return service.applyCoupon(couponCode);
  },
);
