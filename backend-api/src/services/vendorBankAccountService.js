// Vendor Bank Account Service
export class VendorBankAccountService {
  constructor(models) {
    this.models = models;
  }

  /**
   * Add bank account for vendor
   */
  async addBankAccount(vendorId, accountData) {
    try {
      const vendor = await this.models.Vendor.findByPk(vendorId);
      if (!vendor) {
        throw {
          statusCode: 404,
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        };
      }

      // Check if account already exists
      const existingAccount = await this.models.VendorBankAccount.findOne({
        where: {
          vendorId,
          accountNumber: accountData.accountNumber,
        },
      });

      if (existingAccount) {
        throw {
          statusCode: 409,
          code: 'ACCOUNT_EXISTS',
          message: 'Bank account already exists for this vendor',
        };
      }

      const bankAccount = await this.models.VendorBankAccount.create({
        vendorId,
        ...accountData,
      });

      return bankAccount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get vendor bank accounts
   */
  async getVendorBankAccounts(vendorId) {
    try {
      const accounts = await this.models.VendorBankAccount.findAll({
        where: { vendorId },
        order: [['createdAt', 'DESC']],
      });

      return accounts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get bank account by ID
   */
  async getBankAccountById(accountId, vendorId) {
    try {
      const account = await this.models.VendorBankAccount.findOne({
        where: {
          id: accountId,
          vendorId,
        },
      });

      if (!account) {
        throw {
          statusCode: 404,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
        };
      }

      return account;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update bank account
   */
  async updateBankAccount(accountId, vendorId, updateData) {
    try {
      const account = await this.getBankAccountById(accountId, vendorId);

      const updated = await account.update(updateData);

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify bank account (admin only)
   */
  async verifyBankAccount(accountId) {
    try {
      const account = await this.models.VendorBankAccount.findByPk(accountId);
      if (!account) {
        throw {
          statusCode: 404,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
        };
      }

      const updated = await account.update({
        isVerified: true,
        verificationDate: new Date(),
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate bank account
   */
  async deactivateBankAccount(accountId, vendorId) {
    try {
      const account = await this.getBankAccountById(accountId, vendorId);

      const updated = await account.update({
        isActive: false,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set bank account as primary
   */
  async setPrimaryBankAccount(accountId, vendorId) {
    try {
      // Deactivate all other accounts for this vendor
      await this.models.VendorBankAccount.update(
        { isActive: false },
        { where: { vendorId } }
      );

      // Activate the selected account
      const account = await this.getBankAccountById(accountId, vendorId);
      const updated = await account.update({
        isActive: true,
        isVerified: account.isVerified,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId, vendorId) {
    try {
      const account = await this.getBankAccountById(accountId, vendorId);

      // Check if account has associated payouts
      const payoutCount = await this.models.VendorPayout.count({
        where: {
          bankAccountId: accountId,
          status: { [this.models.sequelize.Op.notIn]: ['cancelled'] },
        },
      });

      if (payoutCount > 0) {
        throw {
          statusCode: 400,
          code: 'ACCOUNT_HAS_PAYOUTS',
          message: 'Cannot delete account with associated payouts',
        };
      }

      await account.destroy();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
