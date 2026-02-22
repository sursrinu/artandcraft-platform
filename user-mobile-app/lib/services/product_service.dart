// Product Service - Handles product endpoints
import 'package:dio/dio.dart';
import '../services/api_client.dart';
import '../models/api_models.dart';

class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final String? image;
  final List<String> images;
  final int categoryId;
  final int vendorId;
  final int stock;
  final double? rating;
  final int? reviewCount;
  final String status;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.image,
    this.images = const [],
    required this.categoryId,
    required this.vendorId,
    required this.stock,
    this.rating,
    this.reviewCount,
    this.status = 'active',
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Parse price - it comes as a string from the API
    double price = 0.0;
    final priceValue = json['price'];
    if (priceValue != null) {
      if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else if (priceValue is num) {
        price = priceValue.toDouble();
      }
    }
    
    // Parse rating - it comes as a string from the API
    double? rating;
    final ratingValue = json['rating'];
    if (ratingValue != null) {
      if (ratingValue is String) {
        rating = double.tryParse(ratingValue);
      } else if (ratingValue is num) {
        rating = ratingValue.toDouble();
      }
    }
    
    // Parse ProductImages array
    List<String> images = [];
    final productImages = json['ProductImages'];
    final String baseUrl = 'https://artandcraft-platform-production.up.railway.app'; // Update with your actual base URL
    if (productImages is List && productImages.isNotEmpty) {
      images = productImages
          .where((img) => img != null && img['imageUrl'] != null)
          //.map((img) => img['imageUrl'].toString())
          .map((img) => '$baseUrl${img['imageUrl']}') // Prepend base URL
          .toList();
    }
    
    // Use first image from ProductImages if available, otherwise use image field
    String? mainImage = json['image'];
    if (images.isNotEmpty && mainImage == null) {
      mainImage = images.first;
    }
    
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: price,
      image: mainImage,
      images: images,
      categoryId: json['categoryId'] ?? 0,
      vendorId: json['vendorId'] ?? 0,
      stock: json['stock'] ?? 0,
      rating: rating,
      reviewCount: json['reviewCount'],
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'price': price,
    'image': image,
    'images': images,
    'categoryId': categoryId,
    'vendorId': vendorId,
    'stock': stock,
    'rating': rating,
    'reviewCount': reviewCount,
    'status': status,
  };
}

class ProductService {
  final ApiClient _apiClient = ApiClient();

  // Get all products
  Future<PaginatedResponse<Product>> getProducts({
    int page = 1,
    int perPage = 20,
    String? search,
    int? categoryId,
    String? sortBy = 'createdAt',
    String? sortOrder = 'desc',
  }) async {
    try {
      final response = await _apiClient.get(
        '/products',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (search != null) 'search': search,
          if (categoryId != null) 'categoryId': categoryId,
          'sortBy': sortBy,
          'sortOrder': sortOrder,
        },
      );
      return PaginatedResponse.fromJson(
        response.data['data'] ?? {},
        Product.fromJson,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get product by ID
  Future<Product> getProductById(int productId) async {
    try {
      final response = await _apiClient.get('/products/$productId');
      return Product.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Search products
  Future<PaginatedResponse<Product>> searchProducts({
    required String query,
    int page = 1,
    int perPage = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/products',
        queryParameters: {
          'search': query,
          'page': page,
          'per_page': perPage,
        },
      );
      return PaginatedResponse.fromJson(
        response.data['data'] ?? {},
        Product.fromJson,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get products by category
  Future<PaginatedResponse<Product>> getProductsByCategory({
    required int categoryId,
    int page = 1,
    int perPage = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/products',
        queryParameters: {
          'categoryId': categoryId,
          'page': page,
          'per_page': perPage,
        },
      );
      return PaginatedResponse.fromJson(
        response.data['data'] ?? {},
        Product.fromJson,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get featured products
  Future<List<Product>> getFeaturedProducts() async {
    try {
      final response = await _apiClient.get('/products?featured=true');
      final responseData = response.data['data'] ?? response.data ?? [];
      
      List<dynamic> items = [];
      if (responseData is List) {
        items = responseData;
      } else if (responseData is Map) {
        // Handle { products: [...], pagination: {...} }
        if (responseData['products'] is List) {
          items = responseData['products'];
        } else if (responseData['items'] is List) {
          items = responseData['items'];
        }
      }
      
      return items
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get similar products
  Future<List<Product>> getSimilarProducts(int productId) async {
    try {
      final response = await _apiClient.get('/products/$productId/similar');
      final responseData = response.data['data'] ?? response.data;
      
      List<dynamic> items = [];
      if (responseData is List) {
        items = responseData;
      } else if (responseData is Map) {
        // Handle paginated response with 'items' key
        items = responseData['items'] ?? [];
      }
      
      return items
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final errorMessage = error.response?.data['message'] ??
          error.response?.data['error']?['message'] ??
          'Failed to load products';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
