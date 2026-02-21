// Authentication Service
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../config/jwt.js';
import { sendOtpEmail } from '../utils/email.js';

export class AuthService {
  constructor(db) {
    this.User = db.User;
    this.Vendor = db.Vendor;
    this.Cart = db.Cart;
  }

  // Resend OTP logic
  async resendVerificationCode(email) {
    const user = await this.User.findOne({ where: { email } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }
    if (user.isEmailVerified) {
      throw { statusCode: 400, message: 'Email already verified', code: 'ALREADY_VERIFIED' };
    }
    // Generate new OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min expiry
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
    // Send OTP email
    await sendOtpEmail(email, otp);
    return { message: 'OTP resent to email.' };
  }

  // OTP verification logic
  async verifyEmail(email, code) {
    const user = await this.User.findOne({ where: { email } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }
    if (user.isEmailVerified) {
      throw { statusCode: 400, message: 'Email already verified', code: 'ALREADY_VERIFIED' };
    }
    if (!user.otp || !user.otpExpiresAt || user.otp !== code || user.otpExpiresAt < new Date()) {
      throw { statusCode: 400, message: 'Invalid or expired OTP', code: 'INVALID_OTP' };
    }
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.isActive = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    // Issue tokens after verification
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.userType);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      accessToken,
      refreshToken,
    };
  }

  async register(userData) {
    const { name, email, password, phone, userType } = userData;

    // Check if user already exists
    const existingUser = await this.User.findOne({ where: { email } });
    if (existingUser) {
      throw { statusCode: 409, message: 'Email already registered', code: 'DUPLICATE_EMAIL' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min expiry

    // Create user with OTP fields
    const user = await this.User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      otp,
      otpExpiresAt,
      isEmailVerified: false,
      isActive: false,
    });

    // Create cart for customer
    if (userType === 'customer') {
      await this.Cart.create({ userId: user.id });
    }

    // Send OTP email
    await sendOtpEmail(email, otp);

    // Do not issue tokens until verified
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      message: 'OTP sent to email. Please verify to complete registration.'
    };
  }

  async login(email, password) {

    const user = await this.User.findOne({ where: { email } });
    if (!user) {
      throw { statusCode: 404, message: "User doesn't exist, please register", code: 'USER_NOT_FOUND' };
    }

    if (!user.isActive || !user.isEmailVerified) {
      throw { statusCode: 403, message: 'Account not active or email not verified. Please verify your email to activate your account.', code: 'ACCOUNT_INACTIVE' };
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[DEBUG] bcrypt.compare:', {
      inputPassword: password,
      dbHash: user.password,
      isMatch
    });
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.userType);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.User.findByPk(decoded.userId);

    if (!user) {
      throw { statusCode: 401, message: 'User not found', code: 'UNAUTHORIZED' };
    }

    const { accessToken: newAccessToken } = generateTokens(user.id, user.email, user.userType);
    return { accessToken: newAccessToken };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.User.findByPk(userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Current password is incorrect', code: 'INVALID_PASSWORD' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async getUserProfile(userId) {
    const user = await this.User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: this.Vendor,
          as: 'Vendor',
          attributes: { exclude: ['userId'] },
        },
      ],
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }

    return user;
  }

  async updateUserProfile(userId, updateData) {
    const user = await this.User.findByPk(userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'phone', 'profileImage', 'bio'];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field]) {
        dataToUpdate[field] = updateData[field];
      }
    });

    await user.update(dataToUpdate);
    return user;
  }
}
