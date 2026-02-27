// Vendor Payout Service
import { v4 as uuidv4 } from 'uuid';

export class VendorPayoutService {
  constructor(models) {
    this.models = models;
  }

  /**
   * Calculate payout for a vendor for a specific period
   */
  async calculatePayoutForVendor(vendorId, startDate, endDate) {
    try {
      // Get vendor
      const vendor = await this.models.Vendor.findByPk(vendorId);
      if (!vendor) {
        throw { statusCode: 404, code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' };
      }

      // Get orders for the period
      const orders = await this.models.Order.findAll({
        where: {
          vendorId: vendorId,
          createdAt: {
            [this.models.sequelize.Op.between]: [startDate, endDate],
          },
          status: { [this.models.sequelize.Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] },
        },
        include: ['OrderItems'],
      });

      // Calculate totals
      let totalSales = 0;
      orders.forEach(order => {
        totalSales += parseFloat(order.totalAmount) || 0;
      });

      const commissionAmount = totalSales * (vendor.commissionRate / 100);
      const payoutAmount = totalSales - commissionAmount;

      return {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalOrders: orders.length,
        commissionRate: vendor.commissionRate,
        commissionAmount: parseFloat(commissionAmount.toFixed(2)),
        payoutAmount: parseFloat(payoutAmount.toFixed(2)),
        deductions: 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create payout request
   */
  async createPayout(vendorId, payoutData) {
    try {
      const { startDate, endDate, notes } = payoutData;

      if (!startDate || !endDate) {
        throw {
          statusCode: 400,
          code: 'INVALID_DATES',
          message: 'Start date and end date are required',
        };
      }

      // Check if payout already exists for this period
      const existingPayout = await this.models.VendorPayout.findOne({
        where: {
          vendorId,
          period: this._generatePeriodString(startDate, endDate),
          status: { [this.models.sequelize.Op.notIn]: ['cancelled'] },
        },
      });

      if (existingPayout) {
        throw {
          statusCode: 409,
          code: 'PAYOUT_EXISTS',
          message: 'Payout already exists for this period',
        };
      }

      // Calculate payout
      const calculation = await this.calculatePayoutForVendor(
        vendorId,
        new Date(startDate),
        new Date(endDate)
      );

      // Get vendor's active bank account
      const bankAccount = await this.models.VendorBankAccount.findOne({
        where: {
          vendorId,
          isActive: true,
          isVerified: true,
        },
      });

      if (!bankAccount) {
        throw {
          statusCode: 400,
          code: 'NO_BANK_ACCOUNT',
          message: 'No verified bank account found for vendor',
        };
      }

      // Create payout
      const payout = await this.models.VendorPayout.create({
        vendorId,
        payoutNumber: `PAY-${uuidv4().substring(0, 8)}`,
        amount: calculation.payoutAmount,
        period: this._generatePeriodString(startDate, endDate),
        startDate,
        endDate,
        totalSales: calculation.totalSales,
        totalOrders: calculation.totalOrders,
        commissionRate: calculation.commissionRate,
        commissionAmount: calculation.commissionAmount,
        deductions: 0,
        bankAccountId: bankAccount.id,
        status: 'pending',
        notes,
      });

      return payout;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get vendor payouts with pagination
   */
  async getVendorPayouts(vendorId, options = {}) {
    try {
      const { page = 1, perPage = 20, status } = options;
      const offset = (page - 1) * perPage;

      const where = { vendorId };
      if (status) where.status = status;

      const { count, rows } = await this.models.VendorPayout.findAndCountAll({
        where,
        include: ['Vendor', 'VendorBankAccount'],
        order: [['createdAt', 'DESC']],
        limit: perPage,
        offset,
      });

      return {
        items: rows,
        pagination: {
          page,
          perPage,
          total: count,
          pages: Math.ceil(count / perPage),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all payouts (admin)
   */
  async getAllPayouts(options = {}) {
    try {
      const { page = 1, perPage = 20, status, vendorId } = options;
      const offset = (page - 1) * perPage;

      const where = {};
      if (status) where.status = status;
      if (vendorId) where.vendorId = vendorId;

      const { count, rows } = await this.models.VendorPayout.findAndCountAll({
        where,
        include: ['Vendor', 'VendorBankAccount'],
        order: [['createdAt', 'DESC']],
        limit: perPage,
        offset,
      });

      return {
        items: rows,
        pagination: {
          page,
          perPage,
          total: count,
          pages: Math.ceil(count / perPage),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payout details
   */
  async getPayoutById(payoutId) {
    try {
      const payout = await this.models.VendorPayout.findByPk(payoutId, {
        include: ['Vendor', 'VendorBankAccount'],
      });

      if (!payout) {
        throw {
          statusCode: 404,
          code: 'PAYOUT_NOT_FOUND',
          message: 'Payout not found',
        };
      }

      return payout;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update payout status
   */
  async updatePayoutStatus(payoutId, newStatus, adminId, additionalData = {}) {
    try {
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw {
          statusCode: 400,
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        };
      }

      const payout = await this.models.VendorPayout.findByPk(payoutId);
      if (!payout) {
        throw {
          statusCode: 404,
          code: 'PAYOUT_NOT_FOUND',
          message: 'Payout not found',
        };
      }

      // Update payout
      const updateData = {
        status: newStatus,
        processedBy: adminId,
      };

      if (newStatus === 'completed') {
        updateData.processedAt = new Date();
        updateData.transactionId = additionalData.transactionId || null;
      }

      if (newStatus === 'failed') {
        updateData.failureReason = additionalData.failureReason || 'Payment failed';
      }

      const updated = await payout.update(updateData);

      // Create notification for vendor
      await this.models.Notification.create({
        userId: payout.Vendor.userId,
        type: `payout_${newStatus}`,
        title: `Payout ${newStatus}`,
        message: `Your payout ${payout.payoutNumber} has been ${newStatus}`,
        relatedId: payoutId,
        relatedType: 'VendorPayout',
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add deductions to payout
   */
  async addDeductions(payoutId, amount, reason) {
    try {
      const payout = await this.models.VendorPayout.findByPk(payoutId);
      if (!payout) {
        throw {
          statusCode: 404,
          code: 'PAYOUT_NOT_FOUND',
          message: 'Payout not found',
        };
      }

      if (payout.status !== 'pending') {
        throw {
          statusCode: 400,
          code: 'INVALID_STATUS',
          message: 'Can only add deductions to pending payouts',
        };
      }

      const newDeductions = parseFloat(payout.deductions) + parseFloat(amount);
      const newAmount = payout.totalSales - payout.commissionAmount - newDeductions;

      if (newAmount < 0) {
        throw {
          statusCode: 400,
          code: 'INVALID_DEDUCTION',
          message: 'Deduction would result in negative payout amount',
        };
      }

      const reasons = payout.deductionReasons ? `${payout.deductionReasons}\n${reason}` : reason;

      const updated = await payout.update({
        deductions: newDeductions,
        amount: newAmount,
        deductionReasons: reasons,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel payout
   */
  async cancelPayout(payoutId, reason) {
    try {
      const payout = await this.models.VendorPayout.findByPk(payoutId);
      if (!payout) {
        throw {
          statusCode: 404,
          code: 'PAYOUT_NOT_FOUND',
          message: 'Payout not found',
        };
      }

      if (['completed', 'processing'].includes(payout.status)) {
        throw {
          statusCode: 400,
          code: 'CANNOT_CANCEL',
          message: `Cannot cancel a ${payout.status} payout`,
        };
      }

      const updated = await payout.update({
        status: 'cancelled',
        failureReason: reason,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payout statistics for vendor
   */
  async getPayoutStats(vendorId) {
    try {
      const vendor = await this.models.Vendor.findByPk(vendorId);
      if (!vendor) {
        throw {
          statusCode: 404,
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        };
      }

      const payouts = await this.models.VendorPayout.findAll({
        where: { vendorId },
      });

      const stats = {
        totalPayouts: payouts.length,
        totalPaidOut: 0,
        totalPending: 0,
        totalProcessing: 0,
        averagePayoutAmount: 0,
        lastPayoutDate: null,
      };

      payouts.forEach(payout => {
        if (payout.status === 'completed') {
          stats.totalPaidOut += parseFloat(payout.amount);
        } else if (payout.status === 'pending') {
          stats.totalPending += parseFloat(payout.amount);
        } else if (payout.status === 'processing') {
          stats.totalProcessing += parseFloat(payout.amount);
        }

        if (!stats.lastPayoutDate || payout.processedAt > stats.lastPayoutDate) {
          stats.lastPayoutDate = payout.processedAt;
        }
      });

      if (payouts.length > 0) {
        const completedPayouts = payouts.filter(p => p.status === 'completed');
        if (completedPayouts.length > 0) {
          stats.averagePayoutAmount =
            stats.totalPaidOut / completedPayouts.length;
        }
      }

      return {
        ...stats,
        totalPaidOut: parseFloat(stats.totalPaidOut.toFixed(2)),
        totalPending: parseFloat(stats.totalPending.toFixed(2)),
        totalProcessing: parseFloat(stats.totalProcessing.toFixed(2)),
        averagePayoutAmount: parseFloat(stats.averagePayoutAmount.toFixed(2)),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Generate period string (e.g., "2024-01")
   */
  _generatePeriodString(startDate, endDate) {
    const start = new Date(startDate);
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
