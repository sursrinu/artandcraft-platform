// Review Service - Handles review endpoints
import 'package:dio/dio.dart';
import '../services/api_client.dart';
import '../models/api_models.dart';

class Review {
  final int id;
  final int productId;
  final int userId;
  final String userName;
  final double rating;
  final String title;
  final String content;
  final List<String>? images;
  final int helpful;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    required this.rating,
    required this.title,
    required this.content,
    this.images,
    this.helpful = 0,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      productId: json['productId'] ?? 0,
      userId: json['userId'] ?? 0,
      userName: json['userName'] ?? json['user']?['name'] ?? 'Anonymous',
      rating: (json['rating'] ?? 0).toDouble(),
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      helpful: json['helpful'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'rating': rating,
    'title': title,
    'content': content,
    'images': images,
  };
}

class ReviewService {
  final ApiClient _apiClient = ApiClient();

  // Get product reviews
  Future<PaginatedResponse<Review>> getProductReviews({
    required int productId,
    int page = 1,
    int perPage = 20,
    String? sortBy = 'createdAt',
    String? sortOrder = 'desc',
  }) async {
    try {
      final response = await _apiClient.get(
        '/reviews/products/$productId',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          'sortBy': sortBy,
          'sortOrder': sortOrder,
        },
      );
      
      // Extract the data object which contains 'reviews' and 'pagination'
      final responseData = response.data['data'] ?? {};
      
      // Convert the response to match PaginatedResponse structure
      // The API returns { reviews: [...], pagination: {...} }
      // But PaginatedResponse expects { data: [...], pagination: {...} }
      final transformedData = {
        'data': responseData['reviews'] ?? [],
        'pagination': responseData['pagination'] ?? {},
      };
      
      return PaginatedResponse.fromJson(
        transformedData,
        Review.fromJson,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get user reviews
  Future<PaginatedResponse<Review>> getUserReviews({
    int page = 1,
    int perPage = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/reviews/user/my-reviews',
        queryParameters: {
          'page': page,
          'per_page': perPage,
        },
      );
      return PaginatedResponse.fromJson(
        response.data['data'] ?? {},
        Review.fromJson,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get review by ID
  Future<Review> getReviewById(int reviewId) async {
    try {
      final response = await _apiClient.get('/reviews/$reviewId');
      return Review.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Create review
  Future<Review> createReview({
    required int productId,
    required double rating,
    required String title,
    required String content,
    List<String>? images,
  }) async {
    try {
      final response = await _apiClient.post(
        '/reviews',
        data: {
          'productId': productId,
          'rating': rating,
          'title': title,
          'content': content,
          if (images != null) 'images': images,
        },
      );
      return Review.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Update review
  Future<Review> updateReview({
    required int reviewId,
    double? rating,
    String? title,
    String? content,
    List<String>? images,
  }) async {
    try {
      final response = await _apiClient.put(
        '/reviews/$reviewId',
        data: {
          if (rating != null) 'rating': rating,
          if (title != null) 'title': title,
          if (content != null) 'content': content,
          if (images != null) 'images': images,
        },
      );
      return Review.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Delete review
  Future<void> deleteReview(int reviewId) async {
    try {
      await _apiClient.delete('/reviews/$reviewId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Mark review as helpful
  Future<Map<String, dynamic>> markHelpful(int reviewId) async {
    try {
      final response = await _apiClient.post(
        '/reviews/$reviewId/helpful',
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get review statistics
  Future<Map<String, dynamic>> getReviewStats(int productId) async {
    try {
      final response = await _apiClient.get(
        '/reviews/product/$productId/stats',
      );
      return response.data['data'] ?? {};
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final errorMessage = error.response?.data['message'] ??
          error.response?.data['error']?['message'] ??
          'Review operation failed';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
