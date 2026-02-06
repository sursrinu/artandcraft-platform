// Vendor Service
import bcrypt from 'bcryptjs';

export class VendorService {
  constructor(db) {
    this.Vendor = db.Vendor;
    this.User = db.User;
    this.Product = db.Product;
    this.Order = db.Order;
  }

  async registerVendor(vendorData) {
    const { businessName, email, password, phone, address, taxId } = vendorData;

    // Check if email already exists
    const existingUser = await this.User.findOne({ where: { email } });
    if (existingUser) {
      throw { statusCode: 409, message: 'Email already registered', code: 'DUPLICATE_EMAIL' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.User.create({
      name: businessName,
      email,
      password: hashedPassword,
      phone,
      userType: 'vendor',
    });

    // Create vendor
    const vendor = await this.Vendor.create({
      userId: user.id,
      businessName,
      email,
      phone,
      address,
      taxId,
    });

    return {
      id: vendor.id,
      businessName,
      email,
      status: vendor.status,
      message: 'Vendor registration submitted. Awaiting approval.',
    };
  }

  async getVendors(filters = {}) {
    const { page = 1, perPage = 20, status } = filters;
    const offset = (page - 1) * perPage;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await this.Vendor.findAndCountAll({
      where,
      include: [{ model: this.User, attributes: ['name', 'email', 'phone'] }],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      vendors: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }

  async getVendorById(vendorId) {
    const vendor = await this.Vendor.findByPk(vendorId, {
      include: [
        { model: this.User, attributes: { exclude: ['password'] } },
      ],
    });

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    return vendor;
  }

  async updateVendor(vendorId, updateData) {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    const allowedFields = ['businessName', 'businessDescription', 'address', 'city', 'state', 'zipCode', 'phone'];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    await vendor.update(dataToUpdate);
    return this.getVendorById(vendorId);
  }

  async approveVendor(vendorId) {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    await vendor.update({ status: 'approved', verifiedAt: new Date() });

    // Send notification to vendor
    const user = await this.User.findByPk(vendor.userId);
    if (user) {
      // TODO: Send email notification
    }

    return vendor;
  }

  async rejectVendor(vendorId, reason = '') {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    await vendor.update({ status: 'rejected' });

    // TODO: Send rejection email with reason

    return { message: 'Vendor rejected successfully' };
  }

  async suspendVendor(vendorId, reason = '') {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    await vendor.update({ status: 'suspended' });

    // TODO: Send suspension notification

    return { message: 'Vendor suspended successfully' };
  }

  async getVendorStats(vendorId) {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    const totalProducts = await this.Product.count({ where: { vendorId } });
    const totalOrders = await this.Order.count({ where: { vendorId } });
    const totalRevenue = await this.Order.sum('totalAmount', { where: { vendorId } });

    return {
      vendorId,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue || 0,
      rating: vendor.rating,
      status: vendor.status,
    };
  }

  async updateCommissionRate(vendorId, commissionRate) {
    const vendor = await this.Vendor.findByPk(vendorId);

    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    if (commissionRate < 0 || commissionRate > 100) {
      throw { statusCode: 400, message: 'Invalid commission rate', code: 'INVALID_RATE' };
    }

    await vendor.update({ commissionRate });
    return vendor;
  }
}
