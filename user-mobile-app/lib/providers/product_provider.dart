// Product Provider
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/product_service.dart';
import '../models/api_models.dart';

final productServiceProvider = Provider((ref) => ProductService());

// Get all products
final productsProvider = FutureProvider.family<
    PaginatedResponse<Product>,
    ({int page, int perPage, String? search, int? categoryId})>(
  (ref, params) async {
    final service = ref.watch(productServiceProvider);
    return service.getProducts(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      categoryId: params.categoryId,
    );
  },
);

// Get product by ID
final productByIdProvider = FutureProvider.family<Product, int>(
  (ref, productId) async {
    final service = ref.watch(productServiceProvider);
    return service.getProductById(productId);
  },
);

// Search products
final searchProductsProvider =
    FutureProvider.family<PaginatedResponse<Product>, String>(
  (ref, query) async {
    final service = ref.watch(productServiceProvider);
    return service.searchProducts(query: query);
  },
);

// Get featured products
final featuredProductsProvider = FutureProvider<List<Product>>(
  (ref) async {
    final service = ref.watch(productServiceProvider);
    return service.getFeaturedProducts();
  },
);

// Get products by category
final productsByCategoryProvider =
    FutureProvider.family<PaginatedResponse<Product>, int>(
  (ref, categoryId) async {
    final service = ref.watch(productServiceProvider);
    return service.getProductsByCategory(categoryId: categoryId);
  },
);

// Get similar products
final similarProductsProvider = FutureProvider.family<List<Product>, int>(
  (ref, productId) async {
    final service = ref.watch(productServiceProvider);
    return service.getSimilarProducts(productId);
  },
);
