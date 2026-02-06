import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/review_service.dart';
import '../services/api_client.dart';

final reviewServiceProvider = Provider((ref) {
  return ReviewService();
});

// Get reviews for a product
final productReviewsProvider = FutureProvider.family<dynamic, Map<String, dynamic>>((
  ref,
  params,
) async {
  final reviewService = ref.watch(reviewServiceProvider);
  final productId = params['productId'] as int;
  final page = params['page'] ?? 1;
  final perPage = params['perPage'] ?? 10;
  final rating = params['rating'];

  return await reviewService.getProductReviews(
    productId: productId,
    page: page,
    perPage: perPage,
  );
});

// Get current user's reviews
final userReviewsProvider = FutureProvider.family<dynamic, Map<String, dynamic>>((
  ref,
  params,
) async {
  final reviewService = ref.watch(reviewServiceProvider);
  final page = params['page'] ?? 1;
  final perPage = params['perPage'] ?? 10;

  return await reviewService.getUserReviews(page: page, perPage: perPage);
});

// Get single review
final reviewByIdProvider = FutureProvider.family<dynamic, int>((
  ref,
  reviewId,
) async {
  final reviewService = ref.watch(reviewServiceProvider);
  return await reviewService.getReviewById(reviewId);
});

// Get review statistics for a product
final reviewStatsProvider = FutureProvider.family<dynamic, int>((
  ref,
  productId,
) async {
  final reviewService = ref.watch(reviewServiceProvider);
  return await reviewService.getReviewStats(productId);
});

// Create review state notifier
class CreateReviewNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final ReviewService _reviewService;

  CreateReviewNotifier(this._reviewService) : super(const AsyncValue.loading());

  Future<void> createReview({
    required int productId,
    required double rating,
    required String title,
    required String content,
    List<String>? images,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _reviewService.createReview(
        productId: productId,
        rating: rating,
        title: title,
        content: content,
        images: images,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final createReviewProvider =
    StateNotifierProvider.autoDispose<CreateReviewNotifier, AsyncValue<dynamic>>((ref) {
  final reviewService = ref.watch(reviewServiceProvider);
  return CreateReviewNotifier(reviewService);
});

// Update review state notifier
class UpdateReviewNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final ReviewService _reviewService;

  UpdateReviewNotifier(this._reviewService) : super(const AsyncValue.loading());

  Future<void> updateReview({
    required int reviewId,
    double? rating,
    String? title,
    String? content,
    List<String>? images,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _reviewService.updateReview(
        reviewId: reviewId,
        rating: rating,
        title: title,
        content: content,
        images: images,
      );
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final updateReviewProvider =
    StateNotifierProvider.autoDispose<UpdateReviewNotifier, AsyncValue<dynamic>>((ref) {
  final reviewService = ref.watch(reviewServiceProvider);
  return UpdateReviewNotifier(reviewService);
});

// Delete review state notifier
class DeleteReviewNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final ReviewService _reviewService;

  DeleteReviewNotifier(this._reviewService) : super(const AsyncValue.loading());

  Future<void> deleteReview(int reviewId) async {
    state = const AsyncValue.loading();
    try {
      await _reviewService.deleteReview(reviewId);
      state = AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final deleteReviewProvider =
    StateNotifierProvider.autoDispose<DeleteReviewNotifier, AsyncValue<dynamic>>((ref) {
  final reviewService = ref.watch(reviewServiceProvider);
  return DeleteReviewNotifier(reviewService);
});

// Mark review as helpful state notifier
class MarkHelpfulNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final ReviewService _reviewService;

  MarkHelpfulNotifier(this._reviewService) : super(const AsyncValue.loading());

  Future<void> markHelpful(int reviewId) async {
    state = const AsyncValue.loading();
    try {
      final result = await _reviewService.markHelpful(reviewId);
      state = AsyncValue.data(result);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final markHelpfulProvider =
    StateNotifierProvider.autoDispose<MarkHelpfulNotifier, AsyncValue<dynamic>>((ref) {
  final reviewService = ref.watch(reviewServiceProvider);
  return MarkHelpfulNotifier(reviewService);
});
