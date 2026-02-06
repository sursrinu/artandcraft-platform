// User Profile Service - Handles user profile endpoints
import 'package:dio/dio.dart';
import '../services/api_client.dart';

class UserProfile {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String? bio;
  final String status;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.bio,
    this.status = 'active',
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatar: json['avatar'],
      bio: json['bio'],
      status: json['status'] ?? 'active',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'phone': phone,
    'avatar': avatar,
    'bio': bio,
  };
}

class Address {
  final int id;
  final String type; // 'home', 'office', 'other'
  final String fullName;
  final String phoneNumber;
  final String street;
  final String city;
  final String state;
  final String zipCode;
  final String country;
  final bool isDefault;

  Address({
    required this.id,
    required this.type,
    required this.fullName,
    required this.phoneNumber,
    required this.street,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] ?? 0,
      type: json['type'] ?? 'home',
      fullName: json['fullName'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      // Map stateOrProvince from backend to state in Flutter
      state: json['state'] ?? json['stateOrProvince'] ?? '',
      // Map zipCode from backend to zipCode in Flutter
      zipCode: json['zipCode'] ?? json['zip'] ?? '',
      country: json['country'] ?? '',
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'fullName': fullName,
    'phoneNumber': phoneNumber,
    'street': street,
    'city': city,
    'state': state,
    'zipCode': zipCode,
    'country': country,
    'isDefault': isDefault,
  };
}

class UserProfileService {
  final ApiClient _apiClient = ApiClient();

  // Get user profile
  Future<UserProfile> getProfile() async {
    try {
      final response = await _apiClient.get('/users/profile');
      
      // Check if response is successful
      if (response.statusCode != 200) {
        String errorMsg = 'Failed to fetch profile';
        if (response.data != null) {
          errorMsg = response.data['message'] ?? response.data['error'] ?? errorMsg;
        }
        if (response.statusCode == 401) {
          errorMsg = 'Not authenticated. Please login again.';
        }
        throw errorMsg;
      }
      
      return UserProfile.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Update user profile
  Future<UserProfile> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? bio,
    String? avatar,
  }) async {
    try {
      final response = await _apiClient.put(
        '/users/profile',
        data: {
          if (name != null) 'name': name,
          if (email != null) 'email': email,
          if (phone != null) 'phone': phone,
          if (bio != null) 'bio': bio,
          if (avatar != null) 'avatar': avatar,
        },
      );
      return UserProfile.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Change password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _apiClient.post(
        '/users/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get addresses
  Future<List<Address>> getAddresses() async {
    try {
      final response = await _apiClient.get('/users/addresses');
      
      // Check if response is successful
      if (response.statusCode != 200) {
        final errorMessage = response.data['message'] ?? 'Failed to fetch addresses';
        throw errorMessage;
      }
      
      final List<dynamic> items = response.data['data'] ?? [];
      return items
          .map((item) => Address.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Add address
  Future<Address> addAddress({
    required String type,
    required String fullName,
    required String phoneNumber,
    required String street,
    required String city,
    required String state,
    required String zipCode,
    required String country,
    bool isDefault = false,
  }) async {
    try {
      final response = await _apiClient.post(
        '/users/addresses',
        data: {
          'type': type,
          'fullName': fullName,
          'phoneNumber': phoneNumber,
          'street': street,
          'city': city,
          'stateOrProvince': state,
          'zipCode': zipCode,
          'country': country,
          'isDefault': isDefault,
        },
      );
      return Address.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Update address
  Future<Address> updateAddress({
    required int addressId,
    String? type,
    String? fullName,
    String? phoneNumber,
    String? street,
    String? city,
    String? state,
    String? zipCode,
    String? country,
    bool? isDefault,
  }) async {
    try {
      final response = await _apiClient.put(
        '/users/addresses/$addressId',
        data: {
          if (type != null) 'type': type,
          if (fullName != null) 'fullName': fullName,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
          if (street != null) 'street': street,
          if (city != null) 'city': city,
          if (state != null) 'state': state,
          if (zipCode != null) 'zipCode': zipCode,
          if (country != null) 'country': country,
          if (isDefault != null) 'isDefault': isDefault,
        },
      );
      return Address.fromJson(response.data['data'] ?? {});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Delete address
  Future<void> deleteAddress(int addressId) async {
    try {
      await _apiClient.delete('/users/addresses/$addressId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get wishlist
  Future<List<int>> getWishlist() async {
    try {
      final response = await _apiClient.get('/users/wishlist');
      final List<dynamic> items = response.data['data'] ?? [];
      return items.map((item) => item as int).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Add to wishlist
  Future<void> addToWishlist(int productId) async {
    try {
      await _apiClient.post(
        '/users/wishlist',
        data: {'productId': productId},
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Remove from wishlist
  Future<void> removeFromWishlist(int productId) async {
    try {
      await _apiClient.delete('/users/wishlist/$productId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Deactivate account
  Future<void> deactivateAccount({
    required String password,
  }) async {
    try {
      await _apiClient.post(
        '/users/deactivate',
        data: {'password': password},
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final errorMessage = error.response?.data['message'] ??
          error.response?.data['error']?['message'] ??
          'Profile operation failed';
      return errorMessage;
    }
    return 'Network error. Please try again.';
  }
}
