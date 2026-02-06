// User Controller
import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const { User, Address, PaymentMethod } = db;

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'userType', 'isActive', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'phone', 'userType', 'isActive', 'createdAt'],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        users: rows,
        totalCount: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'phone', 'userType', 'isActive', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: userType || 'customer',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, userType, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    await user.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(userType && { userType }),
      ...(isActive !== undefined && { isActive }),
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};
// Get user addresses
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message,
    });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const {
      type = 'residential',
      fullName,
      phoneNumber,
      street,
      addressLine2,
      city,
      stateOrProvince,
      zipCode,
      country,
      isDefault = false,
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !street || !city || !stateOrProvince || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // If this is marked as default, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const address = await Address.create({
      userId,
      type,
      fullName,
      phoneNumber,
      street,
      addressLine2,
      city,
      stateOrProvince,
      zipCode,
      country,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  } catch (error) {
    console.error('❌ Error adding address:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.userId);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message,
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { addressId } = req.params;
    const address = await Address.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const {
      type,
      fullName,
      phoneNumber,
      street,
      addressLine2,
      city,
      stateOrProvince,
      zipCode,
      country,
      isDefault,
    } = req.body;

    // If this is marked as default, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    await address.update({
      type: type || address.type,
      fullName: fullName || address.fullName,
      phoneNumber: phoneNumber || address.phoneNumber,
      street: street || address.street,
      addressLine2: addressLine2 || address.addressLine2,
      city: city || address.city,
      stateOrProvince: stateOrProvince || address.stateOrProvince,
      zipCode: zipCode || address.zipCode,
      country: country || address.country,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault,
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message,
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { addressId } = req.params;
    const address = await Address.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    await address.destroy();

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message,
    });
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const paymentMethods = await PaymentMethod.findAll({
      where: { userId, isActive: true },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
      error: error.message,
    });
  }
};

// Add payment method
export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { type, cardToken, cardHolderName, cardExpiry, upiId, bankName, walletProvider, isDefault = false } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Payment method type is required',
      });
    }

    // Validate required fields based on type
    if (type === 'card' && (!cardToken || !cardHolderName || !cardExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Card token, holder name, and expiry are required for card payments',
      });
    }

    if (type === 'upi' && !upiId) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required for UPI payments',
      });
    }

    if (type === 'netbanking' && !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Bank name is required for net banking',
      });
    }

    // If this is marked as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    // Extract last 4 digits from card token if it's a card
    let cardLastFour = null;
    if (type === 'card' && cardToken && cardToken.length >= 4) {
      cardLastFour = cardToken.slice(-4);
    }

    const paymentMethod = await PaymentMethod.create({
      userId,
      type,
      cardToken: type === 'card' ? cardToken : null,
      cardLastFour,
      cardHolderName: type === 'card' ? cardHolderName : null,
      cardExpiry: type === 'card' ? cardExpiry : null,
      upiId: type === 'upi' ? upiId : null,
      bankName: type === 'netbanking' ? bankName : null,
      walletProvider: type === 'wallet' ? walletProvider : null,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod,
    });
  } catch (error) {
    console.error('❌ Error adding payment method:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message,
    });
  }
};

// Update payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { methodId } = req.params;
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: methodId, userId },
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    const { isDefault, isActive } = req.body;

    if (isDefault) {
      await PaymentMethod.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    await paymentMethod.update({
      isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault,
      isActive: isActive !== undefined ? isActive : paymentMethod.isActive,
    });

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: error.message,
    });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { methodId } = req.params;
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: methodId, userId },
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    await paymentMethod.destroy();

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: error.message,
    });
  }
};