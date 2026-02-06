// Authentication Service
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../config/jwt.js';

export class AuthService {
  constructor(db) {
    this.User = db.User;
    this.Vendor = db.Vendor;
    this.Cart = db.Cart;
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

    // Create user
    const user = await this.User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
    });

    // Create cart for customer
    if (userType === 'customer') {
      await this.Cart.create({ userId: user.id });
    }

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

  async login(email, password) {
    const user = await this.User.findOne({ where: { email } });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
