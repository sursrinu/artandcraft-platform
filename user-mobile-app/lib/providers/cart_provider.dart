// Cart Provider
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final int id;
  final int productId;
  final String productName;
  final double price;
  int quantity;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  double get total => price * quantity;
}

class CartState {
  final List<CartItem> items;
  final bool isLoading;
  final String? error;

  CartState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  double get subtotal => items.fold(0, (sum, item) => sum + item.total);
  double get tax => subtotal * 0.10; // 10% tax
  double get total => subtotal + tax;

  CartState copyWith({
    List<CartItem>? items,
    bool? isLoading,
    String? error,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(CartState());

  Future<void> addToCart(int productId, String productName, double price) async {
    state = state.copyWith(isLoading: true);
    try {
      // TODO: Call API to add to cart
      // await apiClient.post('/cart/items', data: {...})
      
      final existingItem = state.items.firstWhere(
        (item) => item.productId == productId,
        orElse: () => CartItem(
          id: state.items.length + 1,
          productId: productId,
          productName: productName,
          price: price,
          quantity: 0,
        ),
      );

      if (existingItem.quantity == 0) {
        state = state.copyWith(
          items: [...state.items, existingItem..quantity = 1],
        );
      } else {
        existingItem.quantity++;
        state = state.copyWith(items: [...state.items]);
      }

      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> removeFromCart(int itemId) async {
    state = state.copyWith(
      items: state.items.where((item) => item.id != itemId).toList(),
    );
  }

  void updateQuantity(int itemId, int quantity) {
    final items = state.items;
    final index = items.indexWhere((item) => item.id == itemId);
    if (index != -1) {
      items[index].quantity = quantity;
      state = state.copyWith(items: [...items]);
    }
  }

  void clearCart() {
    state = state.copyWith(items: []);
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>(
  (ref) => CartNotifier(),
);
