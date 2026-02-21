// Resend OTP controller
export const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationCode(email);
    res.status(200).json({
      success: true,
      message: 'OTP resent. Please check your email.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
// OTP verification endpoint
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmail(email, code);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
// Auth controller with full implementation
import { AuthService } from '../services/authService.js';

let authService;

export const initAuthController = (db) => {
  authService = new AuthService(db);
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, userType } = req.body;
    console.log('[REGISTER] Incoming:', { name, email, phone, userType });
    const result = await authService.register({
      name,
      email,
      password,
      phone,
      userType: userType || 'customer',
    });
    console.log('[REGISTER] Success:', result);
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Refresh token is required',
      });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Token invalidation handled on client side
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await authService.getUserProfile(userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, phone, bio, profileImage } = req.body;
    
    const result = await authService.updateUserProfile(userId, {
      name,
      phone,
      bio,
      profileImage,
    });
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
