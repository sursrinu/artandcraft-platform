import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/cart_service.dart';

// Cart Provider
final cartServiceProvider = Provider((ref) => CartService());

// Get cart
final cartProvider = FutureProvider<Cart>(
  (ref) async {
    final service = ref.watch(cartServiceProvider);
    try {
      final cart = await service.getCart();
      debugPrint('[cartProvider] Cart fetched: ${cart.toString()}');
      return cart;
    } catch (e) {
      debugPrint('[cartProvider] Error fetching cart: $e');
      rethrow;
    }
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
