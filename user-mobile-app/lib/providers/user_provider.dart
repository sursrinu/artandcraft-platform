import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/user_service.dart';
import '../services/api_client.dart';
import './auth_provider.dart';

final userServiceProvider = Provider((ref) {
  return UserProfileService();
});

// Get user profile - only fetch if authenticated
final userProfileProvider = FutureProvider<dynamic>((ref) async {
  final authState = ref.watch(authProvider);
  
  // Only fetch profile if user is authenticated
  if (!authState.isAuthenticated) {
    return null;
  }
  
  final userService = ref.watch(userServiceProvider);
  return await userService.getProfile();
});

// Get user addresses - only fetch if authenticated
final userAddressesProvider = FutureProvider<dynamic>((ref) async {
  final authState = ref.watch(authProvider);
  
  // Only fetch addresses if user is authenticated
  if (!authState.isAuthenticated) {
    return [];
  }
  
  final userService = ref.watch(userServiceProvider);
  return await userService.getAddresses();
});

// Get user wishlist - only fetch if authenticated
final userWishlistProvider = FutureProvider<dynamic>((ref) async {
  final authState = ref.watch(authProvider);
  
  // Only fetch wishlist if user is authenticated
  if (!authState.isAuthenticated) {
    return [];
  }
  
  final userService = ref.watch(userServiceProvider);
  return await userService.getWishlist();
});

// Update profile state notifier
class UpdateProfileNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;
  final Ref _ref;

  UpdateProfileNotifier(this._userService, this._ref) : super(const AsyncValue.data(null));

  Future<void> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? bio,
    String? avatar,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _userService.updateProfile(
        name: name,
        email: email,
        phone: phone,
        bio: bio,
        avatar: avatar,
      );
      state = AsyncValue.data(result);
      // Invalidate the profile cache to refetch latest data
      _ref.invalidate(userProfileProvider);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final updateProfileProvider =
    StateNotifierProvider.autoDispose<UpdateProfileNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return UpdateProfileNotifier(userService, ref);
});

// Change password state notifier
class ChangePasswordNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;

  ChangePasswordNotifier(this._userService) : super(const AsyncValue.data(null));

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _userService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      state = AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final changePasswordProvider =
    StateNotifierProvider.autoDispose<ChangePasswordNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return ChangePasswordNotifier(userService);
});

// Add address state notifier
class AddAddressNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;
  final Ref _ref;

  AddAddressNotifier(this._userService, this._ref) : super(const AsyncValue.data(null));

  Future<void> addAddress({
    required String type,
    required String fullName,
    required String phoneNumber,
    required String street,
    required String city,
    required String stateOrProvince,
    required String zipCode,
    required String country,
    bool isDefault = false,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _userService.addAddress(
        type: type,
        fullName: fullName,
        phoneNumber: phoneNumber,
        street: street,
        city: city,
        state: stateOrProvince,
        zipCode: zipCode,
        country: country,
        isDefault: isDefault,
      );
      state = AsyncValue.data(result);
      // Invalidate addresses cache to refetch
      _ref.invalidate(userAddressesProvider);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final addAddressProvider =
    StateNotifierProvider<AddAddressNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return AddAddressNotifier(userService, ref);
});

// Update address state notifier
class UpdateAddressNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;
  final Ref _ref;

  UpdateAddressNotifier(this._userService, this._ref) : super(const AsyncValue.data(null));

  Future<void> updateAddress({
    required int addressId,
    String? type,
    String? fullName,
    String? phoneNumber,
    String? street,
    String? city,
    String? stateOrProvince,
    String? zipCode,
    String? country,
    bool? isDefault,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _userService.updateAddress(
        addressId: addressId,
        type: type,
        fullName: fullName,
        phoneNumber: phoneNumber,
        street: street,
        city: city,
        state: stateOrProvince,
        zipCode: zipCode,
        country: country,
        isDefault: isDefault,
      );
      state = AsyncValue.data(result);
      // Invalidate addresses cache to refetch
      _ref.invalidate(userAddressesProvider);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final updateAddressProvider =
    StateNotifierProvider.autoDispose<UpdateAddressNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return UpdateAddressNotifier(userService, ref);
});

// Delete address state notifier
class DeleteAddressNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;
  final Ref _ref;

  DeleteAddressNotifier(this._userService, this._ref) : super(const AsyncValue.data(null));

  Future<void> deleteAddress(int addressId) async {
    state = const AsyncValue.loading();
    try {
      await _userService.deleteAddress(addressId);
      state = AsyncValue.data(null);
      // Invalidate addresses cache to refetch
      _ref.invalidate(userAddressesProvider);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final deleteAddressProvider =
    StateNotifierProvider.autoDispose<DeleteAddressNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return DeleteAddressNotifier(userService, ref);
});

// Add to wishlist state notifier
class AddToWishlistNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;

  AddToWishlistNotifier(this._userService) : super(const AsyncValue.loading());

  Future<void> addToWishlist(int productId) async {
    state = const AsyncValue.loading();
    try {
      await _userService.addToWishlist(productId);
      state = AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final addToWishlistProvider =
    StateNotifierProvider.autoDispose<AddToWishlistNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return AddToWishlistNotifier(userService);
});

// Remove from wishlist state notifier
class RemoveFromWishlistNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;

  RemoveFromWishlistNotifier(this._userService) : super(const AsyncValue.loading());

  Future<void> removeFromWishlist(int productId) async {
    state = const AsyncValue.loading();
    try {
      await _userService.removeFromWishlist(productId);
      state = AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final removeFromWishlistProvider =
    StateNotifierProvider.autoDispose<RemoveFromWishlistNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return RemoveFromWishlistNotifier(userService);
});

// Deactivate account state notifier
class DeactivateAccountNotifier extends StateNotifier<AsyncValue<dynamic>> {
  final UserProfileService _userService;

  DeactivateAccountNotifier(this._userService) : super(const AsyncValue.loading());

  Future<void> deactivateAccount({
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _userService.deactivateAccount(
        password: password,
      );
      state = AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final deactivateAccountProvider =
    StateNotifierProvider.autoDispose<DeactivateAccountNotifier, AsyncValue<dynamic>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return DeactivateAccountNotifier(userService);
});
