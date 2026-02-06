// API Response Model
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final dynamic error;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : null,
      message: json['message'],
      error: json['error'],
    );
  }
}

// Pagination Model
class PaginationMeta {
  final int page;
  final int perPage;
  final int total;
  final int totalPages;

  PaginationMeta({
    required this.page,
    required this.perPage,
    required this.total,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: json['page'] ?? 1,
      perPage: json['perPage'] ?? 20,
      total: json['total'] ?? 0,
      totalPages: json['totalPages'] ?? json['pages'] ?? 0,
    );
  }
}

// Paginated Response
class PaginatedResponse<T> {
  final List<T> items;
  final PaginationMeta pagination;

  PaginatedResponse({
    required this.items,
    required this.pagination,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    // Try different keys: orders (backend), data, items, products
    List<dynamic> itemsList = [];
    if (json['orders'] != null && json['orders'] is List) {
      itemsList = json['orders'];
    } else if (json['data'] != null && json['data'] is List) {
      itemsList = json['data'];
    } else if (json['items'] != null && json['items'] is List) {
      itemsList = json['items'];
    } else if (json['products'] != null && json['products'] is List) {
      itemsList = json['products'];
    }

    final items = (itemsList as List<dynamic>)
        .map((item) => fromJson(item as Map<String, dynamic>))
        .toList();
    
    return PaginatedResponse(
      items: items,
      pagination: PaginationMeta.fromJson(
        json['pagination'] ?? {},
      ),
    );
  }
}
